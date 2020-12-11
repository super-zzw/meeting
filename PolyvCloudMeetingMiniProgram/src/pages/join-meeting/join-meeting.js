/* eslint-disable sonarjs/no-collapsible-if */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/*
 * @Author: Chenyintang
 * @Date: 2019-06-06 11:54:45
 * @Last Modified by: Chenyintang
 * @Last Modified time: 2019-10-12 16:16:36
 */
const MyTips = require('@components/mytips/mytips');
const regeneratorRuntime = require('@lib/regenerator-runtime/regenerator-runtime');
const request = require('@common/request/request');
const utils = require('@common/utils/utils');
const config = require('@common/config');
const app = getApp();
import { disconnectSocket } from '../../common/chat/initChat';

Page(Object.assign({}, MyTips, {
  data: {
    sessionId: '',
    isOpenPsw: false, // 密码明、暗文切换开关
    isHasPsw: false,
    roomNo: '',
    meetingName: '',
    meetingId: '',
    psw: '',
    formId: ''
  },

  handleRoomNo(e) {
    const { detail: { value } } = e;
    this.setData({
      roomNo: value
    });
    if (value.length == 6) {
      this.handleBlur();
    }
  },

  // 密码框失去焦点后检查改房间是否有密码
  async handleBlur() {
    const ret = await request.post('/api/meeting/checkPassWord', { roomNo: this.data.roomNo });
    try {
      if (ret.code == config.successCode && ret.data.isPassWord == 1) {
        this.setData({ isHasPsw: true });
      } else {
        this.setData({ isHasPsw: false });
      }
    } catch (error) {

    }
  },

  handleMeetingName(e) {
    const { detail: { value } } = e;
    if (utils.getLen(value) > 16) {
      this.setData({
        meetingName: value.substring(0, 16)
      });
    } else {
      this.setData({
        meetingName: value
      });
    }
  },

  handlePsw(e) {
    const { detail: { value } } = e;
    this.setData({
      psw: value
    });
  },

  // 密码明、暗文切换
  openOrclose() {
    this.setData({
      isOpenPsw: !this.data.isOpenPsw
    });
  },

  // 加入会议
  async joinMeeting() {
    const that = this;
    // eslint-disable-next-line sonarjs/no-redundant-boolean
    if (app.globalData.isEntryMeetingPage && (await utils.getAuthSetting('record') != true)) {
      utils.showToast({ title: '您还未开启录音权限，请前往开启', icon: 'none' });
      wx.openSetting({});
      return;
    }
    // eslint-disable-next-line sonarjs/no-redundant-boolean
    if (app.globalData.isEntryMeetingPage && (await utils.getAuthSetting('camera') != true)) {
      utils.showToast({ title: '您还未开启摄像头权限，请前往开启', icon: 'none' });
      wx.openSetting({});
      return;
    }

    if (that.data.roomNo != '' && that.data.meetingName != '') {
      utils.showLoading('加入中');
      const ret = await request.post('/api/meeting/joinMeeting', {
        'passWord': that.data.psw,
        'roomNo': that.data.roomNo,
        'nickName': that.data.meetingName,
        'sessionId': utils.getStorage('sessionId'),
        'formId': that.data.formId
      });
      try {
        if (ret.code == config.successCode) {
          utils.hideLoading();
          disconnectSocket();
          utils.redirectTo('/pages/meeting/meeting?meetingId=' + ret.data.meetingId + '&roomno=' + ret.data.channelId + '&isHost=0&uid=' + ret.data.confereeId + '&nickName=' + ret.data.nickName + '&avatarUrl=' + ret.data.avatarUrl);
        } else {
          utils.hideLoading();
          that.showTips(ret.message, 'error');
        }
      } catch (error) {
        utils.hideLoading();
        console.log(error);
      }
    }
  },

  async getUserInfo(e) {
    const that = this;
    const { detail: { errMsg, userInfo } } = e;
    const { currentTarget: { dataset: { type } } } = e;

    if (errMsg == 'getUserInfo:ok') {
      // eslint-disable-next-line sonarjs/no-redundant-boolean
      if (app.globalData.isEntryMeetingPage && (await utils.getAuthSetting('record') != true)) {
        utils.showToast({ title: '您还未开启录音权限，请前往开启', icon: 'none' });
        wx.openSetting({});
        return;
      }
      // eslint-disable-next-line sonarjs/no-redundant-boolean
      if (app.globalData.isEntryMeetingPage && (await utils.getAuthSetting('camera') != true)) {
        utils.showToast({ title: '您还未开启摄像头权限，请前往开启', icon: 'none' });
        wx.openSetting({});
        return;
      }
      if (that.data.roomNo != '' && that.data.meetingName != '') {
        app.globalData.userInfo = e.detail.userInfo;
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
                  that.setData({
                    sessionId: ret.data.sessionId
                  });
                  utils.setStorage('userInfo', userInfo);
                  utils.setStorage('sessionId', ret.data.sessionId);
                  utils.setStorage('isBindMobile', ret.data.isBindMobile);

                  if (that.data.roomNo != '' && that.data.meetingName != '') {
                    that.joinMeeting();
                  }

                } else {
                  utils.showToast({ title: ret.message, icon: 'none' });
                }
              } catch (error) {

              }
            } else {
              console.log('登录失败！' + res.errMsg);
            }
          }
        });
      }
    }
  },

  // 手机模板id用于发送会议推送通知
  formSubmit(e) {
    const { detail: { formId } } = e;
    this.setData({
      formId: formId
    });
  },

  onLoad(opt) {
    const { meetingId, roomno } = opt;
    this.setData({
      meetingId: meetingId ? meetingId : '',
      roomNo: roomno ? roomno : ''
    });
  },

  onShow() {
    this.setData({
      sessionId: utils.getStorage('sessionId'),
      meetingName: utils.getStorage('userInfo').nickName ? utils.getStorage('userInfo').nickName : ''
    });
  }
}));
