import store from '../../store/index';
import utils from '../../common/utils/utils';
import { initChat } from '../../common/chat/initChat';
const request = require('@common/request/request');
const config = require('@common/config');

export {
  getAppID,
  getMeetingDetail
};
// 获取AppID和AppSecrect
function getAppID() {
  if (!utils.getStorage('sessionId')) return Promise.resolve();
  const hasAppId = !!store.get('app.appId');
  if (hasAppId) return Promise.resolve();
  const confereeId = store.get('main.confereeId');
  return request.post('/api/user/getPolyvAppInfo', {}).then(({ code, data: { appId, appSecret, userId } = {} }) => {
    if (code == config.successCode) {
      store.set('app', { appId, appSecret, userId: confereeId, polyvUserId: userId });
    }
    return;
  });
}

// 获取议会详情
function getMeetingDetail(meetingId) {
  const sessionId = utils.getStorage('sessionId');
  if (!sessionId || !meetingId) return;
  return request.post('/api/meeting/getMeetingDetail', { meetingId, sessionId }).then(res => {
    if (res.code != config.successCode) return;
    const { confereeId, conferees, channelId, isHost } = res.data;
    store.set('main.confereeId', confereeId);
    store.set('main.meetingUsers', conferees);
    store.set('main.channelId', channelId);
    initChat({ channelId: channelId, pageType: parseInt(isHost) === 1 ? 'create' : 'join' });
    return res.data;
  });
}
