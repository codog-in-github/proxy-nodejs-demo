let eventCenter = null;
class EventCenter {
  constructor() {
    if(eventCenter) {
      throw new Error('EventCenter is a singleton');
    }
    this.events = {};
  }
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }
  emit(eventName, ...args) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => {
        callback(...args);
      });
    }
  }
  off(eventName, callback) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(
        item => item !== callback
      );
    }
  }
  once(eventName, callback) {
    const onceCallback = (...args) => {
      callback(...args);
      this.off(eventName, onceCallback);
    };
    this.on(eventName, onceCallback);
  }
  clear() {
    this.events = {};
  }
}

module.exports = eventCenter = new EventCenter;
