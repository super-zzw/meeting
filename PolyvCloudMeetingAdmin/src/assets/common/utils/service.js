import axios from 'axios';
import crypto from 'crypto';

class Service {
  constructor(user = {}) {
    this.user = user;
    // if (user.customEnabled !== 'Y' && process.env.NODE_ENV !== 'development') {
    //   this.init();
    // }
    if (user.customEnabled !== 'Y') {
      this.init();
    }
  }

  init() {
    Service.createScript()
      .then(() => {
        this.zhiManager = window.getzhiSDKInstance();
        this.zhiManager.on('load', () => {
          this.zhiManager.initBtnDOM();
        });
        if (this.user) {
          this.setUserinfo();
        }
      });
  }

  show() {
    if (this.zhiManager) {
      this.zhiManager.expand();
    }
  }

  setUserinfo() {
    const user = this.user;
    this.zhiManager.set('userinfo', {
      uname: user.contact,
      tel: user.telephone,
      qq: user.qq,
      email: user.email,
      partnerId: user.userId,
      remark: user.company || user.website
    });
    this.zhiManager.set('groupId', 'b9bf21af5ebb4a8cbf5a7c38fdd26958');
  }

  // 自动向客服发送消息
  async consultingCustomerService(content) {
    const user = this.user;
    const appId = '56f8d8f21e2f4ddca7b64cef794728c8';
    const appKey = '49j2H0903aQk';
    const createTime = Date.now();
    const sign = crypto.createHash('md5').update(appId + appKey + createTime, 'utf-8').digest('hex');
    const params = {
      appId,
      createTime,
      sign
    };
    // 此时打开对话框，无论是否发送失败
    this.zhiManager.expand();
    const { data: { data: { access_token } } } = await axios.get('/proxy/open/platform/getAccessToken.json', { params });
    const paramsForPost = {
      action: 'chat_user_admin_send',
      data: {
        content,
        partnerId: user.userId,
        sysNum: '42a9433fd0b245f6aef3e3f9c01fa25c',
        msgType: 'text'
      },
      access_token,
    };
    // const { data: code } = await axios.post('/proxy/open/platform/api.json', paramsForPost);
    axios.post('/proxy/open/platform/api.json', paramsForPost);
  }

  static createScript() {
    const script = document.createElement('script');
    script.src = 'https://www.sobot.com/chat/frame/js/entrance.js?sysNum=42a9433fd0b245f6aef3e3f9c01fa25c';
    script.setAttribute('class', 'zhiCustomBtn');
    script.setAttribute('id', 'zhichiScript');
    script.setAttribute('data-args', 'manual=true');
    return new Promise((resolve) => {
      document.getElementsByTagName('head')[0].appendChild(script);
      script.onload = () => {
        resolve();
      };
    });
  }
}

export default Service;
