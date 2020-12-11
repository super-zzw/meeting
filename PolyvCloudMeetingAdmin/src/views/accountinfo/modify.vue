<template>
  <div class="p-modify">
    <div class="title">密码修改</div>
    <div class="content">
      <div class="list">
        <div class="txt">原密码：</div>
        <div class="iofo">
          <input type="text" placeholder="输入原密码" v-model="oldPasswd">
        </div>
      </div>
      <div class="list">
        <div class="txt">新密码：</div>
        <div class="iofo">
          <input type="text" placeholder="新的密码（5~16位）" v-model="passwd">
        </div>
      </div>
      <div class="list">
        <div class="txt">确认新密码：</div>
        <div class="iofo">
          <input type="text" placeholder="再次输入新密码" v-model="confirmPasswd">
        </div>
      </div>
    </div>
    <div class="confirm">
      <button @click="updatePasswd">保存</button>
    </div>
    <loading :display="loadingDisplay" :useImage="true" :fullscreen="true"></loading>
  </div>
</template>

<script>
import Loading from "@/components/loading/loading";
import api from '@/assets/common/api/api.js';
import config from '@/assets/common/config.js';

export default {
  components: {
    Loading
  },
  data() {
    return {
      oldPasswd: null,
      passwd: null,
      confirmPasswd: null,
      loadingDisplay: false
    };
  },
  methods: {
    updatePasswd() {
      let that = this;
      let requestData = {
        oldPasswd: this.oldPasswd,
        passwd: this.passwd,
        confirmPasswd: this.confirmPasswd
      };
      console.log(requestData);
      this.loadingDisplay = true;
      api.post('/api/user/updatePasswd', requestData).then(function (response) {
        let result = response.data;
        console.log(result);
        that.loadingDisplay = false;
        if (result && result.code == config.successCode) {
          that.$notify.successMessage("密码修改成功", 6000);
        } else {
          that.$notify.errorMessage(result.message, 4000);
        }
      }).catch(function (error) {
        that.loadingDisplay = false;
        console.log(error);
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.title {
  font-size: 16px;
  line-height: 40px;
  border-bottom: rgba(204, 204, 204, 0.2) 1px solid;
  padding-left: 6px;
}
.content {
  .list {
    color: rgba(0, 0, 0, 0.647058823529412);
    font-size: 14px;
    margin-top: 10px;
    margin-left: 150px;
    height: 32px;
    line-height: 32px;
    .txt {
      float: left;
      width: 84px;
      text-align: right;
    }
    .iofo {
      float: left;
      margin-left: 4px;
      input {
        width: 400px;
        height: 30px;
        color: rgba(0, 0, 0, 0.65);
        border: rgba(217, 217, 217, 1) solid 1px;
        border-radius: 4px;
        text-indent: 1em;
      }
    }
  }
  .confirm {
    display: flex;
    justify-content: center;
    button {
      margin-top: 100px;
      width: 230px;
      height: 40px;
      border: 0;
      border-radius: 4px;
      background-color: rgba(24, 144, 255, 1);
      font-size: 16px;
      color: #fff;
    }
  }
}
</style>
