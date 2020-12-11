<template>
  <div class="list-channel-table">
    <table>
      <thead>
        <tr>
          <th width="5%">&nbsp;&nbsp;</th>
          <th width="10%">用户ID</th>
          <th width="15%">手机号</th>
          <th width="10%">名称</th>
          <th width="25%">微信openid</th>
          <th width="15%">创建时间</th>
          <th width="20%">操作</th>
        </tr>
      </thead>
      <tbody v-show="tableData.length >= 1">
        <tr v-for="(item, index) in tableData" :key="item.channelId">
          <td>
            <checkbox name="account" :value="item.id" v-model="selectedIdList" :index="index"/>
          </td>
          <td>{{ item.id }}</td>
          <td>{{ item.mobile }}</td>
          <td>{{ item.nickName }}</td>
          <td>{{ item.wxOpenid ? item.wxOpenid : "未绑定" }}</td>
          <td>{{ item.createTime }}</td>
          <td class="list-channel-control">
            <span @click="handleControl('edit', item)">编辑</span>
            <span @click="handleControl('untied', item)" v-show="item.wxOpenid">微信解绑</span>
            <span @click="handleControl('delete', item)">删除</span>
          </td>
        </tr>
      </tbody>
    </table>

    <section v-show="tableData.length === 0" class="warm-up-part">
      <div class="defaultBg">暂无数据</div>
    </section>
    
    <div style="margin-top:20px;">
      <pagination :currentPage="currentPageNum" :total="totalPages" :limitOptions="limitOptions"
      @currentChange="currentChange" @limitChange="limitChange"></pagination>
    </div>
  </div>
</template>

<script>
import Checkbox from "@/components/form/checkbox";
import Pagination from "@/components/pagination/pagination";

export default {
  data() {
    return {
      selectedIdList: [],
      limitOptions: [25,50,100]
    };
  },

  components: {Checkbox,Pagination},

  props: {
    tableData: {
      type: Array,
      default: () => []
    },
    currentPageNum: {
      type: Number,
      default: 1
    },
    totalPages: {
      type: Number,
      default: 0
    },
  },

  watch: {
    // 当前页改变则清空选中频道号列表
    tableData() {
      this.selectedIdList = [];
    },

    selectedIdList(idList) {
      const channelList = this.tableData;
      const dataList = idList.map(curId => {
        return (
          (channelList.filter(channelObj => channelObj.id === curId) || [])[0] || undefined
        );
      });

      this.$emit("selectUpdate", {
        idList: idList,
        dataList: dataList
      });
    }
  },
  methods: {
    handleControl(type, item) {
      this.$emit("dealTableItem", {type, item});
    },
    currentChange (toPage) {
      this.$emit("currentChange", {toPage});
    },
    limitChange (val) {
      this.$emit("limitChange", {val});
    }
  }
};
</script>

<style lang="scss" scoped>
// 字体颜色
$fontColor: #546e7a;
$color: #2196f3;
$red: #f44336;
$littleBlue: #e3f2fd;
$borderGreyColor: #e0e0e0;
$fontNormalColor: #263238;
$colorHover: #42a5f5;

.list-channel-table {
  margin-bottom: 20rpx;

  a {
    color: $fontColor;
    &:hover {
      color: $color;
    }
  }

  .live-liveing {
    color: #03a9f4;
  }

  .live-playback {
    color: #4caf50;
  }

  .live-testing {
    color: #ff9800;
  }

  .live-end {
    color: #9e9e9e;
  }

  .live-ban {
    color: $red;
  }
}

table {
  width: 100%;
  line-height: 48px;
  border-spacing: 0;
  border-collapse: collapse;
}

tbody {
  > tr {
    &:nth-child(odd) {
      background-color: #fff;
    }

    &:hover {
      background-color: $littleBlue;
    }
  }
}

tr {
  margin: 0;
}

th {
  border-bottom: 1px solid $borderGreyColor;
  color: $fontNormalColor;
  font-weight: normal;
}

td {
  vertical-align: top;
  text-align: center;
  margin: 0;
  border-bottom: 1px solid $borderGreyColor;
}

.category-change {
  cursor: pointer;

  &:hover {
    color: $colorHover;
  }

  > div {
    margin: 0 auto;
    width: 120px;
    height: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.list-channel-control {
  > a {
    display: inline-block;
    margin: 0 5px;
    color: $color;
    cursor: pointer;

    &:hover {
      color: $colorHover;
    }

    &:active {
      color: $color;
    }
  }
  > span {
    display: inline-block;
    margin: 0 5px;
    color: $color;
    cursor: pointer;

    &:hover {
      color: $colorHover;
    }

    &:active {
      color: $color;
    }
  }
}

.list-channel-name {
  > div {
    margin: 0 auto;
    width: 18em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
  }
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

.link-animation {
  animation: bounce-in 0.65s;
}

.link-animation-enter-active {
  animation: bounce-in 0.65s;
}

@keyframes bounce-in {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.5);
  }
  75% {
    transform: scale(0.7);
  }
  100% {
    transform: scale(1);
  }
}
</style>
