<template>
  <div
    :class="{'videoMode': true, 'hidden-y': isScreenLarge}"
    ref="videomode"
    @mousemove="mouseMove"
  >
    <!-- 正常时的头部 -->
    <div class="head" :class="isScreenLarge ? 'full-head' : ''" ref="head">
      <div class="head-left" style="width:80%;">
        <img src="../../assets/img/logo.png" class="logo" alt />
        <h3 class="theme" :class="isScreenLarge ? 'white' : ''">
          {{meetingDetail.topic}}
          <span class="text">（{{formatRoomNo}}）</span>
        </h3>
      </div>
      <div class="head-right">
        <!-- 信号 -->
        <div class="signal" v-show="!isScreenLarge">
          <!-- 无信号 -->
          <img src="../../assets/img/ic-atten.png" class="atten" v-show="uplinkNetworkQuality==0" />
          <div class="text" v-show="uplinkNetworkQuality==0">无法连接</div>
          <!-- 有信号 -->
          <img
            src="../../assets/img/1.png"
            v-show="uplinkNetworkQuality==5 || uplinkNetworkQuality==6"
          />
          <img
            src="../../assets/img/2.png"
            v-show="uplinkNetworkQuality==3 || uplinkNetworkQuality==4"
          />
          <img
            src="../../assets/img/3.png"
            v-show="uplinkNetworkQuality==1 || uplinkNetworkQuality==2"
          />
        </div>
        <!-- 分享 -->
        <div class="send">
          <div class="send-icon"></div>
          <div class="send-out">
            <div class="send-drop-down">
              <div class="send-text">房间号</div>
              <div class="item">
                <div
                  class="item-left"
                  v-if="meetingDetail.passWord"
                >{{formatRoomNo}} (密码 {{meetingDetail.passWord}})</div>
                <div class="item-left" v-else>{{formatRoomNo}}</div>
                <button
                  class="send-btn copyRoomNo"
                  data-clipboard-action="copy"
                  :data-clipboard-text="this.copyRoomNoText"
                  @click="copyRoomNo"
                >复制</button>
              </div>
              <div class="send-text">房间地址</div>
              <div class="item">
                <div class="item-left address">{{roomLink}}</div>
                <button
                  class="send-btn copyRoomLink"
                  data-clipboard-action="copy"
                  :data-clipboard-text="roomLink"
                  @click="copyRoomLink"
                >复制</button>
              </div>
              <div class="send-text">小程序</div>
              <div class="code">
                <img src="../../assets/img/code.png" alt />
              </div>
              <div class="toast" v-show="showCopyToast">复制成功</div>
            </div>
          </div>
        </div>
        <!-- 设置 -->
        <div class="head-setting">
          <div class="setting-icon"></div>
          <div class="drop-out">
            <div class="setting-drop-down">
              <!-- 头像 -->
              <div class="drop-photo" id="cameraPreview"></div>
              <!-- 声音 -->
              <div class="drop-volume">
                <div
                  :class="{'spot': true, 'bg-blue': index >= voiceNum}"
                  v-for="(item, index) in 10"
                  :key="index"
                ></div>
              </div>
              <!-- 操作 -->
              <div class="drop-operate">
                <div class="text">媒体设备设置</div>
                <!-- <div class="video-switch">摄像头未开启</div> -->
                <select class="sel" ref="cameraSel"></select>
                <select class="sel" ref="microphoneSel"></select>
                <button class="btn-operate" @click="setDevices">保存</button>
              </div>
            </div>
          </div>
        </div>
        <div class="user-name" v-show="!isScreenLarge">
          <div class="icon">{{currentConferee.nickName}}</div>
          <div class="name">
            <nobr>{{currentConferee.nickName}}</nobr>
          </div>
        </div>
      </div>
    </div>

    <!-- 景观信息提示 -->
    <div class="warningTip" ref="warningTip" v-show="warningMsg">{{warningMsg}}</div>

    <!-- 视频模式 -->
    <div class="videos-box" ref="videobox" :class="isScreenLarge ? 'full' : ''">
      <div class="videos">
        <!-- 主持人 -->
        <div class="host" v-if="hostOnline" :id="hostMedia.elementId">
          <img
            src="../../assets/img/voiceinfo.png"
            class="voiceinfo"
            v-show="hostMedia.isMuteAudio"
          />
          <img src="../../assets/img/no-network.png" class="no-pic" v-show="false" />
          <div class="p-camera-box" v-show="hostMedia.isMuteVideo">
            <div class="p-innrer">
              <img src="../../assets/img/member-pic.png" class="no-pic" />
              <div class="tipTxt tipTxt-center">摄像头未开启</div>
            </div>
          </div>
          <!-- 主持人操作 -->
          <div class="host-setting">
            <img src="../../assets/img/mic.png" alt />
            <div class="host-name">主持人 - {{hostMedia.nickName}}</div>
          </div>
        </div>

        <!-- 参会人员 -->
        <div :class="{'item': true, 'item-width': !hostOnline}" ref="itemwidht">
          <div
            class="member"
            v-for="(memberMedia, index) in media"
            :key="index"
            :id="memberMedia.elementId"
            :style="memberMedia.style"
          >
            <img
              src="../../assets/img/voiceinfo.png"
              class="voiceinfo"
              v-show="memberMedia.isMuteAudio"
            />
            <img src="../../assets/img/no-network.png" class="no-pic" v-show="false" />
            <!-- 摄像头关闭样式  start-->
            <div class="p-camera-box" v-show="memberMedia.isMuteVideo">
              <div class="p-innrer">
                <img src="../../assets/img/member-pic.png" class="no-pic no-pic-center" />
                <div class="tipTxt tipTxt-center">摄像头未开启</div>
              </div>
            </div>
            <!-- 摄像头关闭样式  end-->
            <div class="member-name">
              <div class="text">{{memberMedia.nickName}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 白板模式 -->
    <div
      class="ppth5"
      ref="ppth5box"
      style="display:none;"
      :class="isScreenLarge ? 'full' : ''">
      <div
        class="whiteboard"
        id="ppth5Content"
        ref="ppth5Content"
        :style="whiteStyle"></div>
      <!-- 左边人名 -->
      <div class="left-name">
        <div
          class="item-name"
          :class="{'prohibit':onlineUser.micMute, 'circle':onlineUser.volume}"
          v-for="(onlineUser, index) in onlineUsers"
          :key="index"
        >{{onlineUser.nickName}}</div>
      </div>
    </div>

    <div class="wbtoast" ref="wbtoast" style="display:none;">
      <img class="img" src="../../assets/img/ic-board.png" />
      <div class="text">切换至白板</div>
    </div>

    <div class="wbtoast" ref="doctoast" style="display:none;">
      <img class="img" src="../../assets/img/ic-document.png" />
      <div class="text">切换至文档</div>
    </div>

    <!-- 操作 -->
    <div class="setting" :class="isScreenLarge ? 'mouse' : ''" ref="setting">
      <img :src="voiceSrc" class="setting-icon" @click="handleVoice(true)" />
      <img
        :src="cameraSrc"
        ref="cameraIcon"
        class="setting-icon"
        @click="handleCamera()" />
      <img :src="screenSrc" class="setting-icon" @click="handleLarge()" />
      <div class="line"></div>
      <div class="time">{{joinTime}}</div>
      <button class="btn-out" @click="toLeaveMeeting()">退出会议</button>
    </div>

    <!-- 提示对话框 -->
    <mytips :content="mytipsContent" v-show="showMytips" @hide="toLogin" />

    <!-- 确认对话框 -->
    <mydialog
      content="确定退出会议吗？"
      confirmTitle="确认退出"
      cancelTitle="暂不退出"
      v-show="showLeaveMeetingDialog"
      @confirm="confirmLeaveMeeting"
      @cancel="cancelLeaveMeeting"
    />

    <!-- 退出会议消息提示 -->
    <div class="dialog-cover" v-show="showLeaveMeetingData"></div>
    <div class="dialog" v-show="showLeaveMeetingData">
      <div class="dialog-title">会议已退出</div>
      <div class="dialog-item">
        <div class="item-left">会议时间</div>
        <div class="item-right">{{leaveMeetingData.meetingTimes}}</div>
      </div>
      <div class="dialog-item">
        <div class="item-left">历时</div>
        <div class="item-right">{{leaveMeetingData.duration}}</div>
      </div>
      <div class="dialog-item">
        <div class="item-left">人数</div>
        <div class="item-right">{{leaveMeetingData.counts}}人</div>
      </div>
      <button class="dialog-btn" @click="toLogin()">离开会议室</button>
    </div>
  </div>
</template>

<script>
import voiceOpen from '@/assets/img/voice-open.png';
import voiceClose from '@/assets/img/voice-close.png';
import cameraOpen from '@/assets/img/camera-open.png';
import cameraClose from '@/assets/img/camera-close.png';
import ensmall from '@/assets/img/ensmall.png';
import enlarge from '@/assets/img/enlarge.png';
import Mytips from '@/components/mytips/mytips';
import Mydialog from '@/components/mydialog/mydialog';
import config from '@/assets/common/config.js';
import api from '@/assets/common/api/api.js';
import * as utils from '@/assets/common/utils/utils.js';
import * as storage from '@/assets/common/utils/storage.js';
import RTC from '@/assets/common/rtc/rtc.js';
import chatEvent from '@/assets/common/chat/eventTypes';
import { initChat, disconnectSocket } from '@/assets/common/chat/initChat';
import store from '@/assets/common/chat/store';
import clipboard from 'clipboard';
import Layouter from '@/assets/common/utils/layouter.js';
import { setTimeout, clearTimeout, setInterval, clearInterval } from 'timers';

let pptCtrl = null;
let rtc = null;

export default {
  data() {
    return {
      showLeaveMeetingDialog: false,
      showLeaveMeetingData: false,
      showMytips: false,
      mytipsContent: '会议已经结束',
      warningMsg: '',
      token: '', // 连接socket的token
      meetingId: 0,
      channelId: 0,
      confereeId: 0, // 当前参会人ID
      joinTime: '00:00',
      leaveMeetingData: {},
      meetingDetail: {},
      copyRoomNoText: '',
      currentConferee: {},
      hostMedia: {},
      hostConfereeId: 0, // 主持人参会ID
      hostOnline: false,
      needReconnect: false,
      reconnectTimer: null,
      voiceSrc: voiceOpen,
      cameraSrc: cameraOpen,
      screenSrc: enlarge,
      isCanChangeMic: true,
      isCloseMic: false, // 是否关闭麦克风，默认false
      isCloseCam: false, // 是否关闭摄像头，默认false
      isScreenLarge: false,
      media: [],
      onlineUsers: [],
      uplinkNetworkQuality: 1, // 当前网络状态
      voiceNum: 0,
      // lastMouseMoveSec: false,
      mouseMoveTimer: null,
      showCopyToast: false,
      whiteStyle: '' // ppt样式
    };
  },
  components: {
    Mytips,
    Mydialog
  },
  async mounted() {
    console.log(`.......height: ${document.documentElement.clientHeight}`);
    this.whiteStyle = `height:${document.documentElement.clientHeight -
      50 -
      65}px;`;
    const that = this;
    // 监听退出全屏
    document.addEventListener('fullscreenchange', function(e) {
      if (!document.fullscreenElement) {
        console.log('fullscreenchange');
        that.exitScreenResetStatus();
      }
    });
    document.addEventListener('mozfullscreenchange', function(e) {
      if (!document.fullscreenElement) {
        console.log('mozfullscreenchange');
        that.exitScreenResetStatus();
      }
    });
    document.addEventListener('webkitfullscreenchange', function(e) {
      if (/Apple/.test(navigator.vendor)) {
        if (!that.checkFull()) {
          that.exitScreenResetStatus();
        }
      } else {
        if (!document.fullscreenElement) {
          console.log('webkitfullscreenchange');
          that.exitScreenResetStatus();
        }
      }
    });
    document.addEventListener('msfullscreenchange', function(e) {
      if (!document.fullscreenElement) {
        console.log('msfullscreenchange');
        that.exitScreenResetStatus();
      }
    });

    const sessionId = utils.getSessionId();
    if (!sessionId) {
      that.toLogin(); // 没有登陆，退回加入会议页面
      return;
    }
    this.meetingId = this.$route.query.meetingId;
    this.confereeId = Number(this.$route.query.confereeId);
    this.channelId = this.$route.query.channelId;
    console.log(
      'meetingId:',
      this.meetingId,
      'confereeId:',
      this.confereeId,
      'channelId:',
      this.channelId
    );
    if (!this.meetingId || !this.confereeId || !this.channelId) {
      that.toLogin(); // 参数错误，退回加入会议页面
      return;
    }
    store.set('main.confereeId', this.confereeId);

    await this.getMeetingDetail().then(function() {
      if (that.meetingDetail.status == 2) {
        that.showMytips = true;
        that.mytipsContent = '此会议已经结束';
        return;
      }
      if (that.meetingDetail.status == 0 || that.meetingDetail.status == 3) {
        that.showMytips = true;
        that.mytipsContent = '此会议还未开始';
        return;
      }
      that.meetingDetail.conferees.forEach(e => {
        if (e.confereeId == that.confereeId) {
          that.currentConferee = e;
        }
        if (e.isHost) {
          that.hostConfereeId = e.confereeId;
        }
      });
      if (that.meetingDetail.passWord) {
        that.copyRoomNoText =
          that.meetingDetail.roomNo +
          ' (密码 ' +
          that.meetingDetail.passWord +
          ')';
      } else {
        that.copyRoomNoText = that.meetingDetail.roomNo;
      }
    });

    if (!this.currentConferee.confereeId || !this.currentConferee.nickName) {
      this.showMytips = true;
      this.mytipsContent = '您已退出会议或离线超过5分钟，请重新加入';
      return;
    }

    // 初始声网对象
    await this.initChannel();

    // 获取socket连接token
    await this.getSocketToken(this.channelId);
    console.log('socketToken:', this.token);

    // 初始化聊天室
    initChat({
      token: this.token,
      nickName: this.currentConferee.nickName,
      avatarUrl:
        'http://livestatic.videocc.net/assets/wimages/missing_face.png',
      channelId: this.channelId,
      pageType: 'join',
      toGetInitData: true,
      callback: ({ EVENT, data: { uid, isMute } = {} }) => {
        switch (EVENT) {
          case 'muteForMeeting':
            console.log('EVENT is muteForMeeting');
            that.muteForMeeting({ uid, isMute });
            break;
          case 'muteForMeeting1':
            console.log(
              'EVENT is muteForMeeting1, do not anything',
              uid,
              isMute
            );
            break;
          case 'delForMeeting':
            console.log('EVENT is delForMeeting');
            that.delForMeeting(uid);
            break;
          case 'endingForMeeting':
            console.log(
              'EVENT is endingForMeeting, 接收到主持人结束会议socket'
            );
            that.showMytips = true;
            that.mytipsContent = '主持人结束会议';
            that.leaveChat();
            setTimeout(() => {
              that.toLogin();
            }, 2000);
            break;
          case 'hostEndingMeeting':
            // 接收服务端推送的主持人异常退出超过7分钟的消息
            console.log(
              'EVENT is hostEndingMeeting, 接收服务端推送的主持人异常退出超过7分钟的socket消息'
            );
            let time = 60;
            const interval = setInterval(() => {
              time -= 1;
              if (time == 0) {
                clearInterval(interval);
                that.leaveChat();
                setTimeout(() => {
                  that.toLogin();
                }, 2000);
              } else {
                that.warningMsg = `主持人已离线7分钟，会议将在 ${time}s 后关闭`;
              }
            }, 1000);
            break;
        }
      },
      callback2: ({ EVENT, data }) => {
        switch (EVENT) {
          case chatEvent.SLICEID:
            that.onSliceId(EVENT, data);
            break;
          case chatEvent.SLICECONTROL:
            if (data.data.type === 'closeCamera') {
              that.changeCam(data);
            }
            console.log('EVENT is ' + EVENT, data);
            pptCtrl && pptCtrl.drawMsgFromSocket(data, 200);
            break;
          case chatEvent.SLICEDRAW:
            console.log('EVENT is ' + EVENT, data);
            pptCtrl && pptCtrl.drawMsgFromSocket(data, 200);
            break;
          case chatEvent.SLICEDOPEN:
            console.log('EVENT is ' + EVENT, data);
            if (data.data.autoId) {
              that.$refs.doctoast.style.display = 'block';
              setTimeout(() => {
                that.$refs.doctoast.style.display = 'none';
              }, 2000);
            }
            pptCtrl && pptCtrl.drawMsgFromSocket(data, 200);
            break;
          case chatEvent.SLICESTART:
            console.log('EVENT is ' + EVENT, data);
            pptCtrl && pptCtrl.drawMsgFromSocket(data);
            break;
        }
      }
    });
    setInterval(() => {
      that.getJoinTime();
    }, 1 * 1000);
  },
  methods: {
    async onSliceId(EVENT, data) {
      this.changeCam(data);
      console.log('EVENT is ' + EVENT, data);
      const ppt = await getPPTCtrl();
      ppt && ppt.drawMsgFromSocket(data);
    },
    changeCam(data) {
      if (parseInt(data.data.isCamClosed) === 1) {
        this.showPPTH5();
        this.getOngoingConferees();
        this.$refs.cameraIcon.style.display = 'none';
        this.$refs.setting.style.width = '298px';
        const that = this;
        if (data.data.autoId) {
          that.$refs.doctoast.style.display = 'block';
          setTimeout(() => {
            that.$refs.doctoast.style.display = 'none';
          }, 2000);
        } else {
          that.$refs.wbtoast.style.display = 'block';
          setTimeout(() => {
            that.$refs.wbtoast.style.display = 'none';
          }, 2000);
        }
      } else {
        this.$refs.cameraIcon.style.display = 'block';
        this.$refs.setting.style.width = '358px';
        this.$refs.videobox.style.opacity = 1;
        this.$refs.ppth5box.style.display = 'none';
      }
    },
    checkFull() {
      let isFull =
        document.fullscreenEnabled ||
        window.fullScreen ||
        document.webkitIsFullScreen ||
        document.msFullscreenEnabled;
      if (isFull == undefined) {
        isFull = false;
      }
      console.log('检测==', isFull);
      return isFull;
    },
    exitScreenResetStatus() {
      this.isScreenLarge = false;
      this.screenSrc = enlarge;
      this.exitScreen();
    },
    copyRoomNo() {
      const that = this;
      const _clipboard = new clipboard('.copyRoomNo');
      _clipboard.on('success', function() {
        that.showCopyToast = true;
        setTimeout(() => {
          that.showCopyToast = false;
        }, 2000);
        console.log('房间号复制成功');
      });
      _clipboard.on('error', function() {
        console.log('房间号复制失败');
      });
    },
    copyRoomLink() {
      const that = this;
      const _clipboard = new clipboard('.copyRoomLink');
      _clipboard.on('success', function() {
        that.showCopyToast = true;
        setTimeout(() => {
          that.showCopyToast = false;
        }, 2000);
        console.log('房间链接复制成功');
      });
      _clipboard.on('error', function() {
        console.log('房间链接复制失败');
      });
    },
    getSocketToken(channelId) {
      const that = this;
      return api
        .post('/api/user/getPolyvSocketToken/' + channelId, {})
        .then(function(response) {
          const result = response.data;
          if (result && result.code == config.successCode) {
            that.token = result.data;
          } else {
            console.log(
              'getPolyvSocketToken接口失败：',
              result.code,
              result.message
            );
          }
        })
        .catch(function(err) {
          console.error('请求getPolyvSocketToken接口错误', err);
        });
    },
    // 切换白板
    showPPTH5() {
      this.$refs.videobox.style.opacity = 0;
      this.$refs.ppth5box.style.display = 'block';
      if (pptCtrl) return;
      pptCtrl = new PPTH5({
        content: '#ppth5Content',
        whiteBackColor: '#353535',
        hasPageBtn: false,
        fixedWhiteProp: 2 / 3,
      });
    },
    async initChannel() {
      console.info('====initChannel begin====');
      rtc = new RTC(this.channelId, this.confereeId);
      const channel = await rtc.initClient();
      await rtc.joinChannel(channel);
      const client = channel.client;
      this.client = client;
      const that = this;
      rtc.initLocalStream(
        {
          streamId: this.confereeId,
          video: true,
          audio: true,
          cameraId: storage.read('cameraId'),
          microphoneId: storage.read('microphoneId')
        },
        function(client, stream) {
          console.log('Init local stream successfully:', stream.getId());
          rtc.publishStream();
          that.getConferee(that.confereeId, async function(conferee) {
            if (conferee.micMute == 1) {
              console.log('禁推本地音频：', conferee.confereeId);
              that.handleVoice(true);
            }
            if (conferee.cameraState == 0) {
              console.log('禁推本地视频：', conferee.confereeId);
              that.handleCamera();
            }
            await that.addStream(stream, stream.getId(), 0, conferee); // 本地流
          });
          that.getDevices(); // 初始化设备
          const localStream = RTC.AgoraRTC.createStream({
            streamID: '_local',
            audio: true,
            video: true
          });
          localStream.init(
            () => {
              localStream.addTrack(stream.getVideoTrack());
              localStream.play('cameraPreview');
              setInterval(function() {
                const audioLevel = localStream.getAudioLevel();
                that.voiceNum = 10 - parseInt(audioLevel * 10);
              }, 100);
            },
            err => {
              console.log(err);
            }
          );
        },
        async function(err) {
          if (err && err === 'accessDenied') {
            that.showMytips = true;
            that.mytipsContent = '加入失败，请开启麦克风/摄像头权限';
            await api.post('/api/meeting/leaveMeeting', {
              meetingId: that.meetingId
            });
            that.leaveChat();
          } else {
            console.log('rtc init local stream error.', err);
          }
        }
      );

      client.on('stream-published', function(evt) {
        console.log('Published stream successfully: ', evt.stream.getId());
      });

      client.on('stream-added', function(evt) {
        const stream = evt.stream;
        console.log('Added stream successfully: ' + stream.getId());
        client.subscribe(stream, function(err) {
          console.log('Subscribe stream failed', err);
        });
      });

      client.on('stream-subscribed', function(evt) {
        const stream = evt.stream;
        console.log('Subscribed stream successfully: ' + stream.getId());
        //await that.getConferee(stream.getId(), async function(conferee) {
        //  await that.updateStream(stream, stream.getId());
        //});
        //await that.updateUserState(stream.getId(), 1); // 上报用户在线状态
        //await that.getOngoingConferees();
        var ctimer = setInterval(function() {
          if (that.hasMedia(1, stream.getId()) || that.hostMedia.uid == stream.getId()) {
            that.updateStream(stream, stream.getId());
            console.log(ctimer);
            clearInterval(ctimer);
            ctimer = null;
          }
        }, 1000)
      });

      client.on("peer-online", async function(evt) {
        console.log("peer-online", evt.uid);
        //let memberVideo = document.getElementById('member_video_' + evt.uid);
        //if (!memberVideo && !that.hasMedia(1, evt.uid)) {
          await that.getConferee(evt.uid, async function(conferee) {
            await that.addStream(null, evt.uid, 1, conferee);
          });
          await that.updateUserState(evt.uid, 1); // 上报用户在线状态
          await that.getOngoingConferees();
        //}
      });

      client.on('stream-removed', function(evt) {
        const stream = evt.stream;
        if (stream) stream.stop();
        console.log('Removed stream successfully: ' + stream.getId());
      });

      client.on('peer-leave', async function(evt) {
        console.log(evt.uid + ' leave this channel successfully');
        that.removeStream(evt.uid);
        await that.updateUserState(evt.uid, 0); // 上报用户离开状态
        await that.getOngoingConferees();
      });

      client.on('unmute-audio', function(evt) {
        const uid = evt.uid;
        console.log(uid + ' unmute audio from this channel');
        that.muteAudio(uid, false);
      });

      client.on('mute-audio', function(evt) {
        const uid = evt.uid;
        console.log(uid + ' mute audio from this channel');
        that.muteAudio(uid, true);
      });

      client.on('unmute-video', function(evt) {
        const uid = evt.uid;
        console.log(uid + ' unmute video from this channel');
        that.muteVideo(uid, false);
      });

      client.on('mute-video', function(evt) {
        const uid = evt.uid;
        console.log(uid + ' mute video from this channel');
        that.muteVideo(uid, true);
      });

      client.on('stream-reconnect-start', function(evt) {
        console.log(evt.uid);
      });

      client.on('connection-state-change', function(evt) {
        console.log(evt.prevState, evt.curState);
      });

      // 网络质量
      client.on('network-quality', function(e) {
        that.uplinkNetworkQuality = e.uplinkNetworkQuality;
      });

      client.on('error', err => {
        const errObj = err || {};
        const code = errObj.code || 0;
        const reason = errObj.reason || '';
        console.log(`error: ${code}, reason: ${reason}`);
        // 销毁并退出频道后，重建 client 对象，调用 rejoin 方法尝试重连
        const errCodes = [500, 501, 502, 901, 904, 905];
        if (errCodes.indexOf(code) >= 0) {
          this.needReconnect = true;
          that.reconnect();
        } else {
          this.needReconnect = false;
        }
      });
      console.info('====initChannel end====');
    },
    // 重连
    reconnect() {
      this.reconnectTimer = setTimeout(() => {
        console.log('尝试恢复连接...');
      }, 1 * 1000);
    },
    // 是否已存在的流
    hasMedia(type, uid) {
      return (
        this.media.filter(item => {
          return item.type == type && `${item.uid}` == `${uid}`;
        }).length > 0
      );
    },
    async addStream(stream, uid, type, conferee) {
      console.log('addStream:', `${uid}`, type, conferee);
      let media = this.media || [];
      const user = {
        stream: stream,
        elementId: 'member_video_' + `${uid}`,
        uid: `${uid}`,
        nickName: conferee.nickName,
        isMuteVideo: conferee.cameraState ? false : true,
        isMuteAudio: conferee.micMute == 1 ? true : false,
        style: 'left:0;top:0',
        type: type
      };
      // 判断加入的用户是否为主持人
      if (this.hostConfereeId == uid) {
        console.log('加入的用户是主持人=========', uid);
        this.hostOnline = true;
        this.hostMedia = user;
      } else {
        console.log('加入的用户不是主持人=========', uid);
        await media.push(user);
      }
      media = this.syncLayout(media);
      this.refreshMedia(media);
      this.calcMinWidth(media.length);

      const that = this;
      setTimeout(() => {
        that.customRender();
      }, 100);
    },
    updateStream(stream, uid) {
      console.log('updateStream:', `${uid}`);
      const that = this;
      // 判断加入的用户是否为主持人
      if (this.hostConfereeId == uid) {
        console.log('更新的用户是主持人=========', uid);
        this.hostOnline = true;
        this.hostMedia.stream = stream;
      } else {
        console.log('更新的用户不是主持人=========', uid);
        this.media.forEach((item, index) => {
          if (item.uid == uid) {
            that.media[index].stream = stream;
          }
        });
      }
      setTimeout(() => {
        that.customRender();
      }, 100);
    },
    removeStream(uid) {
      // 判断移除的用户是否为主持人
      if (this.hostConfereeId == uid) {
        console.log('removeStream的是主持人===', uid);
        this.hostOnline = false;
        this.hostMedia = {};
        const player = document.getElementById('player_' + uid);
        if (player) {
          console.log('remove主持人原来的player===', uid);
          player.remove();
        }
      } else {
        console.log('removeStream的不是主持人===', uid);
        let media = this.media || [];
        media = media.filter(item => {
          return `${item.uid}` != `${uid}`;
        });
        media = this.syncLayout(media);
        this.refreshMedia(media);
        this.calcMinWidth(media.length);
      }

      const that = this;
      setTimeout(() => {
        that.customRender();
      }, 100);
    },
    customRender() {
      this.media.map((item, index) => {
        item.stream && item.stream.play(item.elementId);
      });
      if (this.hostOnline && this.hostMedia.stream) {
        this.hostMedia.stream.play(this.hostMedia.elementId);
      }
    },
    // 同步计算布局
    syncLayout(media) {
      let sizes = null;
      if (this.isScreenLarge) {
        const height = this.getHeight() / 2;
        const width = height * (186 / 279);
        console.log('width:', width, 'height:', height);
        sizes = Layouter.getSize(media.length, width, height);
      } else {
        sizes = Layouter.getSize(media.length, 186, 279);
      }
      for (let i = 0; i < sizes.length; i++) {
        const size = sizes[i];
        media[i].style = 'left:' + size.x + 'px; top:' + size.y + 'px';
      }
      return media;
    },
    // 刷新流（布局）
    refreshMedia(media) {
      const that = this;
      return new Promise(resolve => {
        that.media = media;
        resolve();
      });
    },
    // 计算参会人框最小宽度
    calcMinWidth(mlen) {
      let m_cnt = 1;
      if (mlen > 4) {
        m_cnt = 3;
      } else if (mlen > 2) {
        m_cnt = 2;
      } else {
        m_cnt = 1;
      }
      let iw = 186;
      if (this.isScreenLarge) {
        const height = this.getHeight() / 2;
        iw = height * (186 / 279);
      }
      const width = m_cnt * iw;
      this.$refs.itemwidht.style.width = width + 'px';
    },
    muteVideo(uid, isMuteVideo) {
      if (this.hostOnline && this.hostConfereeId == uid) {
        console.log('修改主持人的频频状态为：', isMuteVideo, uid);
        this.hostMedia.isMuteVideo = isMuteVideo;
      } else {
        console.log('修改参会者的频频状态为：', isMuteVideo, uid);
        const _media = this.media || [];
        for (let i = 0; i < _media.length; i++) {
          const item = _media[i];
          if (item.uid == uid) {
            _media[i].isMuteVideo = isMuteVideo;
            this.refreshMedia(_media);
            break;
          }
        }
      }
    },
    muteAudio(uid, isMuteAudio) {
      if (this.hostOnline && this.hostConfereeId == uid) {
        console.log('修改主持人的音频状态为：', isMuteAudio, uid);
        this.hostMedia.isMuteAudio = isMuteAudio;
      } else {
        console.log('修改参会者的音频状态为：', isMuteAudio, uid);
        const _media = this.media || [];
        for (let i = 0; i < _media.length; i++) {
          const item = _media[i];
          if (item.uid == uid) {
            _media[i].isMuteAudio = isMuteAudio;
            this.refreshMedia(_media);
            break;
          }
        }
      }
      const that = this;
      this.onlineUsers &&
        this.onlineUsers.forEach((item, index) => {
          if (item.confereeId == uid) {
            that.onlineUsers[index].micMute = isMuteAudio ? 1 : 0;
          }
        });
    },
    getMeetingDetail() {
      const that = this;
      return api
        .post('/api/meeting/getMeetingDetail', { meetingId: this.meetingId })
        .then(function(response) {
          const result = response.data;
          // console.log('getMeetingDetail:', result);
          if (result && result.code == config.successCode) {
            that.meetingDetail = result.data;
          } else {
            console.log(
              'getMeetingDetail接口失败：',
              result.code,
              result.message
            );
          }
        })
        .catch(function(err) {
          console.error('请求getMeetingDetail接口错误', err);
        });
    },
    confirmLeaveMeeting() {
      const that = this;
      return api
        .post('/api/meeting/leaveMeeting', { meetingId: this.meetingId })
        .then(function(response) {
          const result = response.data;
          // console.log('leaveMeeting:', result);
          if (result && result.code == config.successCode) {
            that.leaveMeetingData = result.data;
            that.showLeaveMeetingData = true;
            that.showLeaveMeetingDialog = false;
            that.leaveChat();
            that.$refs.videobox.innerHTML = '';
            that.$refs.ppth5box.innerHTML = '';
            if (that.isScreenLarge) {
              that.exitScreen();
              that.isScreenLarge = false;
              that.screenSrc = enlarge;
            }
          } else {
            console.log('leaveMeeting接口失败：', result.code, result.message);
          }
        })
        .catch(function(err) {
          console.error('请求leaveMeeting接口错误', err);
        });
    },
    async getOngoingConferees() {
      const that = this;
      return await api
        .post('/api/meeting/getOngoingConferees', { meetingId: this.meetingId })
        .then(function(response) {
          const result = response.data;
          console.log('getOngoingConferees:', result);
          if (result && result.code == config.successCode) {
            const _onlineUsers = result.data;
            _onlineUsers.forEach((item, index) => {
              item.volume = 0;
            });
            that.onlineUsers = _onlineUsers;
          } else {
            console.log(
              'getOngoingConferees接口失败：',
              result.code,
              result.message
            );
          }
        })
        .catch(function(err) {
          console.error('请求getOngoingConferees接口错误', err);
        });
    },
    async getConferee(confereeId, callback) {
      const response = await api.post('/api/meeting/getConferee', {
        confereeId: confereeId
      });
      const result = response.data;
      // console.log(confereeId, 'getConferee:', result);
      if (result && result.code == config.successCode) {
        callback && callback(result.data);
      } else {
        console.log('getConferee接口失败：', result.code, result.message);
      }
    },
    // 上报会议室中人员的状态
    async updateUserState(confereeId, state) {
      await api.post('/api/meeting/updateConnecting', {
        confereeId: confereeId,
        connecting: state
      });
    },
    // 更新麦状态
    async updateMicStatus(confereeId, micMute) {
      await api.post('/api/meeting/updateMicMute', {
        confereeId: confereeId,
        micMute: micMute
      });
    },
    // 更新摄像头状态
    async updateCameraState(confereeId, cameraState) {
      await api.post('/api/meeting/updateCameraState', {
        confereeId: confereeId,
        cameraState: cameraState
      });
    },
    // 主持人踢人
    delForMeeting(uid) {
      if (parseInt(this.confereeId) === parseInt(uid)) {
        console.log('您被主持人移除出会议室');
        this.showMytips = true;
        this.mytipsContent = '您被主持人移除出会议室';
        this.leaveChat();
        setTimeout(() => {
          this.toLogin();
        }, 2000);
      }
    },
    // 主持人开关（用户）麦
    muteForMeeting({ uid, isMute }) {
      if (parseInt(this.confereeId) === parseInt(uid)) {
        if (isMute) {
          console.log('您已被主持人禁麦');
          this.isCloseMic = false;
          this.handleVoice(false); // 先做麦克状态改变动作，再标记解除状态
          this.isCanChangeMic = false;
        } else {
          console.log('您已被主持人解除禁麦');
          this.isCanChangeMic = true; // 先标记解除状态，然后再做麦克状态改变动作
          this.isCloseMic = true;
          this.handleVoice(false);
        }
      }
    },
    handleVoice(isLocalOp) {
      if (!this.isCanChangeMic) {
        console.log('您已被管理员静麦，不能操作！');
        return;
      }
      if (this.isCloseMic) {
        this.voiceSrc = voiceOpen;
        rtc && rtc.enableAudio();
        this.isCloseMic = false;
        this.updateMicStatus(this.confereeId, 0);
      } else {
        this.voiceSrc = voiceClose;
        rtc && rtc.disableAudio();
        this.isCloseMic = true;
        this.updateMicStatus(this.confereeId, 1);
      }
      const that = this;
      this.media.forEach((item, index) => {
        if (item.uid == that.confereeId) {
          that.media[index].isMuteAudio = that.isCloseMic;
        }
      });
      this.onlineUsers &&
        this.onlineUsers.forEach((item, index) => {
          if (item.confereeId == that.confereeId) {
            that.onlineUsers[index].micMute = that.isCloseMic ? 1 : 0;
          }
        });
      if (isLocalOp) {
        //  本地操作时，发送socket, 兼容小程序api
        const chat = store.get('main.chat');
        const sendData = {
          EVENT: 'muteForMeeting1',
          version: '1.0',
          data: {
            uid: this.confereeId,
            meetingId: this.meetingId,
            isMute: this.isCloseMic
          },
          tip: '参会人员本地麦克风开关状态',
          emitMode: 0
        };
        chat && chat.sendSocketMessage(sendData, 'customMessage');
      }
    },
    handleCamera() {
      if (this.isCloseCam) {
        this.cameraSrc = cameraOpen;
        rtc && rtc.enableVideo();
        this.isCloseCam = false;
        this.updateCameraState(this.confereeId, 1);
      } else {
        this.cameraSrc = cameraClose;
        rtc && rtc.disableVideo();
        this.isCloseCam = true;
        this.updateCameraState(this.confereeId, 0);
      }
      const that = this;
      this.media.forEach((item, index) => {
        if (item.uid == that.confereeId) {
          that.media[index].isMuteVideo = that.isCloseCam;
        }
      });
    },
    handleLarge() {
      const that = this;
      const $ppth5Content = this.$refs.ppth5Content;
      if (!this.isScreenLarge) {
        this.fullScreen();
        this.screenSrc = ensmall;
        this.toggleHeadAndFoot(false);
        this.handleLarge.pptStyle = $ppth5Content.getAttribute('style');
        $ppth5Content.removeAttribute('style');
      } else {
        this.toggleHeadAndFoot(true);
        clearTimeout(this.mouseMove.timeout);
        const pptStyle = this.handleLarge.pptStyle;
        if (pptStyle) $ppth5Content.setAttribute('style', pptStyle);
        try {
          this.exitScreen();
          this.screenSrc = enlarge;
          // clearInterval(this.mouseMoveTimer);
        } catch (err) {
          console.error(err);
        }
      }
      this.isScreenLarge = !this.isScreenLarge;
      setTimeout(() => {
        let media = that.media || [];
        media = that.syncLayout(media);
        that.calcMinWidth(media.length);
        that.refreshMedia(media);
      }, 100);
      setTimeout(() => {
        that.customRender();
      }, 200);
    },
    // 全屏
    fullScreen() {
      const el = document.documentElement;
      const rfs =
        el.requestFullScreen ||
        el.webkitRequestFullScreen ||
        el.mozRequestFullScreen ||
        el.msRequestFullscreen;
      if (typeof rfs != 'undefined' && rfs) {
        rfs.call(el);
      }
    },
    // 退出全屏
    exitScreen() {
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      } catch (err) {
        console.error(err);
      }
    },
    leaveChat() {
      try {
        rtc && rtc.leave(); // 退出频道
        disconnectSocket(); // 断开socket
      } catch (err) {
        console.error('会议室退出频道和断开socket失败', err);
      }
    },
    async getDevices() {
      const microphoneId = storage.read('microphoneId');
      const cameraId = storage.read('cameraId');
      const devices = await RTC.getDevices();
      for (let i = 0; i !== devices.length; ++i) {
        const device = devices[i];
        const option = document.createElement('option');
        option.value = device.deviceId;
        if (
          microphoneId &&
          cameraId &&
          (device.deviceId == microphoneId || device.deviceId == cameraId)
        ) {
          option.selected = 'selected';
        }
        if (device.kind === 'audioinput') {
          option.text = device.label || 'microphone ' + (i + 1);
          this.$refs.microphoneSel.appendChild(option);
        } else if (device.kind === 'videoinput') {
          option.text = device.label || 'camera ' + (i + 1);
          this.$refs.cameraSel.appendChild(option);
        }
      }
    },
    setDevices() {
      storage.save('microphoneId', this.$refs.microphoneSel.value);
      storage.save('cameraId', this.$refs.cameraSel.value);
      console.log(
        this.$refs.cameraSel.value,
        this.$refs.microphoneSel.value,
        '设置设备成功'
      );
    },
    toLogin() {
      window.location.assign('/'); // 退回加入会议页面
    },
    toLeaveMeeting() {
      this.showLeaveMeetingDialog = true;
    },
    cancelLeaveMeeting() {
      this.showLeaveMeetingDialog = false;
    },
    getJoinTime() {
      const beginDate = this.meetingDetail.beginDate;
      const date = new Date();
      const y = date.getFullYear();
      const bt_s = y + '/' + beginDate.replace('月', '/').replace('日', '') + ':00';
      const bt = new Date(bt_s);
      const offsetTime = parseInt((date.getTime() - bt.getTime()) / 1000);
      let time = '';
      if (offsetTime >= 60) {
        const m = parseInt(offsetTime / 60);
        if (m >= 10) {
          const s = offsetTime - m * 60;
          if (s < 10) {
            time = m + ':0' + s;
          } else {
            time = m + ':' + s;
          }
        } else {
          const s = offsetTime - m * 60;
          if (s < 10) {
            time = '0' + m + ':0' + s;
          } else {
            time = '0' + m + ':' + s;
          }
        }
      } else {
        if (offsetTime < 10) {
          time = '00:0' + parseInt(offsetTime);
        } else {
          time = '00:' + parseInt(offsetTime);
        }
      }
      this.joinTime = time;
    },
    getHeight() {
      const height =
        window.screen.height ||
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight;
      console.log('this client height is:', height);
      return height;
    },
    mouseMove() {
      // this.lastMouseMoveSec = new Date().getTime() / 1000;
      if (this.isScreenLarge) {
        clearTimeout(this.mouseMove.timeout);
        this.toggleHeadAndFoot(true);
        this.mouseMove.timeout = setTimeout(() => {
          this.toggleHeadAndFoot(false);
        }, 2000);
      }
    },
    toggleHeadAndFoot(status) {
      if (!status) {
        //this.$refs.head.style.display = 'none';
        //this.$refs.setting.style.display = 'none';
        this.$refs.warningTip.style.top = '0';
        
      } else {
        this.$refs.head.style.display = 'flex';
        this.$refs.setting.style.display = 'flex';
        this.$refs.warningTip.style.top = '65px';
      }
    }
  },
  computed: {
    formatRoomNo: function() {
      if (!this.meetingDetail) return '';
      const roomno = this.meetingDetail.roomNo + '';
      return roomno.substring(0, 3) + ' ' + roomno.substring(3);
    },
    roomLink: function() {
      let enterpriseId = storage.read("enterpriseId");
      if (enterpriseId) {
        return 'https://mt.polyv.net/login?e=' + enterpriseId + '&m=' + this.meetingDetail.meetingId;
      } else {
        return 'https://mt.polyv.net/login?m=' + this.meetingDetail.meetingId;
      }
    }
  },
  beforeDestroy() {
    this.leaveChat();
  }
};

