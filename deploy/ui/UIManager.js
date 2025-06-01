/**
 * UI管理器，处理游戏界面
 */
export class UIManager {
  /**
   * 创建UI管理器
   * @param {HTMLElement} container - UI容器元素
   */
  constructor(container) {
    this.container = container;
    this.screens = {};
    this.hudElements = {};
    this.eventListeners = new Map();
    this.activeScreen = null;
    
    // 初始化UI
    this.init();
  }
  
  /**
   * 初始化UI
   */
  init() {
    // 获取所有屏幕
    const screenElements = this.container.querySelectorAll('.screen');
    screenElements.forEach(screen => {
      const id = screen.id;
      this.screens[id] = screen;
    });
    
    // 获取HUD元素
    const hudElements = this.container.querySelectorAll('#game-ui *[id]');
    hudElements.forEach(element => {
      const id = element.id;
      this.hudElements[id] = element;
    });
    
    // 设置计时器更新
    this.timerInterval = null;
  }
  
  /**
   * 显示屏幕
   * @param {string} screenId - 屏幕ID
   * @param {Object} data - 屏幕数据
   */
  showScreen(screenId, data = {}) {
    // 隐藏当前屏幕
    if (this.activeScreen) {
      this.activeScreen.classList.add('hidden');
    }
    
    // 显示新屏幕
    const screen = this.screens[screenId];
    if (screen) {
      screen.classList.remove('hidden');
      this.activeScreen = screen;
      
      // 处理特定屏幕的逻辑
      switch (screenId) {
        case 'game-screen':
          this.startTimer();
          break;
          
        case 'level-complete':
          this.stopTimer();
          this.updateCompletionScreen(data);
          break;
      }
    } else {
      console.error(`屏幕 "${screenId}" 不存在`);
    }
  }
  
  /**
   * 隐藏屏幕
   * @param {string} screenId - 屏幕ID
   */
  hideScreen(screenId) {
    const screen = this.screens[screenId];
    if (screen) {
      screen.classList.add('hidden');
      
      if (this.activeScreen === screen) {
        this.activeScreen = null;
      }
      
      // 处理特定屏幕的逻辑
      switch (screenId) {
        case 'game-screen':
          this.stopTimer();
          break;
      }
    } else {
      console.error(`屏幕 "${screenId}" 不存在`);
    }
  }
  
  /**
   * 更新HUD元素
   * @param {string} elementId - 元素ID
   * @param {*} value - 新值
   */
  updateHUD(elementId, value) {
    const element = this.hudElements[elementId];
    if (element) {
      if (typeof value === 'object') {
        // 更新元素属性
        for (const [key, val] of Object.entries(value)) {
          element[key] = val;
        }
      } else {
        // 更新元素内容
        element.textContent = value;
      }
    } else {
      console.error(`HUD元素 "${elementId}" 不存在`);
    }
  }
  
  /**
   * 显示通知
   * @param {string} message - 通知消息
   * @param {Object} options - 通知选项
   */
  showNotification(message, options = {}) {
    const defaults = {
      duration: 3000, // 持续时间(毫秒)
      type: 'info' // 通知类型(info, success, warning, error)
    };
    
    const settings = { ...defaults, ...options };
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${settings.type}`;
    notification.textContent = message;
    
    // 添加到容器
    this.container.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // 自动隐藏
    setTimeout(() => {
      notification.classList.remove('show');
      
      // 移除元素
      setTimeout(() => {
        this.container.removeChild(notification);
      }, 300);
    }, settings.duration);
  }
  
  /**
   * 添加UI事件监听器
   * @param {string} elementId - 元素ID
   * @param {string} eventType - 事件类型
   * @param {Function} callback - 回调函数
   */
  addEventListener(elementId, eventType, callback) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`元素 "${elementId}" 不存在`);
      return;
    }
    
    // 创建监听器键
    const key = `${elementId}:${eventType}`;
    
    // 移除现有监听器
    if (this.eventListeners.has(key)) {
      const oldCallback = this.eventListeners.get(key);
      element.removeEventListener(eventType, oldCallback);
    }
    
    // 添加新监听器
    element.addEventListener(eventType, callback);
    this.eventListeners.set(key, callback);
  }
  
  /**
   * 移除UI事件监听器
   * @param {string} elementId - 元素ID
   * @param {string} eventType - 事件类型
   */
  removeEventListener(elementId, eventType) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const key = `${elementId}:${eventType}`;
    
    if (this.eventListeners.has(key)) {
      const callback = this.eventListeners.get(key);
      element.removeEventListener(eventType, callback);
      this.eventListeners.delete(key);
    }
  }
  
  /**
   * 开始计时器
   */
  startTimer() {
    // 清除现有计时器
    this.stopTimer();
    
    // 重置计时器显示
    this.updateHUD('timer', '00:00');
    
    // 开始时间
    this.timerStartTime = Date.now();
    
    // 创建新计时器
    this.timerInterval = setInterval(() => {
      const elapsed = (Date.now() - this.timerStartTime) / 1000;
      this.updateHUD('timer', this.formatTime(elapsed));
    }, 100);
  }
  
  /**
   * 停止计时器
   */
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
  
  /**
   * 格式化时间
   * @param {number} seconds - 秒数
   * @returns {string} 格式化的时间字符串(MM:SS)
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  /**
   * 更新完成屏幕
   * @param {Object} data - 完成数据
   */
  updateCompletionScreen(data) {
    if (!data) return;
    
    // 更新完成时间
    if (data.stats && data.stats.time) {
      const timeElement = document.getElementById('completion-time');
      if (timeElement) {
        timeElement.textContent = `时间: ${this.formatTime(data.stats.time)}`;
      }
    }
    
    // 更新星级
    if (data.stars !== undefined) {
      const starElements = document.querySelectorAll('.star');
      starElements.forEach((star, index) => {
        if (index < data.stars) {
          star.classList.add('earned');
        } else {
          star.classList.remove('earned');
        }
      });
    }
  }
  
  /**
   * 填充关卡选择界面
   * @param {Array<Object>} levels - 关卡列表
   * @param {Array<number>} completedLevels - 已完成关卡ID列表
   * @param {Function} onLevelSelect - 关卡选择回调
   */
  populateLevelSelect(levels, completedLevels, onLevelSelect) {
    const levelsGrid = document.getElementById('levels-grid');
    if (!levelsGrid) return;
    
    // 清空现有内容
    levelsGrid.innerHTML = '';
    
    // 添加关卡项
    levels.forEach((level) => {
      const levelId = level.id;
      const isCompleted = completedLevels.includes(levelId);
      const isLocked = levelId > 1 && !completedLevels.includes(levelId - 1);
      
      const levelElement = document.createElement('div');
      levelElement.className = `level-item ${isLocked ? 'level-locked' : ''}`;
      
      const levelNumber = document.createElement('div');
      levelNumber.className = 'level-number';
      levelNumber.textContent = levelId;
      
      const levelName = document.createElement('div');
      levelName.className = 'level-name';
      levelName.textContent = level.name;
      
      const levelStars = document.createElement('div');
      levelStars.className = 'level-stars';
      
      // 显示已获得的星星
      if (isCompleted && level.stars) {
        levelStars.textContent = '★'.repeat(level.stars);
      }
      
      levelElement.appendChild(levelNumber);
      levelElement.appendChild(levelName);
      levelElement.appendChild(levelStars);
      
      if (!isLocked) {
        levelElement.addEventListener('click', () => {
          if (onLevelSelect) {
            onLevelSelect(levelId);
          }
        });
      }
      
      levelsGrid.appendChild(levelElement);
    });
  }
}
