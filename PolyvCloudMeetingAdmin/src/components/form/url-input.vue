<template>
  <div class="live-url-input">
    <div class="select">
      <div class="select-title" @click="handleClick">
        <span>{{ `${networkProtocol}://` }}</span>
        <i :class="{ 'arrow-rotate': showOptions }"></i>
      </div>
      <transition>
        <ul v-show="showOptions" @click="optionControl">
          <li data-value="http">http://</li>
          <li data-value="https">https://</li>
        </ul>
      </transition>
    </div>
    <input
      type="text"
      ref="input"
      :value="url"
      :placeholder="placeholder"
      @input="updateUrl($event.target.value)"
      @blur="format"/>
    <span v-if="maxLength > 0" class="live-url-input-tips">{{ url.length }}/{{ maxLength }}</span>
  </div>
</template>

<script>
const HTTP_PATTERN = /^http:\/\//;
const HTTPS_PATTERN = /^https:\/\//;
const HTTP_OR_HTTPS_PATTERN = /^(http:\/\/)|(https:\/\/)/;

export default {
  name: 'UrlInput',
  props: {
    value: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    maxLength: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      networkProtocol: HTTPS_PATTERN.test(this.value) ? 'https' : 'http',
      url: this.value.replace(HTTP_OR_HTTPS_PATTERN, ''),
      showOptions: false,
    };
  },
  watch: {
    value() {
      const isHTTP = HTTP_PATTERN.test(this.value);
      const isHTTPS = HTTPS_PATTERN.test(this.value);
      let networkProtocol = '';

      if (isHTTP) {
        networkProtocol = 'http';
      } else if (isHTTPS) {
        networkProtocol = 'https';
      }
      this.networkProtocol = networkProtocol || this.networkProtocol;
      this.url = this.value.replace(HTTP_OR_HTTPS_PATTERN, '');
    }
  },
  mounted() {
    document.addEventListener('click', this.handleSelectBlur, false);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleSelectBlur, false);
  },
  methods: {
    updateUrl(url) {
      url = url.trim();
      if (HTTP_PATTERN.test(url)) {
        this.networkProtocol = 'http';
        this.url = url.replace(HTTP_PATTERN, '');
      } else if (HTTPS_PATTERN.test(url)) {
        this.networkProtocol = 'https';
        this.url = url.replace(HTTPS_PATTERN, '');
      } else {
        this.url = url;
      }
    },
    format() {
      let completeUrl = '';
      if (this.url) {
        completeUrl = `${this.networkProtocol}://${this.url}`;
      }
      this.$emit('input', completeUrl);
      this.$emit('change', completeUrl);
    },
    handleClick(e) {
      e.stopImmediatePropagation();
      this.showOptions = !this.showOptions;
    },
    optionControl(event) {
      const target = event.target;
      const value = target.getAttribute('data-value');
      if (!value) return;
      this.networkProtocol = value;
      this.showOptions = false;
      this.format();
    },
    handleSelectBlur() {
      this.showOptions = false;
    },
  },
};
</script>

<style lang="scss" scoped>
$fontNormalColor: #263238;
$borderDarkGrey: #ccc;
$height: 34px;
$selectWid: 85px;
$color: #2196f3;
.live-url-input {
  box-sizing: border-box;
  font-size: 0;
  vertical-align: top;

  &-tips {
    font-size: 14px;
    vertical-align: top;
    margin-left: 10px;
  }
}
.select {
  display: inline-block;
  font-size: 14px;
  color: $fontNormalColor;
  width: $selectWid;
  height: $height;
  line-height: $height;
  border: 1px solid $borderDarkGrey;
  border-right: 0;
  vertical-align: top;
  background-color: #fff;
  position: relative;
  cursor: pointer;
  border-radius: 4px 0 0 4px;

  &-title {
    padding: 0 10px;
    >i {
      display: inline-block;
      width: 10px;
      height: 34px;
      padding: 12px 0;
      background: url(./images/icon-dropdown.png) no-repeat;
      background-position: center center;
      float: right;
      &.arrow-rotate {
        transform: rotate(180deg);
        transition: transform .1s ease;
      }
    }
  }

  > ul {
    position: absolute;
    top: $height;
    width: 100%;
    border: 1px solid $borderDarkGrey;
    z-index: 9;

    > li {
      line-height: 1.8;
      background: #fff;
      width: 100%;
      padding: 0 10px;
      border-bottom: 1px solid $borderDarkGrey;

      &:last-child {
        border-bottom: 0;
      }

      &:hover {
        background: $color;
        color: #fff;
      }
    }
  }
}
input {
  display: inline-block;
  width: 340px - $selectWid;
  background-color: #fff;
  border-radius: 0 4px 4px 0;
  margin: 0;
  border: 1px solid $borderDarkGrey;
  line-height: $height;
  font-size: 14px;
  padding: 0 10px;
  height: $height;
  vertical-align: top;
}
</style>
