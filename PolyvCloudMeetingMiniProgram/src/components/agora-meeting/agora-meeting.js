/* eslint-disable no-undef */
/* eslint-disable no-case-declarations */
/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable camelcase */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/*
 * @Author: Chenyintang
 * @Date: 2019-06-11 18:05:09
 * @Last Modified by: Chenyintang
 * @Last Modified time: 2019-09-09 22:51:27
 */
import RTC from '../../common/rtc/rtc';
import regeneratorRuntime from '../../common/regenerator-runtime/runtime-module';
const Layouter = require('@common/utils/layout');
const request = require('@common/request/request');
const utils = require('@common/utils/utils');
const max_user = 7;
const app = getApp();

Component({
  properties: {
    uid: {
      type: String
    },
    roomno: {
      type: Number
    }
  },
  async ready() {
    this.initLayouter();
    const media = this.data.media || [];
    media.forEach(item => {
      if (item.type === 0) {
        return;
      }
      const player = this.getPlayerComponent(item.uid);
      if (!player) {
        // console.log(`player ${item.uid} component no longer exists`, 'error');
      } else {
        player.start();
      }
    });
    const { uid, roomno } = this.properties;
    const ret = await this.initAgoraChannel(uid, roomno);
    // console.log('onReady====', ret);
    if (ret) {
      const ts = new Date().getTime();
      this.addMedia(0, this.uid, ret, {
        key: ts
      });
    }
  },
  detached() {
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.client && this.client.unpublish();
    this.client && this.client.leave();
    this.client = null;
  },
  data: {
    media: [],
    Layouter: null,
    isCloseMic: false,
  },
  methods: {
    async initAgoraChannel(uid, channel) {
      const that = this;
      const client = new RTC();
      this.client = client;
      return new Promise(async (resolve, reject) => {
        this.subscribeEvents(client);
        const res = await client.init(channel);
        // console.log('初始化=', res);
        client.join(res.connect_channel_key, res.channelId, uid, () => {
          // console.log('client join channel success');
          client.publish(async url => {
            // console.log('client publish success', url);
            resolve(url);
            // 处理静音
            that.handleMute(uid, channel);
          }, e => {
            // console.log(`client publish failed: ${e.code} ${e.reason}`);
            reject(e);
          });
        }, e => {
          // console.log(`client join channel failed: ${e.code} ${e.reason}`);
          reject(e);
        });
      });
    },
    // 上报会议室中人员的状态
    async updateUserState(confereeId, state) {
      const ret = await request.post('/api/meeting/updateConnecting', { confereeId: confereeId, connecting: state });
      // console.info('上报结果=', ret);
    },
    subscribeEvents(client) {
      const that = this;
      client.on('video-rotation', (e) => {
        // console.log(`video rotated: ${e.rotation} ${e.uid}`);
        setTimeout(() => {
          const player = that.getPlayerComponent(e.uid);
          player && player.rotate(e.rotation);
        }, 1000);
      });

      client.on('stream-added', async e => {
        const uid = e.uid;
        const ts = new Date().getTime();
        // console.log(`stream ${uid} added`);

        // 上报用户状态
        that.updateUserState(uid, 1);

        this.triggerEvent('soundChange', {}, {});
        client.subscribe(uid, (url, rotation) => {
          // console.log(`stream ${uid} subscribed successful`);
          const media = that.data.media || [];
          let matchItem = null;
          for (let i = 0; i < media.length; i++) {
            const item = that.data.media[i];
            if (`${item.uid}` == `${uid}`) {
              matchItem = item;
              break;
            }
          }

          if (!matchItem) {
            that.addMedia(1, uid, url, {
              key: ts,
              rotation: rotation
            });
          } else {
            that.updateMedia(matchItem.uid, {
              url: url
            });
          }
        }, e => {
          // console.log(`stream subscribed failed ${e} ${e.code} ${e.reason}`);
        });
      });

      client.on('stream-removed', async e => {
        const _uid = e.uid;
        // console.log(`stream ${_uid} removed`);
        that.removeMedia(_uid);

        // 上报用户状态
        that.updateUserState(_uid[0], 0);

        this.triggerEvent('soundChange', {}, {});
      });

      client.on('error', err => {
        const errObj = err || {};
        const code = errObj.code || 0;
        const reason = errObj.reason || '';
        // console.log(`error: ${code}, reason: ${reason}`);
        const ts = new Date().getTime();
        if (code === 501 || code === 904) {
          that.reconnect();
        }
      });

      client.on('update-url', async e => {
        // console.log(`update-url: ${JSON.stringify(e)}`);
        const uid = e.uid;
        const url = e.url;
        const ts = new Date().getTime();
        if (`${uid}` === `${that.uid}`) {
          // if it's not pusher url, update
          // console.log('ignore update-url');
        } else {
          that.updateMedia(uid, {
            url: url
          });
        }
      });
    },

    getPlayerComponent(uid) {
      return this.selectComponent(`#rtc-player-${uid}`);
    },

    addMedia(mediaType, uid, url, options) {
      // console.log(`add media ${mediaType} ${uid} ${url}`);
      let media = this.data.media || [];

      if (mediaType === 0) {
        // pusher
        media.splice(0, 0, {
          key: options.key,
          type: mediaType,
          uid: `${uid}`,
          holding: false,
          url: url,
          left: 0,
          top: 0,
          width: 0,
          height: 0
        });
      } else {
        // player
        media.push({
          key: options.key,
          rotation: options.rotation,
          type: mediaType,
          uid: `${uid}`,
          holding: false,
          url: url,
          left: 0,
          top: 0,
          width: 0,
          height: 0
        });
      }

      media = this.syncLayout(media);
      return this.refreshMedia(media);
    },

    syncLayout(media) {
      const sizes = this.layouter.getSize(media.length);
      for (let i = 0; i < sizes.length; i++) {
        const size = sizes[i];
        const item = media[i];

        if (item.holding) {
          continue;
        }

        item.left = parseFloat(size.x).toFixed(2);
        item.top = parseFloat(size.y).toFixed(2);
        item.width = parseFloat(size.width).toFixed(2);
        item.height = parseFloat(size.height).toFixed(2);
      }
      return media;
    },

    refreshMedia(media) {
      return new Promise((resolve) => {
        this.setData({
          media: media
        }, () => {
          resolve();
        });
      });
    },

    initLayouter() {
      const systemInfo = app.globalData.systemInfo;
      this.layouter = new Layouter(systemInfo.windowWidth, systemInfo.windowHeight - 64);
    },

    updateMedia(uid, options) {
      // // console.log(`update media ${uid} ${JSON.stringify(options)}`);
      const media = this.data.media || [];
      let changed = false;
      for (let i = 0; i < media.length; i++) {
        const item = media[i];
        if (`${item.uid}` == `${uid}`) {
          media[i] = Object.assign(item, options);
          changed = true;
          // console.log(`after update media ${uid} ${JSON.stringify(item)}`);
          break;
        }
      }

      if (changed) {
        return this.refreshMedia(media);
      } else {
        // console.log(`media not changed: ${JSON.stringify(media)}`);
        return Promise.resolve();
      }
    },

    removeMedia(uid) {
      // console.log(`remove media ${uid}`);
      let media = this.data.media || [];
      media = media.filter(item => {
        return `${item.uid}` != `${uid}`;
      });

      if (media.length != this.data.media.length) {
        media = this.syncLayout(media);
        this.refreshMedia(media);
      } else {
        // console.log(`media not changed: ${JSON.stringify(media)}`);
        return Promise.resolve();
      }
    },

    reconnect() {
      utils.showToast({ title: '尝试恢复链接...', icon: 'none' });
      this.client && this.client.destroy();
      this.reconnectTimer = setTimeout(() => {
        const { uid, roomno } = this.properties;
        this.reinitAgoraChannel(uid, roomno).then(url => {
          const ts = new Date().getTime();

          if (this.hasMedia(0, uid)) {
            this.updateMedia(uid, {
              url: url
            });
          } else {
            // console.log('pusher not yet exists when rejoin...adding');
            this.addMedia(0, uid, url, {
              key: ts
            });
          }
        }).catch(e => {
          // console.log(`reconnect failed: ${e}`);
          return this.reconnect();
        });
      }, 1 * 1000);
    },

    hasMedia(mediaType, uid) {
      const media = this.data.media || [];
      return media.filter(item => {
        return item.type == mediaType && `${item.uid}` == `${uid}`;
      }).length > 0;
    },

    async handleMute(uid, channel) {
      const that = this;
      const ret = await request.post('/api/meeting/getOngoingConferees', { meetingId: channel });
      const users = ret.data;
      for (let i = 0; i < users.length; i++) {
        const item = users[i];
        if (item.confereeId == uid) {
          // 静音
          if (item.micMute == 1) {
            that.client.muteLocal('audio', () => {
              console.log(utils.mklog(), 'ppt初始化时===>publish audio停止音频流成功');
              // that.setData({ isCloseMic: true });
            }, err => {
              console.log(err);
            });
          }
        } else {
          console.log('');
        }
      }
    },

    async reinitAgoraChannel(uid, channel) {
      const that = this;
      const client = new RTC();
      return new Promise(async (resolve, reject) => {
        this.subscribeEvents(client);
        this.client = client;
        const res = await client.init(this.data.roomno);
        client.rejoin(res.connect_channel_key, res.channelId, this.uid, () => {
          // console.log('client rejoin channel success');
          client.publish(async url => {
            // console.log('client publish success', url);
            resolve(url);
            // 处理静音
            that.handleMute(uid, channel);
          }, e => {
            if (!e) return reject(new Error('client publish failed'));
            // console.log(`client publish failed: ${e.code} ${e.reason}`);
            reject(e);
          });
        }, e => {
          // console.log(`client rejoin channel failed: ${e.code} ${e.reason}`);
          reject(e);
        });
      });
    },

    // 网络断链
    onPusherFailed() {
      this.setData({
        isNetError: true
      });
    },

    // 开关麦
    handleChangeMic(isClose) {
      this.handleMuteAudio(isClose);
    },

    handleMuteAudio(isCloseMic) {
      if (isCloseMic) {
        this.client.muteLocal('audio', () => {
          console.log('muteLocal audio success');
          this.triggerEvent('changeMic', 'close');
        }, err => {
          console.log(err);
        });
      } else {
        this.client.unmuteLocal('audio', () => {
          console.log('unmuteLocal audio success');
          this.triggerEvent('changeMic', 'open');
        }, err => {
          console.log(err);
        });
      }
      this.setData({
        isCloseMic
      });
    },

    leave() {
      // 退出频道
      this.client.leave();
      this.client && this.client.destroy();
    }
  }
});
