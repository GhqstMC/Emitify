"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fastpriorityqueue = _interopRequireDefault(require("fastpriorityqueue"));

var _wildcardMatch = _interopRequireDefault(require("wildcard-match"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Emitify {
  constructor() {
    _defineProperty(this, "queue", new _fastpriorityqueue.default((a, b) => {
      return a.priority < b.priority;
    }));
  }

  listenerCount(event = '*') {
    let count = 0;
    this.queue.forEach(obj => {
      if ((0, _wildcardMatch.default)(event)(obj.event)) count++;
    });
    return count;
  }

  on(event, priority, handler) {
    this.queue.add({
      handler: handler,
      event: event,
      priority: priority,
      condition: event => true,
      once: false
    });
  }

  addListener(event, priority, handler) {
    on(event, priority, handler);
  }

  onConditioned(event, priority, condition, handler) {
    this.queue.add({
      handler: handler,
      event: event,
      condition: condition,
      priority: priority,
      once: false
    });
  }

  once(event, priority, handler) {
    this.queue.add({
      handler: handler,
      event: event,
      condition: event => true,
      priority: priority,
      once: true
    });
  }

  onceConditioned(event, priority, condition, handler) {
    this.queue.add({
      handler: handler,
      event: event,
      condition: condition,
      priority: priority,
      once: true
    });
  }

  off(event, priority, handler, condition = event => true, once = false) {
    this.queue.remove({
      event: event,
      priority: priority,
      handler: handler,
      condition: condition,
      once: once
    });
  }

  removeListener(event, priority, handler, condition = event => true, once = false) {
    off(event, priority, handler, condition, once);
  }

  offAll(event) {
    this.queue.removeMany(obj => (0, _wildcardMatch.default)(event)(obj.event));
  }

  removeAllListeners(event) {
    offAll(event);
  }

  emit(event, data) {
    const frozenQueue = this.queue.clone();
    let currentEventObj = data;
    currentEventObj._eventName = event;

    while (!frozenQueue.isEmpty()) {
      const eventHandler = frozenQueue.poll();
      const isMatch = (0, _wildcardMatch.default)(eventHandler.event);

      if (isMatch(event) && eventHandler.condition(currentEventObj)) {
        currentEventObj = eventHandler.handler(currentEventObj);
      }

      if (currentEventObj == null) return;
    }

    this.queue.removeMany(obj => (0, _wildcardMatch.default)(obj.event)(event) && obj.once && (obj.condition == undefined || obj.condition(currentEventObj)));
  }

}

exports.default = Emitify;
