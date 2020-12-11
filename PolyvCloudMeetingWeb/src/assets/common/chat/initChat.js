/* eslint-disable */

import store from './store';
import chatEvent from './eventTypes';
import Chat from './chat';

export {
  initChat,
  disconnectSocket
};

const delay = t => {
  t = Number(t);
  if (isNaN(t)) return Promise.resolve();
  return new Promise(resolve => setTimeout(resolve, t));
};

function initChat({ token, nickName, avatarUrl, channelId, pageType, toGetInitData = true, callback, callback2 }) {
  const userId = store.get('main.confereeId');
  if (callback instanceof Function) initChat.callback = callback;
  if (callback2 instanceof Function) initChat.callback2 = callback2;
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
    resolve(init({ token, userId, channelId, avatarUrl, userName: nickName, pageType }));
  });
}

function disconnectSocket() {
  const chat = store.get('main.chat');
  if (!chat) return;
  chat.disconnectSocket();
  store.set('main.chatMsg', null);
}

function init(data) {
  console.log('=================进入Chat.init()方法====================');
  const { token, userId, channelId, avatarUrl, userName, pageType } = data;
  console.log(`userId=${userId}, channelId=${channelId}, avatarUrl=${avatarUrl}, userName=${userName}, pageType=${pageType}}`);
  // 初始化聊天室
  if (!userId || !channelId || !avatarUrl || !userName) {
    if (init.times && init.times > 5) {
      init.times = 0;
      return Promise.resolve();
    }
    if (!init.times) init.times = 0;
    init.times++;
    return delay(1000).then(() => init(data));
  }
  init.times = 0;

  const options = {
    userId,
    micUserId: userId,
    userName,
    roomName: channelId,
    pic: avatarUrl,
    userType: 'slice',
    isMobile: false,
    token: token
  };
  const chat = new Chat({ ...options });
  chat.setup();
  store.set({ 'main.chat': chat });

  chat.on(
    chatEvent.SPEAK,
    (event, { data }) => {
      initChat.callback({ EVENT: 'hostEndingMeeting', data });
    }
  );

  chat.on(
    'muteForMeeting',
    (event, { data }) => {
      initChat.callback({ EVENT: 'muteForMeeting', data });
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

  chat.on(
    chatEvent.SLICEID,
    (event, data) => {
      initChat.callback2({ EVENT: chatEvent.SLICEID, data });
    }
  );

  chat.on(
    chatEvent.SLICECONTROL,
    (event, data) => {
      initChat.callback2({ EVENT: chatEvent.SLICECONTROL, data });
    }
  );
  
  chat.on(
    chatEvent.SLICEDRAW,
    (event, data) => {
      initChat.callback2({ EVENT: chatEvent.SLICEDRAW, data });
    }
  );

  chat.on(
    chatEvent.SLICEDOPEN,
    (event, data) => {
      initChat.callback2({ EVENT: chatEvent.SLICEDOPEN, data });
    }
  );

  chat.on(
    chatEvent.SLICESTART,
    (event, data) => {
      initChat.callback2({ EVENT: chatEvent.SLICESTART, data });
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

  console.log('=================结束Chat.init()方法====================');
  return Object.assign({ chat }, returnData);
}
