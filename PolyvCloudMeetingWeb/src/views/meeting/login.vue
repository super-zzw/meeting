<template>
  <div class="login" ref="login">
    <div class="content">
      <h3 class="form-title">保利威云会议</h3>
      <div class="form-group">
        <input
          type="text"
          v-model="roomNo"
          maxlength="6"
          @keyup="checkInputPwd"
          placeholder="请填写房间号"
          autofocus
        >
      </div>
      <div class="form-group">
        <input
          type="text"
          v-model="nickName"
          maxlength="20"
          placeholder="请填写参会称呼，例如Sandy"
          @keyup="handleNickName"
        >
      </div>
      <div class="form-group" v-show="isInputPwd">
        <input
          type="text"
          v-model="passWord"
          maxlength="6"
          placeholder="请填写房间密码"
          @keyup="handlePassWord"
          v-if="pwdShow"
        >
        <input
          type="password"
          v-model="passWord"
          maxlength="6"
          placeholder="请填写房间密码"
          @keyup="handlePassWord"
          v-else
        >
        <img :src="pwdImg" @click="showPwd">
      </div>
      <!-- 输入框提示 -->
      <div class="form-tip" v-show="subtip">
        <span></span>
        {{subMsg}}
      </div>
      <div class="form-actions">
        <button type="button" class="btn" @click="joinMeeting">立即加入</button>
      </div>
    </div>
    <!-- 提示对话框 -->
    <mytips :content="tipMsg" v-show="showtip" @hide="hideTip"></mytips>
    <!-- 确认对话框 -->
    <mydialog
      content="您有会议还未结束，需要继续会议么？"
      confirmTitle="结束会议"
      cancelTitle="继续会议"
      v-show="showGoingTip"
      @confirm="leaveMeeting"
      @cancel="goingMeeting"
    ></mydialog>
  </div>
</template>

<script>
import hidePwdImg from "../../assets/img/btn-eye-closed1.png";
import showPwdImg from "../../assets/img/btn-eye-closed.png";
import Mytips from "@/components/mytips/mytips";
import Mydialog from "@/components/mydialog/mydialog";
import config from "@/assets/common/config.js";
import api from "@/assets/common/api/api.js";
import * as utils from "@/assets/common/utils/utils.js";
import RTC from "@/assets/common/rtc/rtc.js";
import * as storage from "@/assets/common/utils/storage.js";

