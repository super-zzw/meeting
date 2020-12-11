export const preventShake = (() => {
  const commonFun = (fun, time, callback) => {
    if (!fun || typeof fun !== 'function') return () => console.info('必须输入函数参数');
    if (isNaN(parseInt(time))) return () => console.info('时间必须为整数');
    time = parseInt(time);
    return callback(fun, time);
  };
  return {

    // 最后执行
    // debounce :: function->number->function
    debounce: (fun, time) => commonFun(fun, time, (f, t) => {
      let setTime = null;
      return e => {
        if (setTime) clearTimeout(setTime);
        setTime = setTimeout(() => f(e), t);
      };
    }),

    // 一开始就执行
    // immediate :: function->number->function
    immediate: (fun, time) => commonFun(fun, time, (f, t) => {
      let setTime = null, canStart = true;
      return e => {
        if (canStart) {
          canStart = false;
          f(e);
        } else {
          if (setTime) clearTimeout(setTime);
        }
        setTime = setTimeout(() => {
          canStart = true;
        }, t);
      };
    })
  };
})();
