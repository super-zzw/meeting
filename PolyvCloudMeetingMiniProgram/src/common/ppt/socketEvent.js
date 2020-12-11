import EVENT from './EVENT';
import request from '../api/plv-request';
const { SHOW_BOARD, HIDE_BOARD, PPT_RELOAD, CHANGE_PAGE, CONTROL_CAM } = EVENT;

class SocketEvent {
  constructor({
    chat,
    pptCtrl,
    paintCtrl,
    isLive = true,
    getCurrentTime = () => { },
    videoId,
    delayTime = 3000,
    user
  }) {
    this.pptCtrl = pptCtrl;
    this.paintbrushCtrl = paintCtrl;
    this.chat = chat;
    this.currentAutoId = '';
    this.subFn = [];
    this._setLiveStatus(isLive, 1);
    this.currentPlayTime = 0;
    this.isRedraw = true;
    this.getCurrentTime = getCurrentTime;
    this.videoId = videoId;
    this.happenResize = false;
    this.requestUrlPre = 'https://api.polyv.net/live/v3/channel/chat/';
    this.delayTime = delayTime;
    this.user = user;
    if (chat) this.setChat(chat);
  }

  /**
   * 开始初始化socket事件
   * @param {Object} chat
   * @param {Boolean} isLive
   */
  setChat(chat, isLive) {
    if (isLive !== undefined) {
      this._setLiveStatus(isLive, 2);
    }
    this.chat = chat;
    this.initEvent();
  }

  // 初始化socket事件
  initEvent() {
    if (!this.chat) return;
    const chatEvent = this.chatEvent = this.getChatEvent(true);
    Object.keys(chatEvent).forEach((item) => {
      this.chat.on(item, chatEvent[item]);
    });
  }

  /**
   * 获取需要监听的事件及其回调函数
   * @param {Boolean} isFromSocket
   */
  getChatEvent(isFromSocket = false) {
    const EVENT = this.chat && this.chat.events;
    const delayed = () => new Promise(resolve => {
      isFromSocket && this.delayTime > 0 ?
        setTimeout(resolve, this.delayTime) :
        resolve();
    });
    const that = this;
    if (!EVENT) return null;
    return {
      [EVENT.SLICEID](event, { data, inMeeting = false }) {
        if (inMeeting) that._setLiveStatus(true, 3);
        if (isFromSocket && !that.isLive) return;
        that.onSliceId(data);
      },
      [EVENT.SLICESTART](event, data) {
        if (isFromSocket) {
          const { roomId, sessionId } = data;
          that.roomId = roomId;
          const reloadData = that.reloadData = Object.assign(
            { roomId, sessionId }, data.data
          );
          that.reload(reloadData);
        } else {
          that.onSliceStart(data);
        }
      },
      [EVENT.SLICEDOPEN](event, data) {
        delayed().then(() => that.onSliceOpen(data.data));
      },
      [EVENT.SLICECONTROL](event, data) {
        delayed().then(() => that.onSliceControl(data.data));
      },
      [EVENT.SLICEDRAW](event, data) {
        delayed().then(() => that.onSliceDraw(data, isFromSocket));
      }
    };
  }

  reload(data) {
    this.destroy();
    this.emit({ EVENT: PPT_RELOAD, data });
  }

  destroy() {
    const chatEvent = this.chatEvent;
    Object.keys(chatEvent).forEach((item) => {
      this.chat.off(item, chatEvent[item]);
    });
  }

