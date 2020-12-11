<template>
  <div class="checkbox-component">
    <label :for="$_id">
      <input
        type="checkbox"
        :index="index"
        :id="$_id"
        :name="name"
        :value="value"
        :required="required"
        :disabled="disabled"
        @change="updateInput"
        :checked="shouldBeChecked"/>
      <span class="input-box"></span>
      <slot></slot>
    </label>
  </div>
</template>

<script>
export default {
  model: {
    prop: 'modelValue',
    event: 'change'
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
      default: null,
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
    index: {
      type: Number,
    },
    model: {}
  },

  data() {
    return {
      $_id: '',
    };
  },

  computed: {
    shouldBeChecked() {
      if (this.modelValue === undefined) {
        return this.checked;
      }

      if (Array.isArray(this.modelValue)) {
        return this.modelValue.indexOf(this.value) > -1;
      }

      return !!this.modelValue;
    }
  },

  methods: {
    updateInput(event) {
      const isChecked = event.target.checked;
      // this.m_checked = isChecked;
      this.toggle(isChecked);
    },

    toggle(isChecked) {
      if (this.modelValue instanceof Array) {
        const newValue = [...this.modelValue];

        if (isChecked) {
          newValue.push(this.value);
        } else {
          newValue.splice(newValue.indexOf(this.value), 1);
        }

        this.$emit('change', newValue, this.id);
      } else {
        this.$emit('change', isChecked, this.id);
      }
    }
  },

  watch: {
    checked(newValue) {
      if (newValue !== this.shouldBeChecked) {
        this.toggle();
      }
    }
  },

  beforeMount() {
    const fingerprint = `radio-${new Date().getTime() % 1000}-${Math.floor(Math.random() * 100000)}`;
    this.$_id = this.id || fingerprint;
  },

  mounted() {
    if (this.checked && !this.shouldBeChecked) {
      this.toggle();
    }
  },
};
</script>

<style lang="scss" scoped>
$fontNormalColor: #263238;
$borderDarkGrey: #ccc;
$height: 14px;
$selectWid: 85px;
$color: #2196f3;
.checkbox-component {
  display: inline-block;
  vertical-align: middle;
  font-size: 0;
  margin-right: 20px;
  height: $height;

  > label {
    font-size: 13px;
    line-height: $height;
    vertical-align: top;
    color: $fontNormalColor;
    cursor: pointer;
    position: relative;

    input {
      opacity: 0;
      position: absolute;
      cursor: pointer;

      &:checked + .input-box {
        border: 1px solid $color;
        background: url(./images/icon-checked.png) no-repeat center;
        background-color: $color;
      }

      &:disabled {
        cursor: not-allowed;
      }

      &:disabled ~ * {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }
  }

  > label > .input-box {
    vertical-align: top;
    display: inline-block;
    width: $height;
    height: $height;
    box-sizing: border-box;
    border: 1px solid $borderDarkGrey;
    background-color: #fff;
    margin-right: 2px;
  }
}
</style>
