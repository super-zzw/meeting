import EVENT from './eventEmitter';

class Paintbrush extends EVENT {
  constructor(ctx, { width, height, user = { userId: '', nick: '' }, strokeStyle = 'red', pptComponent, currentPaintColor, ctxForDraw } = {}) {
    super();
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.historyData = {};
    this.autoId = '';
    this.togglePaint.status = true;
    this.type = 'line';
    this.user = user;
    this.startCoor = {};
    this.endCoor = {};
    this.isDown = false;
    this.drawID = '';
    this.isMove = false;
    this.strokeStyle = strokeStyle;
    this.textSize = 30;
    this.lineWidth = 3;
    this.inDelete = false;
    this.currentPageNum = 0;
    this.deleteJudgeDis = 20;
    this.initWay();
    // 延时500毫秒，让canvas加载完成
    this.boardLoaded = false;
    this.pptComponent = pptComponent;
    this.currentPaintColor = currentPaintColor;
    if (ctxForDraw) this.ctxForDraw = ctxForDraw;
    setTimeout(() => {
      this.setStyle({ lineWidth: this.lineWidth, strokeStyle: this.strokeStyle });
      this.boardLoaded = true;
      const { historyData } = this.drawFromSocket;
      if (historyData) historyData.forEach(v => this.drawFromSocket(v));
      this.drawFromSocket.historyData = undefined;
    }, 500);
  }

  drawFromSocket(socketData) {
    const {
      data, pageType = 'page',
      isRedraw = true, userId = this.user.userId,
      isFromSocket = false
    } = socketData;
    if (!data) return;
    if (!this.boardLoaded) {
      this.drawFromSocket.historyData = this.drawFromSocket.historyData || [];
      this.drawFromSocket.historyData.push(socketData);
      return;
    }
    const { type, color, ID, pageId, clientWidth, clientHeight, autoId, drawID } = data;
    this.autoId = autoId;
    this.pageId = pageId;
    this.emit('resize', clientWidth, clientHeight);
    const pushObj = this._getPropObj(data);
    const isSelfDraw = isFromSocket && userId === this.user.userId;
    if (!isFromSocket || !(isSelfDraw && this.way[type][drawID])) {
      this.setStyle({ lineWidth: pushObj.size, strokeStyle: color });
      this.drawUseData(type === 'text' ? pushObj : pushObj.points, type);
    }
    if (!isRedraw) return;
    const key = `${pageType}${pageType === 'whiteBoard' ? '' : this.autoId}${pageId}`;
    this.historyData[key] = this.historyData[key] || [];
    drawID ?
      this.historyData[key].push(Object.assign({ userId }, data)) :
      this.historyData[key][parseInt(ID)] = data;
  }

  setStyle({ lineWidth, strokeStyle } = this) {
    if (lineWidth) {
      this.ctx.setLineWidth(lineWidth);
      if (this.ctxForDraw) this.ctxForDraw.setLineWidth(lineWidth);
      this.lineWidth = lineWidth;
    }
    if (strokeStyle) {
      this.ctx.setStrokeStyle(strokeStyle);
      if (this.ctxForDraw) this.ctxForDraw.setStrokeStyle(strokeStyle);
      this.strokeStyle = strokeStyle;
      this.emit('changeColor', strokeStyle);
    }
  }

  drawUseData(data, type) {
    if (!this.togglePaint.status) return;
    switch (type) {
      case 'freeline':
      case 'line':
        this.drawLineUseData(data);
        break;
      case 'straightLine':
        this.drawStraightLineUseData(data);
        break;
      case 'rect':
        this.drawRectUseData(data);
        break;
      case 'circle':
        this.drawCircleUseData(data);
        break;
      case 'circ':
      case 'ellipse':
        this.drawEllipseUseData(data);
        break;
      case 'text':
        this.drawTextUseData(data);
        break;
    }

    this.drawDone();
  }

  drawDone({ status = true, toCreateImg = true } = {}) {
    this.ctx.draw(status);
    if (this.ctxForDraw) this.ctxForDraw.draw(status);

    if (!toCreateImg) return;
    clearTimeout(this.drawDone.timeout);
    this.drawDone.autoId = this.autoId;
    this.drawDone.pageId = this.currentPageNum;
    this.drawDone.timeout = setTimeout(() => {
      this._createCanvasImg();
    }, 200);
  }

