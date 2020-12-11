/* eslint-disable no-unused-vars */
/* eslint-disable no-control-regex */
/* eslint-disable no-console */

const uid = `${parseInt(Math.random() * 1000000)}`;

/**
 * 获取uid
 */
const getUid = () => {
  return uid;
};

const formatTime = date => {
  const _date = date ? date : new Date();
  const year = _date.getFullYear();
  const month = _date.getMonth() + 1;
  const day = _date.getDate();
  // const hour = _date.getHours();
  // const minute = _date.getMinutes();
  // const second = _date.getSeconds();

  return `${year}-${month}-${day}`;

  // return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
};

/**
 * 校验手机号合法性
 * @param {手机号} phone
 */
const isValidPhone = phone => {
  const reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
  return reg.test(phone);
};

/**
 * 设置缓存
 * @param {键名} key
 */
const getStorage = key => {
  return wx.getStorageSync(key);
};

/**
 * 设置缓存
 * @param {键名} key
 * @param {值} value
 */
const setStorage = (key, value) => {
  return wx.setStorageSync(key, value);
};

/**
 * 清除缓存
 * @param {*} key
 */
const removeStorage = (key) => {
  wx.removeStorageSync(key);
};

/**
 * 保留当前页面，跳转到应用内的某个页面
 * @param {跳转路径} path
 */
const navigateTo = path => {
  wx.navigateTo({
    url: path
  });
};

/**
 * 关闭当前页面，跳转到应用内的某个页面
 * @param {跳转路径} path
 */
const redirectTo = path => {
  wx.redirectTo({
    url: path
  });
};

/**
 * 关闭所有页面，跳转到应用内的某个页面
 * @param {跳转路径} path
 */
const reLaunch = path => {
  wx.reLaunch({
    url: path
  });
};

/**
 * 轻提示
 * @param {param} param
 */
const showToast = param => {
  const _json = {
    duration: 2000
  };
  param = Object.assign(_json, param);
  wx.showToast(param);
};

/**
 * 显示loading
 * @param {提示文本} text
 */
const showLoading = text => {
  wx.showLoading({
    mask: true,
    title: text || '',
  });
};

/**
 * 关闭loading
 */
const hideLoading = () => {
  wx.hideLoading();
};

/**
 * 复制文本内容
 * @param {文本内容} str
 */
const copyText = (str) => {
  wx.setClipboardData({
    data: str + '',
    success(res) {
      if (res.errMsg == 'setClipboardData:ok') {
        showToast({
          title: '已复制到剪切板',
          icon: 'success'
        });
      } else {
        showToast({
          title: '复制失败',
          image: '/images/common/logo@2x.png'
        });
      }
    }
  });
};

/**
 * 保持屏幕常亮
 */
const setKeepScreenOn = () => {
  wx.setKeepScreenOn({
    keepScreenOn: true
  });
};

/**
 * 分享
 * @param {分享标题} title
 * @param {分享路径} path
 * @param {分享封面图片} imgUrl
 */
const shareApp = (title, path, cb) => {
  const _title = title ? title : '';

  return {
    title: _title,
    path: path || '',
    imageUrl: '../../images/common/pic-share@2x.png',
    success(res) {
      console.log('分享成功：', res);
      cb && cb();
    },
    fail(err) {
      console.log('分享失败：', err);
    }
  };
};

/**
 * 获取月、日、时
 * @param {}
 */
const getMonthAndDate = () => {
  const months = [];
  const days = [];
  const minute = [];
  const minute2 = [];
  const hours = [];
  const hours2 = [];
  const date = new Date();
  const month = date.getMonth() + 1;
  const totalDays = new Date(date.getFullYear(), month, 0).getDate();
  const toDay = date.getDate();
  for (let i = month; i <= 12; i++) {
    const _i = i < 10 ? '0' + i : i;
    months.push(_i + '月');
  }
  for (let j = toDay; j <= totalDays; j++) {
    const _j = j < 10 ? '0' + j : j;
    days.push(_j + '日');
  }
  // date.getHours()
  for (let k = 0; k < 23; k++) {
    const _k = (k + 1) < 10 ? '0' + (k + 1) : k + 1;
    hours.push(_k + '时');
  }
  for (let m = 0; m < 60; m += 10) {
    minute.push(m + '分');
  }
  for (let m1 = 0; m1 < 60; m1 += 10) {
    minute2.push(m1 + '分钟');
  }
  for (let n = 0; n < 24; n++) {
    // const _n = n < 10 ? '0' + n : n;
    hours2.push(n + '小时');
  }
  return { month: months, day: days, hours: hours, hours2: hours2, minute: minute, minute2: minute2 };
};

