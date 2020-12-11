/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/*
 * @Author: Chenyintang
 * @Date: 2019-06-12 17:57:36
 * @Last Modified by: Chenyintang
 * @Last Modified time: 2019-10-12 16:23:43
 */

const regeneratorRuntime = require('@lib/regenerator-runtime/regenerator-runtime');
const request = require('@common/request/request');
const utils = require('@common/utils/utils');
const config = require('@common/config');
const app = getApp();

Page({
  data: {
    isRequesting: false, // 是否可以继续请求
    sessionId: '',
    isBingMobile: '', // 是否绑定手机
    meetingId: '', // 会议id
    inviteNickName: '', // 邀请昵称
    meetingDetail: {}, // 会议详情
    formId: ''
  },

  onLoad(opt) {
    const { meetingId, inviteNickName } = opt;
    this.setData({
      meetingId: meetingId,
      inviteNickName: inviteNickName
    });
  },

  onShow() {
    this.setData({
      sessionId: utils.getStorage('sessionId'),
      isBindMobile: utils.getStorage('isBindMobile')
    });
    this.getMeetingDetail();
  },

  // 获取分享的会议详情
  async getMeetingDetail() {
    utils.showLoading();
    const ret = await request.post('/api/meeting/shareMeetingDetail', { meetingId: this.data.meetingId });
    utils.hideLoading();
    try {
      if (ret.code == config.successCode) {
        this.setData({
          meetingDetail: ret.data,
          sessionId: utils.getStorage('sessionId')
        });
      } else {
        utils.showToast({ title: ret.message, icon: 'none' });
      }
    } catch (error) {

    }
  },

  // 接受预约
  async join() {
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

    const that = this;
    if (that.data.meetingDetail.status == 2) return;
    const userInfo = utils.getStorage('userInfo');
    that.setData({
      isRequesting: true
    });
    wx.login({
      async success(res) {
        if (res.code) {
          // 1:预约的会议，2:发起的会议
          const data = that.data.meetingDetail;

          // 正在进行的会议
          if (data.status == 1) {
            utils.showLoading('加入中');
            const ret2 = await request.post('/api/meeting/joinMeeting', {
              'passWord': '',
              'isCheckPassWord': 0,
              'roomNo': data.roomNo,
              'nickName': userInfo.nickName,
              'sessionId': utils.getStorage('sessionId'),
              'formId': ''
            });
            try {
              if (ret2.code == config.successCode) {
                utils.hideLoading();
                utils.redirectTo('/pages/meeting/meeting?meetingId=' + ret2.data.meetingId + '&roomno=' + data.channelId + '&isHost=' + ret2.data.isHost + '&uid=' + ret2.data.confereeId + '&nickName=' + userInfo.nickName + '&avatarUrl=' + userInfo.avatarUrl);
              } else {
                utils.hideLoading();
                utils.showToast({ title: ret2.message, icon: 'none' });
              }
            } catch (error) {
              utils.hideLoading();
              utils.showToast({ title: ret2.message, icon: 'none' });
            }
          } else {
            // 非正在进行的会议
            utils.showLoading('接受中');
            const ret = await request.post('/api/meeting/acceptSubscribe', {
              'avatarUrl': utils.getStorage('userInfo').avatarUrl,
              'jsCode': res.code,
              'meetingId': that.data.meetingId,
              'nickName': utils.getStorage('userInfo').nickName,
              'sessionId': utils.getStorage('sessoinId'),
              'formId': that.data.formId
            });
            try {
              if (ret.code == config.successCode) {
                utils.hideLoading();
                utils.navigateTo('/pages/subscribe-meeting-detail/subscribe-meeting-detail?meetingId=' + that.data.meetingId + '&roomno=' + that.data.meetingDetail.roomNo + '&sourceType=subscribe');
              } else {
                utils.hideLoading();
                utils.showToast({ title: ret.message, icon: 'none' });
              }
            } catch (error) {
              utils.hideLoading();
              console.log(error);
            }
          }

          that.setData({
            isRequesting: false
          });
        }
      }
    });
  },

  // 不接受预约
  noJoin() {
    utils.reLaunch('/pages/index/index');
  },

  async getUserInfo(e) {
    const that = this;
    const { detail: { errMsg, userInfo } } = e;

    if (errMsg == 'getUserInfo:ok') {
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

      app.globalData.userInfo = userInfo;
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
                  isBindMobile: ret.data.isBindMobile,
                  sessionId: ret.data.sessionId
                });
                utils.setStorage('userInfo', userInfo);
                utils.setStorage('sessionId', ret.data.sessionId);
                utils.setStorage('isBindMobile', ret.data.isBindMobile);

                // utils.navigateTo('/pages/meeting/meeting?meetingId=' + that.data.meetingId);
                that.join();

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
  },

  formSubmit(e) {
    const { detail: { formId } } = e;
    this.setData({
      formId: formId
    });
  },
});
