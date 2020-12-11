/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/*
 * @Author: Chenyintang
 * @Date: 2019-06-06 11:55:16
 * @Last Modified by: Chenyintang
 * @Last Modified time: 2019-10-12 16:49:04
 */

const MyTips = require('@components/mytips/mytips');
const regeneratorRuntime = require('@lib/regenerator-runtime/regenerator-runtime');
const request = require('@common/request/request');
const config = require('@common/config');
const utils = require('@common/utils/utils');

Page(Object.assign({}, MyTips, {
  data: {
    len: 0, // 会议名称长度
    meetingName: '',
    subscribeTime: '',
    subscribeHours: '',
    multiIndex: [0, 0, 0, 0], // 预约时间的索引
    multiArray: [], // 选择后的预估时间的对应值
    multiIndex2: [0, 0], // 预估时长的索引
    multiArray2: [], // 选择后的预估时长的对应值
    formId: ''
  },

  bindMultiPickerChange(e) {
    const { detail: { value } } = e;
    const _time = (this.data.multiArray[2][value[2]].split(':')[0] + this.data.multiArray[3][value[3]]);
    this.setData({
      multiIndex: e.detail.value,
      subscribeTime: this.data.multiArray[0][value[0]] + this.data.multiArray[1][value[1]] + ' ' + _time
    });
  },

  bindMultiPickerCancel() {
    this.initDate();
  },

  bindMultiPickerChange2(e) {
    const index = e.detail.value;
    this.setData({
      multiIndex2: e.detail.value,
      subscribeHours: this.data.multiArray2[0][index[0]] + this.data.multiArray2[1][index[1]]
    });
  },

  bindMultiPickerColumnChange(e) {
  },

  bindMultiPickerColumnChange2(e) {
  },

  handleMeetingName(e) {
    const { detail: { value } } = e;
    if (utils.getLen(value) > 20) {
      this.setData({
        len: 20,
        meetingName: value.substring(0, 20)
      });
    } else {
      this.setData({
        len: utils.getLen(value),
        meetingName: value
      });
    }
  },

  // 预约会议
  async subscribeMeeting() {
    if (!this.data.subscribeTime) {
      return false;
    }
    if (!this.data.subscribeHours) {
      return false;
    }
    utils.showLoading('预约中');
    const _str = this.data.subscribeHours.split('小时');
    const minutes = parseInt(_str[1].split('分钟')[0]);
    const _str2 = this.data.subscribeTime;
    const hours = _str2.split('时')[0] + ':' + _str2.split('时')[1].split('分')[0];
    const ret = await request.post('/api/meeting/subscribeMeeting', {
      'beginTime': new Date().getFullYear() + '年' + hours,
      'duration': parseInt(_str[0] * 60) + minutes,
      'sessionId': utils.getStorage('sessionId'),
      'topic': this.data.meetingName ? this.data.meetingName : '会议',
      'formId': this.data.formId
    });
    try {
      if (ret.code == config.successCode) {
        utils.hideLoading();
        const topic = this.data.meetingName ? this.data.meetingName : '会议';
        const url = '/pages/subscribe-meeting-result/subscribe-meeting-result?meetingId=' + ret.data.meetingId + '&topic=' + topic + '&duration=' + this.data.subscribeHours + '&beginTime=' + this.data.subscribeTime;
        utils.redirectTo(url);
      } else {
        utils.hideLoading();
        this.showTips(ret.message, 'error');
      }
    } catch (error) {
      utils.hideLoading();
    }
  },

  formSubmit(e) {
    const { detail: { formId } } = e;
    this.setData({
      formId: formId
    });
  },

  initDate() {
    const date = new Date();
    let idxHours = new Date().getHours() > 0 ? new Date().getHours() - 1 : 0;
    const minutes = new Date().getMinutes();
    let idxMinutes = 0;
    if (minutes < 10) {
      idxMinutes = 1;
    } else if (minutes < 20) {
      idxMinutes = 2;
    } else if (minutes < 30) {
      idxMinutes = 3;
    } else if (minutes < 40) {
      idxMinutes = 4;
    } else if (minutes < 50) {
      idxMinutes = 5;
    } else {
      idxMinutes = 0;
      idxHours += 1;
    }

    this.setData({
      multiIndex: [0, 0, idxHours, idxMinutes]
    });
  },

  onShow() {
    const time = utils.getMonthAndDate();
    this.setData({
      multiArray: [time.month, time.day, time.hours, time.minute],
      multiArray2: [time.hours2, time.minute2]
    });
    this.initDate();
  }
}));
