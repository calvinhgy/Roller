/**
 * 运动控制器，处理设备方向传感器
 */
export class MotionController {
  /**
   * 创建运动控制器
   * @param {Object} options - 控制器选项
   */
  constructor(options = {}) {
    this.options = Object.assign({
      sensitivity: 1.0,
      smoothing: 0.2,
      useTouchControls: false
    }, options);
    
    // 设备方向数据
    this.orientation = {
      alpha: 0, // z轴旋转 (0-360)
      beta: 0,  // x轴旋转 (-180-180)
      gamma: 0  // y轴旋转 (-90-90)
    };
    
    // 校准偏移
    this.calibration = {
      beta: 0,
      gamma: 0
    };
    
    // 平滑过滤器数据
    this.filter = {
      beta: 0,
      gamma: 0
    };
    
    // 回调函数
    this.orientationChangeCallback = null;
    
    // 触摸控制状态
    this.touchControls = {
      active: false,
      position: { x: 0, y: 0 },
      force: { x: 0, y: 0, z: 0 }
    };
    
    // 绑定方法
    this.handleDeviceOrientation = this.handleDeviceOrientation.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
  }
  
  /**
   * 初始化设备传感器
   * @returns {Promise<boolean>} 初始化成功返回true
   */
  async init() {
    // 检查是否使用触摸控制
    if (this.options.useTouchControls) {
      this.setupTouchControls();
      return true;
    }
    
    // 检查设备方向API是否可用
    if (!MotionController.isSupported()) {
      console.warn('设备方向API不可用，回退到触摸控制');
      this.setupTouchControls();
      return false;
    }
    
    // 在iOS 13+上请求权限
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permissionState = await DeviceOrientationEvent.requestPermission();
        if (permissionState !== 'granted') {
          console.warn('设备方向权限被拒绝，回退到触摸控制');
          this.setupTouchControls();
          return false;
        }
      } catch (error) {
        console.error('请求设备方向权限失败:', error);
        this.setupTouchControls();
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * 开始监听设备方向
   */
  start() {
    if (this.options.useTouchControls) {
      // 已经在init中设置了触摸控制
      return;
    }
    
    window.addEventListener('deviceorientation', this.handleDeviceOrientation);
  }
  
  /**
   * 停止监听设备方向
   */
  stop() {
    window.removeEventListener('deviceorientation', this.handleDeviceOrientation);
    
    // 移除触摸事件监听器
    const gameContainer = document.getElementById('game-canvas-container');
    if (gameContainer) {
      gameContainer.removeEventListener('touchstart', this.handleTouchStart);
      gameContainer.removeEventListener('touchmove', this.handleTouchMove);
      gameContainer.removeEventListener('touchend', this.handleTouchEnd);
    }
  }
  
  /**
   * 校准初始方向
   */
  calibrate() {
    // 保存当前方向作为校准偏移
    this.calibration.beta = this.orientation.beta;
    this.calibration.gamma = this.orientation.gamma;
    
    console.log('方向校准完成:', this.calibration);
  }
  
  /**
   * 获取当前设备方向
   * @returns {Object} 包含alpha、beta、gamma值的对象
   */
  getOrientation() {
    return { ...this.orientation };
  }
  
  /**
   * 设置方向变化回调
   * @param {Function} callback - 方向变化回调函数
   */
  onOrientationChange(callback) {
    this.orientationChangeCallback = callback;
  }
  
  /**
   * 设置灵敏度
   * @param {number} sensitivity - 灵敏度值
   */
  setSensitivity(sensitivity) {
    this.options.sensitivity = sensitivity;
  }
  
  /**
   * 设置是否使用触摸控制
   * @param {boolean} useTouch - 是否使用触摸控制
   */
  setUseTouchControls(useTouch) {
    if (useTouch === this.options.useTouchControls) return;
    
    this.options.useTouchControls = useTouch;
    
    // 停止当前控制方式
    this.stop();
    
    // 设置新的控制方式
    if (useTouch) {
      this.setupTouchControls();
    } else {
      this.start();
    }
  }
  
  /**
   * 检查设备是否支持方向传感器
   * @returns {boolean} 支持返回true
   */
  static isSupported() {
    return 'DeviceOrientationEvent' in window;
  }
  
  /**
   * 处理设备方向事件
   * @param {DeviceOrientationEvent} event - 设备方向事件
   */
  handleDeviceOrientation(event) {
    // 提取方向数据
    const { alpha, beta, gamma } = event;
    
    // 忽略无效数据
    if (beta === null || gamma === null) return;
    
    // 应用平滑过滤
    this.filter.beta = this.applySmoothing(beta, this.filter.beta);
    this.filter.gamma = this.applySmoothing(gamma, this.filter.gamma);
    
    // 应用校准
    this.orientation.alpha = alpha;
    this.orientation.beta = this.filter.beta - this.calibration.beta;
    this.orientation.gamma = this.filter.gamma - this.calibration.gamma;
    
    // 调用回调
    if (this.orientationChangeCallback) {
      this.orientationChangeCallback(this.orientation);
    }
  }
  
  /**
   * 应用平滑过滤
   * @param {number} newValue - 新值
   * @param {number} oldValue - 旧值
   * @returns {number} 平滑后的值
   */
  applySmoothing(newValue, oldValue) {
    const smoothing = this.options.smoothing;
    return oldValue * smoothing + newValue * (1 - smoothing);
  }
  
  /**
   * 设置触摸控制
   */
  setupTouchControls() {
    const gameContainer = document.getElementById('game-canvas-container');
    if (!gameContainer) return;
    
    // 添加触摸事件监听器
    gameContainer.addEventListener('touchstart', this.handleTouchStart);
    gameContainer.addEventListener('touchmove', this.handleTouchMove);
    gameContainer.addEventListener('touchend', this.handleTouchEnd);
  }
  
  /**
   * 处理触摸开始事件
   * @param {TouchEvent} event - 触摸事件
   */
  handleTouchStart(event) {
    event.preventDefault();
    
    const touch = event.touches[0];
    this.touchControls.active = true;
    this.touchControls.position = {
      x: touch.clientX,
      y: touch.clientY
    };
  }
  
  /**
   * 处理触摸移动事件
   * @param {TouchEvent} event - 触摸事件
   */
  handleTouchMove(event) {
    if (!this.touchControls.active) return;
    event.preventDefault();
    
    const touch = event.touches[0];
    const container = document.getElementById('game-canvas-container');
    
    if (!container) return;
    
    // 计算触摸位置相对于容器中心的偏移
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    
    // 计算归一化的方向向量 (-1 到 1)
    const dirX = (touchX - centerX) / centerX;
    const dirY = (touchY - centerY) / centerY;
    
    // 限制最大值
    const maxForce = 1.0;
    const forceX = Math.max(-maxForce, Math.min(maxForce, dirX * this.options.sensitivity));
    const forceZ = Math.max(-maxForce, Math.min(maxForce, dirY * this.options.sensitivity));
    
    // 更新力向量
    this.touchControls.force = {
      x: forceX * 20, // 调整为与方向传感器相似的范围
      y: 0,
      z: forceZ * 20
    };
    
    // 模拟方向数据
    this.orientation.beta = forceZ * 20;
    this.orientation.gamma = forceX * 20;
    
    // 调用回调
    if (this.orientationChangeCallback) {
      this.orientationChangeCallback(this.orientation);
    }
  }
  
  /**
   * 处理触摸结束事件
   * @param {TouchEvent} event - 触摸事件
   */
  handleTouchEnd(event) {
    event.preventDefault();
    
    this.touchControls.active = false;
    this.touchControls.force = { x: 0, y: 0, z: 0 };
    
    // 重置方向数据
    this.orientation.beta = 0;
    this.orientation.gamma = 0;
    
    // 调用回调
    if (this.orientationChangeCallback) {
      this.orientationChangeCallback(this.orientation);
    }
  }
}
