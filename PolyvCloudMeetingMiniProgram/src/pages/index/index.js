/* eslint-disable sonarjs/no-redundant-boolean */
/* eslint-disable sonarjs/no-collapsible-if */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable no-dupe-keys */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/*
 * @Author: Chenyintang
 * @Date: 2019-06-06 11:53:43
 * @Last modified by:   Chenyintang
 * @Last modified time: 2019-06-09 19:03:33
 */
import api from '../../common/api/index';
import store from '../../store/index';
import { initChat, disconnectSocket } from '../../common/chat/initChat';
import { getAppID } from '../../common/utils/getMeetingMessage';
const regeneratorRuntime = require('@lib/regenerator-runtime/regenerator-runtime');
const request = require('@common/request/request');
const utils = require('@common/utils/utils');
const config = require('@common/config');
const app = getApp();
const EXPERIENCE_URL = '/api/user/getExperienceStatus'; // 是否还有体验时间的接口地址

Page({
  data: {
    isAuth: false, // 是否已授权用户信息，默认false为未授权
    isBindMobile: '', // 手机号是否已绑定,空为为绑定
    sessionId: '', // 用户登录标识
    isIphoneX: app && app.globalData.isIphoneX, // 是否为iPhoneX机型，默认为false
    isShowModal: false, // 是否显示继续会议的弹框
    isShowModal2: false, // 是否显示提示获取手机号码的弹框
    isShowModal3: false, // 是否显示试用结束的弹框
    isShowModal4: false, // 是否显示拨打电话的弹框
    isShowModal5: false, // 是否显示体验结束的弹框
    isFiltered: false, // 是否隐藏筛选时间的按钮，默认不隐藏
    btnClickType: '', // 按钮点击的类型：subscribe：跳转预约会议详情，records:跳转会议记录详情，join-meeting: 加入会议，launch-meeting：发起会议，subscribe-meeting:预约会议
    page1: 0, // 我的预约列表页码
    pageSize1: 5, // 我的预约列表每页数量
    total1: 0, // 我的预约列表总数
    isCanRequest1: true, // 是否可以发起获取预约列表的请求，默认为true
    page2: 0, // 会议记录页码
    pageSize2: 10, // 会议记录每页数量
    total2: 0, // 会议记录总数
    isCanRequest2: true, // 是否可以发起获取获取会议记录列表的请求，默认为true
    mySubscribeList: [], // 预约列表
    meetingRecordsList: [], // 会议记录列表
    selectDate: '', // 筛选时间
    endDate: '', // 预约的结束时间
    ongoingMeetingDetail: {}, // 正在进行中的会议详情
    date: '', // 填充日期组件的时间
    userInfo: {}, // 授权的用户信息
  },

  // 点击跳转页面
  async skipPage(e) {
    const userInfo = utils.getStorage('userInfo');
    const { currentTarget: { dataset: { type, roomno, id, status, confereeid } } } = e;
    this.setData({ btnClickType: type });

    if (type == 'subscribe') {
      // 会议进行中跳转会议室
      if (status == 1) {
        const ret = await request.post('/api/meeting/detailJoinMeeting', { meetingId: id });
        try {
          if (ret.code == config.successCode) {
            utils.navigateTo('/pages/meeting/meeting?meetingId=' + id + '&roomno=' + roomno + '&isHost=0&uid=' + confereeid + '&nickName=' + userInfo.nickName + '&avatarUrl=' + userInfo.avatarUrl);
          }
        } catch (error) { }
      } else {
        utils.navigateTo('/pages/subscribe-meeting-detail/subscribe-meeting-detail?meetingId=' + id + '&roomno=' + roomno + '&sourceType=subscribe');
      }
    } else if (type == 'records') {
      if (status != 1) {
        utils.navigateTo('/pages/subscribe-meeting-detail/subscribe-meeting-detail?meetingId=' + id + '&roomno=' + roomno + '&sourceType=records');
      }
    } else if (type == 'join-meeting') {
      utils.navigateTo('/pages/join-meeting/join-meeting');
    } else if (type == 'launch-meeting') {
      // 检测是否有体验权限
      const result = await request.post(EXPERIENCE_URL, {});
      try {
        if (result.code == 300000) {
          utils.showToast({ title: result.message, icon: 'none' });
          utils.removeStorage('userInfo');
          utils.removeStorage('sessionId');
          utils.removeStorage('isBindMobile');
          setTimeout(() => {
            utils.reLaunch('/pages/index/index');
          }, 1000);
        } else {
          if (result.data.isExperience == 1) {
            utils.navigateTo('/pages/launch-meeting/launch-meeting');
          } else {
            this.setData({ isShowModal3: true });
          }
        }
      } catch (error) { }
    } else if (type == 'subscribe-meeting') {
      // 检测是否有体验权限
      const result = await request.post(EXPERIENCE_URL, {});
      console.log(result);
      try {
        if (result.code == 300000) {
          utils.showToast({ title: result.message, icon: 'none' });
          utils.removeStorage('userInfo');
          utils.removeStorage('sessionId');
          utils.removeStorage('isBindMobile');
          setTimeout(() => {
            utils.reLaunch('/pages/index/index');
          }, 1000);
        } else {
          if (result.data.isExperience == 1) {
            utils.navigateTo('/pages/subscribe-meeting/subscribe-meeting');
          } else {
            this.setData({ isShowModal3: true });
          }
        }
      } catch (error) { }
    }
  },

  // 获取用户信息回调
  getUserInfo(e) {
    const that = this;
    const { detail: { errMsg, userInfo } } = e;
    const { currentTarget: { dataset: { type } } } = e;
    that.setData({ btnClickType: type });

    if (errMsg == 'getUserInfo:ok') {
      app.globalData.userInfo = e.detail.userInfo;
      that.setData({ userInfo: userInfo });

      wx.login({
        async success(res) {
          if (res.code) {
            utils.showLoading('授权中');
            const ret = await request.post('/api/user/wxappLogin', {
              'avatarUrl': userInfo.avatarUrl,
              'nickName': userInfo.nickName,
              'city': userInfo.city,
              'country': userInfo.country,
              'gender': userInfo.gender,
              'province': userInfo.province,
              'jsCode': res.code
            });
            utils.hideLoading();
            try {
              if (ret.code == config.successCode) {
                try {
                  if (utils.getStorage('sessionId')) await getAppID();
                } catch (error) { }
                that.setData({
                  isBindMobile: ret.data.isBindMobile,
                  sessionId: ret.data.sessionId
                });
                utils.setStorage('userInfo', userInfo);
                utils.setStorage('sessionId', ret.data.sessionId);
                utils.setStorage('isBindMobile', ret.data.isBindMobile);

                if ((type != 'join-meeting') && !that.data.isBindMobile) {
                  that.setData({ isShowModal2: true });
                } else {
                  if (type == 'launch-meeting') {
                    // 检测是否有体验权限
                    const result = await request.post(EXPERIENCE_URL, {});
                    try {
                      if (result.data.isExperience == 1) {
                        utils.navigateTo('/pages/launch-meeting/launch-meeting');
                      } else {
                        that.setData({ isShowModal3: true });
                      }
                    } catch (error) { }
                    // utils.navigateTo('/pages/launch-meeting/launch-meeting');
                  } else if (type == 'subscribe-meeting') {
                    // 检测是否有体验权限
                    const result = await request.post(EXPERIENCE_URL, {});
                    try {
                      if (result.data.isExperience == 1) {
                        utils.navigateTo('/pages/subscribe-meeting/subscribe-meeting');
                      } else {
                        that.setData({ isShowModal3: true });
                      }
                    } catch (error) { }
                    // utils.navigateTo('/pages/subscribe-meeting/subscribe-meeting');
                  } else if (type == 'join-meeting') {
                    utils.navigateTo('/pages/join-meeting/join-meeting');
                  }
                }

              } else {
                utils.showToast({ title: ret.message, icon: 'none' });
              }
            } catch (error) { }
          } else {
            console.log('登录失败！' + res.errMsg);
          }
        }
      });
    }
  },

  // 获取手机号回调
  handleGetPhoneNumber(e) {
    const that = this;
    const userInfo = utils.getStorage('userInfo');
    const { detail: { errMsg, iv, encryptedData }, currentTarget: { dataset: { type } } } = e;
    that.setData({ btnClickType: type });

    if (errMsg == 'getPhoneNumber:ok') {
      wx.login({
        async success(res) {
          if (res.code) {
            utils.showLoading('绑定中');
            const ret = await request.post('/api/user/bindMobile', {
              'sessionId': utils.getStorage('sessionId'),
              'jsCode': res.code,
              'encryptedData': encryptedData,
              'iv': iv
            });
            utils.hideLoading();
            try {
              if (ret.code == config.successCode) {
                that.setData({
                  isShowModal2: false,
                  sessionId: ret.data.sessionId,
                  isBindMobile: ret.data.isBindMobile
                });
                utils.setStorage('sessionId', ret.data.sessionId);
                utils.setStorage('isBindMobile', ret.data.isBindMobile);
                if (that.data.btnClickType == 'launch-meeting') {
                  if (ret.data.isFirstLogin) {
                    that.setData({ isShowModal5: true });
                  } else {
                    // 检测是否有体验权限
                    const result = await request.post(EXPERIENCE_URL, {});
                    try {
                      if (result.data.isExperience == 1) {
                        utils.navigateTo('/pages/launch-meeting/launch-meeting');
                      } else {
                        that.setData({ isShowModal3: true });
                      }
                    } catch (error) { }
                  }
                } else if (that.data.btnClickType == 'subscribe-meeting') {
                  if (ret.data.isFirstLogin) {
                    that.setData({ isShowModal5: true });
                  } else {
                    // 检测是否有体验权限
                    const result = await request.post(EXPERIENCE_URL, {});
                    try {
                      if (result.data.isExperience == 1) {
                        utils.navigateTo('/pages/subscribe-meeting/subscribe-meeting');
                      } else {
                        that.setData({ isShowModal3: true });
                      }
                    } catch (error) { }
                  }
                }
              } else {
                utils.showToast({ title: ret.message, icon: 'none' });
              }
            } catch (error) {
              console.log(error);
            }
          }
        }
      });
    }
  },

  // 查看更多预约会议
  lookeMoreSubscribeMeeting() {
    this.getMySubscribe();
  },

  // 查看更多会议记录
  lookeMoreMeetingRecords() {
    this.getMeetingRecords();
  },

  // 日期筛选
  bindDateChange(e) {
    const { detail: { value } } = e;
    this.setData({
      selectDate: value,
      page2: 0,
      total2: 0,
      isCanRequest2: true,
      isFiltered: true
    });
    this.getMeetingRecords();
  },

  // 关闭结束会议弹框
  async bindCancel() {
    app.globalData.isChangedPage = false;
    const ret = await request.post('/api/meeting/leaveMeeting', { meetingId: this.data.ongoingMeetingDetail.meetingId });
    try {
      if (ret.code == config.successCode) {
        this.setData({
          isShowModal: false
        });
        this.initStatus();
        this.getMySubscribe();
        this.getMeetingRecords();
        if (this.data.ongoingMeetingDetail.isHost) {
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
        }
      } else {
        utils.showToast({ title: ret.message, icon: 'none' });
      }
    } catch (error) {

    }

    // 结束画板
    if (parseInt(this.data.ongoingMeetingDetail.isHost) === 1) api.closeMeetingPPT(this.data.ongoingMeetingDetail.roomNo);
    disconnectSocket();
  },

  bindCancel2() {
    this.setData({
      isShowModal2: false
    });
  },

  // 确认继续会议
  async bindConfirm() {
    // eslint-disable-next-line sonarjs/no-redundant-boolean
    if (app.globalData.isEntryMeetingPage && (await utils.getAuthSetting('record') != true)) {
      utils.showToast({ title: '您还未开启录音权限，请前往开启', icon: 'none', duration: 3000 });
      wx.openSetting({});
      return;
    }
    // eslint-disable-next-line sonarjs/no-redundant-boolean
    if (app.globalData.isEntryMeetingPage && (await utils.getAuthSetting('camera') != true)) {
      utils.showToast({ title: '您还未开启摄像头权限，请前往开启', icon: 'none', duration: 3000 });
      wx.openSetting({});
      return;
    }

    this.setData({
      isShowModal: false
    });
    const data = this.data.ongoingMeetingDetail;
    disconnectSocket();
    utils.navigateTo('/pages/meeting/meeting?meetingId=' + data.meetingId + '&roomno=' + data.channelId + '&isHost=' + data.isHost + '&uid=' + data.confereeId + '&nickName=' + data.nickName + '&avatarUrl=' + data.avatarUrl);
  },

  // 获取我的预约列表
  async getMySubscribe() {
    const that = this;
    if (!that.data.isCanRequest1) {
      return;
    }
    that.setData({
      page1: that.data.page1 + 1
    });
    const ret = await request.post('/api/user/mySubscribe', { sessionId: utils.getStorage('sessionId'), pageNum: that.data.page1, pageSize: that.data.pageSize1 });
    try {
      if (ret.code == config.successCode) {
        that.setData({
          total1: ret.data.total,
          isCanRequest1: ret.data.hasNextPage
        });
        if (that.data.page1 > 1) {
          that.setData({
            mySubscribeList: that.data.mySubscribeList.concat(ret.data.list)
          });
        } else {
          that.setData({
            mySubscribeList: ret.data.list
          });
        }
      } else {
        console.log(ret);
      }
    } catch (error) { }
  },

  // 获取会议记录列表
  async getMeetingRecords() {
    const that = this;
    if (!that.data.isCanRequest2) {
      return;
    }
    that.setData({
      page2: that.data.page2 + 1
    });

    const ret = await request.post('/api/user/meetingRecords', { screenTime: that.data.selectDate, pageNum: that.data.page2, pageSize: that.data.pageSize2 });
    try {
      if (ret.code == config.successCode) {
        that.setData({
          total2: ret.data.total,
          isCanRequest2: ret.data.hasNextPage
        });
        if (that.data.page2 > 1) {
          that.setData({
            meetingRecordsList: that.data.meetingRecordsList.concat(ret.data.list)
          });
        } else {
          that.setData({
            meetingRecordsList: ret.data.list
          });
        }
      } else {
        console.log(ret);
      }
    } catch (error) {

    }
  },

  // 初始化变量
  initStatus() {
    this.setData({
      mySubscribeList: [],
      meetingRecordsList: [],
      isCanRequest1: true,
      isCanRequest2: true,
      page1: 0,
      page2: 0,
      total1: 0,
      total2: 0
    });
  },

  // 获取正在进行中的会议
  async getOngoingMeeting() {
    if (!utils.getStorage('sessionId')) return;
    const ret = await request.post('/api/meeting/getOngoingMeeting', {});
    try {
      if (ret.code == config.successCode) {
        if (ret.data) {
          this.setData({
            ongoingMeetingDetail: ret.data,
            isShowModal: true
          });
          try {
            if (utils.getStorage('sessionId')) await getAppID();
          } catch (error) {

          }
          store.set('main.confereeId', ret.data.confereeId);
          store.set('main.channelId', ret.data.channelId);
          initChat({
            channelId: ret.data.channelId,
            pageType: 'create'
          });
        }
      }
    } catch (error) {

    }
    return;
  },

  // 取消拨打电话
  bindCancel4() {
    this.setData({
      isShowModal3: false,
      isShowModal4: false
    });
  },

  // 确认打电话
  bindConfirm4() {
    this.setData({
      isShowModal3: false,
      isShowModal4: false
    });
    wx.makePhoneCall({
      phoneNumber: '400-158-8816',
      success() {
        console.log('拨打电话成功！');
      },
      fail() {
        console.log('拨打电话失败！');
      }
    });
  },

  bindCancel3() {
    this.setData({
      isShowModal3: false,
      isShowModal4: false
    });
  },

  // 关闭试用结束提示
  bindConfirm3() {
    this.setData({
      isShowModal3: false,
      isShowModal4: true
    });
  },

  // 关闭赠送体验分钟数弹框
  bindConfirm5() {
    this.setData({ isShowModal5: false });
    const { btnClickType } = this.data;
    if (btnClickType == 'launch-meeting') {
      utils.navigateTo('/pages/launch-meeting/launch-meeting');
    } else if (btnClickType == 'subscribe-meeting') {
      utils.navigateTo('/pages/subscribe-meeting/subscribe-meeting');
    }
  },

  async onShow() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1 > 10 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
    const day = date.getDate() > 10 ? date.getDate() : '0' + date.getDate();
    const isAuth = await utils.getAuth();
    this.setData({
      isAuth: isAuth,
      sessionId: utils.getStorage('sessionId'),
      isBindMobile: utils.getStorage('isBindMobile'),
      selectDate: '',
      date: utils.formatTime(),
      userInfo: utils.getStorage('userInfo'),
      endDate: year + '-' + month + '-' + day,
      isFiltered: false
    });

    this.initStatus();
    if (utils.getStorage('sessionId')) {
      this.getMySubscribe();
      this.getMeetingRecords();
      // 获取正在进行中的会议信息
      this.getOngoingMeeting();
    }
  },
  onShareAppMessage() {
    return utils.shareApp();
  }
});
