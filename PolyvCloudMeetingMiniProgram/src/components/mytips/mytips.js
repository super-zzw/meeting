/* eslint-disable no-console */
const app = getApp();

module.exports = {
  showTips(content = '', icon = '', options = {}) {
    const MyTips = this.data.MyTips || {};
    if (MyTips.timer) {
      clearTimeout(MyTips.timer);
      MyTips.timer = '';
    }
    if (typeof options === 'number') {
      options = {
        duration: options
      };
    }
    options = Object.assign({
      duration: 2000
    }, options);
    const timer = setTimeout(() => {
      this.setData({
        'MyTips.show': false,
        'MyTips.timer': ''
      });
    }, options.duration);
    this.setData({
      MyTips: {
        show: true,
        content,
        icon,
        options,
        timer,
        ipx: app.globalData.isIphoneX
      }
    });
  }
};
