
<template>
  <div class="p-account">
    <div class="title">账号管理</div>
    <div class="account_btn clearfix">
      <button class="btn_style fl del" @click="showBatchDeleteUserTip">批量删除</button>
      <button class="btn_style fr build" @click="showNewUserDialog">新建账号</button>
      <button class="btn_style fr import" @click="showBatchImportDailog">批量导入账号</button>
    </div>

    <loading v-if="isLoading" />
    
    <list v-else
      :tableData="tableData" :currentPageNum="pageNum" :totalPages="totalPages" 
      @selectUpdate="tableSelectUpldate" @dealTableItem="tableTapItem" @currentChange="currentChange" @limitChange="limitChange"/>

    <div v-show="batchDeleteUserTip || newUserDialog || editUserDialog || unbindWxappTip || deleteUserTip || batchImportDailog" class="dialog-cover"></div>

    <!-- 批量删除提示框 -->
    <div v-show="batchDeleteUserTip" class="tip">
      <div class="tip-text">确定删除所有选中用户？</div>
      <div class="tip-footer">
        <button class="confirm fl" @click="batchDeleteUser">确定删除</button>
        <button class="cancel fl" @click="hideBatchDeleteUserTip">取消删除</button>
      </div>
    </div>

    <!-- 新建账号对话框 -->
    <div v-show="newUserDialog" class="dialog">
      <div class="dialog-title">
        新建账号 <span class="dialog-close" @click="hideNewUserDialog">×</span>
      </div>
      <div class="dialog-content">
        <div class="item">
          <div class="txt fl">手机号&nbsp;:</div>
          <div class="fl">
            <input type="text" placeholder="请输入手机号码" v-model="mobile" maxlength="11" @keyup="hanlderMobile"/>
            <div class="tiptxt" v-show="newUserMobile">请输入手机号码</div>
          </div>
        </div>
        <div class="item">
          <div class="txt fl">名称&nbsp;:</div>
          <div class="fl">
            <input type="text" placeholder="请输入名称" v-model="nickName" maxlength="16" @keyup="hanlderNickName"/>
            <div class="tiptxt" v-show="newUserNickName">请输入名称</div>
          </div>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="btn_style fl confirm" @click="saveNewUser">提交</button>
        <button class="btn_style fl cancel" @click="hideNewUserDialog">取消</button>
      </div>
    </div>

    <!-- 编辑账号对话框 -->
    <div v-show="editUserDialog" class="dialog">
      <div class="dialog-title">
        编辑账号 <span class="dialog-close" @click="hideEditUserDialog">×</span>
      </div>
      <div class="dialog-content">
        <div class="item">
          <div class="txt fl">手机号&nbsp;:</div>
          <div class="fl">
            <input type="text" placeholder="请输入手机号码" v-model="editMobile" maxlength="11" @keyup="hanlderEditMobile"/>
            <div class="tiptxt" v-show="editUserMobile">请输入手机号码</div>
          </div>
        </div>
        <div class="item">
          <div class="txt fl">名称&nbsp;:</div>
          <div class="fl">
            <input type="text" placeholder="请输入名称" v-model="editNickName" maxlength="16" @keyup="hanlderEditNickName"/>
            <div class="tiptxt" v-show="editUserNickName">请输入名称</div>
          </div>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="btn_style fl confirm" @click="saveUpdateUser">提交</button>
        <button class="btn_style fl cancel" @click="hideEditUserDialog">取消</button>
      </div>
    </div>

    <!-- 解除微信绑定提示框 -->
    <div v-show="unbindWxappTip" class="tip">
      <div class="tip-text">确定解除微信绑定？</div>
      <div class="tip-footer">
        <button class="confirm fl" @click="unbindWxapp">确定解除</button>
        <button class="cancel fl" @click="hideUnbindWxappTip">取消解除</button>
      </div>
    </div>

    <!-- 删除用户提示框 -->
    <div v-show="deleteUserTip" class="tip">
      <div class="tip-text">确定删除此用户？</div>
      <div class="tip-footer">
        <button class="confirm fl" @click="deleteUser">确定删除</button>
        <button class="cancel fl" @click="hideDeleteUserTip">取消删除</button>
      </div>
    </div>

    <!-- 批量导入对话框 -->
    <div v-show="batchImportDailog" class="import-dialog">
      <div class="dialog-title">批量导入 <span class="dialog-close" @click="hideBatchImportDailog">×</span></div>
      <div class="dialog-content">
        <div class="upload clearfix">
          <div class="file fl">
            <img src="../../assets/images/account/flie.png"/>
            <p class="tip-txt1">点击或将文件拖拽到这里上传，一次最多只能上传100条记录</p>
            <p class="tip-txt2">支持扩展名：.xls .xlsx</p>
          </div>
          <input name="excelFile" type="file" @change="change" :value="excelFileValue"
            accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
        </div>
        <div class="needle clearfix" v-show="showProcess">
          <img class="fl" src="../../assets/images/account/needle.png"/>
          <div class="process fl">
            <div class="file_name">{{fileName}} <span class="fr cdel" v-show="false">×</span></div>
            <div class="strip"><div class="strip-blue" :style="'width:'+ processWith"></div></div>
          </div>
        </div>
      </div>
      <div class="dialog-footer clearfix" style="margin-top:30px;">
        <a target="_blank" href="http://meeting.polyv.net/assets/accout.xlsx"><button class="btn_style fl confirm">下载模板</button></a>
        <button class="btn_style fl cancel" @click="confirmImport" >导入</button>
      </div>
    </div>

    <!-- 批量导入对话框中的提示框 -->
    <div v-show="batchImport_succ_tip" class="import-tip">
      <div class="import-title clearfix">
        <img class="fl" src="../../assets/images/account/yes.png" alt/>
        <div class="fl">导入成功</div>
      </div>
      <div class="import-content">本次成功导入{{importSuccCnt}}条记录，失败0条</div>
      <div class="import-footer">
        <button class="btn_style fr confirm" @click="hideBatchImportSuccTip">确认</button>
      </div>
    </div>

    <!-- 失败提示 -->
    <div v-show="batchImport_fail_tip" class="import-tip" style="width:380px; padding-bottom:10px; height:auto;">
      <div class="import-title clearfix">
        <img class="fl" src="../../assets/images/account/wrong.png" alt/>
        <div class="fl">导入异常</div>
      </div>
      <div class="import-content">
        本次成功导入{{importSuccCnt}}条记录，失败{{importFailCnt}}条
        失败记录：
        <p v-for="(item, index) in failData" :key="index">{{item}}</p>
      </div>
      <div class="import-footer">
        <button class="btn_style fr confirm" @click="hideBatchImportFailTip">确认</button>
      </div>
    </div>

    <div v-show="batchImport_succ_tip || batchImport_fail_tip" class="import-tip-cover"></div>
    <loading v-if="importLoading" />
  </div>
