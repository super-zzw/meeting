<template>
  <div class="p-customization">
    <div class="title">企业定制</div>
    <div class="content">
      <div class="list clearfix">
        <div class="txt fl">logo&nbsp;:</div>
        <div class="box ml60 fl">
          <image-uploader name="logo" @uploadChanged="imageUploadChanged" />
        </div>
        <div class="box ml16 fl">
          <div class="logo">
            <img v-if="enterprise.logoUrl" :src="enterprise.logoUrl" alt="logo" />
          </div>
        </div>
      </div>
      <div class="list clearfix">
        <div class="txt fl">公司名称&nbsp;:</div>
        <input class=" ml60 input fl" type="text" maxlength="50" placeholder="请输入" v-model="enterprise.name"/>
      </div>
      <div class="list clearfix">
        <div class="txt fl">导航栏色调&nbsp;:</div>
        <select class="ml60 fl" v-model="enterprise.navbarColor">
          <option value="#ffffff">白</option>
          <option value="#2828ff">蓝</option>
          <option value="#f9f900">黄</option>
          <option value="#009100">绿</option>
          <option value="#6600ff">紫</option>
        </select>
      </div>
      <div class="list clearfix">
        <div class="txt fl">web页面背景&nbsp;:</div>
        <div class="box ml60 fl">
          <image-uploader name="bg" @uploadChanged="imageUploadChanged" />
        </div>
        <div class="picture ml16 fl">
          <div class="bg">
            <img v-if="enterprise.webBgImgUrl" :src="enterprise.webBgImgUrl" alt="背景图片" />
          </div>
        </div>
      </div>
    </div>
    <div class="footer">
      <button class="save" @click="setDetail">保&nbsp;存</button>
    </div>
    <loading :display="loadingDisplay" :useImage="true" :fullscreen="true"></loading>
  </div>
</template>

<script>
import Loading from "@/components/loading/loading";
import ImageUploader from './image-uploader';
import api from '@/assets/common/api/api.js';

export default {
  components: {
    ImageUploader,
    Loading,
  },
  data() {
    return {
      enterprise: {},
      loadingDisplay: false
    };
  },
  methods: {
    imageUploadChanged(data) {
      const { status, msg, name, imgSrc, uploadImgUrl } = data;
      switch (status) {
        case 'start':
          this.loadingDisplay = true;
          if (name === 'logo') {
            this.enterprise.logoUrl = imgSrc;
          } else {
            this.enterprise.webBgImgUrl = imgSrc;
          }
          break;
        case 'upLoadingSuccess': // 上传成功
          if (name === 'logo') {
            this.enterprise.logoUrl = uploadImgUrl;
            this.$notify.successMessage('logo上传成功');
          } else {
            this.enterprise.webBgImgUrl = uploadImgUrl;
            this.$notify.successMessage(name + 'web页面背景上传成功');
          }
          this.loadingDisplay = false;
          break;
        case 'fail': // 文件错误
        case 'forbid': // 图片涉黄
        case 'upLoadingFail': // 上传失败
          this.loadingDisplay = false;
          this.$notify.warnMessage(name + msg);
          break;
        default:
          break;
      }
    },
    getDetail() {
      let that = this;
      api.post('/api/enterprise/getDetail').then(function (response) {
        let result = response.data;
        console.log(result);
        if (result && result.code == 200000) {
          that.enterprise = response.data.data;
        } else {
          that.$notify.errorMessage(result.message, 4000);
        }
      }).catch(function (error) {
        console.log(error);
      });
    },
    setDetail() {
      if (!this.enterprise.name) {
        that.$notify.warnMessage("企业名称不能为空", 2000);
        return;
      }
      if (this.enterprise.name.length > 50) {
        that.$notify.warnMessage("企业名称不能超过50个字符", 2000);
        return;
      }
      let that = this;
      let requestData = {
        logoUrl: this.enterprise.logoUrl,
        name: this.enterprise.name,
        navbarColor: this.enterprise.navbarColor,
        webBgImgUrl: this.enterprise.webBgImgUrl
      };
      console.log(requestData);
      this.loadingDisplay = true;
      api.post('/api/enterprise/setDetail', requestData).then(function (response) {
        let result = response.data;
        console.log(result);
        that.loadingDisplay = false;
        if (result && result.code == 200000) {
          that.$notify.successMessage("企业定制保存成功", 2000);
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
    this.getDetail();
  }
};
</script>

<style lang="scss" scoped>
.fl {
  float: left;
}
.fr {
  float: right;
}
.clearfix:after {
  content: ".";
  display: block;
  height: 0;
  visibility: hidden;
  clear: both;
}
.clearfix {
  *zoom: 1;
}
.p-customization {
  background-color: #fff;
  padding: 16px 20px 40px;
  font-size: 14px;
  color: #000;
}
.title {
  font-weight: 700;
  font-size: 20px;
  color: rgb(0, 0, 0);
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
}
.list {
  margin-top: 30px;
  .ml60 {
    margin-left: 60px;
  }
  .ml16 {
    margin-left: 16px;
  }
  .txt {
    text-align: right;
    width: 102px;
    line-height: 32px;
  }
  .box {
    width: 104px;
    height: 104px;
    text-align: center;
    background-image: url("../../assets/images/customization/box.png");
    position: relative;
    input{
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0;
      cursor: pointer;
      width: 100%;
      height: 100%;
    }
    .add {
      display: inline-block;
      width: 24px;
      height: 24px;
      background-image: url("../../assets/images/customization/add.png");
      background-size: cover;
      margin-top: 36px;
    }
    p {
      margin-top: 14px;
      color: #333;
    }
  }
  .input {
    width: 440px;
    height: 32px;
    border: rgba(217, 217, 217, 1) solid 1px;
    border-radius: 4px;
    text-indent: 1em;
  }
  select {
    width: 182px;
    height: 30px;
  }
  .logo {
    img{
      width: 88px;
      height: 88px;
      margin: 8px;
    }
  }
  .picture {
    img {
      width: 338px;
      height: 206px;
      border: rgba(217, 217, 217, 1) solid 1px;
    }
  }
}
.footer {
  margin-top: 120px;
  .save {
    width: 120px;
    height: 40px;
    margin-left: 50%;
    line-height: 40px;
    text-align: center;
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    border-radius: 4px;
    background-color: rgba(24, 144, 255, 1);
    border: 0;
  }
}
</style>
