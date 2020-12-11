<template>
  <div class="p-record">
    <div class="title">账号详情</div>
    <div class="content">
      <div class="list">
        <div class="txt">用户邮箱：</div>
        <div class="iofo">{{userinfo.email}}</div>
      </div>
      <div class="list">
        <div class="txt">userid :</div>
        <div class="iofo">{{userinfo.userId}}</div>
      </div>
      <div class="list">
        <div class="txt">注册日期：</div>
        <div class="iofo">{{createTimeFormatDate}}</div>
      </div>
      <div class="list">
        <div class="txt">手机号码：</div>
        <div class="iofo">{{userinfo.mobile}}</div>
      </div>
      <div class="list">
        <div class="txt">姓名：</div>
        <div class="iofo">
          <input type="text" name="name" v-model="userinfo.name">
        </div>
      </div>
      <div class="list">
        <div class="txt">QQ：</div>
        <div class="iofo">
          <input type="text" name="qq" v-model="userinfo.qq" />
        </div>
      </div>
      <div class="list">
        <div class="txt">公司名称：</div>
        <div class="iofo">
          <input type="text" name="company" v-model="userinfo.company">
        </div>
      </div>
      <div class="list" v-show="false">
        <div class="txt">机构网址：</div>
        <div class="iofo">
          <input type="text">
        </div>
      </div>
    </div>
    <div class="confirm">
      <button @click="setUserInfo">保存</button>
    </div>
    <loading :display="loadingDisplay" :useImage="true" :fullscreen="true"></loading>
  </div>
</template>

<script>
import Loading from "@/components/loading/loading";
import api from '@/assets/common/api/api.js';
import * as utils from '@/assets/common/utils/utils.js';
import config from '@/assets/common/config.js';

export default {
  data() {
    return {
      userinfo: {},
      loadingDisplay: false
    };
  },
  components: {
    Loading
  },
  methods: {
    getUserInfo() {
      let that = this;
      api.post('/api/user/getUserInfo').then(function (response) {
        let result = response.data;
        console.log(result);
        if (result && result.code == config.successCode) {
          that.userinfo = response.data.data;
        } else {
          that.$notify.errorMessage(result.message, 4000);
        }
      }).catch(function (error) {
        console.log(error);
      });
    },
    setUserInfo() {
      let that = this;
      let requestData = {
        name: this.userinfo.name,
        company: this.userinfo.company,
        qq: this.userinfo.qq
      };
      console.log(requestData);
      this.loadingDisplay = true;
      api.post('/api/user/setUserInfo', requestData).then(function (response) {
        let result = response.data;
        console.log(result);
        that.loadingDisplay = false;
        if (result && result.code == 200000) {
          that.$notify.successMessage("账号信息保存成功", 6000);
        } else {
          that.$notify.errorMessage(result.message, 4000);
        }
      }).catch(function (error) {
        that.loadingDisplay = false;
        console.log(error);
      });
    }
  },
  mounted() {
    this.getUserInfo();
  },
  computed: {
    createTimeFormatDate() {
      if(this.userinfo.createdTime) {
        let millsTime = parseInt(this.userinfo.createdTime);
        //console.log(millsTime);
        return utils.formatDate(millsTime);
      }
      return "";
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
        color: rgba(0, 0, 0, 0.6470588235);
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
