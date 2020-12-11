/* eslint-disable sonarjs/no-collapsible-if */
/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/*
 * @Author: Chenyintang
 * @Date: 2019-06-06 11:54:53
 * @Last Modified by: Chenyintang
 * @Last Modified time: 2019-10-12 16:19:23
 */
const MyTips = require('@components/mytips/mytips');
const regeneratorRuntime = require('@lib/regenerator-runtime/regenerator-runtime');
const request = require('@common/request/request');
const utils = require('@common/utils/utils');
const config = require('@common/config');
import { disconnectSocket } from '../../common/chat/initChat';
const app = getApp();

Page(Object.assign({}, MyTips, {
  data: {
    isShowModal: false, // 是否显示试用结束的弹框
    isShowModal2: false, // 是否显示拨打客服电话的弹框
    isOpenPsw: false, // 密码明、暗文切换
    roomno: '', // 房间号
    meetingName: '', // 会议室昵称
    psw: '', // 密码
    len: 0, // 密码长度
    formId: ''
  },

  handleMeetingName(e) {
    const { detail: { value } } = e;
    if (utils.getLen(value) > 20) {
      this.setData({
        len: 20,
        meetingName: value.substring(0, 20)
      });
      return false;
    }
    this.setData({
      len: utils.getLen(value),
      meetingName: value
    });
  },

  handlePsw(e) {
    const { detail: { value } } = e;
    this.setData({
      psw: value
    });
  },

  openOrclose() {
    this.setData({
      isOpenPsw: !this.data.isOpenPsw
    });
  },

  // 发起会议
  async launchMeeting() {
    // eslint-disable-next-line sonarjs/no-redundant-boolean
    if (app.globalData.isEntryMeetingPage && (await utils.getAuthSetting('record') != true)) {
      utils.showToast({ title: '您还未开启录音权限，请前往开启', icon: 'none', duration: 3000 });
      wx.openSetting({});
      return;
    }
    // eslint-disable-next-line sonarjs/no-redundant-boolean
    if (app.globalData.isEntryMeetingPage && (await utils.getAuthSetting('camera') != true)) {
      utils.showToast({ title: '您还未开启摄像头权限，请前往开启', icon: 'none', duration: 3000 });
      setTimeout(() => {
        wx.openSetting({});
      }, 3000);
      return;
    }

    const reg = /^\d{6}$/;
    if (this.data.psw && !reg.test(this.data.psw)) {
      this.showTips('密码必须为6位数字', 'error');
      return;
    }
    utils.showLoading('发起中');
    const userInfo = utils.getStorage('userInfo');
    const ret = await request.post('/api/meeting/createMeeting', {
      'passWord': this.data.psw,
      'roomNo': this.data.roomno,
      'topic': this.data.meetingName ? this.data.meetingName : '会议',
      'sessionId': utils.getStorage('sessionId'),
      'formId': this.data.formId
    });
    try {
      if (ret.code == config.successCode) {
        utils.hideLoading();
        disconnectSocket();
        utils.redirectTo('/pages/meeting/meeting?meetingId=' + ret.data.meetingId + '&roomno=' + ret.data.channelId + '&isHost=1&uid=' + ret.data.confereeId + '&nickName=' + userInfo.nickName + '&avatarUrl=' + userInfo.avatarUrl);
      } else {
        utils.hideLoading();
        this.showTips(ret.message, 'error');
      }
    } catch (error) {
      utils.hideLoading();
      console.log(error);
    }
  },

  // 获取房间号
  async getRoomNo() {
    const ret = await request.post('/api/meeting/getRoomNo', { sessionId: utils.getStorage('sessionId') });
    try {
      if (ret.code == config.successCode) {
        this.setData({
          roomno: ret.data
        });
      } else {
        this.showTips('获取房间号失败', 'error');
      }
    } catch (error) {
    }
  },

  formSubmit(e) {
    const { detail: { formId } } = e;
    this.setData({
      formId: formId
    });
  },

  bindCancel2() {
    this.setData({
      isShowModal: false,
      isShowModal2: false
    });
  },

  bindCancel() {
    this.setData({
      isShowModal: false,
      isShowModal2: false
    });
  },

  bindConfirm2() {
    this.setData({
      isShowModal: false,
      isShowModal2: false
    });
    wx.makePhoneCall({
      phoneNumber: '12345678',
      success() {
        console.log('拨打电话成功！');
      },
      fail() {
        console.log('拨打电话失败！');
      }
    });
  },

  bindConfirm() {
    this.setData({
      isShowModal: false,
      isShowModal2: true
    });
  },

  onLoad() {
    this.getRoomNo();
  }
}));
