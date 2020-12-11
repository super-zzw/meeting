<template>
  <div class="radio-component">
    <input
      type="radio"
      :id="$_id"
      :name="name"
      :value="value"
      :required="required"
      :disabled="disabled"
      @change="onChange"
      :checked="state" />
    <label :for="$_id">
      <span class="input-box-circle"></span>
      <slot></slot>
    </label>
  </div>
</template>

<script>
export default {
  model: {
    prop: 'modelValue',
    event: 'input'
  },

  props: {
    id: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: null,
    },
    value: {
      default: '',
    },
    modelValue: {
      default: undefined,
    },
    checked: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    model: {}
  },

  data() {
    return {
      $_id: '',
    };
  },

  computed: {
    state() {
      if (this.modelValue === undefined) {
        return this.checked;
      }

      return this.modelValue === this.value;
    }
  },

  methods: {
    async onChange() {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 0);
      });
      this.toggle();
    },

    toggle() {
      this.$emit('input', this.state ? '' : this.value);
    }
  },

  watch: {
    checked(newValue) {
      if (newValue !== this.state) {
        this.toggle();
      }
    }
  },

  beforeMount() {
    const fingerprint = `radio-${new Date().getTime() % 1000}-${Math.floor(Math.random() * 100000)}`;
    this.$_id = this.id || fingerprint;
  },

  mounted() {
    if (this.checked && !this.state) {
      this.toggle();
    }
  },
};
</script>

<style lang="scss">
$height: 16px;
$borderDarkGrey: #ccc;
.radio-component {
  height: $height;
  display: inline-block;
  vertical-align: middle;
  margin-right: 16px;

  > input {
    opacity: 0;
    position: absolute;
    height: $height;
    cursor: pointer;

    + label {
      height: $height;
      line-height: $height;
      vertical-align: top;
      color: #263238;
      cursor: pointer;
    }

    + label > .input-box-circle {
      vertical-align: top;
      display: inline-block;
      border: 1px solid $borderDarkGrey;
      border-radius: 50%;
      margin: 0;
      padding: 0;
      width: $height;
      height: $height;
      background: #fff;
      overflow: hidden;
      user-select: none;
      margin-right: 10px;
    }

    &:checked + label > .input-box-circle {
      border: solid 5px #03a9f4;
    }

    &:focus + label > .input-box {
      box-shadow: 0 0 2px 3px #73b9ff;
    }

    &:disabled {
      cursor: not-allowed;
    }

    &:disabled + label {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
}
</style>
