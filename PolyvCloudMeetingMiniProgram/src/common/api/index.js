import { URL } from '../utils/config';
import request from './plv-request';

const { mainHost } = URL;

export default {
  getChannelDetail(channelId) {
    return request(mainHost + '/live/v3/applet/sdk/get-channel-detail', { qs: { channelId } });
  },

  // 上传ppt
  getUploadToken(d) {
    return request(mainHost + '/live/v3/channel/document/token/get', {
      qs: { ...d }
    });
  },

  // 获取ppt上传状态
  getUploadPPTStatus(channelId, fileId) {
    return request(mainHost + '/live/v3/channel/document/status/get', {
      qs: { channelId, fileId }
    });
  },

  // 结束会议时，结束ppt直播
  closeMeetingPPT(channelId) {
    return request(mainHost + '/live/v3/channel/chat/close-meeting-ppt', {
      body: { channelId },
      method: 'POST',
      contentType: 'application/x-www-form-urlencoded'
    });
  }
};
