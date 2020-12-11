import md5 from '../utils/md5';
import request from '../utils/request';
import store from '../../store/index';

function getSign(obj, appSecret) {
  const arr = Object.keys(obj).filter((item) => item !== 'sign').sort(); // 拿到除sign外字母顺序排列的key
  let query = '';
  arr.forEach((item) => {
    query += `${item}${obj[item]}`;
  });
  return md5(`${appSecret}${query}${appSecret}`).toUpperCase();
}


/**
 * sdk - 网络请求
 * @param {string} url 请求路径
 * @param {object} options 请求体
 * @param {boolean} raw 是否直接使用原来的request
 */
export default function pRequest(url, options, isRaw) {
  if (!isRaw) {
    // const { appId, appSecret } = store.state.app;
    const { appId, appSecret } = store.get('app');
    Object.keys(options).forEach(key => {
      if ((key === 'qs' || key === 'body') && options[key]) {
        const tmp = { ...options[key] };
        tmp.appId = appId;
        tmp.timestamp = Date.now();
        tmp.sign = getSign(tmp, appSecret);
        options[key] = tmp;
      }
    });
  }
  return request(url, options);
}