export default {
  data() {
    return {
      showtip: false,
      tipMsg: "",
      subtip: false,
      subMsg: "",
      isInputPwd: false,
      pwdImg: hidePwdImg,
      pwdShow: false,
      roomNo: "",
      nickName: "",
      passWord: "",
      showGoingTip: false,
      meetingDetail: {},
      microphoneId: storage.read("microphoneId"),
      cameraId: storage.read("cameraId"),
      meetingId: null,
      enterpriseId: null
    };
  },
  components: {
    Mytips,
    Mydialog
  },
  async mounted() {
    this.enterpriseId = this.$route.query.e;
    this.meetingId = this.$route.query.m;
    console.log("From浏览器的enterpriseId：", this.enterpriseId, "meetingId：", this.meetingId);
    if (this.enterpriseId) {
      await this.getEnterprise();
      storage.save("enterpriseId", this.enterpriseId);
    }
    if (this.meetingId) {
      await this.getMeetingDetail();
    }
    if (!this.microphoneId) {
      let devices = await RTC.getDevices();
      for (var i = 0; i !== devices.length; ++i) {
        let device = devices[i];
        if (device.kind === "audioinput") {
          // 获取麦克风设备
          if (!this.microphoneId) {
            this.microphoneId = device.deviceId;
          }
        } else if (device.kind === "videoinput") {
          // 获取摄像头设备
          if (!this.cameraId) {
            this.cameraId = device.deviceId;
          }
        }
      }
      storage.saveMulti([
        { key: "microphoneId", value: this.microphoneId },
        { key: "cameraId", value: this.cameraId }
      ]);
    }
    let sessionId = utils.getSessionId();
    if (sessionId) {
      await this.getOngoinMeeting();
    }
  },
  methods: {
    getEnterprise() {
      let that = this;
      return api
        .post("/api/user/getEnterpriseByWeb?enterpriseId=" + this.enterpriseId, {})
        .then(function(response) {
          let result = response.data;
          if (result && result.code == config.successCode) {
            console.log(result.data)
            if (result.data && result.data.webBgImgUrl) {
              that.$refs.login.style.backgroundImage = 'url('+result.data.webBgImgUrl+')';
            }
          } else {
            console.log(
              "getEnterpriseByWeb接口失败：",
              result.code,
              result.message
            );
          }
        })
        .catch(function(error) {
          console.error(error);
        });
    },
    leaveMeeting() {
      if (this.meetingDetail.meetingId) {
        let that = this;
        const options = { meetingId: this.meetingDetail.meetingId };
        api
          .post("/api/meeting/leaveMeeting", options)
          .then(function(response) {
            let result = response.data;
            // console.log('leaveMeeting:', result);
            if (result && result.code == config.successCode) {
              window.location.reload(); //刷新本页面
            } else {
              that.showTip(result.message);
            }
          })
          .catch(function(error) {
            console.error(error);
          });
      } else {
        window.location.reload(); //刷新本页面
      }
    },
    getOngoinMeeting() {
      let that = this;
      return api
        .post("/api/meeting/getOngoingMeeting", {})
        .then(function(response) {
          let result = response.data;
          // console.log('getOngoingMeeting:', result);
          if (result && result.code == config.successCode) {
            if (result.data) {
              that.meetingDetail = result.data;
              that.showGoingTip = true;
            }
          } else {
            that.subtip = true;
            that.subMsg = result.message;
          }
        })
        .catch(function(error) {
          console.error(error);
        });
    },
    getMeetingDetail() {
      const that = this;
      return api
        .post("/api/meeting/appShareMeetingDetail", { meetingId: this.meetingId })
        .then(function(response) {
          const result = response.data;
          if (result && result.code == config.successCode) {
            that.roomNo = result.data.roomNo;
            if (result.data.passWord) {
              that.isInputPwd = true;
              that.passWord = result.data.passWord;
            }
          } else {
            console.log(
              "appShareMeetingDetail接口失败：",
              result.code,
              result.message
            );
          }
        })
        .catch(function(err) {
          console.error("请求appShareMeetingDetail接口错误", err);
        });
    },
    goingMeeting() {
      // 继续会议
      this.$router.replace({
        path: "video",
        query: {
          meetingId: this.meetingDetail.meetingId,
          confereeId: this.meetingDetail.confereeId,
          channelId: this.meetingDetail.channelId
        }
      });
    },
    handleNickName(e) {
      if (e.keyCode == 9) {
        return;
      }
      if (e.keyCode == 13) {
        this.joinMeeting();
      }
      if (e.target.value) {
        this.subtip = false;
      } else {
        this.subtip = true;
        this.subMsg = "请填写参会昵称";
      }
    },
    handlePassWord(e) {
      if (e.keyCode == 9) {
        return;
      }
      if (e.keyCode == 13) {
        this.joinMeeting();
      }
      if (e.target.value) {
        this.subtip = false;
      } else {
        this.subtip = true;
        this.subMsg = "请填写房间密码";
      }
    },
    checkInputPwd() {
      if (this.roomNo && (this.roomNo.length != 6 || isNaN(this.roomNo))) {
        this.subtip = true;
        this.subMsg = "请填写正确的房间号";
        this.isInputPwd = false;
        return;
      }
      if (this.roomNo) {
        let that = this;
        const options = { roomNo: this.roomNo };
        api
          .post("/api/meeting/checkPassWord", options)
          .then(function(response) {
            let result = response.data;
            // console.log('checkPassWord:', result);
            if (result && result.code == config.successCode) {
              that.subtip = false;
              if (result.data.isPassWord == 0) {
                that.isInputPwd = false;
              } else {
                that.isInputPwd = true;
              }
            } else {
              that.subtip = true;
              that.subMsg = result.message;
            }
          })
          .catch(function(error) {
            console.error(error);
          });
      }
    },
    joinMeeting() {
      if (!this.roomNo) {
        this.subtip = true;
        this.subMsg = "请填写会议房间号";
        return;
      }
      if (this.roomNo.length < 6) {
        this.subtip = true;
        this.subMsg = "请填写正确的会议房间号";
        return;
      }
      if (isNaN(this.roomNo)) {
        this.subtip = true;
        this.subMsg = "请填写正确的房间号";
        return;
      }
      if (!this.nickName) {
        this.subtip = true;
        this.subMsg = "请填写参会昵称";
        return;
      }
      if (this.isInputPwd && !this.passWord) {
        this.subtip = true;
        this.subMsg = "请填写房间密码";
        return;
      }
      if (!this.isInputPwd) {
        this.passWord = "";
      }
      const options = {
        udid: utils.getUdid(),
        roomNo: this.roomNo,
        nickName: this.nickName,
        passWord: this.passWord,
        sessionId: utils.getSessionId()
      };
      let that = this;
      api
        .post("/api/meeting/appJoinMeeting", options)
        .then(function(response) {
          let result = response.data;
          // console.log('appJoinMeeting', result);
          if (result && result.code == config.successCode) {
            utils.setSessionId(result.data.sessionId);
            //进入会议
            that.$router.replace({
              path: "video",
              query: {
                meetingId: result.data.meetingId,
                confereeId: result.data.confereeId,
                channelId: result.data.channelId
              }
            });
          } else {
            that.showTip(result.message); //错误提示
          }
        })
        .catch(function(error) {
          console.error(error);
        });
    },
    showTip(msg) {
      this.showtip = true;
      this.tipMsg = msg;
    },
    hideTip() {
      this.showtip = false;
    },
    showPwd() {
      if (!this.pwdShow) {
        this.pwdImg = showPwdImg;
        this.pwdShow = true;
      } else {
        this.pwdImg = hidePwdImg;
        this.pwdShow = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.login {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url(../../assets/img/bg.png) no-repeat;
  background-size: cover;

  .content {
    box-sizing: border-box;
    position: absolute;
    width: 432px;
    min-height: 376px;
    max-height: 448px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    border-radius: 10px;
    padding: 54px 64px 64px 64px;

    .form-title {
      text-align: center;
      font-size: 22px;
      font-weight: 600;
    }

    .form-group {
      border-bottom: 1px solid #e5e5e5;
      margin-top: 24px;

      input {
        width: 90%;
        border: 0; // 去除未选中状态边框
        outline: none; // 去除选中状态边框
        background-color: rgba(0, 0, 0, 0); // 透明背景
        line-height: 48px;
        font-size: 16px;
      }

      img {
        float: right;
        width: 24px;
        height: 24px;
        cursor: pointer;
        margin-top: 14px;
      }
    }

    .form-tip {
      position: absolute;
      left: 64px;
      bottom: 126px;
      line-height: 16px;
      color: red;

      span {
        float: left;
        width: 16px;
        height: 16px;
        background: url(../../assets/img/ic-atten.png) no-repeat;
        margin-right: 8px;
      }
    }

    .form-actions {
      margin-top: 50px;

      button {
        width: 304px;
        height: 48px;
        border: 0;
        background-color: #0066e6;
        color: #fff;
        border-radius: 4px;
        cursor: pointer;
        font-size: 18px;
      }
    }
  }
}
</style>