/**
 * 将2019/06/01 格式化为 06月01日
 * @param date
 */
const formatDateToMonthAndDay = (date) => {
  if (!date) return '';
  const _date = date.split('/');
  return _date[1] + '月' + _date[2] + '日';
};

/**
 * 获取字符串长度，中文length为2，英文为1
 * @param {字符串} str
 */
const getLen = (str) => {
  if (str == null) return 0;
  if (typeof str != 'string') {
    str += '';
  }
  return str.replace(/[^\x00-\xff]/g, '01').length;
};

/**
 * 拼接指定的key值
 * @param {数据源} array
 * @param {key} key
 */
const getConcatStringToArray = (array, key) => {
  const arr = [];
  if (!array.length) return '';
  for (let i = 0; i < array.length; i++) {
    const value = array[i][key];
    if (value) {
      arr.push(value);
    }
  }
  return arr.join('、');
};

/**
 * 解析url参数为json
 * @param {url} url
 */
const getParamsToUrl = (url) => {
  const theRequest = new Object();
  if (url.indexOf('?') != -1) {
    const str = url.split('?');
    const strs = str[1];
    if (strs.indexOf('&') != -1) {
      const temp = strs.split('&');
      for (let i = 0; i < temp.length; i++) {
        theRequest[temp[i].split('=')[0]] = temp[i].split('=')[1];
      }
    } else {
      theRequest[strs.split('=')[0]] = strs.split('=')[1];
    }
  }
  return theRequest;
};

/**
 * 获取授权状态
 */
const getAuth = () => {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            lang: 'zh_CN',
            success(res) {
              wx.setStorageSync('userInfo', res.userInfo);
              resolve(true);
            }
          });
        } else {
          resolve(false);
        }
      },
      fail() {
        resolve(false);
      }
    });
  });
};

/**
 * 获取授权状态
 */
const getAuthSetting = (authName) => {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success(res) {
        resolve(res.authSetting['scope.' + authName]);
      },
      fail() {
        resolve(false);
      }
    });
  });
};

/**
 * 调试时的当前时间
 */
const mklog = () => {
  const date = new Date(); // 新建一个事件对象
  const seperator1 = '/'; // 日期分隔符
  const seperator2 = ':'; // 事件分隔符
  let month = date.getMonth() + 1; // 获取月份
  let strDate = date.getDate(); // 获取日期
  let ss = date.getSeconds(); // 获取秒
  if (month >= 1 && month <= 9) { // 判断月份
    month = '0' + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = '0' + strDate;
  }
  if (ss >= 0 && ss <= 9) {
    ss = '0' + ss;
  }
  let ms = date.getMilliseconds();
  if (ms >= 10 && ms <= 100) {
    ms = '0' + ms;
  } else if (ms >= 0 & ms <= 9) {
    ms = '00' + ms;
  }
  const currentdate = ('2' + date.getYear() - 100) + seperator1 + month + seperator1 + strDate + ' ' + date.getHours() + seperator2 + date.getMinutes() + ':' + ss + '\'' + ms;

  return `【${currentdate}】=====>>`;
};

const isObj = (o) => {
  return Object.prototype.toString.call(o) === '[object Object]';
};

const isString = (o) => {
  return typeof o === 'string';
};

const delay = t => {
  t = Number(t);
  if (isNaN(t)) return Promise.resolve();
  return new Promise(resolve => setTimeout(resolve, t));
};

// 监听网络变化
const onNetworkStatusChange = (fn) => {
  return wx.onNetworkStatusChange(fn);
};

module.exports = {
  getUid,
  formatTime,
  isValidPhone,
  getStorage,
  setStorage,
  removeStorage,
  navigateTo,
  redirectTo,
  reLaunch,
  showToast,
  showLoading,
  hideLoading,
  copyText,
  shareApp,
  getMonthAndDate,
  formatDateToMonthAndDay,
  getConcatStringToArray,
  getLen,
  getParamsToUrl,
  getAuth,
  getAuthSetting,
  setKeepScreenOn,
  mklog,
  isObj,
  isString,
  delay,
  onNetworkStatusChange
};
