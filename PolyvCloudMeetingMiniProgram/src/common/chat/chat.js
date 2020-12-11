/* eslint-disable */

import EventEmitter from './events';
import md5 from '../utils/md5';
import io from '../utils/weapp.socket.io';
import Event from './eventTypes';
import EmotionList from './emotionList';
import api from './api';
import { URL } from '../utils/config';

const { socketHost } = URL;

const roomEvents = {
  [Event.KICK_USER](event, message) {
    // 如果被踢的是本人,断开socket
    if (message.user.userId == this.options.userId) {
      // Chat.setCookie('ban_user_room', message.user.roomId, 1);
      this.trigger(Event.BAN_USER_ROOM);
      this.disconnectSocket();
    }
  },

  [Event.LOGIN_KICK](event, message) {
    this.trigger(Event.BAN_USER_ROOM);
    this.disconnectSocket();
  },

  [Event.LOGIN](event, data) {
    const ary = this.addUserlist([data.user]);
    if (ary.length > 0) this.trigger(Event.UPDATEUSER, 'add', ary, true);
  },

  [Event.LOGOUT](event, data) {
    const user = this.removeUser(data.uid);
    if (user) this.trigger(Event.UPDATEUSER, 'remove', user);
  },

  [Event.CONNECT](event, data) {
    if(!this.options.isMobile) {
      this.getOnlineUserList()
      .then(res => {
        this.getQuestionHistoryMessage();
        const ary = this.addUserlist(res.data.data.userlist);
        if (ary.length > 0) this.trigger(Event.UPDATEUSER, 'add', ary);
      });
    }
  },

  [Event.MICROPHONE](event, data) {
    if (this.status !== 'open') {
      this.clearChannelClock();
    }
  },

  [Event.ONLINE_TEACHERINFO](event, data) {
    this.teacherData = data.data;
    this.hasClient = true;
    console.log(this.teacherData);
  },

  [Event.SET_NICK](event, data) {
    if(data.status === 'error') {
      return;
    }
    // 发送给后台
    if (data.userId === this.userId) {
      this.options.userName = this.options.nick = data.nick;
      api.setNickname(this.options.roomId, data.nick);
    }
  },

  [Event.SLICEID](event, data) {
    this.options.session_id = data.data.sessionId;
  },

  [Event.SET_MANAGER_INFO](event, data) {
    // 管理员信息设置
    // console.log(data);
    // if(!data || !data.user) return;
    // $(`[data-uid=${data.user.uid}]`).children('img').attr('src', data.user.pic).end()
    // .children(`#user${data.user.userId}`).html(data.user.nick).end();
  }
};

class Chat {

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

  static FormatEmotions(_html) {
    if (!_html) {
      return '';
    }
    let _of = _html.indexOf('[');
    while (_of > -1) {
      const _oe = _html.indexOf(']', _of + 1);
      if (_oe === -1) {
        break;
      }
      const begin = _html.substring(0, _of);
      const end = _html.substring(_oe + 1);
      let title = _html.substring(_of + 1, _oe);
      if (title) {
        const tempArr = EmotionList.filter(emotion => emotion.title === title);
        const urlstr = tempArr.length > 0 ? tempArr[0].url : '';
        if (urlstr) {
          title = `<img src="${urlstr}">`;
        }
      }
      _html = begin + title + end;

      _of = _html.indexOf('[');
    }
    return _html;
  }

  static setCookie(cname, cvalue, exdays) {
    const d = new Date().getTime() + (exdays * 24 * 60 * 60 * 1000);
    wx.setStorage({
      key: `${cname}${cvalue}`,
      data: d
    });
    // var expires = `expires=${d.toUTCString()}`;
    // document.cookie = `${cname}=${cvalue};+${expires}`;
  }

  static getCookie(cname) {
    return wx.getStorageSync(cname);
  }

  suppotSocket() {
    return true;
  }

  static getUid(userId) {
    return parseInt(userId / 1 % Math.pow(2, 32)) + '';
  }

  // 是否存在更多历史纪录
  hasMoreHistory() {
    return this._hasMoreHistory;
  }