  /**
   * 初始化ppt
   * @param {Numbe} autoId ppt的id
   * @param {Number} pageId ppt第几页
   * @param {Number} type ppt类型，1表示新ppt，0和null表示旧ppt
   */
  init(autoId, pageId, type) {
    this.docType = type;
    const isNew = parseInt(type) === 1;
    if (parseInt(autoId) === parseInt(this.currentAutoId)) {
      if (parseInt(autoId) !== 0) {
        // this.emit({ EVENT: 'log', data: 'deleteWhiteBoard....2' });
        this.deleteWhiteBoard();
        if (isNew === this.pptCtrl.isNew) {
          return Promise.resolve();
        }
      } else {
        return Promise.resolve();
      }
    }

    if (parseInt(autoId) === 0) {
      this.openWhiteBoard(pageId);
      return Promise.resolve();
    } else {
      return this.pptCtrl.init(autoId, isNew).then(r => {
        if (r === true) {
          this.paintbrushCtrl.clear();
          // this.emit({ EVENT: 'log', data: 'deleteWhiteBoard....3' });
          this.deleteWhiteBoard();
          this.pptCtrl.gotoPage(parseInt(pageId));
          this.currentAutoId = autoId;
          this.currentTeacherOp = { pageId, autoId };
        }
        return;
      });
    }
  }

  /**
   * 执行画笔
   * @param {Object} data
   */
  onSliceDraw({ data, userId }, isFromSocket) {
    const { pageId, autoId, type, ID } = data;
    if (
      parseInt(autoId) !== 0 &&
      parseInt(autoId) === parseInt(this.currentAutoId) &&
      parseInt(pageId) !== parseInt(this.pptCtrl.currentPageNum) &&
      userId !== this.user.userId
    ) {
      this.pptCtrl.gotoPage(parseInt(pageId));
    }
    if (type === 'text' && this.paintbrushCtrl) {
      this.paintbrushCtrl.clearHistory(autoId, pageId, ID);
      const time = this.isLive ? undefined : this.currentPlayTime;
      this.paintbrushCtrl.redraw(pageId, this.pageType, time);
    }
    this.paintbrushCtrl.drawFromSocket({ data, pageType: this.pageType, userId, isFromSocket });
  }

  /**
   * 打开新的ppt或白板
   * @param {Object} data
   */
  onSliceOpen(data) {
    const { pageId, autoId, type, docType } = data;
    this.docType = docType;
    if (parseInt(autoId) === 0) {
      this.openWhiteBoard(pageId);
      return;
    }
    this.deleteWhiteBoard();
    this.pageType = 'page';
    if (this.paintbrushCtrl) this.paintbrushCtrl.autoId = autoId;
    const done = () => {
      if (this.isRedraw) {
        this.paintbrushCtrl.clear();
        this.paintbrushCtrl.redraw(pageId || 0, this.pageType);
      }
    };
    if (parseInt(this.currentAutoId) === parseInt(autoId)) return done();
    const oldAutoId = this.currentAutoId;
    const isNew = parseInt(type) === 1 || parseInt(docType) === 1;
    this.currentAutoId = autoId;
    this.pptCtrl.init(autoId, isNew).then(r => {
      if (r === true) {
        this.pptCtrl.gotoPage(parseInt(pageId));
        if (oldAutoId !== undefined && parseInt(oldAutoId) !== 0) this.paintbrushCtrl.clearHistory(oldAutoId);
        setTimeout(done, 500);
      } else {
        done();
      }
    });
  }

  /**
   * 控制ppt翻页等操作
   * @param {Object} param0
   */
  onSliceControl({ pageId, ID, type, autoId, isCamClosed }) {
    switch (type) {
      case 'switchpage':
        this._switchpage(pageId, autoId);
        break;
      case 'switchAnimation':
        this._switchpage(pageId, autoId);
        break;
      case 'delete':
        this.paintbrushCtrl.delete({ pageId, ID, pageType: this.pageType });
        break;
      case 'alldelete':
        this.paintbrushCtrl.clear();
        this.paintbrushCtrl.clearHistory(autoId, pageId);
        break;
      case 'closeCamera':
        this.emit({ EVENT: CONTROL_CAM, isCamClosed });
        break;
    }
  }

  /**
   * 直播中途进入
   * @param {Object} data
   */
  onSliceId(data) {
    clearTimeout(this.onSliceId.timeout);
    this.onSliceId.timeout = setTimeout(() => {
      const { pageId, autoId, sessionId, roomId, type, docType } = data;
      this.roomId = roomId;
      this._getPlayHistory(sessionId, roomId, docType || type).then(r => {
        if (r === 0) this.init(autoId, pageId, docType || type);
      });
    }, 500);
  }

