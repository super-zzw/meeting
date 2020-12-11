<template>
  <nav class="c-navbar clearfix">
    <div class="c-navbar-left">
      <div class="c-navbar-left__logo">
        <router-link to="/"><img src=".././../assets/images/navbar/header-logo.png" alt="POLYV 云会议"/></router-link>
      </div>
      <div class="g-hoverdown c-navbar-page-hoverdown">
        <div class="g-hoverdown-toggle">
          <span>云会议  <i class="g-caret-w c-caret-w"></i></span>
        </div>
        <ul class="g-hoverdown-menu">
          <li>
            <a href="//my.polyv.net/secure/union">产品首页</a>
          </li>
          <li>
            <a href="//my.polyv.net/secure/main">云点播</a>
          </li>
          <li>
            <a href="//live.polyv.net/">云直播</a>
          </li>
          <li>
            <a href="/" class="c-hoverdown-selected">云会议</a>
          </li>
        </ul>
      </div>
      <div class="c-navbar-category-list">
        <router-link class="c-navbar-category-link" active-class="c-navbar-category-selected" to="/account"><div>账号管理</div></router-link>
        <router-link class="c-navbar-category-link" active-class="c-navbar-category-selected" to="/statistics"><div>会议记录</div></router-link>
        <router-link class="c-navbar-category-link" active-class="c-navbar-category-selected" to="/customization"><div>企业订制</div></router-link>
      </div>
    </div>
    <div class="c-navbar-right">
      <a class="c-navbar-right-item" href="http://www.polyv.net/download/" target="_blank"><i class="c-navbar-icon c-navbar-down-icon"></i></a>
      <div class="g-hoverdown c-navbar-right-item c-navbar-right-help">
        <i class="c-navbar-icon c-navbar-quiz-icon"></i>
        <ul class="g-hoverdown-menu">
          <li>
            <a href="http://dev.polyv.net" target="_blank">帮助中心</a>
          </li>
          <li>
            <a href="javascript:;" @click="$service.show()">联系客服</a>
          </li>
        </ul>
      </div>
      <div class="g-hoverdown c-navbar-right-item c-navbar-right-account">
        <a href="javascript:void(0);" class="hoverdown-toggle">
          <span class="c-navbar-email">{{ userInfo.email || 'N/A@polyv.net' }} <i class="g-caret"></i></span>
        </a>
        <ul class="g-hoverdown-menu">
          <li>
            <router-link :to="`/accountInfo/details`">账号信息</router-link>
          </li>
          <li><a href="javascript:;" @click="loginOut">退出</a></li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>

export default {
  name: 'navbar',

  data() {
    return {
      navigatorVisible: false,
      helpVisible: false,
      showUserSelect: false
    };
  },

  computed: {
    userInfo() {
      return this.$store.state.user.userInfo;
    }
  },

  mounted() {
    window.addEventListener('click', () => {
      this.showUserSelect = false;
    });
  },
  methods: {
    showNavigator() {
      this.navigatorVisible = true;
    },
    hideNavigator() {
      this.navigatorVisible = false;
    },
    showHelp() {
      this.helpVisible = true;
    },
    hideHelp() {
      this.helpVisible = false;
    },
    /*
    *  交替显示选项栏
    */
    showSelect() {
      this.showUserSelect = true;
    },
    hideSelect() {
      this.showUserSelect = false;
    },

    loginOut() {
      this.$store.dispatch('user/logout').then(() => {
        window.location.assign('//my.polyv.net/v2/login');
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.c-navbar {
  width: 100%;
  padding: 0 24px;
  background-color: #272c2f;
  color: #fff;

  i {
    margin-right: 0px;
    display: inline-block;
    vertical-align: middle;
  }

  .c-navbar-icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    background-repeat: no-repeat;
    background-size: cover;
  }

  .g-hoverdown-menu {
    left: 0;
    right: 0;
    margin: 0;
    padding: 0;
    z-index: 1000;
    min-width: auto;
    background: #171a1c;
    text-align: left;
    line-height: 40px;
    & > li > a {
      display: inline-block;
      width: 100%;
      height: 40px;
      line-height: 40px;
      font-size: 12px;
      padding: 0 0 0 24px;
      color: #c9ced6;
      &:hover {
        background: #2c3236;
      }
    }
    .c-hoverdown-selected {
      color: #2196f3;
      background: #2c3236;
    }
  }
}

.c-navbar-category-list {
  .c-navbar-category-link {
    display: inline-block;
    width: 88px;
    height: 56px;
    line-height: 20px;
    padding: 18px 0;
    text-align: center;
    font-size: 14px;
    color: #c9ced6;
  }
  .c-navbar-category-selected,
  .c-navbar-category-link:hover {
    color: #2196f3;
    background-color: #171a1c;
  }
}

.c-navbar-left {
  float: left;
  height: 100%;
  > div {
    display: inline-block;
    vertical-align: top;
  }
  .c-navbar-left__logo {
    height: 56px;
    line-height: 56px;
    margin-right: 24px;
  }

  .c-navbar-page-hoverdown {
    width: 120px;
    font-size: 14px;
    height: 56px;
    line-height: 56px;
    background-image: linear-gradient(#2196f3, #2196f3),
                      linear-gradient(#171a1c,#171a1c);
    text-align: center;
    .g-hoverdown-menu > li > a {
      font-size: 14px;
    }
  }
}

.c-navbar-right {
  float: right;
  height: 100%;

  .c-navbar-right-item {
    display: inline-block;
    padding: 0 8px;
    height: 56px;
    line-height: 56px;
    .g-hoverdown-menu > li {
      height: 40px;
      line-height: 40px;
    }
  }
  .c-navbar-right-help {
    .g-hoverdown-menu {
      width: 96px;
    }
  }
  .g-hoverdown:hover {
    .c-navbar-down-icon {
      background-image: url('../../assets/images/navbar/ic-download-hover.png');
    }
    .c-navbar-quiz-icon {
      background-image: url('../../assets/images/navbar/ic-help-hover.png');
    }
    .g-caret,
    .g-caret {
      background-image: url('../../assets/images/navbar/btn-more-hover.png');
    }
    .c-navbar-email {
      color: #2196f3;
    }
  }
  .c-navbar-down-icon {
    background-image: url('../../assets/images/navbar/ic-download.png');
    &:hover {
      background-image: url('../../assets/images/navbar/ic-download-hover.png');
    }
  }
  .c-navbar-quiz-icon {
    background-image: url('../../assets/images/navbar/ic-help.png');
    &:hover {
      background-image: url('../../assets/images/navbar/ic-help-hover.png');
    }
  }
  .c-navbar-email {
    font-size: 14px;
    color: #c9ced6;
  }
}
</style>