  userlist() {
    return this._user.list;
  }

  // 添加新用户
  addUserlist(userAry) {
    const { _user, _teacher } = this;
    const ary = [];
    userAry.forEach(user => {
      const userType = user.userType;
      // 过滤老师管理员
      if (user.userType === 'teacher' && user.userSource === 'chatroom') return;
      if (userType === 'manager' || userType === 'teacher' || userType === 'assistant') {
        if (userType === 'teacher') {
          this.hasClient = true;
          this.teacherData = user;
        }
        if(_teacher.userId.indexOf(user.userId) === -1) {
          _teacher.list.push(user);
          _teacher.id.push(user.uid);
          _teacher.userId.push(user.userId);
          ary.push(user);
        }
        return;
      };
      // 过滤重复用户
      if(_user.userId.indexOf(user.userId) === -1) {
        _user.list.push(user);
        _user.id.push(user.uid);
        _user.ip.push(user.clientIp);
        _user.userId.push(user.userId);
        ary.push(user);
      }
    });
    return ary;
  }

  // 清除用户列表某用户
  removeUser(uid) {
    const { _user, _teacher }= this;
    const indexTeacher = _teacher.id.indexOf(uid);
    if (indexTeacher !== -1) {
      if (_teacher.list[indexTeacher].userType === 'teacher') {
        this.hasClient = false;
      }
      _teacher.id.splice(indexTeacher, 1);
      _teacher.userId.splice(indexTeacher, 1);
      return _teacher.list.splice(indexTeacher, 1);
    }
    const index = _user.id.indexOf(uid);
    if (index !== -1) {
      _user.id.splice(index, 1);
      _user.userId.splice(index, 1);
      return _user.list.splice(index, 1);
    }
  }

  static getSign(id) {
    return md5(`polyv_room_sign${id}`);
  }

  /*
  * @param {object} options
  * 参数 userId、roomName、pic、userName 都为必填项
  *
  */
  constructor(options) {
    this.options = Object.assign({}, options);
    this.options.nick = options.userName;
    this.userId = options.userId;
    this.options.roomId = options.roomId || options.roomName;
    this.options.sign = options.sign || Chat.getSign(this.options.roomId);
    this.options.roomIds = options.roomIds;
    this.teacherData = {};
    this.historyCount = 0;
    this._hasMoreHistory = false;
    // 是否开启聊天室
    this.roomClosed = false;
    this._hasHistoryMessage = false;
    this.joinChannelClock = null;
    this.connectDelayNumber = [2000, 3000, 4000, 5000];
    // 用户列表
    this._user = {
      list: [],
      id: [],
      userId: [],
      ip: []
    };
    // 教师管理员列表
    this._teacher = {
      list: [],
      id: [],
      userId: []
    };

    this.lastSpeakTime = 0;
    this.lastAskTime = 0;

    // 是否有客户端连接
    this.hasClient = (options.liveStatus === 'live');
    const _this = this;
    // var observer = this.observer = new EventEmitter();
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
    for (let roomEvent  in roomEvents) {
      if (roomEvents.hasOwnProperty(roomEvent)) {
        this.on(roomEvent, roomEvents[roomEvent].bind(this));
      }
    }
  }

  checkBanRoom() {
    const key = `ban_user_room${this.options.roomName}`;
    const value = Chat.getCookie(key);
    if (!value) return false;
    if (value > new Date().getTime()) {
      return true
    } else {
      wx.removeStorageSync(key);
      return false;
    }
  }
  getIsKicked() {
    return api.getIsKicked(this.options.roomId, this.userId).then(r => {
      if (r.data.code === 200) return true;
      throw r.data;
    });
  }

  setup() {
    // 查询用户是否被禁止进入
    // if (this.checkBanRoom()) {
    //   setTimeout(() => {
    //     this.trigger(Event.BAN_USER_ROOM);
    //   }, 0);
    //   return;
    // }
    let init = false;
    this.socket = this.connectSocket();
    const clock = this.overtimeConnect(30);
    this.socket.on('connect', () => {
      clearTimeout(clock);
      this.trigger(Event.CONNECT)
      .login();
      if (init) return;
      this.receiveMessage()
      .receiveClassMessage()
      .receiveJoinResponseMessage()
      .receiveJoinSuccessMessage()
      .receiveCustomMessage()
      .socketEvent();
      init = true;
    });
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
    this._createHeartbeat();

    return this;
  }

