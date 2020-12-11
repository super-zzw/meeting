/* eslint-disable no-unused-vars */
import setWatcher from '../../common/utils/watch';
import Paintbrush from '../../common/ppt/paintbrush';
import PPT from '../../common/ppt/ppt';
import SocketEvent from '../../common/ppt/socketEvent';
import PPT_EVENT from '../../common/ppt/EVENT';
const { HIDE_PRE_BTN, CHANGE_IMG_SRC, HIDE_NEXT_BTN, SHOW_PRE_BTN, SHOW_NEXT_BTN, SHOW_BOARD, HIDE_BOARD, PPT_RELOAD, CHANGE_PAGE, CONTROL_CAM } = PPT_EVENT;
import store from '../../store/index';
import { preventShake } from '../../common/utils/common';
import regeneratorRuntime from '../../common/regenerator-runtime/runtime-module';

// const resize = ({ w, h, $this, toReSetPaint, isRedraw }) => {
//   let paintProp = w && h ? w / h : undefined;
//   const { whiteProp } = $this.properties;
//   const isFixedProp = $this.data.isBoard && whiteProp;
//   if (isFixedProp) paintProp = whiteProp;
//   const { width, height, style } = $this.getSize(paintProp, isFixedProp);
//   if ($this.data.canvasStyle !== style || toReSetPaint) {
//     $this.setData({ canvasStyle: style });
//     $this.paintCtrl.setMeasurement({
//       width,
//       height,
//       pageId: $this.data.isBoard ? 0 : (($this.pptCtrl && $this.pptCtrl.currentPageNum) || 0),
//       pageType: $this.socketEvent.pageType,
//       isRedraw
//     });
//     $this.socketEvent.happenResize = true;
//   }
// };
// const resizeWithShape = preventShake.debounce(resize, 100);
Component({
  properties: {
    width: {
      type: Number,
      value: 750
    },
    height: {
      type: Number,
      value: 750
    },
    pptSize: {
      type: Object,
      observer(size) {
        const { width, height } = this.pptSize = size;
        if (width && height && !this.paintCtrl) {
          this.init({ width, height });
        }
      }
    },
    chatData: {
      type: Object,
      observer(newVal) {
        this.chatData = newVal;
        if (this.socketEvent) this.socketEvent.setChatData(newVal);
      }
    },
    videoId: {
      type: String,
      observer(newVal) {
        // this.setData({ log: 'videoId........' });
        if (this.socketEvent) this.socketEvent.setVideoId(newVal);
      }
    },
    vidCurrentTime: {
      type: Number,
      observer(time) {
        this.setData({ vidTime: time });
      }
    },
    // ppt延时时间
    pptDelayTime: {
      type: Number,
      value: 3000,
      observer(newTime) {
        if (this.socketEvent && parseInt(newTime) >= 0) {
          this.socketEvent.delayTime = parseInt(newTime);
        }
      }
    },
    skin: {
      type: String,
      value: 'black',
      observer(val) {
        if (val !== 'black' && val !== 'white') {
          this.setData({ skin: 'black' });
        }
      }
    },
    // 控制画笔的显示和隐藏，ture表示显示，false表示隐藏，默认为true
    togglePaint: {
      type: Boolean,
      value: true,
      observer(newVal) {
        if (this.paintCtrl) this.paintCtrl.togglePaint(newVal);
      }
    },
    // 控制是否可以绘制画板
    canEditPaint: {
      type: Boolean,
      value: true
    },
    // 是否可以控制ppt
    canControlPPT: {
      type: Boolean,
      value: true
    },
    // 控制是否进入删除状态
    toDeletePaint: {
      type: Boolean,
      value: false,
      observer(newVal) {
        if (this.paintCtrl) this.paintCtrl.inDelete = newVal;
      }
    },
    // 用户信息
    user: {
      type: Object,
      value: { userId: '', nick: '' },
      observer(user) {
        if (this.paintCtrl) this.paintCtrl.user = user;
        if (this.socketEvent) this.socketEvent.user = user;
      }
    },
    // 画板背景颜色
    paintBackColor: {
      type: String,
      value: '#fff',
      observer(color) {
        if (color && this.data.pptBackColor) {
          this.setData({ pptBackColor: `background-color:${color};` });
        }
      }
    },
    pptBackColorFromProp: {
      type: String,
    },
    // 写死白板比例
    whiteProp: {
      type: Number,
    },
    // 画笔颜色
    currentPaintColor: {
      type: String,
      value: 'red',
      observer(color) {
        if (this.paintCtrl) {
          this.paintCtrl.setStyle({ strokeStyle: color });
          this.paintCtrl.currentPaintColor = color;
        }
      }
    }
  },
  data: {
    isLoading: false,
    imgUrl: '',
    isShowPageBtn: false,
    isShowPreBtn: false,
    isShowNextBtn: true,
    paintSize: {
      width: '100%',
      height: '100%'
    },
    canvasStyle: 'position:absolute;left:0;top:0;height:100%;width:100%;',
    paintCtrl: null,
    isBoard: false,
    log: 'test',
    vidTime: 0,
    pptDomStyle: {
      width: '100%',
      height: '100%',
      top: 0,
      left: 0
    },
    pptBackColor: '', // 控制ppt背景颜色
    pptStyle: '', // ppt样式
    paintImgUrl: '', // canvas转图片
    showPaintImg: false, // 是否显示画板图片
  },

  lifetimes: {
    created() {

    },
    attached() {
      this.unsub = store.get({
        'main.chat': (chat) => {
          this.chat = chat;
          if (!chat) return;
          if (this.socketEvent) this.socketEvent.setChat(this.chat);
        }
      });

      this.watch = {
        imgUrl() {
          this.setData({ isLoading: true });
          this.loadingTimeout = setTimeout(() => {
            this.setData({ isLoading: false });
          }, 5000);
        }
      };
      setWatcher(this);
    },
    detached() {
      this.unsub();
    }
  },

  // pageLifetimes: {
  //   resize(size) {
  //     // 页面尺寸变化
  //   }
  // },
  methods: {
    init({ width, height, sliceIdData } = this.data) {
      this.setData({ width, height });
      this.pptCtrl = new PPT();
      this.pptCtrl.subscribe(this.pptEvent.bind(this));

      const ctx = wx.createCanvasContext('paintbrush', this);
      const { user, currentPaintColor } = this.properties;
      const options = {
        width,
        height,
        user,
        strokeStyle: currentPaintColor,
        pptComponent: this,
        currentPaintColor,
      };
      if (this.properties.canEditPaint) {
        const ctxForDraw = wx.createCanvasContext('paintbrushForDraw', this);
        options.ctxForDraw = ctxForDraw;
      }
      this.paintCtrl = new Paintbrush(ctx, options);
      // this.paintCtrl.subResize((width, height) => this.resize(width, height));
      // let t = 0;
      // setInterval(() => {
      //   t += 1000;
      //   console.log(t);
      // }, 1000);
      this.socketEvent = new SocketEvent({
        chat: this.chat,
        pptCtrl: this.pptCtrl,
        paintCtrl: this.paintCtrl,
        delayTime: this.pptDelayTime,
        user: this.properties.user,
        getCurrentTime: callback => callback({ time: this.data.vidTime * 1000 || 0 })
        // getCurrentTime: callback => callback({ time: t || 0 })
      });
      if (sliceIdData) {
        this.socketEvent._setLiveStatus(true);
        this.socketEvent.onSliceId(sliceIdData);
      }
      this.socketEvent.subscribe(({ EVENT, data, page, isCamClosed }) => {
        switch (EVENT) {
          case SHOW_BOARD:
            this.showBoard();
            break;
          case HIDE_BOARD:
            this.hideBoard();
            break;
          case 'log':
            // this.setData({ log: data });
            break;
          case PPT_RELOAD:
            this.reload(data);
            break;
          case CHANGE_PAGE:
            if (this.paintCtrl) this.paintCtrl.currentPageNum = page;
            break;
          // 控制摄像头
          case CONTROL_CAM:
            this.triggerEvent(CONTROL_CAM, isCamClosed);
            break;
        }
      });
      this.listenPaintEvent();
    },

    // 监听画板相关事件
    listenPaintEvent() {
      // 发送绘制信息
      const emitMsg = (data, EVENT, emitMode = 0) => {
        if (!(
          (this.properties.canEditPaint || data.type === 'alldelete') &&
          this.socketEvent &&
          this.socketEvent.isLive
        )) return;
        const { currentAutoId, docType, roomId } = this.socketEvent;
        const sendData = {
          EVENT,
          data: Object.assign({
            autoId: currentAutoId || 0,
            pageId: this.pptCtrl.currentPageNum,
            docType,
          }, data),
          roomId,
          userId: this.properties.user.userId,
          emitMode
        };
        if (this.paintCtrl && EVENT === 'onSliceDraw') this.paintCtrl.addSelfData(sendData);
        this.triggerEvent('socketevent', sendData, {});
      };
      this.paintCtrl
        .on('resize', (width, height) => {
          if (width / height === this.data.prop) return;
          this.resize({ w: width, h: height });
        })
        .on('draw', d => {
          d.pointscount = d.points.length;
          emitMsg(d, 'onSliceDraw', 1);
        })
        .on('delete', ({ ID, drawID }) => {
          const data = { ID, drawID, type: 'delete' };
          emitMsg(data, 'onSliceControl', 1);
        })
        .on('deleteAll', () => {
          emitMsg({ type: 'alldelete' }, 'onSliceControl', 1);
        })
        .on('changeColor', color => {
          this.triggerEvent('changeColor', color);
        })
        .on('paintImgUrl', ({ url, autoId, pageId }) => {
          if (this.data.paintImgUrl) {
            this.paintImgList = this.paintImgList || {};
            this.paintImgList[`autoId_${autoId}_pageId_${pageId}`] = this.data.paintImgUrl;
          }
          this.setData({ paintImgUrl: url });
        })
        .on('log', msg => {
          this.setData({ log: msg });
        });
    },

    reload(data) {
      this.pptCtrl = undefined;
      this.paintCtrl = undefined;
      this.socketEvent = undefined;
      this.init({
        width: this.pptSize.width,
        height: this.pptSize.height,
        sliceIdData: data
      });
    },
    /**
     * 图片加载完成
     * @param {Object} e
     */
    handleImgLoad(e) {
      this.setData({ isLoading: false });
      clearTimeout(this.loadingTimeout);
      const { width, height } = e.detail;
      this.resize({ w: width, h: height });
    },
    resize({ w, h, isRedraw = true, toReSetPaint = false } = {}) {
      let paintProp = w && h ? w / h : undefined;
      const { whiteProp } = this.properties;
      const isFixedProp = this.data.isBoard && whiteProp;
      if (isFixedProp) paintProp = whiteProp;
      const { width, height, style } = this.getSize(paintProp, isFixedProp);
      if (this.data.canvasStyle !== style || toReSetPaint) {
        this.setData({ canvasStyle: style });
        this.paintCtrl.setMeasurement({
          width,
          height,
          pageId: this.data.isBoard ? 0 : ((this.pptCtrl && this.pptCtrl.currentPageNum) || 0),
          pageType: this.socketEvent.pageType,
          isRedraw
        });
        this.socketEvent.happenResize = true;
      }
    },
    // 点击ppt，显示翻页按钮
    handleClickPPT() {
      if (!(this.pptCtrl && this.pptCtrl.isShowBtn) || this.data.isBoard) return;
      this.setData({ isShowPageBtn: true });
      clearInterval(this.pageBtnTimeout);
      this.pageBtnTimeout = setTimeout(() => {
        this.setData({ isShowPageBtn: false });
      }, 2000);
    },
    /**
     * 根据比例获取页面宽高
     * @param {Number} p 比例
     */
    getSize(p, isFixedProp = false) {
      const { pptDomStyle: { width: pptW, height: pptH }, width: w, height: h } = this.data;
      let width = Number(pptW.replace('%', '')) / 100 * w;
      let height = Number(pptH.replace('%', '')) / 100 * h;
      const WHProp = width / height;
      const prop = p || this.data.prop || (4 / 3);
      this.setData({ prop });
      if (!isFixedProp) {
        if (WHProp > prop) {
          width = prop * height;
        } else if (WHProp < prop) {
          height = width / prop;
        }
      } else {
        if (width < height) {
          height = width / prop;
        } else {
          width = height * prop;
        }
      }
      const style = `position:absolute;left:50%;top:50%;height:${height}px;width:${width}px;margin-left:-${width / 2}px;margin-top:-${height / 2}px;`;
      return { width, height, style };
    },
    /**
     * 显示白板
     * @param {Number} p
     */
    showBoard() {
      this.setData({ isBoard: true, pptBackColor: `background-color:${this.properties.paintBackColor};`, pptStyle: 'display:none;' });
      this.triggerEvent('toggleWhiteBoard', true);
      this.resize();
    },
    // 隐藏白板
    hideBoard() {
      this.setData({ isBoard: false, pptBackColor: '', pptStyle: '' });
      this.triggerEvent('toggleWhiteBoard', false);
    },
    /**
     * 获取元素尺寸
     * @param {String} select
     */
    getDomSize(select) {
      const that = this;
      const query = wx.createSelectorQuery().in(this);
      query.select(select).boundingClientRect();
      query.selectViewport().scrollOffset();
      return new Promise((resolve, reject) => {
        query.exec(function(res) {
          if (res && res.length && res[0] !== null && typeof res[0] === 'object') {
            const { width, height, top, left } = res[0];
            parseInt(width) === 0 ?
              setTimeout(() => resolve(that.getDomSize(select)), 500) :
              resolve({ width, height, top, left });
          } else {
            reject(new Error('查找不到尺寸'));
          }
        });
      });
    },
    /**
     * ppt相关事件
     * @param {Object} data
     */
    pptEvent({ EVENT, src, page }) {
      switch (EVENT) {
        case CHANGE_IMG_SRC:
          this.setData({ imgUrl: src });
          break;
        case HIDE_PRE_BTN:
          this.setData({ isShowPreBtn: false });
          break;
        case SHOW_PRE_BTN:
          this.setData({ isShowPreBtn: true });
          break;
        case HIDE_NEXT_BTN:
          this.setData({ isShowNextBtn: false });
          break;
        case SHOW_NEXT_BTN:
          this.setData({ isShowNextBtn: true });
          break;
        case CHANGE_PAGE:
          this.pptChangePage(page);
          break;
      }
    },
    // ppt页数发生变化
    pptChangePage(page) {
      if (this.paintCtrl) this.paintCtrl.currentPageNum = page;
      const paintImgUrl = this.paintImgList && this.paintImgList[`autoId_${this.socketEvent.currentAutoId}_pageId_${this.pptCtrl.currentPageNum}`];
      if (paintImgUrl) this.setData({ paintImgUrl });
    },
    // 点击上一页
    handleTapPreBtn() {
      if (this.pptCtrl) this.pptCtrl.gotPreviousPage();
    },
    // 点击下一页
    handleTapNextBtn() {
      if (this.pptCtrl) this.pptCtrl.gotNextPage();
    },
    // 回到播放当前页
    toCurrentTeacherOp() {
      if (this.socketEvent) this.socketEvent.toCurrentTeacherOp();
    },
    // 触摸事件
    async handleTouchEvent(e) {
      const { type, changedTouches, touches } = e;
      const getTouchSite = async () => {
        const { left, top } = await this.getDomSize('#paintbrush');
        return changedTouches.map(({ pageX, pageY }) =>
          ({ x: pageX - left, y: pageY - top })
        );
      };
      // 白板缩放
      let { inZoom } = this.handleTouchEvent;
      if (type === 'touchstart') {
        const len = touches.length;
        if (len === 1) this._toBackSizeWhenClick(e);
        inZoom = this.handleTouchEvent.inZoom = len > 1;
      }
      if (inZoom) {
        this._zoomScreen(e);
        return;
      }
      const { canEditPaint, canControlPPT } = this.properties;
      if (canEditPaint) {
        // 绘制画笔
        if (!(this.socketEvent && this.socketEvent.isLive)) return;
        const touchSite = await getTouchSite();
        if (touchSite.length === 0) return;
        this.paintCtrl && this.paintCtrl.handleTouchEvent(
          e.type, touchSite
        );
      } else if (canControlPPT) {
        // 操作ppt
        this._touchToChangePPTPage(e);
      }
    },
    _zoomScreen({ type, touches }) {
      const touchStart = async () => {
        this._zoomScreen.preDots = touches;
        // 获取双指中间点百分比
        const { x, y } = this._zoomScreen._startMiddle = this._zoomScreen._preMiddleDot = this._getMiddleDot(touches);
        const { top, left } = this.data.pptDomStyle;
        const { width, height } = await this.getDomSize('#plvPPTDom');
        this._zoomScreen.middleProp = {
          x: (x - left) / width,
          y: (y - top) / height
        };
      };

      // 缩放
      switch (type) {
        case 'touchstart':
          if (touches.length > 1) {
            touchStart();
          }
          break;
        case 'touchmove':
          if (touches.length > 1) {
            this.setData({ showPaintImg: true });
            this._toZoomPPT.isMove = true;
            this._toZoomPPT(this._zoomScreen.preDots, touches);
          }
          break;
        case 'touchcancel':
        case 'touchend':
          this._zoomScreen.endProp = this._zoomScreen.preProp;
          this._zoomScreen.middleProp = undefined;
          this._zoomScreen.preMid = undefined;
          this.setData({ showPaintImg: false });
          if (this._toZoomPPT.isMove) {
            this.resize({ isRedraw: true, toReSetPaint: true });
          }
          this._toZoomPPT.isMove = false;
          break;
      }
    },

    // 缩放ppt区域
    _toZoomPPT(s, e) {
      if (!this._zoomScreen.middleProp) return;
      const endDis = this._getDistance(e);
      const prop = endDis / this._getDistance(s);
      let p = (this._zoomScreen.endProp || 1) * prop;
      if (p < 1) {
        this._zoomScreen.preProp = undefined;
        return;
      }
      if (p > 2) p = 2;
      const scale = `${Number(p * 100).toFixed(2)}%`;
      const em = this._getMiddleDot(e);
      const sm = this._zoomScreen._preMiddleDot;
      this._zoomScreen._preMiddleDot = em;
      this._zoomScreen.preProp = p;
      const { width, height } = this.data;
      const { x: midX, y: midY } = this._zoomScreen.middleProp;
      const { x: sx, y: sy } = this._zoomScreen._startMiddle;
      const midMoveY = sy + (em.y - sm.y);
      const midMoveX = sx + (em.x - sm.x);
      const zoomedSize = { h: height * p, w: width * p };
      const moveT = zoomedSize.h * midY - midMoveY;
      const moveL = zoomedSize.w * midX - midMoveX;
      this._zoomScreen._startMiddle = { x: midMoveX, y: midMoveY };
      this.setData({
        pptDomStyle: {
          width: scale,
          height: scale,
          top: -moveT,
          left: -moveL
        }
      });
      const { showPaintImg, paintImgUrl } = this.data;
      this.resize({ isRedraw: !(showPaintImg && paintImgUrl) });
    },

    // 双击返回原尺寸
    _toBackSizeWhenClick({ touches: [dot] }) {
      const start = this._toBackSizeWhenClick.clicked;
      if (start) {
        clearTimeout(this._toBackSizeWhenClick.timeout);
        const distance = this._getDistance([start, dot]);
        this._toBackSizeWhenClick.clicked = false;
        if (distance < 15) this._toBackSize();
      } else {
        this._toBackSizeWhenClick.clicked = dot;
        this._toBackSizeWhenClick.timeout = setTimeout(() => {
          this._toBackSizeWhenClick.clicked = false;
        }, 300);
      }
    },
    _toBackSize() {
      this.setData({
        pptDomStyle: {
          width: '100%',
          height: '100%',
          top: 0,
          left: 0
        }
      });
      this._zoomScreen.endProp = 1;
      this.resize();
    },
    _getMiddleDot([s, e]) {
      return { x: (s.pageX + e.pageX) / 2, y: (s.pageY + e.pageY) / 2 };
    },
    // 获取两点间距离
    _getDistance([p1, p2]) {
      const x = p2.pageX - p1.pageX;
      const y = p2.pageY - p1.pageY;
      return Math.sqrt((x * x) + (y * y));
    },
    _touchToChangePPTPage({ type, changedTouches: [{ pageX } = {}] }) {
      if (!this.pptCtrl || this.data.isBoard || pageX === undefined) return;
      const controlPPT = () => {
        const dir = pageX - this._touchToChangePPTPage.startX;
        const TOUCH_SIZE = 100;
        if (Math.abs(dir) > TOUCH_SIZE) {
          dir > 0 ?
            this.pptCtrl.gotPreviousPage() :
            this.pptCtrl.gotNextPage();
          if (this.paintCtrl) {
            this.paintCtrl.clear();
            this.paintCtrl.redraw(this.pptCtrl.currentPageNum);
          }
          this._sendChangePageMsg();
        }
      };
      switch (type) {
        case 'touchstart':
          this._touchToChangePPTPage.startX = pageX;
          break;
        case 'touchcancel':
        case 'touchend':
          controlPPT();
          break;
      }
    },
    // 跳页
    changePage(num) {
      num = parseInt(num);
      if (!this.pptCtrl || isNaN(num)) return;
      const result = this.pptCtrl.gotoPage(num < 0 ? 0 : num);
      if (!result) return;
      this._sendChangePageMsg();
    },
    // 发送操作ppt的数据到聊天室
    _sendChangePageMsg() {
      if (!(
        this.properties.canControlPPT &&
        this.socketEvent &&
        this.socketEvent.isLive
      )) return;
      const { currentAutoId, docType, roomId } = this.socketEvent;
      const sendData = {
        EVENT: 'onSliceControl',
        roomId,
        userId: this.properties.user.userId,
        data: {
          autoId: currentAutoId || 0,
          pageId: this.pptCtrl.currentPageNum,
          docType,
          type: 'switchpage'
        }
      };
      this.triggerEvent('socketevent', sendData, {});
    },
    // 删除所有画笔
    toDeleteAllPaint() {
      if (this.paintCtrl) this.paintCtrl.deleteAll();
    },
    // 老师切换ppt
    changePPT(data) {
      const sendAutoId = parseInt(data.autoId);
      // 获取上次ppt的页数
      if (this.changePPT.pptMsg) {
        const { autoId, pageId } = this.changePPT.pptMsg;
        if (parseInt(autoId) === sendAutoId) {
          data.pageId = pageId;
        }
      }
      // 切白板时记录下ppt信息
      if (sendAutoId === 0) this.changePPT.pptMsg = { autoId: this.socketEvent.currentAutoId, pageId: this.pptCtrl.currentPageNum };
      // 开始切换
      if (this.socketEvent) this.socketEvent.onSliceOpen(data);
    },
    // 重新设置ppt区域尺寸
    resetPPTSize(width, height) {
      if (!(width && height)) return;
      this.setData({ width, height, pptSize: { width, height } });
      this._toBackSize();
    },
    // 销毁
    destroy() {
      if (this.socketEvent) this.socketEvent.destroy();
      if (this.paintCtrl) this.paintCtrl.off();
    }
  }
});
