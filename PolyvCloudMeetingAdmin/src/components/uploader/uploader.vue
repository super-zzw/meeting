<template>
  <remote-js :src="this.jsUrl" @load-js-finish="this.jsLoadCallBack"/>
</template>

<script>
const jsUrl = '//live.polyv.cn/assets/wjs/dist/UpLoadingImgForChat.min.js';

export default {
  data() {
    return {
      jsUrl
    };
  },
  components: {
    'remote-js': {
      render(createElement) {
        const self = this;
        return createElement('script', {
          attrs: { type: 'text/javascript', src: jsUrl },
          on: {
            load() {
              self.$emit('load-js-finish');
            }
          }
        });
      },
    }
  },
  props: {
    jsLoadCallBack: Function // 外部js加载完成回调
  }
};
</script>
