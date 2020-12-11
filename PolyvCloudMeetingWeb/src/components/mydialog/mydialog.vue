<template>
  <div>
    <div class="dialog-cover"></div>
    <div class="tip-dialog">
      <div class="tip-contetn">{{content}}</div>
      <div class="tip-btn">
        <button class="confirm" @click="confirm">{{confirmTitle}}</button>
        <button class="cancel" @click="cancel">{{cancelTitle}}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'mydialog',
  props: {
    content: [String],
    confirmTitle: [String],
    cancelTitle: [String]
  },
  methods: {
    confirm() {
      this.$emit('confirm');
    },
    cancel() {
      this.$emit('cancel');
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
  background-color: #fff;
  width: 369px;
  height: 155px;
  border-radius: 6px;
  z-index: 9999999;

  .tip-contetn {
    font-size: 18px;
    line-height: 80px;
    color: #000;
    text-align: center;
  }

  .tip-btn {
    display: flex;
    justify-content: center;

    button {
      width: 147px;
      height: 48px;
      font-size: 18px;
      border: 0;
      border-radius: 4px;
      cursor: pointer;
    }

    .cancel {
      color: #fff;
      background-color: #0066e6;
      margin-left: 15px;
    }

    .confirm {
      color: #0066e6;
      border: 1px solid #0066e6;
    }
  }
}
</style>