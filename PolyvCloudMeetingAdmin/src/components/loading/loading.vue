<template>
  <div class="loading" v-if="display" :class="{ fullscreen }">
    <img
      src="./channel-info-loading.gif"
      alt="loadingImg"
      v-if="useImage"
      class="loadingImg"
    />
    <div class="ball-clip-rotate" v-else><div></div></div>
  </div>
</template>

<script>
export default {
  props: {
    display: {
      type: Boolean,
      default: true
    },
    useImage: {
      type: Boolean,
      default: false
    },
    fullscreen: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style lang="scss">
.loading {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1002;
  background-color: rgba(255,255,255,.35);
}
.fullscreen {
  position: fixed;
  right: 0;
  bottom: 0;
  overflow: auto;
  margin: 0;
  background-color: rgba(124,125,131,.35);
}
@keyframes rotate {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(.6);
  }
  100% {
   transform: rotate(360deg) scale(1);
 }
}

.ball-clip-rotate {
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -13px;
  margin-top: -13px;

  > div {
    border-radius: 100%;
    margin: 2px;

    border: 2px solid #2196f3;
    border-bottom-color: transparent;
    height: 26px;
    width: 26px;
    background: transparent !important;
    display: inline-block;
    animation: rotate 1s 0s linear infinite;
  }
}
.loadingImg{
  position: absolute;
  left: 50%;
  top: 50%;
}
</style>
