import util from '../common/utils/utils';

class Store {
  constructor(state) {
    this.state = { ...state };
    this.callbacks = {};
  }

  // key: get('app.appId')
  // obj: get({ 'main.chat', (chat) => {} }) chat变化，执行回调函数
  get(keyOrObj) {
    if (util.isString(keyOrObj)) {
      return this._getByStr(keyOrObj);
    }
    if (util.isObj(keyOrObj)) {
      const obj = { ...keyOrObj };
      Object.keys(obj).forEach(k => {
        const cb = obj[k];

        if (!this.callbacks[k]) {
          this.callbacks[k] = [];
        }
        if (this.callbacks[k].indexOf(cb) < 0) {
          this.callbacks[k].push(cb);
        }
        const val = this._getByStr(k);
        cb(val);
      });
      return () => {
        Object.keys(obj).forEach(k => {
          const cb = obj[k];
          const index = this.callbacks[k].indexOf(cb);
          this.callbacks[k].splice(index, 1);
        });
      };
    }
    throw Error('key must be string or object.');
  }

  // set('main.chat', chat)
  // set({ 'main.chat': chat, 'main.videoId': videoId });
  set(key, val) {
    if (util.isObj(key)) {
      const obj = { ...key };
      Object.keys(obj).forEach(k => {
        const val = obj[k];
        this._setItem(k, val);
      });
      return;
    }
    this._setItem(key, val);
  }

  reset() {
    this.state.main = {
      chat: null,
      channelId: '',
      userInfo: '',
      channelDetail: {},
      chapterList: [],
      videoId: '',
      videoPoolId: ''
    };
  }

  _getItem(key, cb) {
    if (!this.callbacks[key]) {
      this.callbacks[key] = [];
    }
    this.callbacks[key].push(cb);
    const val = this._getByStr(key);
    cb(val);
    return val;
  }

  _setItem(key, val) {
    const keys = key.split('.');
    if (val === this._getByStr(key)) return;

    this._setByStr(key, val);
    keys.reduce((lastKey, key) => {
      const k = lastKey ? lastKey + '.' + key : key;
      (this.callbacks[k] || []).forEach(cb => {
        cb(this._getByStr(k));
      });
    });
  }

  _getByStr(keyStr) {
    if (!keyStr) return this.state;

    const keys = keyStr.split('.');
    return keys.reduce((obj, key, index) => {
      if (!obj[key] && index < keys.length - 1) {
        throw Error(`${key} is undefined in state`);
      }
      return obj[key];
    }, this.state);
  }

  _setByStr(keyStr, val) {
    const keys = keyStr.split('.');
    keys.reduce((obj, key, index) => {
      if (index === keys.length - 1) {
        obj[key] = val;
      }
      obj[key] = obj[key] || {};
      return obj[key];
    }, this.state);
  }
}

const initialState = {
  app: {
    appId: '',
    appSecret: '',
    userId: ''
  },
  main: {
    chat: null,
    channelId: '',
    userInfo: '',
    channelDetail: {},
    chapterList: [],
    openId: '',
    userName: '',
    avatarUrl: '',
    confereeId: '',
    meetingUsers: [],
    chatMsg: null,
  }
};

export default new Store(initialState);
