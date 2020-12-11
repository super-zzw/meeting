import config from '../config';
import axios from 'axios';
import * as utils from '@/assets/common/utils/utils.js';

const $axios = axios.create({
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
  // , baseURL: config.baseUrl
});

$axios.interceptors.request.use((req) => {
  // console.log('请求报文：' + req.data);
  req.headers['cloud-meeting-client-type'] = 'pcweb';
  const sessionId = utils.getSessionId();
  if (sessionId) {
    req.headers['cloud-meeting-session-id'] = sessionId;
  }
  return req;
});

$axios.interceptors.response.use((res) => {
  // console.log('返回报文：' + JSON.stringify(res.data));
  if (res.data.code === config.sessionExpiredCode) { // 用户未登录
    utils.setSessionId(''); // 清空本地sessionId
    window.location.assign('/');
  }
  return res;
});

export default $axios;
