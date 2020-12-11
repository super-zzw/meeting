/* eslint-disable */

import EventEmitter from 'events';
import io from 'socket.io-client';
import Event from './eventTypes';

class Chat {

  /*
  * @param {object} options
  * 参数 userId、roomName、pic、userName 都为必填项
  */
  constructor(options) {
    this.options = Object.assign({}, options);
    this.options.nick = options.userName;
    this.userId = options.userId;
    this.options.roomId = options.roomId || options.roomName;

    this.connectDelayNumber = [2000, 3000, 4000, 5000];

    this.socket = null;
    
    const _this = this;
    var observer = new EventEmitter();
    observer.trigger = function trigger (event, ...data) {
      observer.emit(event, event, ...data);
      return _this;
    };
    observer.off = function off (event, ...data) {
      observer.removeListener(event, ...data);
      return _this;
    };
    this.on = function(event, func) {
      observer.on(event, func);
      return _this;
    };
    this.off = observer.off.bind(observer);
    this.trigger = observer.trigger.bind(observer);
    
    this.events = Event;
  }

  setup() {
    console.log("====chat setup begin====")
    let init = false;
    this.socket = this.connectSocket();
    const clock = this.overtimeConnect(30);
    this.socket.on('connect', () => {
      clearTimeout(clock);
      this.trigger(Event.CONNECT).login();
      if (init) return;
      this.receiveMessage()
      .receiveCustomMessage()
      .socketEvent();
      init = true;
    });
    console.log("====chat setup end====")
  }

  overtimeConnect(second = 30) {
    return setTimeout(() => {
      this.trigger(Event.OVERTIMECONNECT)
    }, second * 1000);
  }

  login() {
    const userInfo = this.options;
    this.socket.emit('message', JSON.stringify({
      EVENT: 'LOGIN',
      values: [userInfo.userName, userInfo.pic, userInfo.userId],
      roomId: userInfo.roomId,
      type: userInfo.userType
    }));

    // 创建心跳
    this.createHeartbeat();

    return this;
  }