function getPPTCtrl() {
  if (pptCtrl) return Promise.resolve(pptCtrl);
  return new Promise(resolve => {
    const interval = setInterval(() => {
      if (pptCtrl) {
        clearInterval(interval);
        resolve(pptCtrl);
      }
    }, 500);
  });
}
</script>

<style lang="scss" scoped>
video {
  position: relative;
}

.videoMode {
  background-color: #353535;
  min-height: 720px;
  position: relative;
  height: 100%;

  &.hidden-y {
    overflow-y: hidden;
  }

  .warningTip {
    background-color: rgba(255, 91, 91, 1);
    width: 100%;
    height: 28px;
    position: absolute;
    top: 65px;
    left: 0;
    z-index: 99999999999999;
    color: #fff;
    text-align: center;
    padding-top: 12px;
  }

  .head {
    background-color: #fff;
    height: 65px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &.full-head {
      position: absolute;
      top: 0;
      z-index: 10;
      background-color: rgba(0, 0, 0, 0.8);
      width: 100%;
    }

    .head-left {
      margin-left: 41px;
      display: flex;

      .logo {
        width: 41px;
        height: 41px;
      }

      .theme {
        font-size: 18px;
        line-height: 41px;
        margin-left: 8px;

        .text {
          font-size: 14px;
        }

        &.white {
          color: #fff;
        }
      }
    }

    .head-right {
      display: flex;
      align-items: center;
      margin-right: 38px;

      .signal {
        display: flex;
        align-items: center;

        .atten {
          width: 15px;
          height: 15px;
        }

        .text {
          margin-left: 4px;
          margin-right: 12px;
          font-size: 16px;
          color: #ff5b5b;
        }

        img {
          width: 27px;
          height: 27px;
        }
      }

      .send {
        width: 27px;
        height: 65px;
        margin-left: 24px;
        position: relative;

        .send-icon {
          width: 27px;
          height: 27px;
          background-image: url(../../assets/img/btn-send.png);
          background-size: cover;
          cursor: pointer;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
        }

        .send-out {
          position: absolute;
          top: 65px;
          right: -20px;
          width: 312px;
          height: 272px;
          background: rgba(252, 252, 252, 1);
          z-index: 999;
          display: none;
        }

        .send-drop-down {
          background-color: #fff;
          padding: 25px 25px 0 25px;

          .send-text {
            color: #888888;
            font-size: 14px;
          }

          .send-btn {
            width: 42px;
            height: 23px;
            border: 0;
            border: 1px solid #0368e6;
            border-radius: 4px;
            color: #0368e6;
            font-size: 12px;
            cursor: pointer;
          }

          .item {
            color: #000;
            font-size: 18px;
            line-height: 35px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 14px;

            .address {
              color: #0066e6;
              font-size: 14px;
            }

            .item-left {
              width: 234px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
          }

          .code {
            img {
              width: 64px;
              height: 64px;
              margin-top: 16px;
            }
          }

          .toast {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80px;
            height: 23px;
            background-color: #111;
            opacity: 0.7;
            border-radius: 4px;
            font-size: 14px;
            color: #fff;
            text-align: center;
            padding-top: 9px;
          }
        }
      }

      .send:hover .send-out {
        display: block;
      }

      .head-setting {
        width: 27px;
        height: 65px;
        margin-left: 24px;
        position: relative;

        .setting-icon {
          width: 27px;
          height: 27px;
          background-image: url(../../assets/img/btn-setting.png);
          background-size: cover;
          cursor: pointer;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
        }

        .drop-out {
          position: absolute;
          top: 65px;
          right: -20px;
          width: 377px;
          height: 216px;
          z-index: 999;
          display: none;
        }

        .setting-drop-down {
          width: 377px;
          height: 216px;
          background-color: #fcfcfc;
          display: flex;
          align-items: center;

          .drop-photo {
            width: 112px;
            height: 168px;
            margin-left: 25px;
          }

          .drop-volume {
            height: 170px;
            width: 13px;
            margin: 0 28px 0 16px;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            cursor: pointer;

            .spot {
              width: 12px;
              height: 7px;
              background-color: #f1f1f1;
              margin-top: 6px;
            }

            .bg-blue {
              background-color: #9fcaff;
            }
          }

          .drop-operate {
            width: 162px;

            .text {
              font-size: 18px;
              color: #000;
              line-height: 18px;
            }

            .video-switch {
              margin-top: 25px;
              width: 162px;
              height: 31px;
              border: solid 1px #f1f1f1;
              border-radius: 4px;
              color: #b2b2b2;
              line-height: 31px;
            }

            .sel {
              width: 162px;
              height: 31px;
              margin-top: 17px;
              border-radius: 4px;
            }

            .btn-operate {
              font-size: 16px;
              margin-top: 17px;
              width: 162px;
              height: 31px;
              color: #0e6ee7;
              border: 1px solid #0e6ee7;
              border-radius: 4px;
              cursor: pointer;
            }
          }
        }
      }

      .head-setting:hover .drop-out {
        display: block;
      }

      .user-name {
        display: flex;
        align-items: center;
        margin-left: 27px;

        .icon {
          width: 33px;
          height: 33px;
          background-color: #3183e9;
          border-radius: 50%;
          color: #fff;
          line-height: 33px;
          text-align: center;
          font-size: 12px;
          overflow: hidden;
          height: 33px;
        }

        .name {
          margin-left: 8px;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }

  .videos-box {
    display: inline-block;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    min-height: 618px;

    &.full {
      height: 100%;

      .host {
        width: calc(100vh * (186 / 279));
        height: calc(100vh);

        .host-setting {
          max-width: calc(100vh * (186 / 279));
        }
      }

      .item {
        .member {
          width: calc(50vh * (186 / 279));
          height: calc(50vh);

          .member-name {
            max-width: calc(50vh * (186 / 279));
          }
        }
      }
    }
  }

  .videos {
    display: flex;
    justify-content: center;
    position: relative;
    margin: 0 auto;

    .host {
      width: 372px;
      height: 558px;
      position: relative;

      .p-camera-box {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: #222;
        z-index: 9;

        .p-innrer {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          height: 81px;
        }
      }

      .no-pic {
        width: 55px;
        height: 48px;
        margin-left: 15px;

        &.no-pic-center {
          margin-left: 15px;
        }
      }

      .tipTxt {
        margin-top: 16px;
        line-height: 14px;
        font-size: 14px;
        color: #818181;

        .tipTxt-center {
          text-align: center;
        }
      }

      .voiceinfo {
        position: absolute;
        right: 13px;
        top: 13px;
        width: 33px;
        height: 33px;
        z-index: 50;
      }

      .host-setting {
        position: absolute;
        left: 0;
        bottom: 0;
        max-width: 372px;
        height: 34px;
        background-color: #000;
        opacity: 0.8;
        display: flex;
        align-items: center;
        z-index: 10;
        overflow: hidden;
        box-sizing: border-box;
        padding: 0 8px;

        img {
          width: 16px;
          height: 20px;
          margin-right: 8px;
        }

        .host-name {
          flex: 1;
          color: #fff;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .item {
      position: relative;

      &.item-width {
        top: -12px;
      }

      .member {
        position: absolute;
        width: 186px;
        height: 279px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: #222222;

        .photo {
          width: 100%;
          height: 100%;
        }

        .p-camera-box {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: #222;
          z-index: 9;

          .p-innrer {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            height: 81px;
          }
        }

        .no-pic {
          width: 55px;
          height: 48px;
          z-index: 50;

          &.no-pic-center {
            margin-left: 15px;
          }
        }

        .tipTxt {
          margin-top: 16px;
          line-height: 14px;
          font-size: 14px;
          color: #818181;

          .tipTxt-center {
            text-align: center;
          }
        }

        .voiceinfo {
          position: absolute;
          right: 13px;
          top: 13px;
          width: 33px;
          height: 33px;
          z-index: 50;
        }

        .member-name {
          position: absolute;
          bottom: 0;
          left: 0;
          max-width: 186px;
          height: 24px;
          background-color: #000;
          color: #fff;
          opacity: 0.8;
          text-align: center;
          z-index: 10;
          padding-top: 10px;
          .text {
            padding-left: 8px;
            padding-right: 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }

  .ppth5 {
    display: flex;
    justify-content: center;
    position: absolute;
    top: 65px;
    width: 100%;
    z-index: 9;

    &.full {
      top: 0;

      .whiteboard {
        height: calc(100vh);
        // width: calc(100vh * (372 / 558));
      }

      .left-name {
        display: none;
      }
    }

    .whiteboard {
      width: 100%;
      height: 100%;
      background: rgba(246, 246, 246, 1);
      margin: 0 auto;
      position: relative;
      top: 0;
      left: 0;
      display: block;
    }

    .left-name {
      width: 57px;
      height: 558px;
      position: absolute;
      right: 46px;
      top: 65px;

      .item-name {
        width: 57px;
        height: 57px;
        background-color: #3183e9;
        font-size: 20px;
        color: #fff;
        line-height: 57px;
        text-align: center;
        border-radius: 50%;
        margin-top: 14px;
        position: relative;
        overflow: hidden;
      }

      .prohibit::after {
        content: " ";
        display: block;
        background: url(../../assets/img/voice-close.png) center center;
        background-color: rgba(0, 0, 0, 0.6);
        border-radius: 50%;
        background-size: auto 100%;
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        opacity: 0.9;
      }

      .circle {
        box-shadow: 0px 0px 0px 8px #33537c;
      }
    }
  }

  .wbtoast {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
    background: rgba(17, 17, 17, 1);
    border-radius: 10px;
    opacity: 0.7;
    justify-content: center;
    align-items: center;
    text-align: center;
    z-index: 99;

    .img {
      margin-top: 26px;
      margin-left: 39px;
      margin-right: 39px;
      height: 42px;
      widows: 42px;
    }

    .text {
      height: 18px;
      font-size: 13px;
      margin-top: 18px;
      margin-bottom: 16px;
      font-weight: 400;
      color: rgba(255, 255, 255, 1);
      line-height: 18px;
    }
  }

  .setting {
    width: 358px;
    height: 50px;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 0);
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    z-index: 20;

    &.mouse {
      bottom: 0;
      left: 50%;
    }

    .setting-icon {
      width: 60px;
      height: 48px;
      cursor: pointer;
    }

    .line {
      width: 1px;
      height: 18px;
      border-right: 1px solid #2e2e2e;
      margin-right: 16px;
    }

    .time {
      color: #fff;
      width: 51px;
      height: 21px;
      font-size: 16px;
      line-height: 21px;
      padding-top: 2px;
    }

    .btn-out {
      border: 0;
      width: 80px;
      height: 28px;
      background: rgba(255, 91, 91, 1);
      border-radius: 4px;
      font-size: 14px;
      font-family: PingFangSC-Regular;
      font-weight: 400;
      color: rgba(255, 255, 255, 1);
      line-height: 20px;
      margin-left: 16px;
      color: #fff;
      cursor: pointer;
    }
  }

  .dialog-cover {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #000;
    opacity: 0.5;
    z-index: 999998;
  }

  .dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 368px;
    height: 288px;
    background-color: #fff;
    border-radius: 8px;
    z-index: 999999;

    .dialog-title {
      font-size: 22px;
      margin-top: 32px;
      margin-bottom: 22px;
      text-align: center;
    }

    .dialog-item {
      height: 20px;
      line-height: 20px;
      font-size: 16px;
      margin-bottom: 26px;

      .item-left {
        width: 86px;
        float: left;
        margin-left: 88px;
        text-align: left;
        color: #919191;
      }

      .item-right {
        float: left;
        color: #000;
      }
    }

    .dialog-btn {
      margin: 0 32px 32px 32px;
      width: 304px;
      height: 48px;
      border-radius: 4px;
      background-color: #0066e6;
      color: #fff;
      font-size: 18px;
      cursor: pointer;
    }
  }
}
</style>
