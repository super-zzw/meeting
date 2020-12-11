const filterStr = (str, length = 6) => {
  let len = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    // 单字节加1
    if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
      len++;
    } else {
      len += 2;
    }
    if (len > length) {
      str = str.substring(0, i) + '...';
      return str;
    }
  }
  return str;
};

export default {
  filterStr
};