  /**
   * 开始直播
   * @param {Object} data
   */
  onSliceStart(data) {
    this.paintbrushCtrl.clearHistory();
    const { roomId, sessionId } = data;
    this.onSliceId(Object.assign({ roomId, sessionId }, data.data));
  }

  /**
   * 切换页面
   * @param {Number} pageId
   * @param {Number} autoId
   */
  _switchpage(pageId, autoId) {
    if (parseInt(autoId) === 0) {
      return this.openWhiteBoard(pageId);
    }
    this.pageType = parseInt(autoId) === 0 ? 'whiteBoard' : 'page';

    if (parseInt(autoId) !== parseInt(this.currentAutoId)) {
      if (this.paintbrushCtrl) this.paintbrushCtrl.clear();
      return;
    }
    if (parseInt(this.pptCtrl.currentPageNum) !== parseInt(pageId)) {
      if (this.paintbrushCtrl) {
        this.paintbrushCtrl.clear();
        this.paintbrushCtrl.redraw(pageId, this.pageType);
      }
      this.pptCtrl.gotoPage(parseInt(pageId));
    }
  }

  /**
   * 学员中途进入直播，请求历史数据
   * @param {String} sessionId
   * @param {Number} roomId
   * @param {Boolean} type
   */
  _getPlayHistory(sessionId, roomId, type) {
    if (!(sessionId && roomId)) return Promise.resolve('sessionId和roomId不为空');
    return request(`${this.requestUrlPre}get-ppt-content`, {
      qs: {
        channelId: roomId,
        sessionId
      }
    }).then(result => {
      if (!result) return console.error('请求接口/front/pptContent返回数据为空');
      const { statusCode, data: { code, data } = {} } = result || {};
      if (parseInt(statusCode) !== 200 || code !== 200 || !data || !data.length) return console.error('请求接口/front/pptContent失败', result);
      const d = data;
      const max = this._getMaxTimeHistory(d);

      const content = SocketEvent.parseJson(max.content);
      if (!content) return console.error('json格式有问题');
      const lastData = content.data;
      return this.init(lastData.autoId, lastData.pageId, type).then(() => {
        this._saveHistoryData(d);
        this.paintbrushCtrl.autoId = lastData.autoId;
        this.paintbrushCtrl.redraw(lastData.pageId, parseInt(lastData.autoId) === 0 ? 'whiteBoard' : 'page');

        return;
      });
    });
  }

  // 直播时，获取历史数据中最近一条记录
  _getMaxTimeHistory(d) {
    let max = d[0];
    for (let i = 1, len = d.length; i < len; i++) {
      const v = d[i];
      if (v.time > max.time) {
        const vc = SocketEvent.parseJson(v.content);
        if (!vc) continue;
        if (this._isRightEvent(vc.EVENT, vc.data.type)) {
          max = v;
        }
      }
    }
    return max;
  }

  // 直播中途进入，将画笔历史数据保存起来
  _saveHistoryData(d) {
    let currentAutoId;
    d.forEach(v => {
      const content = SocketEvent.parseJson(v.content);
      if (!content) return;
      const { EVENT, data, userId } = content;
      const { autoId, pageId, ID, type } = data;
      if (EVENT === 'onSliceDraw') this.paintbrushCtrl.saveHistory(data, userId);
      else if (EVENT === 'onSliceControl') {
        switch (type) {
          case 'delete':
            this.paintbrushCtrl.clearHistory(autoId, pageId, ID);
            break;
          case 'alldelete':
            this.paintbrushCtrl.clearHistory(autoId, pageId);
            break;
        }
      } else if (
        parseInt(autoId) !== 0 &&
        currentAutoId &&
        parseInt(autoId) !== parseInt(currentAutoId) &&
        EVENT === 'onSliceOpen'
      ) {
        this.paintbrushCtrl.clearHistory(currentAutoId);
      }
      if (parseInt(autoId) !== 0) currentAutoId = autoId;
    });
  }

