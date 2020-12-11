/* eslint-disable no-unused-vars */
/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable no-console */
import store from '../../store/index';
import chatEvent from './eventTypes';
import Chat from './chat';
import utils from '../utils/utils';

export {
  initChat,
  disconnectSocket,
  emitToPaintEvent
};

function initChat({ channelId, pageType, toGetInitData = true, callback }) {
  // console.log('=================进入initChat方法====================');
  const userId = store.get('main.confereeId');
  const { nickName, avatarUrl } = utils.getStorage('userInfo');
  if (callback instanceof Function) initChat.callback = callback;
  return new Promise(resolve => {
    const chatMsg = store.get('main.chatMsg');
    const chat = store.get('main.chat');
    if (chatMsg) {
      if (parseInt(chatMsg.channelId) === parseInt(channelId)) {
        // 如果之前存在过，则通知聊天室，从新获取ppt当前状态
        if (toGetInitData) {
          chat.sendSocketMessage({
            EVENT: 'GET_PPT_STATUS_WHEN_LOGIN',
            roomId: channelId,
            userId
          });
        }
        return resolve(chatMsg);
      }
      chat.disconnectSocket();
    }
    if (chat) chat.disconnectSocket();
    resolve(init({ userId, channelId, avatarUrl, userName: nickName, pageType }));
  });
}

function disconnectSocket() {
  const chat = store.get('main.chat');
  if (!chat) return;
  chat.disconnectSocket();
  store.set('main.chatMsg', null);
}

function init(data) {
  const { userId, channelId, avatarUrl, userName, pageType } = data;
  // console.log(`userId=${userId}, channelId=${channelId}, avatarUrl=${avatarUrl}, userName=${userName}, pageType=${pageType}}`);
  // 初始化聊天室
  if (!userId || !channelId || !avatarUrl || !userName) {
    if (init.times && init.times > 5) {
      init.times = 0;
      return Promise.resolve();
    }
    if (!init.times) init.times = 0;
    init.times++;
    return utils.delay(1000).then(() => init(data));
  }
  init.times = 0;

  const options = {
    userId,
    micUserId: userId,
    userName,
    roomName: channelId,
    pic: avatarUrl,
    userType: 'slice',
    isMobile: true
  };
  const chat = new Chat({ ...options });
  chat.setup();
  store.set({ 'main.chat': chat });
  chat.on(
    chatEvent.SLICEID,
    (event, { inMeeting, data: { userId: loginUserId, isCamClosed } }) => {
      if (
        !inMeeting &&
        loginUserId === userId &&
        pageType === 'create'
      ) _sliceStart(channelId);
      if (initChat.callback) {
        initChat.callback({ EVENT: 'controlCam', isCamClosed });
      }
    }
  );

  chat.on(
    chatEvent.SLICECONTROL,
    (event, { data: { type, isCamClosed } }) => {
      if (type === 'closeCamera' && initChat.callback) {
        initChat.callback({ EVENT: 'controlCam', isCamClosed });
      }
    }
  );

  chat.on(
    chatEvent.SPEAK,
    (event, { data }) => {
      initChat.callback({ EVENT: 'hostEndingMeeting', data });
    }
  );

  chat.on(
    'onChangeCamera',
    (event, { data }) => {
      initChat.callback({ EVENT: 'onChangeCamera', data });
    }
  );

  chat.on(
    'muteForMeeting',
    (event, { data }) => {
      initChat.callback({ EVENT: 'muteForMeeting', data });
    }
  );

  chat.on(
    'muteForMeeting1',
    (event, { data }) => {
      initChat.callback({ EVENT: 'muteForMeeting1', data });
    }
  );

  chat.on(
    'delForMeeting',
    (event, { data }) => {
      initChat.callback({ EVENT: 'delForMeeting', data });
    }
  );

  chat.on(
    'endingForMeeting',
    (event, { data }) => {
      initChat.callback({ EVENT: 'endingForMeeting', data });
    }
  );

  const returnData = {
    user: {
      userId,
      nickName: userName
    },
    channelId
  };
  store.set('main.chatMsg', returnData);
  return Object.assign({ chat }, returnData);

  // 开始上课
  function _sliceStart(roomId) {
    const timeStamp = Date.now();
    const sendData = {
      EVENT: 'onSliceStart',
      roomId,
      sessionId: `meeting${timeStamp}`,
      timeStamp,
      docType: 1,
      userId,
      courseType: 'meeting',
      emitMode: 0,
      data: {
        autoId: 0,
        pageId: 0,
        step: 0,
        isCamClosed: 0,
      }
    };
    chat.sendSocketMessage(sendData);
  }
}

// 广播开启关闭白板事件
function emitToPaintEvent({ roomId, isCamClosed = 1 }) {
  const chat = store.get('main.chat');
  if (!chat) return;
  const userId = store.get('main.confereeId');
  const sendData = {
    EVENT: 'onSliceControl',
    docType: 1,
    data: {
      docType: 1,
      isCamClosed,
      type: 'closeCamera'
    },
    roomId,
    userId
  };
  chat.sendSocketMessage(sendData);
}
