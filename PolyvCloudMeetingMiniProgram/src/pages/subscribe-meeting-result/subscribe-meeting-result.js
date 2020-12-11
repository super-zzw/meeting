/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/*
 * @Author: Chenyintang
 * @Date: 2019-06-06 11:55:28
 * @Last Modified by: Chenyintang
 * @Last Modified time: 2019-06-24 11:47:43
 */

const regeneratorRuntime = require('@lib/regenerator-runtime/regenerator-runtime');
const request = require('@common/request/request');
const utils = require('@common/utils/utils');

Page({
  data: {
    meetingId: '',
    topic: '',
    duration: '',
    beginTime: ''
  },
  noInvite() {
    utils.reLaunch('/pages/index/index');
  },
  onLoad(opt) {
    const { meetingId, topic, duration, beginTime } = opt;
    this.setData({
      meetingId: meetingId,
      topic: topic,
      duration: duration,
      beginTime: beginTime
    });
  },
  onShareAppMessage(e) {
    const { from } = e;
    // 【邀请人昵称】 + 邀请您参与 +【 XX月XX日 YY:YY】 + 的 + 【会议主题】
    const nickName = utils.getStorage('userInfo').nickName;
    const title = nickName + ' 邀请您参与 ' + this.data.beginTime + ' 的 ' + this.data.topic;
    const url = '/pages/meeting-invitation/meeting-invitation?meetingId=' + this.data.meetingId + '&inviteNickName=' + nickName;
    console.log(url);
    if (from == 'button') {
      return utils.shareApp(title, url);
    }
  }
});