  // 心跳
  _createHeartbeat() {
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

  receiveClassMessage() {
    this.socket.on('class', res => {
      let message = JSON.parse(res);
      if (message && message.EVENT) {
        let event;
        switch (message.EVENT) {
          case 'onClassStart':
            event = Event.CLASSSTART;
              break;
          case 'onClassEnd':
            event = Event.CLASSEND;
              break;
          case 'onClassControl':
            event = Event.CLASSCONTROL;
              break;
          default:
            break;
        }

        if(!event) return;

        if(event === Event.CLASSCONTROL) {
          this.trigger(event, message);
          const type = message.type;
          if (type === 'muteAllAudio') {
            event = Event.MUTEALLAUDIO;
          } else if (type === 'muteAllVideo') {
            event = Event.MUTEALLVIDEO;
          } else if (type === 'muteUserAudio') {
            event = Event.MUTEUSERAUDIO;
          } else if (type === 'muteUserVideo') {
            event = Event.MUTEUSERVIDEO;
          }
          message.EVENT = event;
          delete message.type;
          this.trigger(event, message);
          return;
        }
        message.EVENT = event;
        this.trigger(Event.ALLOW_MICROPHONE, message);

      }
    });

    return this;
  }

  receiveJoinResponseMessage() {
    this.socket.on('joinResponse', res => {
      let message = JSON.parse(res);
      if (message) {
        message.EVENT = Event.ALLOW_MICROPHONE;
        this.trigger(Event.ALLOW_MICROPHONE, message);
      }
    });

    return this;
  }

  receiveJoinSuccessMessage() {
    this.socket.on('joinSuccess', res => {
      let message = JSON.parse(res);
      if (message) {
        message.EVENT = Event.SUCCESS_MICROPHONE;
        this.trigger(Event.SUCCESS_MICROPHONE, message);
      }
    });

    return this;
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
          case 'CLOSEROOM':
            this.roomClosed = message.value.closed;
            event = message.value.closed ? Event.CLOSE_ROOM : Event.OPEN_ROOM;
            break;
          case 'GONGGAO':
            event = Event.SYSTEM_ANNOUNCEMENT;
            break;
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
            // event = message.status === 'error' ? Event.SPEAK_ERROR: Event.SPEAK;
            break;
          case 'REWARD':
            event = Event.REWARD;
            break;
          case 'QUESTION':
            event = Event.QUESTION;
            break;
          case 'CLOSE_QUESTION':
            event = Event.CLOSE_QUESTION;
            break;
          case 'ANSWER':
            event = Event.ANSWER;
            break;
          case 'CUSTOMER_MESSAGE':
            event = Event.CUSTOMER_MESSAGE;
            break;
          case 'ERROR':
            event = Event.SERVER_ERROR;
            break;
          case 'KICK':
            event = Event.KICK_USER;
            break;
          case 'LOGIN_KICK':
            event = Event.LOGIN_KICK;
            break;
          case 'REMOVE_HISTORY':
            event = Event.REMOVE_HISTORY;
            break;
          case 'REMOVE_CONTENT':
            event = Event.REMOVE_CONTENT;
            break;
          case 'CLOSE_DANMU':
            event = Event.CLOSE_DANMU;
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
          case 'S_QUESTION':
            event = Event.S_QUESTION;
            break;
          case 'T_ANSWER':
            event = Event.T_ANSWER;
            break;
          case 'BULLETIN':
            event = Event.BULLETIN;
            break;
          case 'REMOVE_BULLETIN':
            event = Event.REMOVE_BULLETIN;
            break;
          case 'FLOWERS':
            event = Event.FLOWERS;
            break;
          case 'REDPAPER':
            event = Event.REDPAPER;
            break;
          case 'SIGN_IN':
            event = Event.SIGN_IN;
            break;
          case 'STOP_SIGN_IN':
            event = Event.STOP_SIGN_IN;
            break;
          case 'LIKES':
            event = Event.LIKES;
            break;
          case 'OPEN_MICROPHONE':
            event = Event.MICROPHONE;
            break;
          case 'SET_NICK':
            event = Event.SET_NICK;
            break;
          case 'O_TEACHER_INFO':
            event = Event.ONLINE_TEACHERINFO;
            break;
          case 'SET_MANAGER_INFO':
            event = Event.SET_MANAGER_INFO;
            break;
          case 'GET_TEST_QUESTION_CONTENT':
            event = Event.GET_TEST_QUESTION_CONTENT;
            break;
          case 'GET_TEST_QUESTION_RESULT':
            event = Event.GET_TEST_QUESTION_RESULT;
            break;
          case 'STOP_TEST_QUESTION':
            event = Event.STOP_TEST_QUESTION;
            break;
          case 'SYSTEM_MESSAGE':
            event = Event.SYSTEM_MESSAGE;
            break;
          case 'CHAT_IMG':
            event = Event.CHAT_IMG
          default:
            break
        }

        if(!event) return;
        message.EVENT = event;
        if(event === Event.S_QUESTION) {
          if (message.user.userId !== this.userId) {
            return;
          }
          if (!message.user.nick) {
            message.user.nick = message.user.userName;
          }
          this.lastAskTime = new Date().getTime();

          message = this.parseData([message])[0];
        }

        if(event === Event.T_ANSWER) {
          if (message.s_userId !== this.userId) {
            return;
          }
        }

        if(event === Event.SPEAK) {
          message.content = message.values[0];
          delete message.values;
          message = this.parseData([message])[0];
        }
        if (event === Event.SPEAK_ERROR) {
          message = this.parseData([message])[0];
        }
        if(event === Event.FLOWERS) {
          message.flowers = true;
        }
        if(event === Event.REWARD) {
          message.reward = true;
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
    return io(socketHost, {
      query: {
        token: this.options.chatToken
      },
      transports: [this.suppotSocket() ? 'websocket' : 'polling'],
      reconnectionDelay: this.connectDelayNumber[Math.floor(Math.random()*4)],
      randomizationFactor: Math.random(),
    });
  }

  send(value) {
    if(!this.socket) {
      this.trigger(Event.PROHIBIT_TO_SPEAK);
      return;
    };

    if (this.roomClosed) return;

    const nowTime = new Date().getTime();
    if ((nowTime - this.lastSpeakTime) < 3000) {
      this.trigger(Event.SYSTEM_MESSAGE, {
        system: true,
        content: '您的发言过快，请稍后再试'
      });
      return;
    }

    // 过滤标签
    const msg = Chat.parseString(value);

    const options = this.options;
    const data = {
      EVENT: 'SPEAK',
      values: [msg],
      roomId: options.roomId
    }
    this.socket.emit('message', JSON.stringify(data));
    this.lastSpeakTime = new Date().getTime();
    this.trigger(Event.SEND_MESSAGE, this.parseData([{
      content: msg,
      time: new Date().getTime(),
      mySelfSend: true,
      id: Math.floor(Math.random() * 10000000),
      user: {
        nick: options.userName,
        pic: options.pic,
        userId: options.userId,
        roomId: options.roomId,
        channelId: options.roomName
      }
    }])[0]);
    return this;
  }

  /*
  * 踢出用户
  */
  kick(userId) {
    const options = this.options;
    const data = {
      EVENT: 'KICK',
      roomId: options.roomId,
      channelId: options.roomName,
      userId: userId,
      sign: options.sign
    };
    this.socket.emit('message', JSON.stringify(data));
  }

  /*
  * 禁言或取消禁言
  */
  prohibitSpeak(ip, prohibit = true) {
    const options = this.options;
    const data = {
      EVENT:  prohibit === true ? 'SHIELD' : 'REMOVE_SHIELD',
      roomId: options.roomId,
      channelId: options.roomName,
      sign: options.sign,
      value: ip
    };
    this.socket.emit('message', JSON.stringify(data));
    const _user = this._user;
    const index = _user.ip.indexOf(ip);
    if (_user.list[index]) {
      _user.list[index].banned = !!prohibit;
    }
  }

  /**
   * 咨询提问-回答(发送指定id的消息)
   */
  sendQuestion(msg) {
    const options = this.options;

    const nowTime = new Date().getTime();
    if ((nowTime - this.lastAskTime) < 3000) {
      this.trigger(Event.SYSTEM_MESSAGE, {
        system: true,
        content: '您的发言过快，请稍后再试'
      });
      return;
    }

    const data = {
      EVENT: 'S_QUESTION',
      roomId: options.roomId,
      content: msg,
      user: {
        nick: options.nick,
        pic: options.pic,
        userId: options.userId,
        actor: options.actor ? options.actor : '学生',
        userType: options.userType === 'slice' ? 'student' : options.userType
      }
    };
    this.socket.emit('message', JSON.stringify(data));
  }

  /*
  * 发送公告
  */
  sendAnnouncement(content) {
    const options = this.options;
    const data = {
      EVENT:  'BULLETIN',
      roomId: options.roomId,
      channelId: options.roomName,
      sign: options.sign,
      content
    };
    this.socket.emit('message', JSON.stringify(data));
  }

  /*
  * 删除公告
  */
  deleteAnnouncement() {
    const options = this.options;
    const data = {
      EVENT:  'REMOVE_BULLETIN',
      roomId: options.roomId,
      channelId: options.roomName,
      sign: options.sign
    };
    this.socket.emit('message', JSON.stringify(data));
  }

  sendLike(times) {
    const options = this.options;
    const data = {
      EVENT:  'LIKES',
      roomId: options.roomId,
      channelId: options.roomName,
      nick: options.nick,
      count: times
    };
    this.socket.emit('message', JSON.stringify(data));
  }

  setNick(nick) {
    const options = this.options;
    const data = {
      EVENT:  'SET_NICK',
      roomId: options.roomId,
      channelId: options.roomName,
      nick: nick,
      userId: options.userId
    };
    this.socket.emit('message', JSON.stringify(data));
  }

  // 学生点击签到
  toSign(checkinId) {
    const { roomId, userId, nick } = this.options;
    this.socket.emit('message', JSON.stringify({
      EVENT: 'TO_SIGN_IN',
      roomId,
      checkinId,
      user: { userId, nick }
    }));
  }

  // 发送签到
  sendSign(content, time) {
    const options = this.options;
    const data = {
      EVENT: 'SIGN_IN',
      roomId: options.roomId,
      data: {
        message: content,
        limitTime: time
      }
    };
    this.socket.emit('message', JSON.stringify(data));
  }

  // 结束签到
  endSign() {
    const options = this.options;
    const data = {
      EVENT: 'STOP_SIGN_IN',
      roomId: options.roomId
    };
    this.socket.emit('message', JSON.stringify(data));
  }

  // 发送答案
  sendAnswer(option, questionId, cb = function() {}) {
    const options = this.options;
    const data = {
      EVENT: 'ANSWER_TEST_QUESTION',
      roomId: options.roomId,
      nick: options.nick,
      userId: options.userId,
      option,
      questionId
    };
    this.socket.emit('message', JSON.stringify(data), cb);
  }

  // 举手
  joinChannel() {
    const options = this.options;
    const data = {
      user: {
        nick: options.nick,
        pic: options.pic,
        userId: Chat.getUid(options.micUserId),
        userType: options.userType,
        sessionId: options.session_id
      },
      roomId: options.roomId,
      sessionId: options.session_id
    };
    this.clearChannelClock()
    this.socket.emit('joinRequest', JSON.stringify(data), (a,b,c)=>{
      this.clearChannelClock();
    });

    this.joinChannelClock = setTimeout(() => {
      this.trigger(Event.JOIN_CHANNEL_FAIL);
    }, 20000);
  }

  clearChannelClock() {
    clearTimeout(this.joinChannelClock);
  }

  // 加入声网成功发送
  joinChannelSuccess() {
    const options = this.options;
    const data = {
      user: {
        nick: options.nick,
        pic: options.pic,
        userId: Chat.getUid(options.micUserId),
        userType: options.userType,
        sessionId: options.session_id
      },
      roomId: options.roomId,
      sessionId: options.session_id
    };

    this.socket.emit('joinSuccess', JSON.stringify(data));
  }

  // 取消举手发言
  cancelJoinChannel() {
    const options = this.options;
    const data = {
      user: {
        nick: options.nick,
        pic: options.pic,
        userId: Chat.getUid(options.micUserId),
        userType: options.userType,
        sessionId: options.session_id
      },
      roomId: options.roomId,
      sessionId: options.session_id
    };
    this.socket.emit('joinLeave', JSON.stringify(data));
  }

  disconnectSocket() {
    this.socket && this.socket.close();
    return this;
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

  // 处理图片地址
  dealImgUrl(url) {
    return url.replace(/^\/\//, 'https://');
  }

  getOnlineUserList() {
    const userInfo = this.options;
    return api.getOnlineUserList(userInfo.roomName);
  }

  getHistoryMessage(numbers = 20, start) {
    // const begin =  this.historyCount = start || this.historyCount;
    const begin =  start == undefined ? this.historyCount : start;
    const userInfo = this.options;
    api.getHistoryMessage(userInfo, begin, numbers)
    .then(d => {
      const res = d.data.data;
      this.historyCount += numbers;
      this._hasMoreHistory = res.length === 21;
      this.trigger(Event.HISTORY_MESSAGE, this.parseData(res.reverse().slice(this._hasMoreHistory ? 1 : 0)), begin, begin + numbers);
    })

    return this;
  }

  getQuestionHistoryMessage() {
    api.getQuestionHistoryMessage(this.options.roomName)
    .then(d => {
      const res = d.data.data;
      const userId = this.userId;

      let temp = res.filter(item => {
        return item.user && (item.user.userType === 'teacher' || item.user.userType === 'assistant' || item.user.userType === 'manager') && item.s_userId === userId;
      });

      if(temp.length === 0) {
        res.unshift({
          content: '同学，您好！请问有什么问题吗？',
          time: new Date().getTime(),
          s_userId: userId,
          user: {
            actor: '讲师',
            clientIp: '',
            nick: '讲师',
            pic: '//livestatic.polyv.net/assets/images/teacher.png',
            userType: 'teacher'
          }
        })
      }

      this.trigger(Event.UPDATE_QUESTION_HISTROY, this.parseData(res.filter(item => {
        return item.user && ((item.user.userType === 'student' && item.user.userId === userId) || (item.user.userType !== 'student' && item.s_userId === userId));
      })));
    });
  }

  getCurrentSignRecord(value) {
    return api.getCurrentSignRecord(value);
  }

  getHistorySignRecord(value) {
    return api.getHistorySignRecord(value);
  }

  getBannedList() {
    return api.getBannedList(this.options.roomId);
  }

  removeHistoryMessage(id) {
    // 删除聊天记录
    const options = this.options;
    api.removeHistoryUrl(id, options);
  }

  cleanHistoryMessage() {
    const options = this.options;
    const data = {
      EVENT: 'REMOVE_HISTORY',
      roomId: options.roomId,
      sign: options.sign,
      subsidiaryRoom: options.roomIds
    };
    this.socket.emit('message', JSON.stringify(data));
  }

  // 查询当前连麦状态
  checkCurrentStatus() {
    return api.checkCurrentStatus(this.options.roomId);
  }

  sendFlower(count) {
    const options = this.options;
    const data = {
      EVENT: 'LIKES',
      roomId: options.roomId,
      nick: options.userName,
      count: count
    }
    this.socket.emit('message', JSON.stringify(data));
  }

  // 发送任意消息
  sendSocketMessage(data, socketType = 'message') {
    if (data !== null && typeof data === 'object') data = JSON.stringify(data);
    if (typeof data !== 'string' || typeof socketType !== 'string') return;
    this.socket.emit(socketType, data);
  }
}

Chat.events = Event;

export default Chat;
