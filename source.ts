import FastPriorityQueue from 'fastpriorityqueue'
import wcmatch from 'wildcard-match'

export class Emitify {
  queue: FastPriorityQueue = new FastPriorityQueue((a, b) => {
    return a.priority < b.priority
  });
  
  listenerCount(event: string = '*'): number {
    let count = 0
    this.queue.forEach((obj) => {
      if (wcmatch(event)(obj.event)) count++
    })
    return count
  }

  on(event: string, priority: int, handler: (event: any) => any | null) {
    this.queue.add({
      handler: handler,
      event: event,
      priority: priority,
      condition: (event) => true,
      once: false,
    });
  }

  addListener(event: string, priority: int, handler: (event: any) => any | null) {
    on(event, priority, handler)
  }

  onConditioned(
    event: string,
    priority: int,
    condition: (event: any) => boolean,
    handler: (event: any) => any | null
  ) {
    this.queue.add({
      handler: handler,
      event: event,
      condition: condition,
      priority: priority,
      once: false
    });
  }

  once(event: string, priority: int, handler: (event: any) => any | null) {
    this.queue.add({
      handler: handler,
      event: event,
      condition: (event) => true,
      priority: priority,
      once: true
    });
  }

  onceConditioned(
    event: string,
    priority: int,
    condition: (event: any) => boolean,
    handler: (event: any) => any | null
  ) {
    this.queue.add({
      handler: handler,
      event: event,
      condition: condition,
      priority: priority,
      once: true
    });
  }

  off(
    event: string,
    priority: int,
    handler: (event: any) => any | null,
    condition: (event: any) => boolean = (event) => true,
    once: boolean = false
  ) {
    this.queue.remove({
      event: event,
      priority: priority,
      handler: handler,
      condition: condition,
      once: once
    });
  }

  removeListener(
    event: string,
    priority: int,
    handler: (event: any) => any | null,
    condition: (event: any) => boolean = (event) => true,
    once: boolean = false
  ) {
    off(event, priority, handler, condition, once)
  }

  offAll(event: string) {
    this.queue.removeMany((obj) => wcmatch(event)(obj.event))
  }

  removeAllListeners(event: string) {
    offAll(event)
  }

  emit(event: string, data: any) {
    const frozenQueue = this.queue.clone()
    let currentEventObj = data
    currentEventObj._eventName = event
    
    while (!frozenQueue.isEmpty()) {
      const eventHandler = frozenQueue.poll()
      const isMatch = wcmatch(eventHandler.event)
      if (isMatch(event) && eventHandler.condition(currentEventObj)) {
        currentEventObj = eventHandler.handler(currentEventObj)
      }

      if (currentEventObj == null) return;
    }
    this.queue.removeMany(
      (obj) =>
        (wcmatch(obj.event)(event)) &&
        obj.once &&
        (obj.condition == undefined || obj.condition(currentEventObj))
    );
  }
}
