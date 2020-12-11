/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import api from '../../common/api/index';
import store from '../../store/index';
import md5 from '../../common/utils/md5';
import utils from '../../common/utils/utils';
import { initChat, emitToPaintEvent, disconnectSocket } from '../../common/chat/initChat';
import { getAppID, getMeetingDetail } from '../../common/utils/getMeetingMessage';
const request = require('@common/request/request');
import regeneratorRuntime from '../../common/regenerator-runtime/runtime-module';
const MyTips = require('@components/mytips/mytips');

let chat = null;
const app = getApp();
Page(Object.assign({}, MyTips, {
  async onLoad(options) {
    if (!options) return;
    this.setData({ options, changeViewModeStyle: 'top:0;' });
    this.init(options);
    getAppID();
    const { conferees } = await getMeetingDetail(options.meetingId);
    this.setData({ micUsers: conferees });
    this.filterUserName(this.data.micUsers);
  },

  handleUpdateState() {
    utils.showToast({ title: '更新状态', icon: 'none' });
    console.log(123);
  },

  data: {
    componentPPT: null,
    detail: null,
    pptSize: {},
    pptDelayTime: 0,
    isWhiteBoard: false,
    user: null,
    options: null,
    drawMode: 'pan', // 画板模式
    currentColor: 'red', // 当前画笔颜色
    colors: {
      red: '#FF5B5B',
      purple: '#864FFD',
      blue: '#3ba4ff',
      green: '#48C55C',
      yellow: '#FFE35B',
      black: '#1E1E1E',
      white: '#FFFFFF'
    },
    pptH: '100vh',
    colorStyle: '',
    inDelete: false,
    pptColorHorizontalH: '', // 横屏时画板颜色条的高度
    pptNavHorizontalH: '', // 横屏时画板控制条样式
    titleTop: 0,
    inHorizontal: false, // 是否处于横屏状态
    navWidthInHorizontal: '', // 导航在横屏时的宽度
    micListStyle: '', // 观众观看时，连麦状态的位置样式
    users: [], // 连麦用户列表
    changeViewModeStyle: '', // 白板切换按钮样式
    micUsers: [],
    pptH5Top: '',
    isCloseMic: false,
    selfMicMute: 0,
    paintBackColor: '#F6F6F6', // 白板背景色
    pptBackColorFromProp: '', // ppt背景色，默认和paintBackColor一致
  },

  init(options) {
    this.initChat(options);
    this.setData({ options, isCloseMic: options.isCloseMic === 'true' });
    this.filterUserName(this.data.micUsers);

    // 获取头部高度
    const { statusBarHeight, titleBarHeight } = app.globalData;
    const titleTop = statusBarHeight + titleBarHeight;
    this.setData({ titleTop });

    // 获取屏幕尺寸
    wx.getSystemInfo({
      success: ({ windowWidth, windowHeight }) => {
        const inHorizontal = windowWidth > windowHeight;
        const pptSize = this._getPPTSize({
          windowWidth,
          windowHeight,
          inHorizontal
        });
        // 设置ppt尺寸
        this.setData({ pptSize });
        if (pptSize.pptH) this.setData({ pptH: `${pptSize.pptH}px` });
        this._setBoardStyle(inHorizontal, windowHeight);
        this._setMicListStyle({ windowWidth, windowHeight });
      }
    });
  },

  isJoin() {
    return this.data.options && this.data.options.pageType === 'join';
  },

  _getPPTSize({ windowWidth, windowHeight, inHorizontal }) {
    const windowProp = windowWidth / 750;
    const { titleTop } = this.data;
    let height;
    let width;
    const micSize = this.isJoin() ? ((inHorizontal ? 60 : 120) * windowProp) : 0;
    let pptH5Top = this.isJoin() ? (`margin-${inHorizontal ? 'left' : 'top'}:${micSize}px;`) : '';
    let ml = 35;
    if (app.globalData.isIphoneX && inHorizontal) pptH5Top = `margin-left:${ml}px;`;
    else ml = 0;
    this.setData({ pptH5Top });
    if (inHorizontal) {
      const navW = this.isJoin() ? 96 : 144;
      width = windowWidth - navW * windowProp - micSize - ml;
      height = windowHeight;
    } else {
      const navH = this.isJoin() ? 192 : 290;
      width = windowWidth - ml;
      height = windowHeight - navH * windowProp - titleTop - micSize;
    }
    return { width, height };
  },

  // 监听页面旋转
  onResize({ size: { windowWidth, windowHeight } }) {
    const inHorizontal = windowWidth > windowHeight;
    const { drawMode } = this.data;
    if (drawMode !== 'pan') {
      this.setData({
        colorStyle: inHorizontal ? 'width:0;' : 'height:0;',
        navWidthInHorizontal: inHorizontal ? 'width:96rpx' : '',
      });
    }
    this.setData({
      pptBackColorFromProp: inHorizontal ? '#393842' : '',
    });
    this._setBoardStyle(inHorizontal, windowHeight);
    const pptSize = this._getPPTSize({ windowWidth, windowHeight, inHorizontal });
    this._runPPTMethods('resetPPTSize', pptSize.width, pptSize.height);
    this._setMicListStyle({ windowWidth, windowHeight });
  },

  // 设置连麦列表样式
  _setMicListStyle({ windowWidth, windowHeight }) {
    const inHorizontal = windowWidth > windowHeight;
    const windowProp = windowWidth / 750;
    const { titleTop } = this.data;
    const micListStyle = inHorizontal ? '' : `top:${(titleTop / windowProp) + 32}rpx;`;
    this.setData({ micListStyle });
  },

  // 设置画板控制栏样式
  _setBoardStyle(inHorizontal, windowHeight) {
    this.setData({
      pptColorHorizontalH: inHorizontal ? `height:${windowHeight}px;` : '',
      inHorizontal,
      pptNavHorizontalH: inHorizontal ? 'height:85%;top:15%;' : ''
    });
  },

  // 初始化聊天室 this.client.muteLocal('audio'
  async initChat({ channelId, pageType }) {
    const that = this;
    const { user, chat: newChat } = await initChat({
      channelId,
      pageType,
      callback: ({ EVENT, isCamClosed, data: { uid, isMute } = {} }) => {
        if (EVENT === 'controlCam' && parseInt(isCamClosed) === 0) {
          that.bindTapToCam();
        } else if (EVENT === 'muteForMeeting') {
          const confereeId = store.get('main.confereeId');
          this.bindSoundChange();
          if (confereeId && parseInt(confereeId) === parseInt(uid)) {
            this.selectComponent('#agoraMeeting').handleMuteAudio(isMute);
            this.setData({ selfMicMute: parseInt(isMute) });
          }
        } else if (EVENT === 'endingForMeeting') {
          // 主持人结束会议
          utils.showToast({ title: '主持人结束会议', icon: 'none' });
          // 退出频道
          this.selectComponent('#agoraMeeting').leave();
          // 断开socket
          disconnectSocket();
          setTimeout(() => {
            utils.redirectTo('/pages/index/index');
          }, 1000);
        } else if (EVENT === 'hostEndingMeeting') {
          // 接收服务端推送的主持人异常退出超过7分钟的消息
          console.info('接收服务端推送的主持人异常退出超过7分钟的socket消息');
          let time = 60;
          setInterval(() => {
            time -= 1;
            if (time == 0) {
              // 退出频道
              that.selectComponent('#agoraMeeting').leave();
              // 断开socket
              disconnectSocket();
              // const ret = await request.post('/api/meeting/leaveMeeting', { meetingId: that.data.meetingId });
              // if (ret.code == config.successCode) {
              //   console.log("已经离开房间=========");
              // }
              setTimeout(() => {
                utils.redirectTo('/pages/index/index');
              }, 1000);
            } else {
              that.showTips(`主持人已离线7分钟，会议将在 ${time}s 后关闭`, 'error');
            }
          }, 1000);
        }
      }
    });
    this.setData({ user });
    chat = newChat || store.get('main.chat');
  },

  // 监听ppt操作后的数据
  handleSocketEvent(e) {
    if (!chat) return;
    chat.sendSocketMessage(e.detail);
  },

  // 点击添加文档
  bindSelectDoc() {
    if (!this.data.isWhiteBoard) {
      return this._uploadPPTSuccess(0);
    }
    const { channelId } = this.data.options || {};
    const that = this;
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success({ tempFiles: [{ path, size, name, time: pptCreatTime } = {}] = [] }) {
        // tempFilePath可以作为img标签的src属性显示图片
        if (!path || !size || !channelId || !name) {
          return console.error(`调用小程序上传文件chooseMessageFile时，返回参数不全，参数为：path:${path}, size: ${size}, channelId:${channelId}, name:${name}`);
        }
        if (size > 100 * 1024 * 1024) return that.tip('上传的ppt大小不能超过100MB');
        const typeMat = name.match(/[^.]*$/);
        const type = typeMat ? typeMat[0] : '';
        const types = ['ppt', 'pptx', 'pdf'];
        if (types.indexOf(type) < 0) {
          const tip = `文件格式必须为:${types.join('、')}`;
          console.error(tip);
          that.tip(tip);
          return;
        }
        wx.showLoading({ title: '文件上传中', mask: true });
        that.uploadPPT({ channelId, name, type, path, pptCreatTime });
      }
    });
  },

  // 上传ppt
  async uploadPPT({ channelId, name, type, path, pptCreatTime }) {
    const that = this;
    const transType = 'common';
    const appId = store.get('app.appId');
    const fileId = md5(`${name}${pptCreatTime}`) + `${appId || channelId}${transType}`;
    // 获取上传ppt必要的参数
    const { data: {
      code, message,
      data: uploadData
    } } =
      await api.getUploadToken({
        channelId,
        fileId,
        fileName: name,
        type: transType,
      }).catch(err => err);
    const { autoId, bucket, endpoint, dir, policy, accessId, encodedCallback, signature, convertStatus } = uploadData || {};
    if (code !== 200) {
      this.tip();
      console.error(`请求获取ppt上传token的接口失败，失败信息：${message}`);
      return;
    }
    if (convertStatus === 'waitConvert') return this._getUpladPPTStatus(channelId, fileId);
    else if (convertStatus === 'normal') return this._uploadPPTSuccess(autoId);
    // 开始上传ppt到阿里
    wx.uploadFile({
      url: `https://${bucket}.${endpoint}`,
      filePath: path,
      name: 'file',
      header: {
        'Content-Type': 'multipart/form-data',
        'accept': 'application/json'
      },
      formData: {
        key: `${dir}${fileId}.${type}`,
        policy,
        OSSAccessKeyId: accessId,
        'success_action_status': '200', // 让服务端返回200,不然，默认会返回204
        callback: encodedCallback,
        signature
      },
      success({ statusCode, errMsg }) {
        if (statusCode !== 200) {
          that.tip();
          return console.error(errMsg);
        }
        that._getUpladPPTStatus(channelId, fileId, autoId);
      },
      fail(err) {
        that.tip();
        console.error(err);
      }
    });
  },

  // 定时获取ppt上传状态
  async _getUpladPPTStatus(channelId, fileId, autoId) {
    const { data: { code, message, data: [{ convertStatus } = {}] = [] } } = await api.getUploadPPTStatus(channelId, fileId);
    if (code !== 200) {
      this.tip();
      return console.error(`获取ppt上传状态时失败，失败信息:${message}`);
    }
    switch (convertStatus) {
      case 'normal': // 上传成功
        this._uploadPPTSuccess(autoId);
        break;
      case 'waitConvert': // 转换中
        await utils.delay(2000);
        this._getUpladPPTStatus(channelId, fileId, autoId);
        break;
      case 'failUpload': // 上传失败
      case 'failConvert': // 转换失败
        console.error(`上传ppt时失败，失败信息：${message}`);
        this.tip();
        break;
    }
  },

  // ppt上传成功，开始切换ppt或者白板
  _uploadPPTSuccess(autoId) {
    wx.hideLoading();
    if (parseInt(autoId) !== 0) this.closePaint(true);
    const roomId = this.properties.options.channelId;
    const { user: { userId } } = this.data;
    const sendData = {
      EVENT: 'onSliceOpen',
      roomId,
      userId,
      docType: 1,
      data: {
        docType: 1,
        autoId,
        pageId: 0,
        isCamClosed: 1,
        isShareOpen: 0,
        teacherId: userId,
        pushtime: Date.now()
      }
    };
    this._runPPTMethods('changePPT', sendData.data);
    chat.sendSocketMessage(sendData);
  },

  // 监听ppt和白板的切换
  toggleWhiteBoard({ detail: status }) {
    this.setData({ isWhiteBoard: status });
  },

  // 选择画笔颜色
  bindTapColor({ currentTarget: { dataset: { type } } }) {
    if (!type) return;
    this.setData({ currentColor: type });
  },

  // 点击画板导航按钮
  bindTapToChnageDrawMode({ currentTarget: { dataset: { type } } }) {
    const { drawMode, inHorizontal } = this.data;
    const colorStyle = inHorizontal ? 'width:0;' : 'height:0;';
    if (type === 'pan') {
      const inDraw = !this.data.colorStyle;
      this.closePaint(inDraw);
    } else if (type === 'delete') {
      const inDelete = drawMode === 'delete';
      this.setData({
        colorStyle,
        inDelete: !inDelete,
        navWidthInHorizontal: inHorizontal ? 'width:96rpx' : '',
        drawMode: inDelete ? 'none' : 'delete'
      });
    }
    if (type === 'deleteAll') {
      this._runPPTMethods('toDeleteAllPaint');
    }
  },

  // 关闭画笔
  closePaint(isClose) {
    const { inHorizontal } = this.data;
    const colorStyle = inHorizontal ? 'width:0;' : 'height:0;';
    this.setData({
      colorStyle: isClose ? colorStyle : '',
      inDelete: false,
      navWidthInHorizontal: isClose && inHorizontal ? 'width:96rpx' : '',
      drawMode: isClose ? 'none' : 'pan',
    });
  },

  // 根据颜色值获取颜色类型
  _getColorsKey(val) {
    const { colors } = this.data;
    let { colorsVal } = this._getColorsKey;
    if (!colorsVal) {
      colorsVal = this._getColorsKey.colorsVal = {};
      Object.keys(colors).forEach(key => {
        colorsVal[colors[key]] = key;
      });
    }
    return colorsVal[val];
  },

  // 画板颜色改变
  // handleChangeColor({ detail: color }) {
  //   const colorVal = this._getColorsKey(color);
  //   if (colorVal) this.setData({ currentColor: colorVal });
  // },

  // 提示
  tip(content = '上传失败，请重试') {
    wx.hideLoading();
    wx.showModal({
      title: '',
      content,
      showCancel: false,
    });
  },

  // 运行ppt组件的方法
  _runPPTMethods(methods, ...args) {
    try {
      this.selectComponent('#componentPPT')[methods](...args);
    } catch (err) {
      console.error(err);
    }
  },

  // 切换到摄像头
  bindTapToCam() {
    const { pageType, meetingId, channelId, isHost, uid, userName, avatarUrl } = this.data.options;
    if (parseInt(this.data.options.isHost) === 1) emitToPaintEvent({ roomId: this.data.options.channelId, isCamClosed: 0 });
    utils.reLaunch('/pages/meeting/meeting?meetingId=' + meetingId + '&roomno=' + channelId + '&isHost=' + isHost + '&uid=' + uid + '&nickName=' + userName + '&avatarUrl=' + avatarUrl + '&pageType=' + pageType);
  },

  // 过滤字符串
  filterStr(str, length = 4) {
    let len = 0;
    for (let i = str.length - 1; i >= 0; i--) {
      const c = str.charCodeAt(i);
      // 单字节加1
      if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
        len++;
      } else {
        len += 2;
      }
      if (len > length) {
        return str.substring(i + 1, str.length);
      }
    }
    return str;
  },

  // 连麦用户列表过滤
  filterUserName(micUsers) {
    const confereeId = store.get('main.confereeId');
    for (let i = 0; i < micUsers.length; i++) {
      const { confereeId: selfId, micMute } = micUsers[i];
      if (selfId === confereeId) {
        this.setData({ selfMicMute: parseInt(micMute) });
        break;
      }
    }
    const users = (micUsers || []).reduce((r, user) => {
      user.miniName = this.filterStr(user.nickName);
      r.push(user);
      return r;
    }, []);
    this.setData({ users });
  },

  // 控制连麦
  bindTapControlMic() {
    // if (parseInt(this.data.selfMicMute) === 1) return;
    this.setData({ isCloseMic: !this.data.isCloseMic });
    this.selectComponent('#agoraMeeting').handleChangeMic(this.data.isCloseMic);
  },

  // 控制管理按钮
  baindTapManage() {
    const { meetingId, channelId } = this.data.options;
    utils.navigateTo('/pages/meeting-room/meeting-room?meetingId=' + meetingId + '&roomno=' + channelId);
  },

  async bindSoundChange() {
    const { pageType, meetingId } = this.data.options;
    if (pageType === 'create') return;
    const { conferees } = await getMeetingDetail(meetingId);
    this.setData({ micUsers: conferees });
    this.filterUserName(conferees);
  },

  handleChangeMic({ detail: status }) {
    const isCloseMic = status === 'close';
    const confereeId = store.get('main.confereeId');
    request.post('/api/meeting/updateMicMute', { confereeId, micMute: isCloseMic ? 1 : 0 });
    this.bindSoundChange();
  },

  onUnload() {
    console.log('白板页面销毁');
  },

  onShareAppMessage(e) {
    const { from } = e;
    const { meetingId } = this.data.options;
    const inviteNickName = utils.getStorage('userInfo').nickName;
    const topic = this.data.options.topic;
    const title = inviteNickName + '邀请您参与' + topic;
    const url = '/pages/meeting-invitation/meeting-invitation?meetingId=' + meetingId + '&inviteNickName=' + inviteNickName;
    if (from == 'button') {
      return utils.shareApp(title, url);
    }
  }
}));