</template>

<script>
/* eslint-disable */
import api from '@/assets/common/api/api.js';
import Checkbox from "@/components/form/checkbox";
import LiveRadio from "@/components/form/radio";
import UrlInput from "@/components/form/url-input";
import Loading from '@/components/loading/loading';
import config from '@/assets/common/config';
import axios from 'axios';
import List from "./list";

export default {
  components: {
    Checkbox,
    LiveRadio,
    UrlInput,
    List,
    Loading
  },

  data() {
    return {
      currentOpItem : null,
      batchDeleteUserTip: false,
      newUserDialog: false,
      editUserDialog: false,
      unbindWxappTip: false,
      deleteUserTip: false,
      batchImportDailog: false,
      batchImport_succ_tip: false,
      batchImport_fail_tip: false,
      tableData: [],
      pageNum: 1,
      pageSize: 25,
      totalPages: 0,

      mobile: null,
      nickName: null,
      editMobile: null,
      editNickName: null,

      selectedIdList: [],

      fileName: null,
      showProcess: false,
      excelFile: null,
      excelFileValue: null,
      processWith: '0%',
      importSuccCnt: 0,
      importFailCnt: 0,
      failData: {},

      isLoading: false,
      importLoading: false,

      newUserMobile: false,
      newUserNickName: false,
      editUserMobile: false,
      editUserNickName: false
    };
  },

  mounted() {
    this.isLoading = true;
    this.getUserList().then(() => {
      this.isLoading = false;
    }).catch(() => {
      this.isLoading = false;
    });
  },

  methods: {
    hanlderMobile(e) {
      if (e.target.value) {
        this.newUserMobile = false;
      } else {
        this.newUserMobile = true;
      }
    },
    hanlderNickName(e) {
      if (e.target.value) {
        this.newUserNickName = false;
      } else {
        this.newUserNickName = true;
      }
    },
    hanlderEditMobile(e) {
      if (e.target.value) {
        this.editUserMobile = false;
      } else {
        this.editUserMobile = true;
      }
    },
    hanlderEditNickName(e) {
      if (e.target.value) {
        this.editUserNickName = false;
      } else {
        this.editUserNickName = true;
      }
    },
    change(e) {
      this.excelFile = e.target.files[0];
      if(!this.showProcess) {
        this.showProcess = true;
      }
      this.fileName = this.excelFile.name;
      console.log(this.fileName);
    },
    getUserList() {
      let that = this;
      let requestData = {
        "pageNum": this.pageNum,
        "pageSize": this.pageSize
      };
      return api.post('/api/user/list', requestData).then(function (response) {
        let result = response.data;
        if (result && result.code == 200000) {
          that.tableData = result.data.list;
          that.pageNum = result.data.pageNum;
          that.totalPages = result.data.pages;
        } else {
          that.$notify.errorMessage(result.message, 4000);
        }
      }).catch(function (error) {
        console.log(error);
      });
    },
    tableSelectUpldate(res) {
      const { idList, dataList } = res;
      this.selectedIdList = idList;
    },
    // 点击table内某一行
    tableTapItem(data) {
      const { type, item } = data;
      this.currentOpItem = item;
      if (type == "edit") {
        this.editUserDialog = true;
        this.editMobile = this.currentOpItem.mobile;
        this.editNickName = this.currentOpItem.nickName;
      } else if (type == "untied") {
        this.unbindWxappTip = true;
      } else if (type == "delete") {
        this.deleteUserTip = true;
      }
    },
    currentChange (data) {
      const {toPage} = data;
      this.pageNum = toPage;
      this.getUserList();
    },
    limitChange(data) {
      const {pSize} = data;
      this.pageNum = 1;
      this.pageSize = pSize;
      this.getUserList();
    },
    hideUnbindWxappTip() {
      this.unbindWxappTip = false;
      this.currentOpItem = null;
    },
    unbindWxapp() { //解除微信绑定
      let that = this;
      that.unbindWxappTip = false;
      api.post('/api/user/unbindWxapp/'+this.currentOpItem.id).then(function (response) {
        let result = response.data;
        if (result && result.code == 200000) {
          that.tableData.forEach(function(item, index){
            if(item.id == that.currentOpItem.id) {
              item.wxOpenid = null;
            }
          });
          that.$notify.successMessage("操作成功", 2000);
        } else {
          that.$notify.errorMessage(result.message, 4000);
        }
      }).catch(function (error) {
        console.log(error);
      });
    },
    hideDeleteUserTip() {
      this.deleteUserTip = false;
      this.currentOpItem = null;
    },
    deleteUser() { //删除用户
      let that = this;
      that.deleteUserTip = false;
      api.post('/api/user/delete/'+this.currentOpItem.id).then(function (response) {
        let result = response.data;
        if (result && result.code == 200000) {
          that.$notify.successMessage("操作成功", 2000);
          that.getUserList();
        } else {
          that.$notify.errorMessage(result.message, 4000);
        }
      }).catch(function (error) {
        console.log(error);
      });
    },
    hideBatchDeleteUserTip() {
      this.batchDeleteUserTip = false;
    },
    showBatchDeleteUserTip() {
      if (this.selectedIdList.length == 0) {
        this.$notify.warnMessage("请至少选择一条要删除的数据", 2000);
      } else {
        this.batchDeleteUserTip = true;
      }
    },
    batchDeleteUser() {
      if (this.selectedIdList.length == 0) {
        this.$notify.warnMessage("请至少选择一条要删除的数据", 2000);
        this.batchDeleteUserTip = false;
        return;
      }
      let that = this;
      that.batchDeleteUserTip = false;
      api.post('/api/user/batchDelete',{userIds:JSON.stringify(this.selectedIdList)}).then(function (response) {
          let result = response.data;
          console.log(result);
          if (result && result.code == 200000) {
            that.$notify.successMessage("操作成功", 2000);
            that.pageNum = 1;
            that.getUserList();
          } else {
            that.$notify.errorMessage(result.message, 4000);
          }
        }).catch(function (error) {
          console.log(error);
        });
    },
    hideNewUserDialog() {
      this.newUserDialog = false;
    },
    showNewUserDialog() {
      this.newUserDialog = true;
    },
    saveNewUser() {
      this.newUserMobile = !this.nickName;
      this.newUserNickName = !this.nickName;
      if (!this.mobile || !this.nickName) {
        return;
      }
      let requestData = {
        "mobile" : this.mobile,
        "nickName" : this.nickName,
      }
      let that = this;
      that.isLoading = true;
      api.post('/api/user/save', requestData).then(function (response) {
        let result = response.data;
        that.isLoading = false;
        if (result && result.code == 200000) {
          that.newUserDialog = false;
          that.$notify.successMessage("操作成功", 2000);
          that.getUserList();
          that.mobile = '';
          that.nickName = '';
        } else {
          that.$notify.errorMessage(result.message, 4000);
        }
      }).catch(function (error) {
        that.isLoading = fale;
        console.log(error);
      });
    },
    hideEditUserDialog() {
      this.editUserDialog = false;
    },
    showEditUserDialog() {
      this.editUserDialog = true;
    },
    saveUpdateUser() {
      this.editUserMobile = !this.editMobile;
      this.editUserNickName = !this.editNickName;
      if (!this.editMobile || !this.editNickName) {
        return;
      }
      let requestData = {
        "mobile" : this.editMobile,
        "nickName" : this.editNickName,
      }
      let that = this;
      that.isLoading = true;
      api.post('/api/user/update/' + this.currentOpItem.id, requestData).then(function (response) {
        let result = response.data;
        that.isLoading = false;
        if (result && result.code == 200000) {
          that.editUserDialog = false;
          that.$notify.successMessage("操作成功", 2000);
          that.tableData.forEach(function(item, index){
            if(item.id == that.currentOpItem.id) {
              item.nickName = that.editNickName;
              item.mobile = that.editMobile;
            }
          });
          that.editMobile = '';
          that.editNickName = '';
        } else {
          that.$notify.errorMessage(result.message, 4000);
        }
      }).catch(function (error) {
        that.isLoading = false;
        console.log(error);
      });
    },
    confirmImport() {
      if (this.excelFile == null) {
        this.$notify.warnMessage('请选择你要导入的文件', 2000);
        return;
      }
      let that = this;
      let axiosConfig = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: function (e) {
          if (e.lengthComputable) {
              let rate = e.loaded / e.total;  //已上传的比例
              if (rate < 1) {
                that.processWith = (rate *100).toFixed(2)+ '%';
              }
          }
        }
      };
      this.importLoading = true;
      let formData = new FormData();
      formData.append("excelFile", this.excelFile);
      axios.post('/api/user/excelImport', formData, axiosConfig).then(function (response) {
        that.importLoading = false;
        let result = response.data;
        if (result && result.code == 200000) {
          that.importSuccCnt = result.data.importSuccCnt;
          that.importFailCnt = result.data.importFailCnt;
          that.failData = result.data.failData;
          that.fileName = null;
          that.excelFile = null;
          that.showProcess = false;
          that.processWith = '0%';
          that.excelFileValue = null;
          if (result.data.importFailCnt == 0) {
            that.showBatchImportSuccTip();
          } else {
            that.showBatchImportFailTip();
          }
          that.pageNum = 1;
          that.getUserList();
        } else {
            that.$notify.errorMessage(result.message, 4000);
        }
      }).catch(function (err) {
        console.log(err);
        that.importLoading = false;
      });
    },
    hideBatchImportDailog() {
      this.batchImportDailog = false;
      this.fileName = null;
      this.excelFile = null;
      this.showProcess = false;
      this.processWith = '0%';
      this.excelFileValue = null;
    },
    showBatchImportDailog() {
      this.batchImportDailog = true;
    },
    hideBatchImportSuccTip() {
      this.batchImport_succ_tip = false;
    },
    showBatchImportSuccTip() {
      this.batchImport_succ_tip = true;
      this.hideBatchImportDailog();
    },
    hideBatchImportFailTip(){
      this.batchImport_fail_tip = false;
    },
    showBatchImportFailTip(){
      this.batchImport_fail_tip = true;
      this.hideBatchImportDailog();
    }
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
.p-account {
  background-color: #fff;
  padding: 16px 20px;
}
.title {
  font-weight: 700;
  font-size: 20px;
  color: rgb(0, 0, 0);
}
.btn_style {
  background-color: rgba(24, 144, 255, 1);
  color: rgb(255, 255, 255);
  font-size: 14px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  border-radius: 4px;
  cursor: pointer;
  border: 0;
}
.account_btn {
  width: 100%;
  margin-top: 30px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
  .del {
    width: 92px;
  }
  .import {
    width: 120px;
    margin-right: 10px;
  }
  .build {
    width: 92px;
  }
}
// 普通对话框
.dialog {
  position: fixed;
  top: 120px;
  left: 50%;
  margin-left: -202px;
  width: 404px;
  height: 330px;
  background-color: #fff;
  z-index: 10;
  .dialog-title {
    font-weight: 700;
    font-size: 20px;
    color: rgb(0, 0, 0);
    padding-bottom: 16px;
    margin: 20px 26px 0 10px;
    border-bottom: #666 solid 1px;
    .dialog-close {
      position: absolute;
      right: 0;
      top: 0;
      width: 30px;
      height: 30px;
      line-height: 30px;
      text-align: center;
      // border-radius: 50%;
      background-color: rgba(24, 144, 255, 1);
      font-size: 16px;
      color: #fff;
      cursor: pointer;
      &:hover {
        color: #000;
      }
    }
  }
  .dialog-content {
    .item {
      height: 56px;
      margin: 30px 0 0 50px;

      .txt {
        width: 60px;
        height: 30px;
        line-height: 30px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.847058823529412);
      }
      input {
        width: 220px;
        height: 30px;
        color: rgba(0, 0, 0, 0.65);
        border: rgba(217, 217, 217, 1) solid 1px;
        border-radius: 4px;
        text-indent: 1em;
      }
      .tiptxt {
        height: 22px;
        color: red;
        font-size: 14px;
        line-height: 24px;
      }
    }
  }
  .dialog-footer {
    margin-top: 30px;
    .confirm {
      width: 70px;
      height: 40px;
      line-height: 40px;
      margin-left: 100px;
    }
    .cancel {
      width: 70px;
      height: 40px;
      line-height: 40px;
      color: #000;
      background-color: #fff;
      border: #000 solid 1px;
      margin-left: 50px;
    }
  }
}
// 提示框
.tip {
  position: fixed;
  top: 120px;
  left: 50%;
  margin-left: -202px;
  width: 280px;
  height: 160px;
  background-color: #fff;
  z-index: 10;
  border-radius: 6px;
  .tip-text {
    width: 100%;
    height: 106px;
    text-align: center;
    line-height: 106px;
    font-size: 20px;
    border-bottom: #666 solid 1px;
  }
  .tip-footer {
    height: 38px;
    font-size: 16px;
    line-height: 38px;
    margin: 8px 0;
    text-align: center;
    .confirm {
      width: 138px;
      color: #999;
      border-right: #999 solid 1px;
      cursor: pointer;
    }
    .cancel {
      width: 138px;
      color: #000;
      cursor: pointer;
    }
    button {
      height: 38px;
      border: 0;
    }
  }
}
.dialog-cover {
  background: #000;
  opacity: 0.3;
  position: fixed;
  z-index: 5;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.import-tip-cover {
  background: #000;
  opacity: 0.3;
  position: fixed;
  z-index: 15;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
// 批量导入
.import-dialog {
  position: fixed;
  top: 120px;
  left: 50%;
  margin-left: -338px;
  width: 676px;
  height: 460px;
  background-color: #fff;
  z-index: 10;
  .dialog-title {
    font-weight: 700;
    font-size: 20px;
    color: rgb(0, 0, 0);
    padding-bottom: 16px;
    margin: 40px 0 0 20px;
    border-bottom: #666 solid 1px;
    .dialog-close {
      position: absolute;
      right: 0;
      top: 0;
      width: 30px;
      height: 30px;
      line-height: 30px;
      text-align: center;
      // border-radius: 50%;
      background-color: rgba(24, 144, 255, 1);
      font-size: 16px;
      color: #fff;
      cursor: pointer;
      &:hover {
        color: #000;
      }
    }
  }
  .dialog-content {
    margin-top: 30px;
    .upload {
      input {
        outline: none;
        background-color: transparent;
        filter: alpha(opacity=0);
        opacity: 0;
        width: 438px;
        height: 193px;
        margin: 10px 117px;
        position: absolute;
        top: 115px;
        left: 0;
      }
      .file {
        width: 438px;
        height: 193px;
        background-image: url("../../assets/images/account/frame.png");
        text-align: center;
        margin: 10px 117px;
        img {
          width: 48px;
          height: 48px;
          display: inline-block;
          margin-top: 35px;
        }
        .tip-txt1 {
          width: 252px;
          margin: 20px auto 10px;
          font-size: 14px;
          line-height: 22px;
        }
        .tip-txt2 {
          color: #999;
        }
      }
    }
    .needle {
      margin-top: 20px;
      img {
        width: 14px;
        height: 14px;
        margin-left: 110px;
      }
      .process {
        margin-left: 4px;
        .cdel {
          cursor: pointer;
        }
        .strip {
          width: 422px;
          height: 3px;
          background-color: rgba(232, 232, 232, 1);
          margin-top: 6px;
          border-radius: 3px;
          .strip-blue {
            height: 3px;
            background-color: #1890ff;
            width: 0%;
          }
        }
      }
    }
  }
  .dialog-footer {
    margin-top: 40px;
    .confirm {
      width: 130px;
      height: 40px;
      margin-left: 180px;
    }
    .cancel {
      width: 130px;
      height: 40px;
      margin-left: 50px;
    }
  }
}
// 批量导入中的提示
.import-tip {
  position: fixed;
  top: 240px;
  left: 50%;
  margin-left: -173px;
  width: 346px;
  height: 186px;
  background-color: #fff;
  z-index: 20;
  border-radius: 4px;
  padding: 36px 40px 0 30px;
  .import-title {
    img {
      width: 22px;
      height: 22px;
    }
    div {
      font-weight: 700;
      margin-left: 10px;
    }
  }
  .import-content {
    color: rgba(0, 0, 0, 0.427450980392157);
    font-size: 14px;
    line-height: 22px;
    margin-left: 30px;
    margin-top: 10px;
  }
  .import-footer {
    .confirm {
      width: 66px;
      margin-top: 20px;
    }
  }
}
</style>
