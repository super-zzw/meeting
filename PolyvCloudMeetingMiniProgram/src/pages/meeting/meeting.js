/* eslint-disable no-undef */
/* eslint-disable no-case-declarations */
/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable camelcase */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/*
 * @Author: Chenyintang
 * @Date: 2019-06-11 18:05:09
 * @Last Modified by: Chenyintang
 * @Last Modified time: 2019-10-12 19:20:10
 */
const MyTips = require('@components/mytips/mytips');
import api from '../../common/api/index';
const regeneratorRuntime = require('@lib/regenerator-runtime/regenerator-runtime');
import RTC from '@common/rtc/rtc';
import Chat from '../../common/chat/chat';
import { initChat, emitToPaintEvent, disconnectSocket } from '../../common/chat/initChat';
import { getAppID, getMeetingDetail } from '../../common/utils/getMeetingMessage';
import store from '../../store/index';
const request = require('@common/request/request');
const utils = require('@common/utils/utils');
const Layouter = require('@common/utils/layout');
const config = require('@common/config');
const app = getApp();

Page(Object.assign({}, MyTips, {
  data: {
    // 会议中的变量
    isCloseMic: false, // 是否关闭麦克风，默认false
    isCloseCam: false, // 是否关闭摄像头，默认false
    isNetError: false, // 网络是否断链
    isCanChangeMic: true, // 参会者是否可以开、关麦
    meetingId: '', // 会议id
    roomno: '', // 房间号
    uid: '', // 当前用户的id
    media: [], // 当前会议室的用户列表
    onlineUsers: [], // 接口返回的当前在线用户列表
    layouter: null, // 流窗口布局的实例
    changeViewModeStyle: '', // 白板切换按钮样式
    pageType: 'create', // 是否为会议发起者
    interval: null, // 主持人上报定时器

    // 会议室管理的变量
    isShowMeetingRoom: false, // 是否显示会议室管理的弹框页
    isHideIcon: true, // 是否隐藏头部的返回按钮
    isShowModal: false, // 是否显示结束会议的弹框
    isShowModal2: false, // 是否显示已结束会议信息的弹框
    startX: 0,
    startY: 0,
    meetingDetail: {}, // 当前会议的详情
    joinMeetingPeopleList: [], // 当前会议室的加入列表
    leaveMeetingDetail: {}, // 离开房间后的会议统计信息
    isIphoneX: false, // 是否为iPhoneX机型
    isEditTheme: false, // 会议主题是否处于编辑状态
    isLocked: false, // 是否锁定会议室
    index: '', // 当前编辑用户的索引
    isPageHide: false, // 当前页面是否被隐藏
    roomAddr: 'http://mt.polyv.net/login?m=', // 房间地址
  },

  async onLoad(opt) {
    const { meetingId, roomno, isHost, uid, nickName } = opt;
    this.setData({
      meetingId: meetingId,
      roomno: roomno,
      isHost: isHost,
      channel: roomno,
      uid: uid,
      role: 'broadcaster',
      client: null,
      layouter: null,
      leaving: false,
      nickName: nickName,
      pageType: parseInt(isHost) === 1 ? 'create' : 'join',
      isIphoneX: app.globalData.isIphoneX
    });
    await getMeetingDetail(meetingId);
    if (utils.getStorage('sessionId')) await getAppID();
  },

  async onReady() {
    const uid = this.data.uid;
    // 初始化布局
    this.initLayouter();

    // 监听网络变化
    utils.onNetworkStatusChange((res) => {
      // 断网重连
      // 从断网状态 到 网络连接
      if (!this.curNetwork && res.isConnected) {
        if (this.pusherStop || this.playerStop) {
          this.restart();
        } else if (this.needReconnect) {
          this.reconnect();
        }
      }
      this.curNetwork = res.isConnected;
    });

    // eslint-disable-next-line sonarjs/no-redundant-boolean
    if ((await utils.getAuthSetting('record') == true) && (await utils.getAuthSetting('camera') == true) && !this.data.client) {
      // 初始化频道
      console.log('初始化频道====', app.globalData.isChangedPage);
      if (app.globalData.isChangedPage) {
        this.reconnect();
      } else {
        const ret = await this.initAgoraChannel();
        if (ret) {
          '';
          const ts = new Date().getTime();
          this.addMedia(0, uid, ret, {
            key: ts
          });
        }
      }
    }
  },

  // 页面显示
  async onShow() {
    const that = this;
    // 屏幕常亮
    utils.setKeepScreenOn();
    // 图标动画
    this.setData({ changeViewModeStyle: 'top:-72rpx;', isCanChangeMic: app.globalData.isCanChangeMic });
    // 获取在线用户
    this.getOnlineUsers();

    // 获取会议详情
    this.getMeetingDetail();

    // 上报
    this.updateUserState(this.data.uid, 1);

    // 重连
    console.log('页面显示===', this.data.isPageHide);
    // eslint-disable-next-line sonarjs/no-redundant-boolean
    if (this.data.isPageHide && (await utils.getAuthSetting('record') == true) && (await utils.getAuthSetting('camera') == true)) {
      console.log('页面显示进入重连===', this.data.isPageHide);
      this.reconnect();
      this.setData({ isPageHide: false });
    }

    const media = this.data.media || [];
    media.forEach(item => {
      if (item.type == 0) {
        return;
      }
      const player = this.getPlayerComponent(item.uid);
      if (!player) {
        console.log(`player ${item.uid} component no longer exists`, 'error');
      } else {
        try {
          player.start();
        } catch (error) {
        }
      }
    });
    // 初始化聊天室
    initChat({
      channelId: this.data.roomno,
      pageType: this.data.pageType,
      toGetInitData: parseInt(this.data.isHost) !== 1,
      callback: ({ EVENT, isCamClosed, data: { uid, isMute, isCam, values } = {} }) => {
        switch (EVENT) {
          case 'controlCam':
            if (parseInt(isCamClosed) === 1) that.bindTapToPPT();
            break;
          case 'onChangeCamera':
            console.log('onChangeCamera切换摄像头==', uid, isCam);
            const _media1 = that.data.media;
            if (uid != that.data.uid) {
              for (let i = 0; i < _media1.length; i++) {
                const item = _media1[i];
                if (item.uid == uid) {
                  _media1[i].iscam = isCam;
                  that.setData({ media: _media1 });
                }
              }
            }
            break;
          case 'muteForMeeting':
            that.muteForMeeting({ uid, isMute });
            break;
          case 'muteForMeeting1':
            const _media = that.data.media;
            if (uid != that.data.uid) {
              for (let i = 0; i < _media.length; i++) {
                const item = _media[i];
                if (item.uid == uid) {
                  _media[i].ismute = isMute;
                  that.setData({ media: _media });
                }
              }
            }
            break;
          case 'delForMeeting':
            that.delForMeeting(uid);
            break;
          case 'endingForMeeting':
            // 主持人结束会议
            console.log('接收到主持人结束会议socket');
            utils.showToast({ title: '主持人结束会议', icon: 'none' });
            // 退出频道
            that.data.client.leave();
            that.data.client && that.data.client.destroy();
            // 断开socket
            disconnectSocket();
            setTimeout(() => {
              utils.reLaunch('/pages/index/index');
            }, 1000);
            break;
          case 'hostEndingMeeting':
            // 接收服务端推送的主持人异常退出超过7分钟的消息
            console.log('接收服务端推送的主持人异常退出超过7分钟的socket消息');
            let time = 60;
            const interval = setInterval(() => {
              time -= 1;
              if (time == 0) {
                clearInterval(interval);
                // 退出频道
                that.data.client.leave();
                that.data.client && that.data.client.destroy();
                // 断开socket
                disconnectSocket();
                setTimeout(() => {
                  utils.redirectTo('/pages/index/index');
                }, 1000);
              } else {
                that.showTips(`主持人已离线7分钟，会议将在 ${time}s 后关闭`, 'error');
              }
            }, 1000);
            break;
        }
      }
    });

    // 检测是否拒绝授权
    wx.authorize({
      scope: 'scope.record',
      complete(res) {
        const { errMsg } = res;
        if (errMsg != 'authorize:ok') {
          that.showModal({ content: '未获取到录音功能权限，请前往开启' });
        } else {
          wx.authorize({
            scope: 'scope.camera',
            async complete(ret) {
              const { errMsg } = ret;
              if (errMsg != 'authorize:ok') {
                that.showModal({ content: '未获取到摄像头功能权限，请前往开启' });
              } else {
                // 初始化频道
                if (!that.data.client) {
                  if (app.globalData.isChangedPage) {
                    that.reconnect();
                  } else {
                    const ret = await that.initAgoraChannel();
                    if (ret) {
                      const ts = new Date().getTime();
                      that.addMedia(0, that.data.uid, ret, {
                        key: ts
                      });
                    }
                  }
                }
              }
            }
          });
        }
      }
    });
  },

  // 页面隐藏
  onHide() {
    this.setData({
      isPageHide: true
    });
    this.updateUserState(this.data.uid, 0);
    console.log('会议页面隐藏================');
    app.globalData.isChangedPage = false;
    console.log('app.globalData.isChangedPag====', app.globalData.isChangedPage);
  },

  // 页面卸载
  onUnload() {
    this.destroyData();
  },

  showModal({ content }) {
    wx.showModal({
      title: '温馨提示',
      content: content,
      confirmText: '确定',
      showCancel: false,
      success(ret) {
        if (ret.confirm) {
          wx.openSetting({});
        }
      }
    });
  },

  // 当前会议中的在线用户
  async getOnlineUsers() {
    const ret = await request.post('/api/meeting/getOngoingConferees', { meetingId: this.data.meetingId });
    try {
      if (ret.code == config.successCode) {
        // 参会成员
        this.setData({
          onlineUsers: ret.data
        });
      }

      // 主持人上报
      const users = ret.data;
      for (let i = 0; i < users.length; i++) {
        if (users[i].isHost && (users[i].confereeId == this.data.uid)) {
          if (this.data.interval) clearInterval(this.data.interval);
          const interval = setInterval(async () => {
            await request.post(`/api/meeting/hostHeartbeat/${this.data.meetingId}`, {});
          }, 60000);
          this.setData({ interval: interval });
        }
      }

    } catch (error) {
      this.setData({
        onlineUsers: []
      });
    }
  },

  /**
   *上报会议室中人员的状态
   * @param {*} confereeId 当前用户id
   * @param {*} state 0:离线，1：在线
   */
  async updateUserState(confereeId, state) {
    await request.post('/api/meeting/updateConnecting', { confereeId: confereeId, connecting: state });
    // 更新在线用户列表
    this.getOnlineUsers();
  },

  // 主持人开关（用户）麦
  muteForMeeting({ uid, isMute }) {
    const that = this;
    const confereeId = store.get('main.confereeId');
    const media = this.data.media || [];
    if (confereeId && parseInt(confereeId) === parseInt(uid)) {
      const _media = that.data.media;
      if (isMute) {
        that.data.client.muteLocal('audio', () => {
          utils.showToast({ title: '您已被主持人静麦', icon: 'none' });
          _media.forEach((item, index) => {
            if (item.uid == that.data.uid) {
              _media[index].status = 1;
              _media[index].ismute = true;
              that.setData({
                media: _media
              });
            }
          });
          // 被主持人禁麦后未退出之前自己不能操作麦克风
          app.globalData.isCanChangeMic = false;
          that.setData({
            isCloseMic: true,
            isCanChangeMic: false
          });
          // 更新麦的状态
          that.updateMicStatus(uid, 1);
        }, err => {
          console.log(err);
        });
      } else {
        that.data.client.unmuteLocal('audio', () => {
          utils.showToast({ title: '您已被主持人解除静麦', icon: 'none' });
          _media.forEach((item, index) => {
            if (item.uid == that.data.uid) {
              _media[index].status = 0;
              _media[index].ismute = false;
              that.setData({
                media: _media
              });
            }
          });
          // 被主持人解除禁麦后自己能操作麦克风
          app.globalData.isCanChangeMic = true;
          that.setData({
            isCloseMic: false,
            isCanChangeMic: true
          });
          // 更新麦的状态
          that.updateMicStatus(uid, 0);
        }, err => {
          console.log(err);
        });
      }
      this.setData({
        isCloseMic: !this.data.isCloseMic
      });
    } else {
      // 静音的不是当前的用户，这时当前用户也能看到被静音用户的静音icon
      const _media1 = this.data.media;
      _media1.forEach((item, index) => {
        if (item.uid == uid) {
          if (isMute) {
            _media1[index].ismute = true;
          } else {
            _media1[index].ismute = false;
          }
          this.setData({ media: _media1 });
        }
      });
    }
  },

  // 更新麦状态
  async updateMicStatus(confereeId, type) {
    await request.post('/api/meeting/updateMicMute', { confereeId: confereeId, micMute: type });
  },

  // 主持人踢人
  delForMeeting(uid) {
    const confereeId = store.get('main.confereeId');
    if (confereeId && parseInt(confereeId) === parseInt(uid)) {
      utils.showToast({ title: '您被主持人移除出会议室', icon: 'none' });
      try {
        // 退出频道
        this.data.client.leave();
        this.data.client.destroy();
        // 断开socket
        disconnectSocket();
      } catch (error) { }
      setTimeout(() => {
        utils.reLaunch('/pages/index/index');
      }, 1000);
    }
  },

  // 初始化布局
  initLayouter() {
    const systemInfo = app.globalData.systemInfo;
    const sliceHeight = app.globalData.isIphoneX ? 84 : 64;
    this.layouter = new Layouter(systemInfo.windowWidth, systemInfo.windowHeight - sliceHeight);
  },

  // 处理麦和摄像头开启关闭
  async handleMicOrCam() {
    const that = this;
    const ret = await request.post('/api/meeting/getOngoingConferees', { meetingId: this.data.meetingId });
    const users = ret.data;
    for (let i = 0; i < users.length; i++) {
      const item = users[i];
      if (item.confereeId == that.data.uid) {
        // 静音
        if (item.micMute == 1) {
          that.data.client.muteLocal('audio', () => {
            console.log(utils.mklog(), '-------->audio停止音频流成功');
            that.setData({ isCloseMic: true });
          }, err => {
            console.log(err);
          });
        } else {
          that.data.client.unmuteLocal('audio', () => {
            console.log(utils.mklog(), '-------->audio恢复音频流成功');
            that.setData({ isCloseMic: false });
          }, err => {
            console.log(err);
          });
        }

        // 禁摄像头
        if (item.cameraState == 0) {
          that.data.client.muteLocal('video', () => {
            console.log(utils.mklog(), '初始化时===>publish video停止视频频流成功');
            that.setData({ isCloseCam: true });
          }, err => {
            console.log(err);
          });
        }
      } else {
        console.log('');
      }
    }
  },

  // 初始化sdk
  async initAgoraChannel() {
    const that = this;
    const client = new RTC();
    this.setData({ client: client });

    return new Promise(async (resolve, reject) => {
      const res = await client.init(this.data.roomno);
      this.subscribeEvents(client);
      this.data.client.setRole('broadcaster');
      client.join(res.connect_channel_key, res.channelId, this.data.uid, (uid) => {
        console.log(utils.mklog(), '加入客户端 join channel success===', this.data.uid);
        client.publish(async url => {
          resolve(url);
          that.handleMicOrCam();
        }, e => {
          console.log(utils.mklog(), `client publish failed: ${e.code} ${e.reason}`);
          reject(e);
        });
      }, e => {
        console.log(utils.mklog(), `client join channel failed: ${e.code} ${e.reason}`);
        reject(e);
      });
    });
  },

  // 添加流
  /**
   *
   * @param {*} mediaType 0:推流者，1：拉流者
   * @param {*} uid
   * @param {*} url
   * @param {*} options
   */
  async addMedia(mediaType, uid, url, options) {
    this.getOnlineUsers();
    let media = this.data.media || [];
    console.log(utils.mklog(), `add media ${mediaType == 1 ? 'player' : 'pusher'} ${uid}`, 'addMedia前===', media);

    const user = {
      key: options.key,
      type: mediaType, // 0:推流者，1：拉流者
      ismute: false, // 是否静音
      iscam: false, // 是否关闭摄像头
      uid: `${uid}`, // 用户id
      url: url,
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      // status: 0
    };
    if (mediaType == 0) {
      // pusher
      media.splice(0, 0, user);
    } else {
      // player
      media.push(user);
    }

    // utils.showToast({ title: uid + '', icon: 'none' });
    console.log(utils.mklog(), `add media ${mediaType ? 'player' : 'pusher'} ${uid}`, 'addMedia后===', media);

    // 设置用户对应的麦和视频流状态
    const onlineUsers = this.data.onlineUsers;
    media.forEach((item) => {
      onlineUsers.forEach((subItem, subIndex) => {
        if (item.uid == subItem.confereeId) {
          item.ismute = Boolean(subItem.micMute);
          item.iscam = Boolean(!subItem.cameraState);
        }
      });
    });

    media = this.syncLayout(media);
    return this.refreshMedia(media);
  },

  // 同步计算布局
  syncLayout(media) {
    const sizes = this.layouter.getSize(media.length);
    for (let i = 0; i < sizes.length; i++) {
      const size = sizes[i];
      const item = media[i];

      item.left = parseFloat(size.x).toFixed(2);
      item.top = parseFloat(size.y).toFixed(2);
      item.width = parseFloat(size.width).toFixed(2);
      item.height = parseFloat(size.height).toFixed(2);
    }
    return media;
  },

  // 是否已存在的流
  hasMedia(mediaType, uid) {
    const media = this.data.media || [];
    return media.filter(item => {
      return item.type == mediaType && `${item.uid}` == `${uid}`;
    }).length > 0;
  },

  // 刷新流（布局）
  refreshMedia(media) {
    return new Promise((resolve) => {
      this.setData({
        media: media
      }, () => {
        resolve();
      });
    });
  },

  // 订阅用户事件
  subscribeEvents(client) {
    const that = this;
    // 监听流加入
    client.on('stream-added', async e => {
      const uid = e.uid;
      console.log(utils.mklog(), `监听stream-added============用户 ${uid} 加入============`);
      // 订阅用户
      await that.subscribeUser(uid);
      // 上报用户状态
      that.updateUserState(uid, 1);
    });

    // 监听流移除
    client.on('stream-removed', async e => {
      const _uid = e.uid;
      console.log(utils.mklog(), `监听stream-removed============用户 ${_uid} 离开============`);
      that.removeMedia(_uid);
      // 上报用户状态
      that.updateUserState(_uid, 0);
    });

    client.on('error', err => {
      const errObj = err || {};
      const code = errObj.code || 0;
      const reason = errObj.reason || '';
      console.log(`error: ${code}, reason: ${reason}`);
      // 销毁并退出频道后，重建 client 对象，调用 rejoin 方法尝试重连
      const errCodes = [500, 501, 502, 901, 904, 905];
      if (errCodes.indexOf(code) >= 0) {
        this.needReconnect = true;
        if (this.curNetwork) {
          that.reconnect();
        }
      } else {
        this.needReconnect = false;
      }
    });

    client.on('update-url', e => {
      console.log(utils.mklog(), `update-url: ${JSON.stringify(e)}`);
      const uid = e.uid;
      const url = e.url;
      const ts = new Date().getTime();
      if (`${uid}` == `${that.uid}`) {
        console.log(utils.mklog(), 'update-url当前更新的是自己');
      } else {
        that.updateMedia(uid, {
          url: url
        });
      }
    });
  },

  // 订阅用户
  subscribeUser(uid) {
    const that = this;
    const ts = new Date().getTime();
    return new Promise((resolve, reject) => {
      that.data.client.subscribe(uid, url => {
        console.log(utils.mklog(), `subscribeUser=========>>>用户 ${uid} 订阅成功`);
        const media = that.data.media || [];
        let matchItem = null;
        for (let i = 0; i < media.length; i++) {
          const item = media[i];
          if (item.uid == uid) {
            matchItem = item;
            break;
          }
        }
        if (!matchItem) {
          console.log(utils.mklog(), 'subscribeUser=========>>>没有匹配到matchItem，属于新用户');
          that.addMedia(1, uid, url, {
            key: ts
          });
        } else {
          console.log(utils.mklog(), 'subscribeUser=========>>>匹配到matchItem，属于已有用户');
          that.updateMedia(matchItem.uid, {
            url: url
          });
        }
        resolve();
      }, e => {
        console.log(utils.mklog(), `subscribeUser=========>>>stream subscribed failed ${e} ${e.code} ${e.reason}`);
      });
    });
  },

  // 移除流
  removeMedia(uid) {
    console.log(utils.mklog(), `remove media ${uid}`);
    let media = this.data.media || [];
    media = media.filter(item => {
      return `${item.uid}` != `${uid}`;
    });

    if (media.length != this.data.media.length) {
      media = this.syncLayout(media);
      this.refreshMedia(media);
    } else {
      console.log(utils.mklog(), `media not changed: ${JSON.stringify(media)}`);
      return Promise.resolve();
    }
  },

  // 重连
  reconnect() {
    utils.showToast({ title: '尝试恢复连接...', icon: 'none' });
    this.data.client && this.data.client.destroy();
    this.reconnectTimer = setTimeout(() => {
      const uid = this.data.uid;
      const channel = this.data.channel;
      this.reinitAgoraChannel(uid, channel).then(url => {
        console.log(utils.mklog(), 'reinitAgoraChannel重新初始化成功');
        // this.subscribeEvents(this.data.client);
        const ts = new Date().getTime();
        if (this.hasMedia(0, this.data.uid)) {
          this.updateMedia(this.data.uid, {
            url: url
          });
        } else {
          console.log(utils.mklog(), 'pusher not yet exists when rejoin...adding');
          this.addMedia(0, this.data.uid, url, {
            key: ts
          });
        }
      }).catch(e => {
        console.log(utils.mklog(), `reinitAgoraChannel重连失败: ${e}`);
        return this.reconnect();
      });
    }, 1 * 1000);
  },

  // 重启
  restart() {
    this.setData({
      media: []
    });
    this.reconnect();
    // const { meetingId, roomno, isHost, uid, nickName } = this.data;
    // const { avatarUrl } = utils.getStorage('userInfo');
    // utils.reLaunch('/pages/meeting/meeting?meetingId=' + meetingId + '&roomno=' + roomno + '&isHost=' + isHost + '&uid=' + uid + '&nickName=' + nickName + '&avatarUrl=' + avatarUrl);
  },

  // 重新初始化sdk
  async reinitAgoraChannel(uid, channel) {
    const that = this;
    const client = new RTC();
    this.data.client = client;
    return new Promise(async (resolve, reject) => {
      const res = await client.init(this.data.roomno);
      this.subscribeEvents(client);
      this.data.client.setRole('broadcaster');
      // 在会议室的用户id
      const uids = this.data.media.map(item => {
        return item.uid;
      });

      // 开始重连
      client.rejoin(res.connect_channel_key, res.channelId, this.data.uid, uids, () => {
        console.log(utils.mklog(), '=========rejoin重连成功=========');
        client.publish(async (url) => {
          console.log('rejoin client publish success', url);
          resolve(url);
          that.handleMicOrCam();
        }, e => {
          console.log(utils.mklog(), `rejoin client publish failed: ${e.code} ${e.reason}`);
          reject(e);
        });
      }, e => {
        console.log(utils.mklog(), `=========rejoin重连失败=========: ${e.code} ${e.reason}`);
        reject(e);
      });
    });
  },

  // 获取player组件
  getPlayerComponent(uid) {
    return this.selectComponent(`#rtc-player-${uid}`);
  },

  // 获取pusher组件
  getPusherComponent() {
    return this.selectComponent('#rtc-pusher');
  },

  // 重置状态
  destroyData() {
    // 退出后如果之前被主持人静音的，恢复可以自由切换麦克风
    app.globalData.isCanChangeMic = true;
    app.globalData.isChangedPage = false;

    try {
      this.reconnectTimer && clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;

      this.data.interval && clearInterval(this.data.interval);
      this.data.interval = null;

      this.data.client && this.data.client.leave();
      this.data.client && this.data.client.destroy();
      this.data.client = null;
      disconnectSocket();
    } catch (err) {
      console.error(err);
    }
  },

  // 更新流
  updateMedia(uid, options) {
    console.log(utils.mklog(), `更新流update media ${uid} ${JSON.stringify(options)}`);
    const media = this.data.media || [];
    let changed = false;
    for (let i = 0; i < media.length; i++) {
      const item = media[i];
      if (item.uid == uid) {
        media[i] = Object.assign(item, options);
        changed = true;
        break;
      }
    }

    if (changed) {
      return this.refreshMedia(media);
    } else {
      console.log(utils.mklog(), `media not changed: ${JSON.stringify(media)}`);
      return Promise.resolve();
    }
  },

  // 当前用户开关麦
  handleChangeMic(e) {
    const that = this;
    const { currentTarget: { dataset: { uid, ismute: nowIsMute, index } } } = e;
    const _media = that.data.media;
    const onlineUsers = that.data.onlineUsers;
    let hostUid = null;

    // console.log(utils.mklog(), onlineUsers, uid);
    for (let i = 0; i < onlineUsers.length; i++) {
      const item = onlineUsers[i];
      if (item.isHost) {
        hostUid = item.confereeId;
      }
    }
    // console.log(utils.mklog(), '======', uid, nowIsMute, 'hostUid=', hostUid);

    if (!that.data.isCanChangeMic && hostUid != uid) {
      utils.showToast({ title: '您已被主持人静音', icon: 'none' });
      return;
    }

    // 发送socket
    const chat = store.get('main.chat');
    const isMute = nowIsMute;
    const sendData = {
      EVENT: 'muteForMeeting1',
      version: '1.0',
      data: { uid, meetingId: this.data.meetingId, isMute },
      tip: '会议发起者将指定参与者静音',
      emitMode: 0
    };
    chat.sendSocketMessage(sendData, 'customMessage');

    if (!that.data.isCloseMic) {
      that.data.client.muteLocal('audio', () => {
        console.log(utils.mklog(), 'audio停止音频流成功');
        _media.forEach((item, index) => {
          if (item.uid == that.data.uid) {
            _media[index].status = 1;
            _media[index].ismute = true;
            that.setData({
              media: _media
            });
          }
        });
        that.updateMicStatus(that.data.uid, 1);
        this.setData({
          isCloseMic: true
        });
      }, err => {
        console.log(err);
      });
    } else {
      that.data.client.unmuteLocal('audio', () => {
        console.log(utils.mklog(), 'audio恢复音频流成功');
        _media.forEach((item, index) => {
          if (item.uid == that.data.uid) {
            _media[index].status = 0;
            _media[index].ismute = false;
            that.setData({
              media: _media
            });
          }
        });
        that.updateMicStatus(that.data.uid, 0);
        this.setData({
          isCloseMic: false
        });
      }, err => {
        console.log(err);
      });
    }
  },

  // 当前用户开关摄像头
  handleChangeCam(e) {
    const that = this;
    const { currentTarget: { dataset: { uid, iscam: nowIsCam } } } = e;
    const _media = that.data.media;
    const onlineUsers = that.data.onlineUsers;
    let hostUid = null;

    console.log(utils.mklog(), onlineUsers, uid);
    for (let i = 0; i < onlineUsers.length; i++) {
      const item = onlineUsers[i];
      if (item.isHost) {
        hostUid = item.confereeId;
      }
    }

    console.log(utils.mklog(), '======', uid, nowIsCam, 'hostUid=', hostUid);

    // 发送socket
    const chat = store.get('main.chat');
    const isCam = nowIsCam;
    const sendData = {
      EVENT: 'onChangeCamera',
      version: '1.0',
      data: { uid, meetingId: this.data.meetingId, isCam },
      tip: '用户切换视频流',
      emitMode: 0
    };
    chat.sendSocketMessage(sendData, 'customMessage');

    if (!that.data.isCloseCam) {
      that.data.client.muteLocal('video', async () => {
        console.log(utils.mklog(), 'muteLocal video success');
        _media.forEach((item, index) => {
          if (item.uid == that.data.uid) {
            _media[index].status = 2;
            _media[index].iscam = true;
            that.setData({
              media: _media
            });
          }
        });
        // 更新摄像头
        that.updateCam(that.data.uid, 0);
        that.setData({
          isCloseCam: true
        });
      }, err => {
        console.log(err);
      });
    } else {
      that.data.client.unmuteLocal('video', () => {
        console.log(utils.mklog(), 'unmuteLocal video success');
        _media.forEach((item, index) => {
          if (item.uid == that.data.uid) {
            _media[index].status = 0;
            _media[index].iscam = false;
            that.setData({
              media: _media
            });
          }
        });
        // 更新摄像头
        that.updateCam(that.data.uid, 1);
        that.setData({
          isCloseCam: false
        });
      }, err => {
        console.log(err);
      });
    }
  },

  // 更新摄像头状态
  async updateCam(confereeId, cameraState) {
    await request.post('/api/meeting/updateCameraState', { confereeId: confereeId, cameraState: cameraState });
  },

  // 当前用户摄像头方向切换
  handleSwitchCamera() {
    const agoraPusher = this.getPusherComponent();
    agoraPusher && agoraPusher.switchCamera();
  },

  // 网络断开
  onPusherFailed() {
    this.setData({
      isNetError: true
    });
  },

  bindChangeWin(e) {
    const { currentTarget: { dataset: { uid, index } } } = e;
  },

  // 推流组件状态变化
  onPusherStatusChanged(e) {
    // console.log(e);
    const code = e.detail.code;
    // 网络断连，且经多次重连抢救无效，更多重试请自行重启推流
    if (code === -1307) {
      this.pusherStop = true;
      if (this.curNetwork) {
        this.restart();
      }
      // 上报状态
      that.updateUserState(this.data.uid, 0);
    } else {
      this.pusherStop = false;
    }
  },

  // live-player组件状态变化
  onPlayerStatusChanged(e) {
    const code = e.detail.code;
    // 网络断连，且经多次重连抢救无效，更多重试请自行重启推流
    if (code === -2301) {
      this.playerStop = true;
    } else {
      this.playerStop = false;
    }
  },

  // 切换到会议室管理
  goMeetingRoomManage() {
    this.setData({
      isHideIcon: false,
      isShowMeetingRoom: true
    });
    this.getMeetingDetail();
  },

  // 切换白板
  bindTapToPPT() {
    this.destroyData();
    const { meetingId, isHost, uid, pageType, isCloseMic } = this.data;
    const { nickName, avatarUrl } = utils.getStorage('userInfo');
    const channelId = this.data.roomno;
    const topic = this.data.meetingDetail.topic;
    if (parseInt(isHost) === 1) emitToPaintEvent({ roomId: channelId });
    if (!nickName || !avatarUrl || !channelId) return console.error(`加入会议数据不足,nickName:${nickName},avatarUrl:${avatarUrl},channelId:${channelId}`);
    utils.reLaunch(`/pages/ppt/ppt?channelId=${channelId}&roomNo=${this.data.meetingDetail.roomNo}&topic=${topic}&userName=${nickName}&avatarUrl=${avatarUrl}&pageType=${pageType}&meetingId=${meetingId}&isHost=${isHost}&uid=${uid}&isCloseMic=${isCloseMic}`);
    this.setData({ changeViewModeStyle: '' });
  },

  // 会议详情
  async getMeetingDetail() {
    const ret = await request.post('/api/meeting/getMeetingDetail', { meetingId: this.data.meetingId, sessionId: utils.getStorage('sessionId') });
    try {
      if (ret.code == config.successCode) {
        const _joinMeetingPeopleList = ret.data.conferees;
        for (let i = 0; i < _joinMeetingPeopleList.length; i++) {
          _joinMeetingPeopleList[i]['isTouchMove'] = false;
        }
        this.setData({
          meetingDetail: ret.data,
          joinMeetingPeopleList: _joinMeetingPeopleList
        });
      } else {
        utils.showToast({ title: ret.message, icon: 'none' });
      }
    } catch (error) {
    }
  },

  // 编辑会议主题
  editTheme(e) {
    this.setData({
      isEditTheme: !this.data.isEditTheme
    });
  },

  // 会议主题编辑中
  handleTopicInputing(e) {
    const { detail: { value } } = e;
    if (utils.getLen(value) > 20) {
      this.setData({
        'meetingDetail.topic': value.substring(0, 20)
      });
    } else {
      this.setData({
        'meetingDetail.topic': value
      });
    }
  },

  /**
   * 修改会议主题
   * @param {*} e
   */
  async handleTopicInput(e) {
    const { detail: { value } } = e;
    const ret = await request.post('/api/meeting/updateTopic', { meetingId: this.data.meetingId, topic: this.data.meetingDetail.topic });
    try {
      if (ret.code == config.successCode) {
        this.setData({
          'meetingDetail.topic': this.data.meetingDetail.topic
        });
      } else {
        utils.showToast({ title: ret.message, icon: 'none' });
      }
    } catch (error) {

    }
  },

  handleNickInputing(e) {
    const { detail: { value } } = e;
    if (this.data.meetingDetail.isHost) {
      if (utils.getLen(value) > 20) {
        this.setData({
          'meetingDetail.nickName': value.substring(0, 20)
        });
      } else {
        this.setData({
          'meetingDetail.nickName': value
        });
      }
    }
  },

  // 开、解锁会议
  async lockMeetingRoom() {
    const ret = await request.post('/api/meeting/lockingMeeting', { meetingId: this.data.meetingId });
    try {
      if (ret.code == config.successCode) {
        if (this.data.meetingDetail.locking) {
          this.setData({
            'meetingDetail.locking': 0
          });
          utils.showToast({ title: '房间已解锁', image: '../../images/meeting-room/lock-open@2x.png' });
        } else {
          this.setData({
            'meetingDetail.locking': 1
          });
          utils.showToast({ title: '房间已锁定', image: '../../images/meeting-room/lock-closed@2x.png' });
        }
      } else {
        utils.showToast({ title: '操作失败', icon: 'none' });
      }
    } catch (error) {
      console.log(error);
    }
  },

  // 复制房间号
  copyText(e) {
    const { currentTarget: { dataset: { text, psw } } } = e;
    if (this.data.sourceType != 'records') {
      const _text = psw ? text + ` 密码:${psw}` : text;
      utils.copyText(_text);
    }
  },

  // 编辑昵称
  editNickName(e) {
    const { currentTarget: { dataset: { id, index } } } = e;
    this.setData({
      uid: id,
      index: index,
      isEditMode: !this.data.isEditMode
    });
  },

  // 编辑参与人员昵称
  async handleNickInput(e) {
    const { detail: { value } } = e;
    if (utils.getLen(value) > 16) {
      this.setData({
        nickName: value.substring(0, 16)
      });
    } else {
      this.setData({
        nickName: value
      });
    }
    const ret = await request.post('/api/meeting/updateName', { confereeId: this.data.uid, nickName: this.data.nickName });
    try {
      if (ret.code == config.successCode) {
        this.setData({
          isEditMode: false
        });
        this.getMeetingDetail();
      } else {
        utils.showToast({ title: ret.message, icon: 'none' });
      }
    } catch (error) {

    }
  },

  // 主持人静言用户
  async handleVoice(e) {
    const { currentTarget: { dataset: { uid, ismute: nowIsMute, index } } } = e;
    const chat = store.get('main.chat');
    if (!chat) return;
    const isMute = !nowIsMute;
    const ret = await request.post('/api/meeting/updateMicMute', { confereeId: uid, micMute: isMute ? 1 : 0 });
    try {
      if (ret.code == config.successCode) {
        const sendData = {
          EVENT: 'muteForMeeting',
          version: '1.0',
          data: { uid, meetingId: this.data.meetingId, isMute },
          tip: '会议发起者将指定参与者静音',
          emitMode: 0
        };
        chat.sendSocketMessage(sendData, 'customMessage');
        console.log('主持人发送静音socket，发送数据为=', sendData);
        this.getMeetingDetail();
      } else {
        utils.showToast({ title: ret.message, icon: 'none' });
      }
    } catch (error) {

    }

  },

  // 移除会议室用户
  async handleDel(e) {
    const { currentTarget: { dataset: { uid, index } } } = e;
    const ret = await request.post('/api/meeting/removeUser', { meetingId: this.data.meetingId, confereeId: uid });
    try {
      if (ret.code == config.successCode) {
        // 发送socket
        const chat = store.get('main.chat');
        if (!chat) return;
        const sendData = {
          EVENT: 'delForMeeting',
          version: '1.0',
          data: { uid, meetingId: this.data.meetingId },
          tip: '会议发起者将指定参与者移除',
          emitMode: 0
        };
        chat.sendSocketMessage(sendData, 'customMessage');
        console.log('主持人发送移除socket，发送数据为=', sendData);
        this.getMeetingDetail();
      } else {
        utils.showToast({ title: ret.message, icon: 'none' });
      }
    } catch (error) {

    }
  },

  // 结束会议提示
  endingMeeting() {
    this.setData({
      isShowModal: true
    });
  },

  // 结束会议取消
  bindCancel() {
    this.setData({
      isShowModal: false
    });
  },

  // 结束会议确认回调
  async bindConfirm() {
    const ret = await request.post('/api/meeting/leaveMeeting', { meetingId: this.data.meetingId });
    this.updateMicStatus(this.data.uid, 0);
    this.updateCam(this.data.uid, 1);
    app.globalData.isChangedPage = false;
    this.data.client && this.data.client.destroy();
    this.data.client = null;
    console.log('结束会议确认回调==', app.globalData.isChangedPage);
    try {
      if (ret.code == config.successCode) {
        if (this.data.meetingDetail.isHost == 1) {
          const chat = store.get('main.chat');
          if (!chat) return;
          const sendData = {
            EVENT: 'endingForMeeting',
            version: '1.0',
            data: {},
            tip: '会议发起者结束会议',
            emitMode: 0
          };
          chat.sendSocketMessage(sendData, 'customMessage');
          console.log('会议发起者结束会议socket');

          this.setData({
            leaveMeetingDetail: ret.data,
            isShowModal: false,
            isShowModal2: true
          });
        } else {
          utils.reLaunch('/pages/index/index');
        }
      } else {
        utils.showToast({ title: ret.message, icon: 'none' });
      }
    } catch (error) {

    }

    // 结束画板
    if (parseInt(this.data.meetingDetail.isHost) === 1) api.closeMeetingPPT(this.data.meetingDetail.roomNo);
    disconnectSocket();
  },
  bindConfirm2() {
    this.setData({
      isShowModal: false,
      isShowModal2: false
    });
    utils.reLaunch('/pages/index/index');
  },
  handleClose() {
    this.setData({
      isShowMeetingRoom: false,
      isHideIcon: true
    });
  },
  touchstart(e) {
    this.data.joinMeetingPeopleList.forEach((v, i) => {
      if (v.isTouchMove) {
        v.isTouchMove = false;
      }
    });
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      joinMeetingPeopleList: this.data.joinMeetingPeopleList
    });
  },
  touchmove(e) {
    const that = this,
      index = e.currentTarget.dataset.index,
      startX = that.data.startX,
      startY = that.data.startY,
      touchMoveX = e.changedTouches[0].clientX,
      touchMoveY = e.changedTouches[0].clientY,
      angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
    that.data.joinMeetingPeopleList.forEach((v, i) => {
      v.isTouchMove = false;
      if (Math.abs(angle) > 30) return;
      if (i == index) {
        if (touchMoveX > startX) {
          v.isTouchMove = false;
        } else {
          v.isTouchMove = true;
        }
      }
    });
    that.setData({
      joinMeetingPeopleList: that.data.joinMeetingPeopleList
    });
  },
  angle(start, end) {
    const _X = end.X - start.X,
      _Y = end.Y - start.Y;
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
  onShareAppMessage(e) {
    const { from } = e;
    const meetingId = this.data.meetingId;
    const inviteNickName = utils.getStorage('userInfo').nickName;
    const topic = this.data.meetingDetail.topic;
    const title = inviteNickName + '邀请您参与' + topic;
    const url = '/pages/meeting-invitation/meeting-invitation?meetingId=' + meetingId + '&inviteNickName=' + inviteNickName;
    console.log(url);
    if (from == 'button') {
      return utils.shareApp(title, url);
    }
  }
}));
