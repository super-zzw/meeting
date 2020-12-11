/* eslint-disable */
import aesjs from 'aes-js';
import { Base64 } from 'js-base64';
import AgoraRTC from 'agora-rtc-sdk';
import axios from 'axios';

const key = 'polyvliveSDKAuth';
const iv = '1111000011110000';

AgoraRTC && AgoraRTC.Logger.setLogLevel(AgoraRTC.Logger.ERROR);

class RTC {

  constructor(channelId, uid) {
    this.channelId = channelId;
    this.uid = uid;
    this.channel = {};
    this.streamStatus = 'NOT_READY';
    this.muteStatus = {
      video: true,
      audio: true
    };
  }

  channelKeyUrl() {
    return `//api.polyv.net/live/v2/channels/${this.channelId}/mic-auth`;
  }

  decryptChannelKey(text, key, iv) {
    const bytesKey = aesjs.utils.utf8.toBytes(key);
    const bytesIv = aesjs.utils.utf8.toBytes(iv);
    const textBytes = aesjs.utils.hex.toBytes(text);
    // eslint-disable-next-line new-cap
    const aesCbc = new aesjs.ModeOfOperation.cbc(bytesKey, bytesIv);
    const decryptedBytes = aesCbc.decrypt(textBytes);
    const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    const res = JSON.parse(Base64.decode(decryptedText));
    return res;
  }

  getChannelKey() {
    return new Promise((resolve, reject) => {
      axios.get(this.channelKeyUrl(), {
        params: { type: 'web', timestamp: new Date().getTime() }
      }).then((res) => {
        res = res.data;
        if (res.code === 200) {
          resolve(this.decryptChannelKey(res.data, key, iv));
        } else {
          const error = new Error(res.message);
          error.statusCode = res.status;
          reject(error);
        }
      }).catch(err => {
        reject(err);
      });
    });
  }

  async initClient() {
    const client = AgoraRTC.createClient({ mode: 'h264_interop' });
    const data = await this.getChannelKey();
    data.uid = this.uid;
    const init = () => {
      return new Promise(resolve => {
        client.init(data.connect_appId, () => {
          resolve();
        });
      })
    }
    await init();
    const channel = this.channel = { client, data };
    return channel;
  }

  joinChannel(channel) {
    const { client, data } = channel;
    return new Promise((resolve, reject) => {
      client.join(data.connect_channel_key, data.channelId, data.uid, uid => {
        console.log("client join success, uid: ", uid);
          resolve(true);
        },
        err => {
          reject(err);
          if (err === 109) {
            this.getChannelKey().then(res => {
              client.renewChannelKey(res.connect_channel_key);
            });
          }
        });
    });
  }

  leave() {
    this.channel.stream && this.channel.stream.close();
    return new Promise((resolve, reject) => {
      this.channel.client.leave(
        () => {
          resolve();
        },
        err => {
          reject(err);
        });
    });
  }

  async initLocalStream(options, callback = function() {}, failCallback = function() {}) {
    const spec = {
      streamID: this.uid,
      audio: options.audio,
      video: options.video,
      screen: false,
      cameraId: options.cameraId,
      microphoneId: options.microphoneId
    };

    const userAgent = window.navigator && window.navigator.userAgent || '';
    if (/fireFox/i.test(userAgent)) {
      delete spec.cameraId;
      delete spec.microphoneId;
    }
    const stream = this.channel.stream = AgoraRTC.createStream(spec);
    stream.setVideoProfile('480P');
    // The user has denied access to the camera and mic.
    stream.on("accessDenied", function() {
      console.log("accessDenied");
      failCallback("accessDenied");
    });
    stream.init(() => {
      this.streamStatus = 'STREAMINIT';
      callback(this.channel.client, stream);
    }, (err) => {
      failCallback(err);
    });
  }

  publishStream() {
    const { client, stream } = this.channel;
    console.info('publish stream:',  stream.getId());
    client.publish(stream, function(err) {
      console.info('stream published fail', err);
    });
    this.streamStatus = 'PUBLISH';
  }

  unPublishStream() {
    const { client, stream } = this.channel;
    console.info('unpublish stream:',  stream.getId());
    client.unpublish(stream, function(err) {
      console.info('stream unpublished fail', err);
    });
    this.streamStatus = 'UNPUBLIST';
  }

  enableVideo() {
    const stream = this.channel.stream
    stream.unmuteVideo();
    this.muteStatus.video = true;
  }

  disableVideo() {
    const stream = this.channel.stream
    stream.muteVideo();
    this.muteStatus.video = false;
  }

  enableAudio() {
    const stream = this.channel.stream
    stream.unmuteAudio();
    this.muteStatus.audio = true;
  }

  disableAudio() {
    const stream = this.channel.stream
    stream.muteAudio();
    this.muteStatus.audio = false;
  }

  setVolume(volume) {
    const stream = this.channel.stream
    stream.setAudioVolume(volume);
  }

  static async hasDevices() {
    const devices = await RTC.getDevices();
    console.log(devices);
    const hasVideo = devices.find(device => (device.kind === 'videoinput' && device.deviceId));
    const hasAudio = devices.find(device => (device.kind === 'audioinput' && device.deviceId));
    return (hasAudio && hasVideo) || false;
  }

  static getDevices() {
    return new Promise(resolve => {
      AgoraRTC.getDevices(devices => {
        resolve(devices);
      }, (err) => {
        console.error(err);
        reject();
      });
    });
  }

}

RTC.isSupport = AgoraRTC && AgoraRTC.checkSystemRequirements();
RTC.AgoraRTC = AgoraRTC;

export default RTC;
