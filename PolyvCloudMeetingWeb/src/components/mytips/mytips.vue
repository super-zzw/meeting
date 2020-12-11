<template>
  <div>
    <div class="dialog-cover"></div>
    <div class="tip-dialog">
      <div class="tip-content">{{content}}</div>
      <div class="tip-confirm">
        <button type="button" class="tip-btn" @click="hide">好的，知道了</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'mytips',
  props: {
    content: [String]
  },
  methods: {
    hide() {
      this.$emit('hide');
    }
  }
};
</script>

<style lang="scss">
.dialog-cover {
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: #000;
  opacity: 0.5;
  top: 0;
  left: 0;
  z-index: 999998;
}

.tip-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 368px;
  height: 160px;
  background-color: #fff;
  border-radius: 6px;
  z-index: 999999;

  .tip-content {
    line-height: 80px;
    text-align: center;
    color: #000;
    font-size: 18px;
  }

  .tip-confirm {
    display: flex;
    justify-content: center;

    button {
      width: 304px;
      height: 48px;
      border: 0;
      background-color: #0066e6;
      color: #fff;
      border-radius: 4px;
      cursor: pointer;
      font-size: 18px;
    }
  }

  .tip-btn {
    display: flex;
    justify-content: center;
  }
}
</style>