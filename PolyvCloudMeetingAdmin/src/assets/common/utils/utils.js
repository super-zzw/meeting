// 是否为邮箱
export function isEmail(val) {
  let temp = /^[\w-]+(?:\.[\w-]+)*@[\w-]+(?:\.[\w-]+)*\.[a-zA-Z]{2,}$/.test(val);
  if (temp) {
    temp = val.replace('@', '.').split('.');
    for (let i = temp.length - 2; i >= 0; i--) {
      if (/^[-_]/.test(temp[i]) || /[_-]$/.test(temp[i])) {
        return false;
      }
    }
  } else {
    return false;
  }
  return true;
}

export function imagePrefixUrlMethod(valueStr) {
  if (typeof valueStr !== 'string' || valueStr.trim() === '') {
    return '';
  }

  if (valueStr.indexOf('live.polyv.net') > -1 || valueStr.indexOf('static.live.polyv.net') > -1 ||
   valueStr.indexOf('livestatic.videocc.net') > -1) {
    if (/^http/.test(valueStr)) {
      if (valueStr.indexOf('.net') > -1) {
        const tempStr = valueStr.split('.net')[1];
        return `//livestatic.videocc.net${tempStr}`;
      }
    } else if (!/^\/\//.test(valueStr)) {
      return `//livestatic.videocc.net${valueStr}`;
    }
  } else if (/^\/\//.test(valueStr)) { // 双斜杠开头的路径不做处理
    return valueStr;
  } else if (/^\//.test(valueStr)) { // 解决相对路径的图片地址
    return `//livestatic.videocc.net${valueStr}`;
  } else if (/^(?!\/)/.test(valueStr) && !/^http/.test(valueStr)) { // 解决从点播获取的路径
    // //img.videocc.net/uimage/userId的第一位/ + url
    return `//img.videocc.net/uimage/${valueStr.slice(0, 1)}/${valueStr}`;
  }
  return valueStr;
}

// 日期格式化
export function formatDate(millsTime) {
  const day = new Date(millsTime);
  const Year = day.getFullYear();
  let Month = day.getMonth() + 1;
  let Day = day.getDate();
  let Hour = day.getHours();
  let Minute = day.getMinutes();

  if (Month < 10) {
    Month = `0${Month}`;
  }

  if (Day < 10) {
    Day = `0${Day}`;
  }

  if (Hour < 10) {
    Hour = `0${Hour}`;
  }

  if (Minute < 10) {
    Minute = `0${Minute}`;
  }

  return `${Year}/${Month}/${Day} ${Hour}:${Minute}`;
}

// 时间格式化
export function formateTime(time) {
  if (typeof time !== 'number') return '00:00:00';
  const _time = Math.ceil(time);
  let h = '00';
  let m = '00';
  let s = '00';
  if (_time < 10) return `00:00:0${_time}`;
  if (_time < 60) return `00:00:${_time}`;
  if (_time < 3600) {
    m = Math.floor(_time / 60);
    s = Math.floor(_time % 60);
    if (m < 10) m = `0${m}`;
    if (s < 10) s = `0${s}`;
    return `00:${m}:${s}`;
  }
  h = Math.floor(_time / 3600);
  time = _time % 3600;
  if (_time > 60 && _time < 3600) {
    m = Math.floor(_time / 60);
    s = Math.floor(_time % 60);
  }
  if (h < 10) h = `0${h}`;
  if (m < 10) m = `0${m}`;
  if (s < 10) s = `0${s}`;
  return `${h}:${m}:${s}`;
}

export function liveStatusToTxt(status) {
  let result;
  switch (status) {
    case 1:
      result = '直播中';
      break;
    case 2:
      result = '暂无直播';
      break;
    case 3:
      result = '回放中';
      break;
    case 4:
      result = '测试中';
      break;
    default:
      result = '已禁播';
  }

  return result;
}
