const defaultoptions = {
  url: undefined,
  method: 'GET',
  qs: undefined,
  body: undefined,
  headers: undefined,
  type: 'json',
  contentType: 'application/json',
  crossOrigin: true,
  credentials: undefined
};

const makeOptions = (url, options) => {
  let thisoptions = {};
  if (!options) {
    if (typeof url === 'string') {
      thisoptions.url = url;
    } else {
      thisoptions = url;
    }
  } else {
    thisoptions = options;
    if (url) {
      thisoptions.url = url;
    }
  }
  thisoptions = Object.assign({}, defaultoptions, thisoptions);

  return thisoptions;
};

const addQs = (url, qs) => {
  let queryString = '';
  let newUrl = url;
  if (qs && typeof qs === 'object') {
    /* eslint no-restricted-syntax: 0 */
    for (const k of Object.keys(qs)) {
      queryString += `&${k}=${encodeURIComponent(qs[k])}`;
    }
    if (queryString.length > 0) {
      const a = url.split('?');
      if (a.length < 2 || a[1].length === 0) {
        queryString = queryString.substring(1);
      }
    }

    if (url.indexOf('?') === -1) {
      newUrl = `${url}?${queryString}`;
    } else {
      newUrl = `${url}${queryString}`;
    }
  }

  return newUrl;
};

/**
 * 网络请求
 * @param {string} url 请求地址
 * @param {object{}} [options] 配置
 * @param {string} options.method 请求方法 GET/POST/PUT...
 * @param {object} options.body 请求体
 * @param {object} options.qs querystring
 * @param {object} options.headers 请求头
 */
const request = (url, options) => {
  const opts = makeOptions(url, options);
  const { method, body, headers, qs, type, contentType } = opts;

  let requestUrl = opts.url;
  if (qs) requestUrl = addQs(requestUrl, qs);

  let header = headers;
  if ((!headers || !headers['content-type']) && contentType) {
    header = Object.assign({}, headers, { 'content-type': contentType });
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: requestUrl,
      method,
      data: body,
      header,
      dataType: type,
      success(response) {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(response);
        }

        resolve(response);
      },
      fail(err) {
        reject(err);
      }
    });
  });
};

export default request;
