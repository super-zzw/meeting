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

export function getUdid() {
  let udid = localStorage.getItem("udid");
  if (!udid) {
    let s = [];
    let hexDigits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    for (var i = 0; i < 32; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x62), 1);
    }
    udid = s.join("");
    localStorage.setItem("udid", udid);
  }
  return udid;
}

export function setSessionId(sessionId) {
  localStorage.setItem("sessionId", sessionId);
}

export function getSessionId() {
  return localStorage.getItem("sessionId");
}