  // 去掉白板，切换到ppt
  deleteWhiteBoard() {
    this.emit({ EVENT: HIDE_BOARD });
  }

  // 切换到白板
  openWhiteBoard(pageId = 0) {
    // this.emit({ EVENT: 'log', data: 'openWhiteBoard....' });
    this.pageType = 'whiteBoard';
    this.currentAutoId = 0;
    this.emit({ EVENT: CHANGE_PAGE, page: pageId });
    if (this.isRedraw) {
      // this.emit({ EVENT: 'log', data: 'openWhiteBoard--redraw....' });
      this.paintbrushCtrl.clear();
      this.paintbrushCtrl.redraw(pageId, this.pageType);
    }
    this.emit({ EVENT: SHOW_BOARD });
  }

  // 订阅相关事件
  subscribe(fn) {
    if (fn instanceof Function) this.subFn.push(fn);
  }

  // 触发事件
  emit(d) {
    this.subFn.forEach(fn => fn(d));
  }

  // 判断是否为ppt相关的事件
  _isRightEvent(EVENT, type) {
    return EVENT === 'onSliceStart' || EVENT === 'onSliceOpen' || EVENT === 'onSliceID' || EVENT === 'onSliceDraw' || (EVENT === 'onSliceControl' && (type === 'switchpage' || type === 'delete' || type === 'alldelete' || type === 'switchAnimation'));
  }

  // 初始化聊天室相关数据
  setChatData(chatData) {
    const isLiveChangeBefore = this.isLive;
    this._setLiveStatus(chatData.status === 'Y', 4);
    if (!isLiveChangeBefore && this.isLive && this.reloadData) return this.reload(this.reloadData);
    this.chatData = chatData;
    const isRecord = chatData.recordFileSimpleModel && chatData.recordFileSimpleModel.fileId;
    const hasPlayback = chatData.hasPlayback;
    if (!this.isLive && ((hasPlayback && this.videoId) || (!hasPlayback && isRecord))) {
      this.vodStart({
        id: hasPlayback ? this.videoId : chatData.recordFileSimpleModel.fileId,
        channelId: chatData.channelId,
        type: hasPlayback ? 'playback' : 'record'
      });
    }
  }

  setVideoId(id) {
    this.videoId = id;
    if (this.isLive) return;
    this.vodStart({ id, channelId: this.chatData.channelId });
  }

  // 点播
  vodStart(d) {
    const data = typeof d === 'string' ? SocketEvent.parseJson(d) : d;
    if (typeof data !== 'object') return console.warn('vodStart的json数据格式有问题');
    const { channelId, id, type = 'playback' } = data;
    if (!(channelId && id)) return console.warn('vodStart的json数据必须有roomId和id');
    request(`${this.requestUrlPre}get-ppt-history`, {
      qs: { channelId, id, type }
    }).then(result => {
      this._VODStartResult(result);
    }).catch(err =>
      console.error(`vodStart,err:${JSON.stringify(err)},data:${d}`)
    );
  }

  // 点播结果
  _VODStartResult(result) {
    const { statusCode, data: { code, data } } = result;
    if (parseInt(statusCode) !== 200 || parseInt(code) !== 200) return console.warn('请求画笔回看数据失败');
    const paintData = typeof data === 'string' ? SocketEvent.parseJson(data) : data;
    if (!paintData || !paintData.length) return console.warn('获取的画笔json数据格式有问题');
    // 处理回放相关数据
    this.paintData = paintData.filter(v => {
      const content = SocketEvent.parseJson(v.content);
      if (!content) return `获取历史数据时格式有问题：${v.content}`;
      return !(content.EVENT === 'onSliceControl' && content.data.type === 'closeCamera');
    });
    this.sliceStartTime = [];
    this.sliceOpenObj = {};
    this._saveHistoryDataForVOD();

    if (this.paintbrushCtrl) this.paintbrushCtrl.clearHistory();
    this.vodPlayEx = this.vodPlay();
  }

