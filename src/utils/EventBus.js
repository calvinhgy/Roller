/**
 * 事件总线，实现发布-订阅模式
 */
export class EventBus {
  constructor() {
    this.subscribers = new Map();
    this.nextId = 1;
  }
  
  /**
   * 订阅事件
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @returns {string} 订阅ID
   */
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Map());
    }
    
    const id = this.nextId++;
    this.subscribers.get(event).set(id, callback);
    
    return id.toString();
  }
  
  /**
   * 取消订阅
   * @param {string} subscriptionId - 订阅ID
   */
  unsubscribe(subscriptionId) {
    const id = parseInt(subscriptionId);
    
    for (const [event, callbacks] of this.subscribers.entries()) {
      if (callbacks.has(id)) {
        callbacks.delete(id);
        return;
      }
    }
  }
  
  /**
   * 发布事件
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   */
  publish(event, data) {
    if (!this.subscribers.has(event)) return;
    
    const callbacks = this.subscribers.get(event);
    for (const callback of callbacks.values()) {
      try {
        callback(data);
      } catch (error) {
        console.error(`事件处理器错误 (${event}):`, error);
      }
    }
  }
  
  /**
   * 一次性订阅
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @returns {string} 订阅ID
   */
  once(event, callback) {
    const id = this.subscribe(event, (data) => {
      callback(data);
      this.unsubscribe(id);
    });
    
    return id;
  }
  
  /**
   * 清除特定事件的所有订阅
   * @param {string} event - 事件名称
   */
  clear(event) {
    if (this.subscribers.has(event)) {
      this.subscribers.delete(event);
    }
  }
  
  /**
   * 清除所有事件订阅
   */
  clearAll() {
    this.subscribers.clear();
  }
}
