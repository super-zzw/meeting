/* eslint-disable */

export default  {
  // 连接socket
  CONNECT: 'connect',
  // 取消连接
  DISCONNECT: 'disconnect',
  // 重新连接后
  RECONNECT: 'reconnect',
  // 重新连接开始
  RECONNECT_ATTEMPT: 'reconnect_attempt',
  // 用户发言
  SPEAK: 'speak',
  // 发言错误
  SPEAK_ERROR: 'speakError',
  // 发言审核
  SPEAK_CENSOR: 'speak_censor',
  // 自定义信息
  CUSTOMER_MESSAGE: 'customerMessage',
  // 后台出错
  SERVER_ERROR: 'serverError',
  // socket错误
  ERROR: 'error',
  // 发送消息成功
  SEND_MESSAGE: 'sendMessage',
  // 系统消息
  SYSTEM_MESSAGE: 'SYSTEM_MESSAGE',
  // 登录
  LOGIN: 'login',
  // 退出登录
  LOGOUT: 'loginOut',
  // 画笔
  SLICEID: 'onSliceID',
  SLICESTART: 'onSliceStart',
  SLICECONTROL: 'onSliceControl',
  SLICEDRAW: 'onSliceDraw',
  SLICEDOPEN: 'onSliceOpen'
};
