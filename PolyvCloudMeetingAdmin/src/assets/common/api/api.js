import config from '../config';
import axios from 'axios';
import qs from 'qs';

const $axios = axios.create({
  timeout: 10000,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  // , baseURL: config.baseUrl
});

$axios.interceptors.request.use((req) => {
  req.data = qs.stringify(req.data);
  // console.log('请求报文：' + req.data);
  return req;
});

$axios.interceptors.response.use((res) => {
  // console.log('返回报文：' + JSON.stringify(res.data));
  if (res.data.code === config.sessionExpiredCode) { // 用户未登录
    window.location.assign('//my.polyv.net/v2/login');
  }
  return res;
});

export default $axios;