  // 心跳
  createHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.heartbeatInterval = setInterval(() => {
      const userInfo = this.options;
      this.socket.emit('message', JSON.stringify({
        EVENT: 'HEARTBEAT',
        uid: userInfo.userId,
      }));
    }, 25*1000);
  }

  // 自定义消息
  receiveCustomMessage() {
    this.socket.on('customMessage', res => {
      let message = JSON.parse(res);
      if (message) {
        this.trigger(message.EVENT, message);
      }
    });
    return this;
  }

  receiveMessage() {
    this.socket.on('message', res => {
      let message;
      try {
        message = JSON.parse(res);
      } catch(err) {
        console.error(err);
      }
      if (message && message.EVENT) {
        let event;
        switch (message.EVENT) {
          case 'SPEAK':
            switch (message.status) {
              case 'error':
                event = Event.SPEAK_ERROR;
                break;
              case 'censor':
                event = Event.SPEAK_CENSOR;
                break;
              default:
                event = Event.SPEAK;
                break;
            }
            break;
          case 'SYSTEM_MESSAGE':
            event = Event.SYSTEM_MESSAGE;
            break;
          case 'CUSTOMER_MESSAGE':
            event = Event.CUSTOMER_MESSAGE;
            break;
          case 'ERROR':
            event = Event.SERVER_ERROR;
            break;
          case 'LOGIN':
            event = Event.LOGIN;
            break;
          case 'LOGOUT':
            event = Event.LOGOUT;
            break;
          case 'onSliceID':
            event = Event.SLICEID;
            break;
          case 'onSliceStart':
            event = Event.SLICESTART;
            break;
          case 'onSliceControl':
            event = Event.SLICECONTROL;
            break;
          case 'onSliceDraw':
            event = Event.SLICEDRAW;
            break;
          case 'onSliceOpen':
            event = Event.SLICEDOPEN;
            break;
        }

        if(!event) return;
        message.EVENT = event;

        if(event === Event.SPEAK) {
          message.content = message.values[0];
          message = this.parseData([message])[0];
        }
        if (event === Event.SPEAK_ERROR) {
          message = this.parseData([message])[0];
        }
        if(event === Event.CUSTOMER_MESSAGE) {
          message.customerMessage = true;
        }
        this.trigger(event, message);
      }
    });
    return this;
  }

  socketEvent() {
    this.socket.on('disconnect', ()=> {
      this.trigger(Event.DISCONNECT);
    });
    this.socket.on('error', ()=> {
      this.trigger(Event.ERROR);
    });
    this.socket.on('reconnect', (attemptNumber) => {
      this.trigger(Event.RECONNECT);
    });
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      this.trigger(Event.RECONNECT_ATTEMPT);
    });
    return this;
  }

  connectSocket() {
    const protocol = window.location.protocol;
    const suppotSocket = 'WebSocket' in window || 'MozWebSocket' in window;
    const socketHost = protocol === 'http:' ? 'http://chat.polyv.net:80' : 'https://chat.polyv.net:443';
    return io.connect(socketHost, {
        query: `token=${this.options.token}`,
        transports : [suppotSocket ? 'websocket' : 'polling'],
        reconnectionDelay: this.connectDelayNumber[Math.floor(Math.random()*4)],
        randomizationFactor: Math.random()
    });
  }

  disconnectSocket() {
    this.socket && this.socket.close();
    return this;
  }

  // 发送任意消息
  sendSocketMessage(data, socketType = 'message') {
    if (data !== null && typeof data === 'object') data = JSON.stringify(data);
    if (typeof data !== 'string' || typeof socketType !== 'string') return;
    this.socket.emit(socketType, data);
  }

  getActor(user) {
    let actor = '';
    if (user.actor) {
      actor = user.actor;
    } else if (user.userType === 'teacher') {
      actor = '讲师';
    } else if (user.userType === 'manager') {
      actor = '管理员';
    } else if (user.userType === 'assistant') {
      actor = '助教';
    }

    return actor;
  }

  // 处理图片地址
  dealImgUrl(url) {
    return url.replace(/^\/\//, 'https://');
  }

  // 对数据进一步处理
  parseData(ary) {
    return ary.map(item => {
      if (item.user) {
        // 判断是否为打赏消息
        item.reward = item.user.uid === '1';
        // 判断是否为自定义消息
        item.isCustomMsg = item.user.uid === '2';
        // 是否当前用户
        item.currentUser = item.user.userId === this.options.userId;
        // 格式化actor
        item.actor = this.getActor(item.user);
        // 头像\打赏地址添加协议
        item.user.pic = this.dealImgUrl(item.user.pic);
        if (item.reward && item.content.gimg) {
          item.content.gimg = this.dealImgUrl(item.content.gimg);
        }
      }
      // 过滤标签 - 打赏和图片直接返回content
      item.content = (item.reward || item.msgSource === 'chatImg') ? item.content : Chat.parseString(item.content);
      if (item.time) {
        // 格式化时间
        item.formatTime = Chat.FormatTime(item.time);
      }
      // 是否含有违规词
      item.system = item.system || item.status === 'error';
      if (item.system) {
        item.content = item.message;
      }
      return item;
    });
  }

  static parseString(str) {
    if (!str) {
      return '';
    }
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
  }

  static FormatTime(time) {
    const emitZero = n => n < 10 ? `0${n}` : n;
    const dates = new Date(time / 1);
    const year = dates.getFullYear();
    let month = emitZero(dates.getMonth() + 1);
    let date = emitZero(dates.getDate());
    let hours = emitZero(dates.getHours());
    let minutes = emitZero(dates.getMinutes());
    return `${year}-${month}-${date} ${hours}:${minutes}`;
  }

}

Chat.events = Event;
  
export default Chat;