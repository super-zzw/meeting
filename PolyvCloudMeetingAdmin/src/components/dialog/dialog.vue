<template>
  <div :class="styleClassObj">
    <div class="dialog-title">
      {{ title }}
      <span class="dialog-close" @click="hide">×</span>
    </div>
    <div class="dialog-content">
      <slot></slot>
    </div>
    <div class="dialog-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    styleClassObj() {
      const obj = {
        'dialog-layout': true
      };

      if (this.styleClass) {
        obj[this.styleClass] = true;
      }

      return obj;
    }
  },

  props: {
    title: [String, Number],
    styleClass: [String]
  },
  methods: {
    hide() {
      this.$emit('hide');
    }
  }
};
</script>

<style lang="scss">
$borderPureColor: #ececec;

.dialog-layout {
  padding: 0 10px 30px;
}

.dialog-title {
  line-height: 40px;
  border-bottom: 1px solid $borderPureColor;
  position: relative;
}

.dialog-close {
  width: 30px;
  text-align: center;
  position: absolute;
  right: 0;
  top: 0;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    color: #ff7e55;
  }
}

.dialog-footer {
  text-align: center;

  button {
    margin: 0 3px;
  }
}
</style>