  // 保存点播历史数据
  _saveHistoryDataForVOD() {
    this.drawDataKeyUsePage = this.paintData.reduce((obj, v, i) => {
      const content = SocketEvent.parseJson(v.content);
      if (!content) return console.warn(`获取历史数据时格式有问题：${v.content}`);
      // 首频
      if (i === 0) {
        this.init(content.data.autoId, content.data.pageId, v.type || v.docType);
      }
      if (content.EVENT === 'onSliceStart') {
        this.startAutoId = content && content.data && content.data.autoId;
        this.sliceStartTime.push(content.timeStamp);
      }
      if (content.EVENT === 'onSliceOpen' || content.EVENT === 'onSliceStart') {
        this.sliceOpenObj[`autoId${content.data.autoId}`] = v.type || v.docType;
      }
      const cd = content.data;
      const pre = parseInt(cd.autoId) === 0 ? 'white' : 'page';
      const key = `${pre}${cd.autoId}${cd.pageId}`;
      v.isExecuted = false;
      obj[key] = obj[key] || [];
      obj[key].push(v);
      return obj;
    }, {});
  }

  // 开始回放
  vodPlay() {
    clearTimeout(this.VODPlayTimeout);
    let canStart = true;
    const that = this;
    this.isRedraw = false;
    this._setLiveStatus(false, 5);
    let preState = null;

    start();
    return {
      stop,
      start() {
        canStart = true;
        start();
      }
    };

    function start() {
      if (!canStart || that.isLive) return;
      that.VODPlayTimeout = setTimeout(() => {
        if (that.isLive) return;
        that.getCurrentTime(currentTimeCallback);
      }, 500);
    }
    function stop() {
      // that.emit({ EVENT: 'log', data: 'stop....' });
      clearTimeout(that.VODPlayTimeout);
      canStart = false;
    }

    function currentTimeCallback(d) {
      const data = typeof d === 'string' ? SocketEvent.parseJson(d) : d;
      if (!data) throw new Error('获取当前播放时间的json字符串有问题');
      const time = data.time;
      that.currentPlayTime = time;

      const currentPaint = that._findDataUseTime(time || 0);
      if (!currentPaint) return start();

      const content = SocketEvent.parseJson(currentPaint.content);
      const { pageId, autoId = that.startAutoId } = content.data;

      const isToTakeExecuted = that._getIsToTakeExecuted(content, preState);
      preState = content;

      const pageData = that._gethistoryData(pageId, autoId);
      const type = that.sliceOpenObj[`autoId${autoId}`];
      that.init(autoId, pageId, type).then(() => {
        that._toDrawForVOD({ time, isToTakeExecuted, pageData });
        start();
      });
    }
  }

  // 回放操作ppt和画笔
  _toDrawForVOD({ time, isToTakeExecuted, pageData }) {
    const sliceStartLen = this.sliceStartTime ? this.sliceStartTime.length : 0;
    const { startTime, endTime } = this._getMergeVODTime(time, sliceStartLen);
    if (!isToTakeExecuted && this && this.paintbrushCtrl) this.paintbrushCtrl.clear();
    pageData.forEach(v => {
      if (!isToTakeExecuted) v.isExecuted = false;
      const content = SocketEvent.parseJson(v.content);
      const timeStamp = content.data.timeStamp;
      if (!(timeStamp !== undefined && timeStamp <= time)) return;
      this._saveTeacherOp(content.data);
      if (
        content.data.type !== 'switchAnimation' &&
          (
            (startTime === endTime && timeStamp >= startTime) ||
            (timeStamp >= startTime && timeStamp <= endTime)
          ) &&
          (!isToTakeExecuted || (isToTakeExecuted && !v.isExecuted))
      ) {
        this._drawForBackPlay(content);
        v.isExecuted = true;
      }
    });
  }

