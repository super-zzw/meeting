export default setWatcher;

/**
 * 建立监听
 */
function setWatcher(page) {
  const { data, watch } = page;
  if (!(data && watch)) throw new Error('找不到watch或data');
  Object.keys(watch).forEach(key => {
    const keyArr = key.split('.');
    const len = keyArr.length;
    let d = data;
    for (let i = 0; i < len - 1; i++) {
      d = data[keyArr[i]];
    }
    observe({
      obj: d,
      key: keyArr[len - 1],
      fn: watch[key].handle || watch[key],
      page,
      deep: watch[key].deep
    });
  });
}

/**
 * 监听data里面的属性，并执行watch对应的函数
 */
function observe({ obj, key, fn, page, deep }) {
  let val = obj[key];
  // 判断是否为深度监听
  if (deep && val !== null && typeof val === 'object') {
    Object.keys(val).forEach(childKey => {
      observe({ obj: val, key: childKey, fn, page, deep });
    });
  }
  Object.defineProperty(obj, key, {
    set(newVal) {
      // 执行相应的监听函数，并把this指向页面
      if (fn instanceof Function) fn.call(page, newVal, val, key);
      val = newVal;
      if (deep) observe({ obj, key, fn, page, deep });
    },
    get() {
      return val;
    }
  });
}
