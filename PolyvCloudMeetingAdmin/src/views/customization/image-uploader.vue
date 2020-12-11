<template>
  <div class="c-uploader">
    <div class="c-upload-btn">
      <p class="c-upload-btn__plus">+</p>
      <p>上传</p>
      <input
        type="file"
        :name="name"
        class="c-upload__input"
        ref="imgUploader"
        accept="image/jpeg,image/jpg,image/png,image/gif"
      />
    </div>
    <uploader :js-load-call-back="loadRongJs" />
  </div>
</template>

<script>
import Uploader from '@/components/uploader/uploader';

export default {
  name: 'imageUploader',

  components: {
    Uploader
  },

  props: {
    name: String,
  },

  data() {
    return {
      imgCtrl: null
    };
  },

  watch: {
    images(newVal) {
      const uploadImgs = newVal.filter(image => image.status !== 'start');
      if (this.imgCtrl) {
        this.imgCtrl.currentUploadNum = uploadImgs.length;
      }
    }
  },

  methods: {
    // 上传图片回调
    sendImgResult(result) {
      /**
       * const { status, msg, ...imgData } = result;
       * status状态有以下几种
       * 1. start: 开始上传
       * 2. upLoadingSuccess： 上传成功
       * 3. fail：文件错误
       * 4. forbid：图片涉黄
       * 5. upLoadingFail： 上传失败
       */
      // status状态有以下几种
      this.$emit('uploadChanged', { ...result, name: this.name });
    },
    // 实例化上传组件
    loadRongJs() {
      if (!this.imgCtrl && this.$refs.imgUploader) {
        this.imgCtrl = new UpLoadingImgForChat( //eslint-disable-line
          this.$refs.imgUploader,
          {
            isChatRoom: false,
            bucket: 'liveimages',
            reUploadTimes: 5,
            reUploadInterval: 3000,
            isCompareSize: true
          }
        );
        this.imgCtrl.subscript(this.sendImgResult);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.c-upload-btn {
  width: 104px;
  height: 104px;
  border-radius: 8px;
  position: relative;
  color: #999;
  text-align: center;
}

.c-upload-btn__plus {
  font-size: 28px;
  color: #aaa;
  line-height: 36px;
  margin-top: 20px;
}

.c-upload__input {
    display: inline-block;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    cursor: pointer;
    font-size: 0;
}
</style>
