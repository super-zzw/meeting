/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/*
 * @Author: Chenyintang
 * @Date: 2019-06-06 11:55:38
 * @Last modified by:   Chenyintang
 * @Last modified time: 2019-06-09 18:44:46
 */
import regeneratorRuntime from '@lib/regenerator-runtime/regenerator-runtime';

App({
  async onShow() {
    this.getSystemInfo();
  },
  globalData: {
    systemInfo: {}, // 系统信息
    isIphoneX: false, // 是否是iPhoneX机型
    titleBarHeight: 0, // 头部高度
    statusBarHeight: 0, // 导航栏高度
    isCanChangeMic: true, // 参会者是否可以自行操作开关麦，默认可以
    isChangedPage: false, // 会议中页码是否被隐藏
    isFirstEntryMeetingPage: true, // 是否第一次进入过会议中页面
  },
  // 获取系统信息
  getSystemInfo() {
    const res = wx.getSystemInfoSync();
    this.globalData.systemInfo = res;
    this.globalData.statusBarHeight = res.statusBarHeight;
    this.globalData.isIphoneX = res.model.toLowerCase().includes('iPhone X'.toLowerCase());
  }
});
