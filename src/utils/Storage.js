/**
 * 存储管理器，处理游戏数据持久化
 */
export class StorageManager {
  /**
   * 创建存储管理器
   * @param {string} namespace - 存储命名空间
   */
  constructor(namespace) {
    this.namespace = namespace;
    this.cache = new Map();
    this.initialized = false;
    
    // 初始化缓存
    this.init();
  }
  
  /**
   * 初始化存储
   */
  init() {
    try {
      // 检查localStorage是否可用
      if (typeof localStorage === 'undefined') {
        console.warn('localStorage不可用，将使用内存存储');
        this.initialized = true;
        return;
      }
      
      // 加载所有已存储的数据到缓存
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key.startsWith(`${this.namespace}.`)) {
          const actualKey = key.substring(this.namespace.length + 1);
          try {
            const value = JSON.parse(localStorage.getItem(key));
            this.cache.set(actualKey, value);
          } catch (e) {
            console.error(`解析存储数据失败: ${key}`, e);
          }
        }
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('初始化存储失败:', error);
      this.initialized = true; // 即使失败也标记为已初始化，使用内存存储
    }
  }
  
  /**
   * 保存数据
   * @param {string} key - 数据键
   * @param {*} value - 数据值
   * @returns {Promise<boolean>} 保存成功返回true
   */
  async save(key, value) {
    if (!this.initialized) {
      await this.waitForInitialization();
    }
    
    try {
      // 更新缓存
      this.cache.set(key, value);
      
      // 尝试保存到localStorage
      if (typeof localStorage !== 'undefined') {
        const storageKey = `${this.namespace}.${key}`;
        localStorage.setItem(storageKey, JSON.stringify(value));
      }
      
      return true;
    } catch (error) {
      console.error(`保存数据失败: ${key}`, error);
      return false;
    }
  }
  
  /**
   * 加载数据
   * @param {string} key - 数据键
   * @returns {Promise<*>} 加载的数据
   */
  async load(key) {
    if (!this.initialized) {
      await this.waitForInitialization();
    }
    
    // 从缓存中获取
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    return null;
  }
  
  /**
   * 删除数据
   * @param {string} key - 数据键
   * @returns {Promise<boolean>} 删除成功返回true
   */
  async delete(key) {
    if (!this.initialized) {
      await this.waitForInitialization();
    }
    
    try {
      // 从缓存中删除
      this.cache.delete(key);
      
      // 从localStorage中删除
      if (typeof localStorage !== 'undefined') {
        const storageKey = `${this.namespace}.${key}`;
        localStorage.removeItem(storageKey);
      }
      
      return true;
    } catch (error) {
      console.error(`删除数据失败: ${key}`, error);
      return false;
    }
  }
  
  /**
   * 清除所有数据
   * @returns {Promise<boolean>} 清除成功返回true
   */
  async clear() {
    if (!this.initialized) {
      await this.waitForInitialization();
    }
    
    try {
      // 清除缓存
      this.cache.clear();
      
      // 清除localStorage中的命名空间数据
      if (typeof localStorage !== 'undefined') {
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith(`${this.namespace}.`)) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
      
      return true;
    } catch (error) {
      console.error('清除数据失败', error);
      return false;
    }
  }
  
  /**
   * 获取所有键
   * @returns {Promise<Array<string>>} 键数组
   */
  async keys() {
    if (!this.initialized) {
      await this.waitForInitialization();
    }
    
    return Array.from(this.cache.keys());
  }
  
  /**
   * 等待初始化完成
   * @returns {Promise<void>}
   */
  waitForInitialization() {
    return new Promise(resolve => {
      const checkInitialized = () => {
        if (this.initialized) {
          resolve();
        } else {
          setTimeout(checkInitialized, 10);
        }
      };
      
      checkInitialized();
    });
  }
}
