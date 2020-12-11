<template>
  <div class="p-info">
    <div class="title">账号信息</div>
    <div class="sidebar">
      <!-- <router-link class="list active" to="/accountinfo/details">账户详情</router-link>
      <router-link class="list" to="/accountinfo/modify">修改密码</router-link>-->
      <router-link
        class="list"
        :to="{ path: item.path }"
        v-for="(item,index) in liList"
        @click.native="addClass(index)"
        :key="item.index"
        v-bind:class="{ 
         active:index==current}"
      >{{ item.title }}</router-link>
    </div>
    <div class="content">
      <router-view/>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      current: 0,
      liList: [
        { title: "账户详情", path: "/accountinfo/details" },
        { title: "修改密码", path: "/accountinfo/modify" }
      ]
    };
  },
  methods: {
    addClass(index) {
      this.current = index;
      console.log(this.current);
    }
  }
};
</script>
<style lang="scss" scoped>
.p-info {
  height: 630px;
  background-color: #fff;
  padding: 16px 20px 0 0;
}
.title {
  font-weight: 700;
  font-size: 20px;
  color: rgb(0, 0, 0);
  margin-left: 20px;
}
.sidebar {
  margin-top: 60px;
  margin-left: 8px;
  float: left;
  .list {
    width: 120px;
    height: 54px;
    display: block;
    padding-right: 20px;
    text-align: right;
    line-height: 54px;
    &.active {
      background-color: rgba(204, 204, 204, 0.2);
    }
  }
}
.content {
  margin-left: 150px;
}
</style>
