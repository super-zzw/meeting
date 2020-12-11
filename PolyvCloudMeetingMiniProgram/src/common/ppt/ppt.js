import request from '../utils/request';
import EVENT from './EVENT';
const { HIDE_PRE_BTN, CHANGE_IMG_SRC, HIDE_NEXT_BTN, SHOW_PRE_BTN, SHOW_NEXT_BTN, CHANGE_PAGE } = EVENT;

class PPT {
  constructor({ isShowBtn = true } = {}) {
    this.subFn = [];
    this.changeCurrentPage(0);
    this.isShowBtn = isShowBtn;
  }

  /**
   * ppt初始化
   * @param {String} pptID
   * @param {Boolean} isNew
   */
  init(pptID, isNew = false) {
    if (!pptID) return Promise.reject(new Error('初始化ppt时，pptID为空'));
    let msgUrl = isNew ? `https://doc-2.polyv.net/data/${pptID}.json` : `https://doc.polyv.net/get/oneJson?autoId=${pptID}`;
    msgUrl = msgUrl.replace('https://', 'https://router.polyv.net/proxy/');
    this.changeCurrentPage(0);
    this.isNew = isNew;
    return this.getPPTMsg(msgUrl, isNew);
  }

  /**
   * 请求接口，获取ppt数据
   * @param {String} msgUrl ppt接口地址
   * @param {Boolean} isNew 是否为新ppt
   */
  getPPTMsg(msgUrl, isNew) {
    return request(msgUrl).then(result => {
      const { statusCode, data } = result;
      if (statusCode !== 200) return Promise.reject(new Error('获取ppt数据失败'));
      const pptData = data;
      const getPPTObj = isNew ? pptData.convertFileJson : JSON.parse(pptData.jsonContent);
      this.operation = this.staticPhotoControl(getPPTObj.images);

      return true;

    }).catch(console.error);
  }

  /**
   * 非动画ppt初始化
   * @param {Array} images
   */
  staticPhotoControl(images) {
    if (!images) {
      console.warn('请求ppt接口，返回数据为空');
      return;
    }
    const len = this.total = images.length;
    if (!(images && len > 0)) return;
    let currentPage = 0;
    images = images.reduce((arr, url) => {
      arr.push(PPT.getUrlPrefix(url));
      return arr;
    }, []);

    this.emit({ EVENT: CHANGE_IMG_SRC, src: images[0] });

    const that = this;

    return ({ op, fun, args = [] }) => {
      switch (op) {
        case 'gotoNextStep':
          changePage({ fun });
          break;
        case 'gotoPreviousStep':
          changePage({ fun, dir: -1 });
          break;
        case 'gotoSlide':
          changePage({ fun, page: args[0] });
          break;
      }
    };

    function changePage({ fun, dir = 1, page } = {}) {
      isNaN(parseInt(page)) ?
        currentPage += dir :
        currentPage = parseInt(page);
      if (currentPage < 0) currentPage = len - 1;
      if (currentPage > len - 1) currentPage = 0;
      that.emit({ EVENT: CHANGE_IMG_SRC, src: images[currentPage] });
      that.changeCurrentPage(currentPage);
      if (fun) fun();
    }
  }

  /**
   * 订阅PPT相关事件
   * @param {Function} fn
   */
  subscribe(fn) {
    if (fn instanceof Function) this.subFn.push(fn);
  }

  /**
   * 触发事件
   * @param {Object} data
   */
  emit(data) {
    this.subFn.forEach(fn => fn(data));
  }

  /**
   * 获取完整的地址
   * @param {String} url
   */
  static getUrlPrefix(url) {
    return url.replace(/^[^:]*:/, 'https:');
  }

  // 下一页
  gotNextPage() {
    if (this.operation) this.operation({ op: 'gotoNextStep' });
  }

  // 上一页
  gotPreviousPage() {
    if (this.operation) this.operation({ op: 'gotoPreviousStep' });
  }

  // 跳到指定页面
  gotoPage(page) {
    if (parseInt(this.currentPageNum) !== parseInt(page) && this.operation) {
      this.changeCurrentPage(page);
      this.operation({ op: 'gotoSlide', args: [page] });
      return true;
    }
    return false;
  }

  /**
   * 控制翻页按钮
   * @param {Number} page
   */
  changeCurrentPage(page) {
    this.currentPageNum = page;
    this.emit({ EVENT: CHANGE_PAGE, page });
    if (!this.isShowBtn) return;
    if (page === 0) {
      this.emit({ EVENT: HIDE_PRE_BTN });
    } else if (page === this.total - 1) {
      this.emit({ EVENT: HIDE_NEXT_BTN });
    } else {
      this.emit({ EVENT: SHOW_PRE_BTN });
      this.emit({ EVENT: SHOW_NEXT_BTN });
    }
  }
}

export default PPT;
