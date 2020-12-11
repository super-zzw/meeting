<template>
  <div class="breadCrumb">
    <div class="container">
      管理系统：
      <span v-if="$route.matched[0] && $route.matched[0].name !== 'messageCenter'"><router-link to="/channel">云会议</router-link> &gt;</span>
      <span v-if="$route.matched[0] && $route.matched[0].meta.auth === 'channel'">
        <router-link to="/account">账号管理</router-link> &gt;
        <a href="javascript:;" v-if="detail.userCategory" @click="toCategory">{{ detail.userCategory.categoryName }}</a>&gt;
        {{ detail.name }} ({{detail.channelId}})
      </span>
      <span v-else-if="$route.matched[0] && $route.matched[0].meta.auth === 'channelStatistics'">
        <router-link to="/statistics">统计分析</router-link> &gt;
        <a href="javascript:;" v-if="detail.userCategory" @click="toCategory">{{ detail.userCategory.categoryName }}</a>&gt;
        {{ detail.name }} ({{detail.channelId}})
      </span>
      <span v-else v-for="(item, index) in breadCrumbList" :key="index">
        <router-link :to="item.meta.path || {name: item.name}">{{ item.meta.name }}</router-link>
        &gt;
      </span>
      {{ currentPageName }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentPageName: '',
      breadCrumbList: [],
      showHandly: true,
    };
  },

  computed: {
    detail() {
      return this.$store.state.channel.detail;
    },
  },

  watch: {
    $route() {
      const $route = this.$route;
      const name = $route.name;
      const auth = $route.matched[0].meta.auth;
      if (auth === 'channel' || auth === 'channelStatistics') {
        this.currentPageName = '';
        return;
      }

      if ($route.query.keyword && (name === 'home' || name === 'channel')) {
        this.currentPageName = '搜索结果';
      } else {
        this.currentPageName = $route.meta.name;
      }
      this.breadCrumbList = $route.matched.slice(0, -1);
    }
  },

  methods: {
    toCategory() {
      this.$store.commit(this.$types.CHANGE_CATEGORY, this.detail.userCategory.categoryId);
      this.$router.push({
        path: '/channel'
      });
    }
  }
};
</script>

<style lang="scss" scoped>
// 字体颜色
$fontColor: #546e7a;
.breadCrumb {
  position: relative;
  padding-top: 30px;
  margin-bottom: 40px;
  font-size: 12px;

  .live-link-exact {
    color: $fontColor;
    cursor: default;
  }
}
</style>
