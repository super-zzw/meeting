<template>
  <div class="p-record">
    <div class="title">会议记录查询</div>
    <div class="search">
      搜索：
      <input type="text" placeholder="输入会议主题/主持人进行搜索" v-model="searchKeyword" @keyup.enter="searchMeeting"/>
    </div>

    <loading v-if="isLoading" />

    <div v-else>
      <table>
        <thead>
          <tr>
            <th width="10%">会议主题</th>
            <th width="15%">会议开始时间</th>
            <th width="15%">会议结束时间</th>
            <th width="10%">时长(分钟)</th>
            <th width="10%">发起平台</th>
            <th width="10%">参会人数</th>
            <th width="5%">主持人</th>
            <th width="25%">参与者</th>
          </tr>
        </thead>
        <tbody v-show="tableData.length >= 1">
          <tr v-for="(item) in tableData" :key="item.channelId">
            <td>{{ item.topic }}</td>
            <td>{{ item.beginTime }}</td>
            <td>{{ item.endTime }}</td>
            <td>{{ item.duration }}</td>
            <td>{{ item.platform }}</td>
            <td>{{ item.confereeCnt }}</td>
            <td>{{ item.masterNickName }}</td>
            <td :title="item.player">{{ item.confereeName }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <section v-show="isLoading || tableData.length == 0" class="warm-up-part">
      <div class="defaultBg">暂无数据</div>
    </section>
    <div style="margin-top:20px;">
      <pagination :currentPage="pageNum" :total="totalPages" :limitOptions="[25,50,100]" 
        @currentChange="currentChange" @limitChange="limitChange"></pagination>
    </div>
  </div>
</template>

<script>
import Pagination from "@/components/pagination/pagination";
import api from '@/assets/common/api/api.js';
import Loading from '@/components/loading/loading';

export default {
  components: {
    Pagination,
    Loading
  },
  data() {
    return {
      searchKeyword: '',
      tableData: [],
      pageNum: 1,
      pageSize: 25,
      totalPages: 0,

      isLoading: false,
    };
  },
  methods: {
    getMeetingList() {
      let that = this;
      let requestData = {
        "searchKeyword": this.searchKeyword, 
        "pageNum": this.pageNum,
        "pageSize": this.pageSize
      };
      return api.post('/api/meeting/list', requestData).then(function (response) {
        let result = response.data;
        console.log(result);
        if (result && result.code == 200000) {
          that.tableData = result.data.list;
          that.pageNum = result.data.pageNum;
          that.totalPages = result.data.pages;
          that.platformCodeToName();
        } else {
          console.log(result.message);
        }
      }).catch(function (error) {
        console.log(error);
      });
    },
    searchMeeting() {
      this.pageNum = 1;
      this.getMeetingList();
    },
    currentChange(toPage) {
      // const {toPage} = data;
      this.pageNum = toPage;
      this.getMeetingList();
    },
    limitChange(pageSize) {
      // const {pSize} = data;
      this.pageNum = 1;
      this.pageSize = pageSize;
      this.getMeetingList();
    },
    platformCodeToName() {
      this.tableData.forEach(function(e, index){
        if (e.platform == "wxapp") {
          e.platform = "小程序"
        } else if (e.platform == "ios") {
          e.platform = "iOS端"
        } else if (e.platform == "android") {
          e.platform = "安卓端"
        } else if (e.platform == "pcweb") {
          e.platform = "PC网页"
        } else {
          e.platform = "未知"
        }
      });
    }
  },
  mounted() {
    this.isLoading = true;
    this.getMeetingList().then(() => {
      this.isLoading = false;
    }).catch(() => {
      this.isLoading = false;
    });
  },
  computed: {
    //computed
  }
};
</script>

<style lang="scss" scoped>
.p-record {
  background-color: #fff;
  padding: 16px 20px;
}
.title {
  font-weight: 700;
  font-size: 20px;
  color: rgb(0, 0, 0);
}
.search {
  height: 32px;
  line-height: 32px;
  font-size: 14px;
  color: #000;
  margin: 30px 0;
  input {
    width: 340px;
    height: 32px;
    border: rgba(217, 217, 217, 1) solid 1px;
    border-radius: 4px;
    text-indent: 1em;
  }
}
table {
  width: 100%;
  line-height: 48px;
  border-spacing: 0;
  border-collapse: collapse;
  table-layout: fixed;
}
thead {
  // border: rgba(232, 232, 232, 1) 1px solid;
  border-top: rgba(232, 232, 232, 1) 1px solid;
}
tbody {
  > tr {
    &:nth-child(odd) {
      background-color: #fff;
    }

    &:hover {
      background-color: #e3f2fd;
    }
  }
}

tr {
  margin: 0;
}

th {
  border-bottom: 1px solid #e0e0e0;
  color: #263238;
  font-weight: normal;
}

td {
  vertical-align: top;
  text-align: center;
  margin: 0;
  border-bottom: 1px solid #e0e0e0;
  white-space: nowrap; /*控制单行显示*/
  overflow: hidden; /*超出隐藏*/
  text-overflow: ellipsis; /*隐藏的字符用省略号表示*/
}
.warm-up-part {
  width: 100%;
  height: 100%;

  > .defaultBg {
    text-align: center;
    font-size: 18px;
    color: #9e9e9e;
    margin-top: 120px;
    margin-bottom: 120px;
  }
}
</style>
