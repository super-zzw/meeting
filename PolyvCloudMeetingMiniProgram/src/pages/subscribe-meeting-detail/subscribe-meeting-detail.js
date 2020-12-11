/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable sonarjs/no-collapsible-if */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/*
 * @Author: Chenyintang
 * @Date: 2019-06-06 11:55:22
 * @Last modified by:   Chenyintang
 * @Last modified time: 2019-06-09 18:52:49
 */

const regeneratorRuntime = require('@lib/regenerator-runtime/regenerator-runtime');
const request = require('@common/request/request');
const utils = require('@common/utils/utils');
const config = require('@common/config');
const app = getApp();
const EXPERIENCE_URL = '/api/user/getExperienceStatus';

Page({
  data: {
    isFinished: false, // 请求是否已完成，完成后才显示dom
    isIphoneX: false,
    isEditMode: false, // 主持人昵称是否属于编辑状态
    isShowModal: false, // 是否显示取消会议弹框
    isShowModal3: false, // 是否显示试用结束弹框
    isShowModal4: false, // 是否显示联系客服弹框
    meetingDetail: {}, // 会议详情
    joinMeetingPeopleList: [], // 加入会议室的人
    index: 0, // 当前编辑昵称的索引
    uid: '', // 当前编辑的用户的id
    meetingId: '', // 会议id
    nickName: '',
    roomno: '',
    sourceType: '' // 进入页面的来源，records:表示从会议记录点击进入的
  },
  copyText(e) {
    const { currentTarget: { dataset: { text, psw } } } = e;
    if (this.data.sourceType != 'records') {
      const _text = psw ? text + ` 密码:${psw}` : text;
      utils.copyText(_text);
    }
  },
  editNickName(e) {
    const { currentTarget: { dataset: { nickname, id, index } } } = e;
    this.setData({
      isEditMode: !this.data.isEditMode,
      nickName: nickname,
      uid: id,
      index: index
    });
  },
  async handleNickInput(e) {
    const { detail: { value } } = e;
    const ret = await request.post('/api/meeting/updateName', { confereeId: this.data.uid, nickName: value });
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
  inviteFriends(e) {
    wx.shareAppMessage();
  },
  bindCancel() {
    this.setData({
      isShowModal: false
    });
  },
  async bindConfirm() {
    this.cancelMeeting();
    if (this.data.meetingDetail.isHost) {
      this.handleCancelMeeting();
    } else {
      if (this.data.meetingDetail.status != 1) {
        this.handleCancelMeeting();
      } else {
        this.handleLeavingMeeting();
      }
    }
  },
  // 取消会议
  cancelMeeting() {
    if (this.data.meetingDetail.status == 2) {
      utils.showToast({ title: '会议已结束', icon: 'none' });
      return;
    }
    this.setData({
      isShowModal: true
    });
  },
  // 取消会议接口调用
  async handleCancelMeeting() {
    const ret = await request.post('/api/meeting/cancelMeeting', { meetingId: this.data.meetingId });
    try {
      if (ret.code == config.successCode) {
        this.setData({
          isShowModal: false
        });
        utils.reLaunch('/pages/index/index');
      } else {
        utils.showToast({ title: ret.message, icon: 'none' });
      }
    } catch (error) {
      utils.showToast({ title: '取消失败', icon: 'none' });
    }
  },
  // 离开会议接口调用
  async handleLeavingMeeting() {
    const ret = await request.post('/api/meeting/leaveMeeting', { meetingId: this.data.meetingId });
    try {
      if (ret.code == config.successCode) {
        this.setData({
          isShowModal: false
        });
        utils.reLaunch('/pages/index/index');
      } else {
        utils.showToast({ title: ret.message, icon: 'none' });
      }
    } catch (error) {
      utils.showToast({ title: '离开失败', icon: 'none' });
    }
  },
  // 开始、加入会议
  async startMeeting() {
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

    if (this.data.meetingDetail.isHost) {
      if (this.data.meetingDetail.status != 2) {
        // 检测是否有体验权限
        const result = await request.post(EXPERIENCE_URL, {});
        try {
          if (result.data.isExperience == 1) {
            const ret = await request.post('/api/meeting/startMeeting', { meetingId: this.data.meetingId });
            try {
              if (ret.code == config.successCode) {
                utils.redirectTo('/pages/meeting/meeting?meetingId=' + this.data.meetingId + '&roomno=' + this.data.meetingDetail.channelId + '&isHost=' + this.data.meetingDetail.isHost + '&uid=' + ret.data.confereeId + '&nickName=' + ret.data.nickName + '&avatarUrl=' + ret.data.avatarUrl);
              } else {
                utils.showToast({ title: ret.message, icon: 'none' });
              }
            } catch (error) {

            }
          } else {
            this.setData({
              isShowModal3: true
            });
          }
        } catch (error) {

        }
      }
    } else {
      if (this.data.meetingDetail.status == 1) {
        const ret = await request.post('/api/meeting/detailJoinMeeting', { meetingId: this.data.meetingId });
        try {
          if (ret.code == config.successCode) {
            utils.redirectTo('/pages/meeting/meeting?meetingId=' + this.data.meetingId + '&roomno=' + ret.data.channelId + '&isHost=0&uid=' + ret.data.confereeId + '&nickName=' + ret.data.nickName + '&avatarUrl=' + ret.data.avatarUrl);
          } else {
            utils.showToast({ title: ret.message, icon: 'none' });
          }
        } catch (error) {

        }
      } else {
        // 再次判断此会议是否开始了
        const result = await request.post('/api/meeting/getMeetingDetail', { meetingId: this.data.meetingId, sessionId: utils.getStorage('sessionId') });
        if (result.data.status == 1) {
          const ret = await request.post('/api/meeting/detailJoinMeeting', { meetingId: this.data.meetingId });
          try {
            if (ret.code == config.successCode) {
              utils.redirectTo('/pages/meeting/meeting?meetingId=' + this.data.meetingId + '&roomno=' + ret.data.channelId + '&isHost=0&uid=' + ret.data.confereeId + '&nickName=' + ret.data.nickName + '&avatarUrl=' + ret.data.avatarUrl);
            } else {
              utils.showToast({ title: ret.message, icon: 'none' });
            }
          } catch (error) {

          }
        }
      }
    }
  },
  // 获取会议详情
  async getMeetingDetail() {
    this.setData({ isFinished: false });
    const ret = await request.post('/api/meeting/getMeetingDetail', { meetingId: this.data.meetingId, sessionId: utils.getStorage('sessionId') });
    this.setData({ isFinished: true });
    try {
      if (ret.code == config.successCode) {
        this.setData({
          meetingDetail: ret.data,
          joinMeetingPeopleList: ret.data.conferees
        });
      } else {
        utils.showToast({ title: ret.message, icon: 'none' });
      }
    } catch (error) {
    }
  },
  bindCancel4() {
    this.setData({
      isShowModal3: false,
      isShowModal4: false
    });
  },
  bindCancel3() {
    this.setData({
      isShowModal3: false,
      isShowModal4: false
    });
  },
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
  bindConfirm3() {
    this.setData({
      isShowModal3: false,
      isShowModal4: true
    });
  },
  onLoad(opt) {
    const { meetingId, roomno, sourceType } = opt;
    this.setData({
      meetingId: meetingId,
      roomno: roomno,
      sourceType: sourceType
    });
    this.getMeetingDetail();
  },
  onShow() {
    this.setData({
      isIphoneX: app.globalData.isIphoneX,
      year: new Date().getFullYear() + '年'
    });
  },
  onShareAppMessage(e) {
    const { from } = e;
    const meetingId = this.data.meetingId;
    const inviteNickName = utils.getStorage('userInfo').nickName;
    const topic = this.data.meetingDetail.topic;
    let title = '';
    if (this.data.meetingDetail.status == 1) {
      title = inviteNickName + '邀请您参与' + topic;
    } else {
      title = inviteNickName + ' 邀请您参与 ' + this.data.meetingDetail.beginDate + ' 的' + topic;
    }
    const url = '/pages/meeting-invitation/meeting-invitation?&meetingId=' + meetingId + '&inviteNickName=' + inviteNickName;
    console.log(url);
    if (from == 'button') {
      return utils.shareApp(title, url);
    }
  }
});
