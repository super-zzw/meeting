// import request from '../utils/request';
import request from '../api/plv-request';
import { URL } from '../utils/config';
// import { getSign, appId } from '../api/index';

// console.log('request', request);

const { mainHost } = URL;
// 根据频道号获取历史聊天消息
const historyUrl = `${mainHost}/live/v3/channel/chat/get-history-contents`;
// 删除单条聊天消息
const removeHistoryUrl = `${mainHost}/live/v3/channel/chat/remove-content`;
// 获取咨询提问内容
const questionHistoryUrl = `${mainHost}/live/v3/channel/chat/get-question-contents`;
// 根据roomId和checkinId获取签到记录
const getCurrentSign = `${mainHost}/live/v3/channel/chat/get-checkin`;
// 获取签到列表
const getCheckinList = `${mainHost}/live/v3/channel/chat/get-checkin-list`;
const userUrl = `${mainHost}/live/v3/channel/chat/get-user-list`;
// 获取禁言列表
const bannedListUrl = `${mainHost}/live/v3/channel/chat/get-banned-list`;
// 获取当前房间连麦状态
const microphoneStatusUrl = `${mainHost}/live/v3/channel/chat/get-microphone-status`;

export default {
  setNickname(roomId, nickname) {
    return request(`${mainHost}/${roomId}/set-nickname`, {
      body: { nickname }
    });
  },
  // 获取频道在线列表
  getOnlineUserList(channelId) {
    return request(userUrl, {
      body: {
        channelId,
        page: 1,
        pageSize: 100,
        hide: 0
      }
    });
  },
  getHistoryMessage(userInfo, begin, numbers) {
    return request(historyUrl, {
      body: {
        channelId: userInfo.roomName,
        start: begin,
        end: begin + numbers,
        hideIp: 0,
        fullMessage: 1
      }
    });
  },
  getQuestionHistoryMessage(roomName, begin = 0, numbers = 20) {
    return request(questionHistoryUrl, {
      body: {
        channelId: roomName,
        start: begin,
        end: begin + numbers
      }
    });
  },
  getCurrentSignRecord(value) {
    return request(getCurrentSign, {
      body: {
        channelId: value.channelId,
        checkinId: value.checkinId
      }
    });
  },
  getHistorySignRecord(value) {
    return request(getCheckinList, {
      body: {
        channelId: value.channelId,
        startDate: value.startIndate,
        endDate: value.endIndate
      }
    });
  },
  getBannedList(roomId) {
    return request(bannedListUrl, {
      body: {
        channelId: roomId,
        type: 'ip'
      }
    });
  },
  // 删除聊天记录
  removeHistoryUrl(id, options) {
    return request(removeHistoryUrl, {
      body: {
        channelId: options.roomName,
        id: id
      }
    });
  },
  // 查询当前连麦状态
  checkCurrentStatus(roomId) {
    return request(microphoneStatusUrl, {
      body: {
        channelId: roomId
      }
    });
  }
};
