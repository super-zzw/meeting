/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/*
 * @Author: Chenyintang
 * @Date: 2019-06-06 14:47:38
 * @Last Modified by: Chenyintang
 * @Last Modified time: 2019-09-11 13:19:28
 * @Description：封装请求
 */

const config = require('@common/config');
const utils = require('../utils/utils');

/**
 * 发起post请求
 * @param {请求url} url
 * @param {请求参数（json）} data
 */
const post = (url, data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.baseUrl + url,
      data: data,
      method: 'POST',
      header: {
        'cloud-meeting-session-id': utils.getStorage('sessionId'),
        'cloud-meeting-client-type': 'wxapp'
      },
      success(res) {
        resolve(res.data);
        const { data: { code, message } } = res;
        // console.log('发起post请求拦截==', res, code);
        if (code == 300000) {
          utils.showToast({ title: message, icon: 'none' });
          utils.removeStorage('userInfo');
          utils.removeStorage('sessionId');
          utils.removeStorage('isBindMobile');
          setTimeout(() => {
            utils.reLaunch('/pages/index/index');
          }, 1000);
          reject(res);
        } else {
          resolve(res.data);
        }
      },
      fail(err) {
        reject(err);
      }
    });
  });
};

/**
 * 发起get请求
 * @param {请求url} url
 * @param {请求参数（json）} data
 */
const get = (url, data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.baseUrl + url,
      data: data,
      success(res) {
        console.log(res);
        resolve(res.data);
      },
      fail(err) {
        reject(err);
      }
    });
  });
};

module.exports = {
  post,
  get
};
