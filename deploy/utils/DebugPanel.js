/**
 * 调试面板，显示游戏性能和调试信息
 */
export class DebugPanel {
  /**
   * 创建调试面板
   * @param {HTMLElement} container - 容器元素
   * @param {Object} options - 面板选项
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = Object.assign({
      enabled: false,
      showFPS: true,
      showMemory: true,
      showPhysics: true,
      showPosition: true
    }, options);
    
    this.panelElement = null;
    this.fpsElement = null;
    this.memoryElement = null;
    this.physicsElement = null;
    this.positionElement = null;
    
    this.lastTime = performance.now();
    this.frames = 0;
    this.fps = 0;
    
    this.updateInterval = null;
    
    if (this.options.enabled) {
      this.init();
    }
  }
  
  /**
   * 初始化调试面板
   */
  init() {
    // 创建面板元素
    this.panelElement = document.createElement('div');
    this.panelElement.className = 'debug-panel';
    
    // 创建FPS元素
    if (this.options.showFPS) {
      this.fpsElement = document.createElement('div');
      this.fpsElement.className = 'debug-info';
      this.fpsElement.textContent = 'FPS: 0';
      this.panelElement.appendChild(this.fpsElement);
    }
    
    // 创建内存元素
    if (this.options.showMemory) {
      this.memoryElement = document.createElement('div');
      this.memoryElement.className = 'debug-info';
      this.memoryElement.textContent = 'Memory: 0 MB';
      this.panelElement.appendChild(this.memoryElement);
    }
    
    // 创建物理元素
    if (this.options.showPhysics) {
      this.physicsElement = document.createElement('div');
      this.physicsElement.className = 'debug-info';
      this.physicsElement.textContent = 'Bodies: 0';
      this.panelElement.appendChild(this.physicsElement);
    }
    
    // 创建位置元素
    if (this.options.showPosition) {
      this.positionElement = document.createElement('div');
      this.positionElement.className = 'debug-info';
      this.positionElement.textContent = 'Pos: (0, 0, 0)';
      this.panelElement.appendChild(this.positionElement);
    }
    
    // 添加到容器
    this.container.appendChild(this.panelElement);
    
    // 开始更新
    this.startUpdate();
  }
  
  /**
   * 开始更新
   */
  startUpdate() {
    // 每秒更新一次FPS
    this.updateInterval = setInterval(() => {
      this.updateFPS();
      this.updateMemory();
    }, 1000);
  }
  
  /**
   * 停止更新
   */
  stopUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
  
  /**
   * 更新FPS
   */
  updateFPS() {
    if (!this.options.showFPS || !this.fpsElement) return;
    
    this.fps = this.frames;
    this.frames = 0;
    
    this.fpsElement.textContent = `FPS: ${this.fps}`;
    
    // 根据FPS值改变颜色
    if (this.fps >= 55) {
      this.fpsElement.style.color = '#4CAF50'; // 绿色
    } else if (this.fps >= 30) {
      this.fpsElement.style.color = '#FFC107'; // 黄色
    } else {
      this.fpsElement.style.color = '#F44336'; // 红色
    }
  }
  
  /**
   * 更新内存使用
   */
  updateMemory() {
    if (!this.options.showMemory || !this.memoryElement) return;
    
    // 只有在Chrome浏览器中才能获取内存使用情况
    if (window.performance && window.performance.memory) {
      const memory = Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024));
      this.memoryElement.textContent = `Memory: ${memory} MB`;
      
      // 根据内存使用量改变颜色
      if (memory < 50) {
        this.memoryElement.style.color = '#4CAF50'; // 绿色
      } else if (memory < 100) {
        this.memoryElement.style.color = '#FFC107'; // 黄色
      } else {
        this.memoryElement.style.color = '#F44336'; // 红色
      }
    } else {
      this.memoryElement.textContent = 'Memory: N/A';
    }
  }
  
  /**
   * 更新物理信息
   * @param {Object} physicsWorld - 物理世界
   */
  updatePhysics(physicsWorld) {
    if (!this.options.showPhysics || !this.physicsElement) return;
    
    if (physicsWorld && physicsWorld.world) {
      const bodies = physicsWorld.world.bodies.length;
      this.physicsElement.textContent = `Bodies: ${bodies}`;
    }
  }
  
  /**
   * 更新位置信息
   * @param {Object} position - 位置对象
   */
  updatePosition(position) {
    if (!this.options.showPosition || !this.positionElement) return;
    
    if (position) {
      const x = position.x.toFixed(2);
      const y = position.y.toFixed(2);
      const z = position.z.toFixed(2);
      this.positionElement.textContent = `Pos: (${x}, ${y}, ${z})`;
    }
  }
  
  /**
   * 记录帧
   */
  recordFrame() {
    this.frames++;
  }
  
  /**
   * 更新调试面板
   * @param {Object} data - 调试数据
   */
  update(data = {}) {
    if (!this.options.enabled) return;
    
    this.recordFrame();
    
    if (data.physicsWorld) {
      this.updatePhysics(data.physicsWorld);
    }
    
    if (data.position) {
      this.updatePosition(data.position);
    }
  }
  
  /**
   * 设置启用状态
   * @param {boolean} enabled - 是否启用
   */
  setEnabled(enabled) {
    this.options.enabled = enabled;
    
    if (enabled && !this.panelElement) {
      this.init();
    } else if (!enabled && this.panelElement) {
      this.stopUpdate();
      this.container.removeChild(this.panelElement);
      this.panelElement = null;
    }
  }
  
  /**
   * 切换启用状态
   */
  toggle() {
    this.setEnabled(!this.options.enabled);
  }
  
  /**
   * 添加自定义信息
   * @param {string} id - 信息ID
   * @param {string} text - 信息文本
   */
  addCustomInfo(id, text) {
    if (!this.options.enabled || !this.panelElement) return;
    
    let element = this.panelElement.querySelector(`#debug-${id}`);
    
    if (!element) {
      element = document.createElement('div');
      element.id = `debug-${id}`;
      element.className = 'debug-info';
      this.panelElement.appendChild(element);
    }
    
    element.textContent = text;
  }
  
  /**
   * 移除自定义信息
   * @param {string} id - 信息ID
   */
  removeCustomInfo(id) {
    if (!this.options.enabled || !this.panelElement) return;
    
    const element = this.panelElement.querySelector(`#debug-${id}`);
    if (element) {
      this.panelElement.removeChild(element);
    }
  }
}
