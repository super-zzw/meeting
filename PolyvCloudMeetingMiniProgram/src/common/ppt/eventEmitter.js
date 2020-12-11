export default class {
  constructor() {
    this.events = {};
  }
  on(event, fn) {
    if (!(typeof event === 'string' && fn instanceof Function)) return;
    this.events[event] = this.events[event] || [];
    this.events[event].push(fn);
    return this;
  }
  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach(fn => {
      fn(...args);
    });
  }
  off(event, fn) {
    if (event && fn) {
      const fns = this.events[event] || [];
      const index = fns.indexOf(fn);
      if (index > -1) {
        fns.splice(index, 1);
      }
    } else {
      this.events = {};
    }
  }
}