  // 将canvas转图片
  _createCanvasImg() {
    const that = this;
    this.ctx.draw(true, wx.canvasToTempFilePath({
      canvasId: 'paintbrush',
      success: function(res) {
        const tempFilePath = res.tempFilePath;
        that.emit('paintImgUrl', { url: tempFilePath, autoId: that.drawDone.autoId, pageId: that.drawDone.pageId });
        that._createCanvasImg.times = 0;
      },
      fail: function(res) {
        console.error(`canvas转图片时报错，错误信息为：${res && typeof res === 'object' && JSON.stringify(res)}`);
        if (!that._createCanvasImg.times) that._createCanvasImg.times = 0;
        that._createCanvasImg.times++;
        if (that._createCanvasImg.times < 3) {
          that._createCanvasImg();
        } else {
          that._createCanvasImg.times = 0;
        }
      }
    }, this.pptComponent));
  }

  drawLineUseData(data) {
    this.ctx.beginPath();
    this.ctx.moveTo(data[0].x, data[0].y);
    const len = data.length;
    for (let i = 1; i < len; i++) {
      const { x, y } = data[i];
      this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();
  }

  drawStraightLineUseData(data) {
    const [start, end] = data;
    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();
  }

  drawRectUseData(data) {
    const [s, e] = data;
    this.ctx.strokeRect(
      s.x,
      s.y,
      e.x - s.x,
      e.y - s.y
    );
  }

  drawCircleUseData(data) {
    const [s, e] = data;
    this.circle({
      sx: s.x,
      sy: s.y,
      ex: e.x,
      ey: e.y,
      ctx: this.ctx
    });
  }

  circle({ sx, sy, ex, ey, ctx }) {
    const cx = (ex + sx) / 2;
    const cy = (ey + sy) / 2;
    const r = Math.sqrt((ex - sx) ** 2 + (ey - sy) ** 2) / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.stroke();
  }

  drawEllipseUseData(data) {
    const [s, e] = data;
    this.ellipse({
      sx: s.x,
      sy: s.y,
      ex: e.x,
      ey: e.y,
      ctx: this.ctx
    });
  }

  ellipse({ sx, sy, ex, ey, ctx }) {
    const cx = (ex + sx) / 2;
    const cy = (ey + sy) / 2;
    const a = Math.abs((ex - sx) / 2);
    const b = Math.abs((ey - sy) / 2);
    ctx.save();
    ctx.translate(cx, cy);
    const r = 1 / 20;
    ctx.beginPath();
    ctx.moveTo(a, 0);
    for (let h = 0; h < 2 * Math.PI; h += r) {
      const tanH = Math.tan(h);
      let x = Math.sqrt(((a ** 2) * (b ** 2)) / ((b ** 2) + ((a * tanH) ** 2)));
      if (h > (Math.PI / 2) && h < (Math.PI * 3 / 2)) x = -x;
      const y = tanH * x;
      ctx.lineTo(x, y);
      ctx.moveTo(x, y);
    }
    ctx.lineTo(a, 0);
    ctx.stroke();
    ctx.restore();
  }

  drawTextUseData(data) {
    const { content, size, points, color } = data;
    this.ctx.fillStyle = color;
    this.ctx.setFontSize(size);
    this.ctx.fillText(content, points[0].x, points[0].y);
  }

  setMeasurement({ width, height, pageId = 0, pageType = 'page', isRedraw = true }) {
    if (!width && !height) return;
    if (!isNaN(parseInt(width))) this.width = width;
    if (!isNaN(parseInt(height))) this.height = height;

    if (isRedraw) {
      this.redraw(pageId || 0, pageType);
    }
  }

  redraw(pageId = this.currentPageNum, pageType = 'page', time) {
    this.redraw.justOne = !this.redraw.timeout;
    if (!this.redraw.timeout) this.toRedraw(pageId, pageType, time);
    clearTimeout(this.redraw.timeout);
    this.redraw.timeout = setTimeout(() => {
      if (!this.redraw.justOne) this.toRedraw(pageId, pageType, time);
      this.redraw.timeout = undefined;
    }, 100);
  }

  toRedraw(pageId = this.currentPageNum, pageType = 'page', time) {
    if (!this.togglePaint.status) return;
    const key = `${pageType}${pageType === 'whiteBoard' ? '' : this.autoId}${pageId}`;
    const hisArr = this.historyData[key];
    this.clear();
    if (hisArr) {
      hisArr.forEach(v => {
        if (time === undefined || (time !== undefined && v.timeStamp !== undefined && time >= v.timeStamp)) {
          this.drawFromSocket({ data: v, pageType, isRedraw: false });
        }
      });
    }
    return true;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.setStyle();
    this.drawDone({ status: false });
  }

  clearHistory(autoId, pageId, ID, drawID) {
    if (autoId === undefined) {
      this.historyData = {};
      this.clear();
      return this;
    }
    if (pageId === undefined) {
      for (const key in this.historyData) {
        if (key.indexOf('page') !== -1) {
          this.historyData[key] = [];
        }
      }
      return this;
    }
    const key = this._getKey(autoId, pageId);
    const hisArr = this.historyData[key];
    if (!hisArr) return this;
    if (drawID !== undefined) ID = hisArr.findIndex(v => v.drawID === drawID);
    if (!isNaN(Number(ID)) && ID < 0) return this;
    ID !== undefined ?
      hisArr.splice(parseInt(ID), 1) :
      (this.historyData[key] = []);
    return this;
  }

  delete({ pageId, ID, pageType = 'page', drawID }) {
    const key = `${pageType}${pageType === 'whiteBoard' ? '' : this.autoId}${pageId}`;
    const arr = this.historyData[key];
    if (!arr) return;
    if (drawID) ID = arr.findIndex(v => v && v.drawID === drawID);
    if (ID < 0) return;
    arr.splice(ID, 1);
    this.redraw(pageId, pageType);
  }

  _getKey(autoId = this.autoId || 0, pageId = this.currentPageNum) {
    const isWhite = parseInt(autoId) === 0;
    return `${isWhite ? 'whiteBoard' : 'page'}${isWhite ? '' : autoId}${pageId}`;
  }

  saveHistory(obj, userId) {
    const { pageId, autoId, drawID, ID } = obj;
    const key = this._getKey(autoId, pageId);
    this.historyData[key] = this.historyData[key] || [];
    drawID ?
      this.historyData[key].push(Object.assign({ userId }, obj)) :
      this.historyData[key][parseInt(ID)] = obj;
  }

  // 控制画板显示
  togglePaint(status) {
    this.togglePaint.status = status;
    this.clear();
    if (status) {
      this.redraw(
        this.pageId,
        parseInt(this.autoId) === 0 ? 'whiteBoard' : 'page'
      );
    }
  }

  // 触摸事件
  handleTouchEvent(type, [{ x, y }]) {
    switch (type) {
      case 'touchstart':
        this.start(x, y);
        break;
      case 'touchmove':
        this.touchMove(x, y);
        break;
      case 'touchend':
        this.done();
        break;
    }
  }

  start(x, y) {
    if (!this.ctxForDraw) return;
    if (this.inDelete) return this.deleteEdit(x, y);
    this.startCoor.x = x;
    this.startCoor.y = y;
    const type = this.type;
    if (type === 'line' || type === 'freeline') this.ctxForDraw.beginPath();
    if (type === 'line' || type === 'freeline' || type === 'straightLine') {
      this.ctxForDraw.moveTo(x, y);
    }
    this.isDown = true;
    this.drawID = `${this.user.userId}_${this.type}_${Date.now()}`;
  }

  touchMove(x, y) {
    if (!this.isDown) return; // 确认是否已经点击
    this.isMove = true;
    this.draw(x, y);
    this.endCoor.x = x;
    this.endCoor.y = y;
  }

  done() {
    if (!this.isDown) return;
    if (!this.isMove) {
      this.isDown = false;
      return;
    }
    this.isMove = false;
    const { type, drawID } = this;
    this.record({
      x: this.startCoor.x,
      y: this.startCoor.y,
      type,
      id: drawID,
      isStart: true,
    });
    if (!(type === 'line' || type === 'freeline')) {
      this.record({
        x: this.endCoor.x,
        y: this.endCoor.y,
        type,
        id: this.drawID
      });
    }
    if (this.ctxForDraw) this.ctxForDraw.clearRect(0, 0, this.width, this.height);
    this.drawUseData(this.way[type][drawID].points, type);
    this.isDown = false;
    this.sendData();
  }

  draw(x, y) {
    if (!this.isDown || !this.boardLoaded) return;
    this.setStyle({ strokeStyle: this.currentPaintColor });
    switch (this.type) {
      case 'freeline':
      case 'line':
        this.drawLine(x, y);
        break;
    }
  }

  drawLine(x, y) {
    const type = this.type;
    const ctx = this.ctxForDraw || this.ctx;
    ctx.lineTo(x, y);
    ctx.stroke();
    this.drawDone();
    ctx.beginPath();
    ctx.moveTo(x, y);
    if (type === 'line' || type === 'freeline') this.record({ x, y, type, id: this.drawID });
  }

  record({ x, y, type, id, isStart = false, content = '', lineWidth = this.lineWidth }) {
    const key = this.way[type];
    key[id] = key[id] || {
      lineWidth,
      strokeStyle: this.strokeStyle,
      points: [],
      content
    };
    isStart ?
      key[id].points.unshift({ x, y }) :
      key[id].points.push({ x, y });
  }

  // 将绘制信息发送出去lineWidth
  sendData() {
    const { type, drawID } = this;
    this.sendData[this.autoId] = this.sendData[this.autoId] || { width: this.width, height: this.height };
    const { height, width } = this.sendData[this.autoId];
    const wayData = Object.assign({}, this.way[type][drawID]);
    if (width !== this.width) {
      const prop = width / this.width;
      const { points } = wayData;
      wayData.points = points.map(({ x, y }) => ({ x: x * prop, y: y * prop }));
      wayData.lineWidth = wayData.lineWidth * prop;
    }
    const data = Object.assign({
      clientHeight: height,
      clientWidth: width,
      color: this.strokeStyle,
      size: type === 'text' ? this.textSize : wayData.lineWidth,
      font: '微软雅黑',
      type: type === 'ellipse' ? 'circ' : type,
      drawID
    }, wayData);
    this.emit('draw', data);
  }

  // 初始化本地绘制数据
  initWay() {
    this.way = { line: {}, straightLine: {}, rect: {}, circle: {}, ellipse: {}, arrowLine: {}, text: {} };
  }

  // 本地执行删除编辑
  deleteEdit(x, y) {
    const historyKey = this._getKey();
    const data = this.historyData[historyKey] || [];
    for (let i = 0, len = data.length; i < len; i++) {
      if (!data[i]) continue;
      const v = this._getPropObj(data[i]);
      const { type, points, drawID } = v;
      const isNear = this.getClickIsNear({ type, points, data: v, dot: { x, y } });
      if (isNear) {
        this.emit('delete', { ID: i, drawID });
        this.delete({
          pageId: this.currentPageNum,
          pageType: parseInt(this.autoId) === 0 ? 'whiteBoard' : 'page',
          drawID
        });
        return;
      }
    }
  }

  // 将数据进行比例转换，使画笔自适应屏幕大小
  _getPropObj(obj) {
    const { points, size, clientWidth } = obj;
    const pushObj = JSON.parse(JSON.stringify(obj));
    const prop = this.width / clientWidth;
    pushObj.size = size * prop;
    pushObj.points = points.map(v => ({
      x: v.x * prop,
      y: v.y * prop
    }));
    return pushObj;
  }

  // 删除状态，获取鼠标点击时，离鼠标最近的画笔
  getClickIsNear({ type, points, dot }) {
    if (type === 'line') return this.getClickIsNearForLine(points, dot);
  }

  getClickIsNearForLine(points, dot) {
    for (let i = 0, len = points.length; i < len; i++) {
      const distance = this._getDotDistance(dot, points[i]);
      if (distance < this.deleteJudgeDis) {
        return true;
      }
    }
    return false;
  }

  // 获取指定两点间的距离
  _getDotDistance(s, e) {
    return Math.sqrt(Math.pow(s.x - e.x, 2) + Math.pow(s.y - e.y, 2));
  }

  // 删除所有
  deleteAll() {
    this.emit('deleteAll');
    this.clear();
    this.clearHistory(this.autoId, this.currentPageNum);
  }

  // 添加自己画的数据
  addSelfData({ data, userId }) {
    const key = this._getKey(data.autoId, data.pageId);
    this.historyData[key] = this.historyData[key] || [];
    this.historyData[key].push(Object.assign({ userId }, data));
  }
}

export default Paintbrush;
