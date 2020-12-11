/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    uid: {
      type: Number,
      value: 0
    },
    minBitrate: {
      type: Number,
      value: 200
    },
    painmode: {
      type: Number,
      value: 1
    },
    maxBitrate: {
      type: Number,
      value: 500
    },
    width: {
      type: Number,
      value: 0
    },
    height: {
      type: Number,
      value: 0
    },
    x: {
      type: Number,
      value: 0
    },
    y: {
      type: Number,
      value: 0
    },
    muted: {
      type: Boolean,
      value: !1
    },
    beauty: {
      type: String,
      value: 0
    },
    aspect: {
      type: String,
      value: '3:4'
    },
    status: {
      type: Number,
      value: 0
    },
    ismute: {
      type: Boolean,
      value: false
    },
    iscam: {
      type: Boolean,
      value: false
    },
    url: {
      type: String,
      value: '',
      observer: function(newVal, oldVal, changedPath) {
        // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
        // 通常 newVal 就是新设置的数据， oldVal 是旧数据
        // console.log(`推流 ${oldVal} to ${newVal}, path: ${changedPath}`);
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    pusherContext: null,
    detached: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * start live pusher via context
     * in most cases you should not call this manually in your page
     * as this will be automatically called in component ready method
     */
    start() {
      console.log('starting pusher');
      this.data.pusherContext.stop();
      if (this.data.detached) {
        console.log('try to start pusher while component already detached');
        return;
      }
      this.data.pusherContext.start();
    },

    /**
     * stop live pusher context
     */
    stop() {
      console.log('stopping pusher');
      this.data.pusherContext.stop();
    },

    /**
     * switch camera direction
     */
    switchCamera() {
      this.data.pusherContext.switchCamera();
    },

    /**
     * 推流状态更新回调
     */
    recorderStateChange: function(e) {
      // console.log(`live-pusher code: ${e.detail.code} - ${e.detail.message}`);
      this.triggerEvent('livePusherStatusChange', e.detail);
    },
    recorderNetChange: function(e) {
      this.triggerEvent('netchange', e.detail);
    }
  },

  /**
   * 组件生命周期
   */
  ready: function() {
    console.log('pusher ready');
    this.data.pusherContext || (this.data.pusherContext = wx.createLivePusherContext(this));
  },
  moved: function() {
    console.log('pusher moved');
  },
  detached: function() {
    console.log('pusher detached');
    // auto stop pusher when detached
    this.data.pusherContext && this.data.pusherContext.stop();
    this.data.detached = true;
  }
});
