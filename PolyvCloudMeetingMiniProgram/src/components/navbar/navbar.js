/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/**
 * @Author: Chenyintang
 * @Date:   2019-06-07 22:19:44
 * @Email:  chenytrl@163.com
 * @Last modified by:   Chenyintang
 * @Last modified time: 2019-06-09 18:18:27
 */

const regeneratorRuntime = require('@lib/regenerator-runtime/regenerator-runtime');
const request = require('@common/request/request');
const utils = require('@common/utils/utils');
const config = require('@common/config');
const app = getApp();

Component({
  properties: {
    title: {
      type: String,
      value: '保利威云会议'
    },
    hideIcon: {
      type: Boolean,
      value: false
    },
    showBackIcon: {
      type: Boolean,
      value: true
    },
    isHome: {
      type: Boolean,
      value: false
    },
    isClose: {
      type: Boolean,
      value: false
    },
    isEditTitle: {
      type: Boolean,
      value: true
    },
    isShowShare: {
      type: Boolean,
      value: false
    }
  },
  data: {
    statusBarHeight: 0,
    titleBarHeight: 0,
    logoIcon: '/images/common/logo@2x.png',
    bgColor: '#fff'
  },
  methods: {
    headerBack() {
      if (this.data.isClose) {
        this.triggerEvent('closewin');
      } else {
        if (this.data.isHome) {
          utils.reLaunch('/pages/index/index');
        } else {
          wx.navigateBack({
            delta: 1
          });
        }
      }
    }
  },
  lifetimes: {
    attached() {
      if (app.globalData.statusBarHeight && app.globalData.titleBarHeight) {
        this.setData({
          statusBarHeight: app.globalData.statusBarHeight,
          titleBarHeight: app.globalData.titleBarHeight
        });
      } else {
        const res = wx.getSystemInfoSync();
        if (res.model.indexOf('iPhone') !== -1) {
          app.globalData.titleBarHeight = 44;
        } else {
          app.globalData.titleBarHeight = 48;
        }
        this.setData({
          statusBarHeight: app.globalData.statusBarHeight,
          titleBarHeight: app.globalData.titleBarHeight
        });
      }
    }
  },
  pageLifetimes: {
    async show() {
      if (utils.getStorage('sessionId')) {
        const ret = await request.post('/api/user/getEnterprise', {});
        try {
          if (ret.code == config.successCode && ret.data) {
            if (this.data.isEditTitle) {
              this.setData({
                logoIcon: ret.data.logoUrl,
                title: ret.data.name,
                bgColor: ret.data.navbarColor
              });
            } else {
              this.setData({
                logoIcon: ret.data.logoUrl,
                bgColor: ret.data.navbarColor
              });
            }
          }
        } catch (error) {

        }
      }
    },
  },
  async ready() {
    console.log('ready');
    if (utils.getStorage('sessionId')) {
      const ret = await request.post('/api/user/getEnterprise', {});
      try {
        if (ret.code == config.successCode && ret.data) {
          if (this.data.isEditTitle) {
            this.setData({
              logoIcon: ret.data.logoUrl,
              title: ret.data.name,
              bgColor: ret.data.navbarColor
            });
          } else {
            this.setData({
              logoIcon: ret.data.logoUrl,
              bgColor: ret.data.navbarColor
            });
          }
        }
      } catch (error) { }
    }
  }
});