  /**
   * 视频合并相关修改
   * @param {Number} time
   * @param {Number} len
   */
  _getMergeVODTime(time, len) {
    let startTime = 0;
    let endTime = 0;
    if (len === 1) {
      startTime = endTime = this.sliceStartTime[0];
    } else {
      for (let i = 0; i < len; i++) {
        const current = this.sliceStartTime[i];
        const next = this.sliceStartTime[i + 1] || current;

        if (current === next || (time >= current && time <= next)) {
          startTime = current;
          endTime = next;
          break;
        }
      }
    }
    return { startTime, endTime };
  }

  /**
   * 回放时定时查找指定时间最近的数据，使用二分查找
   * @param {Number} time
   */
  _findDataUseTime(time) {
    if (!this.paintData) return null;
    return find(this.paintData);
    function find(arr) {
      const len = arr.length;
      const con = parseInt(len / 2);
      const content = SocketEvent.parseJson(arr[con].content);
      const timeStamp = content.timeStamp === undefined ? content.data.timeStamp : content.timeStamp;

      if (con === len - 1) {
        if (time > timeStamp) {
          return arr[con];
        }
        return len === 1 ? null : find([arr[0]]);
      }

      if (parseInt(time) === parseInt(timeStamp)) return arr[con];
      return time < timeStamp ?
        find(arr.slice(0, con)) :
        find(arr.slice(con, arr.length));
    }
  }

  /**
   * 是否需要根据executed来判断是否执行
   * @param {Object} current
   * @param {Object} pre
   */
  _getIsToTakeExecuted(current, pre) {
    const preTime = pre ?
      pre.data.timeStamp === undefined ?
        pre.timeStamp :
        pre.data.timeStamp :
      0;
    const currentTime = current ?
      current.data.timeStamp === undefined ?
        current.timeStamp :
        current.data.timeStamp :
      0;
    const isToTakeExecuted =
      pre &&
      parseInt(pre.data.autoId) === parseInt(current.data.autoId) &&
      parseInt(pre.data.pageId) === parseInt(current.data.pageId) &&
      preTime <= currentTime;
    const result = isToTakeExecuted && !this.happenResize;
    if (pre && !result) {
      const preArr = this._gethistoryData(pre.data.pageId, pre.data.autoId);
      preArr.forEach(v => {
        v.isExecuted = false;
      });
    }
    if (this.happenResize) this.happenResize = false;
    return result;
  }

  // 获取历史数据
  _gethistoryData(pageId, autoId) {
    const preStr = parseInt(autoId) === 0 ? 'white' : 'page';
    return this.drawDataKeyUsePage[`${preStr}${autoId}${pageId}`];
  }

  // 保存老师操作，回到当前页时使用
  _saveTeacherOp({ autoId, pageId }) {
    if (parseInt(autoId) === 0) return;
    if (autoId !== undefined) this.currentTeacherOp.autoId = autoId;
    if (pageId !== undefined) this.currentTeacherOp.pageId = pageId;
  }

  // 回放时的画笔和ppt等操作
  _drawForBackPlay(content = {}) {
    const chatEvent = this.getChatEvent();
    if (!chatEvent) return;
    const { EVENT } = content;
    if (EVENT && chatEvent[EVENT] instanceof Function) { chatEvent[EVENT].call(this, EVENT, content); }
  }

  // 设置是否直播字段
  _setLiveStatus(isLive) {
    this.isLive = isLive;
    if (this.pptCtrl) this.pptCtrl.isShowBtn = !isLive;
  }

  // 回到当前页
  toCurrentTeacherOp() {
    const { pageId } = this.currentTeacherOp;
    this.pptCtrl.gotoPage(parseInt(pageId));
  }

  /**
   * 解析json字符串
   * @param {String} str
   */
  static parseJson(str) {
    try {
      return JSON.parse(str);
    } catch (err) {
      return false;
    }
  }

  // 会议页面切换时，不重新连接聊天室，需要重新绘制ppt画板信息
  startForMeeting(data) {
    this._setLiveStatus(true);
    this.onSliceId(data);
  }
}

export default SocketEvent;
