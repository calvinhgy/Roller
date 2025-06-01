import * as THREE from 'three';

/**
 * 渲染器类，封装Three.js渲染器
 */
export class Renderer {
  /**
   * 创建渲染器
   * @param {HTMLElement} container - 容器元素
   * @param {Object} options - 渲染器选项
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = Object.assign({
      quality: 'medium',
      antialias: true,
      alpha: false,
      shadows: true
    }, options);
    
    this.renderer = null;
    this.width = 0;
    this.height = 0;
    this.pixelRatio = 1;
    
    // 后处理
    this.composer = null;
    this.effectsEnabled = false;
  }
  
  /**
   * 初始化渲染器
   */
  init() {
    // 创建WebGL渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: this.options.antialias,
      alpha: this.options.alpha,
      powerPreference: 'high-performance'
    });
    
    // 设置像素比
    this.pixelRatio = this.getOptimalPixelRatio();
    this.renderer.setPixelRatio(this.pixelRatio);
    
    // 设置尺寸
    this.updateSize();
    
    // 设置阴影
    if (this.options.shadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    
    // 设置颜色空间
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    
    // 设置色调映射
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    
    // 添加到容器
    this.container.appendChild(this.renderer.domElement);
    
    // 应用质量设置
    this.setQuality(this.options.quality);
    
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  /**
   * 渲染场景
   * @param {THREE.Scene} scene - 要渲染的场景
   * @param {THREE.Camera} camera - 使用的相机
   */
  render(scene, camera) {
    if (!this.renderer) return;
    
    if (this.effectsEnabled && this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(scene, camera);
    }
  }
  
  /**
   * 调整渲染器大小
   * @param {number} width - 宽度
   * @param {number} height - 高度
   */
  resize(width, height) {
    if (!this.renderer) return;
    
    this.width = width || this.container.clientWidth;
    this.height = height || this.container.clientHeight;
    
    this.renderer.setSize(this.width, this.height);
    
    if (this.composer) {
      this.composer.setSize(this.width, this.height);
    }
  }
  
  /**
   * 更新渲染器尺寸
   */
  updateSize() {
    this.resize(
      this.container.clientWidth,
      this.container.clientHeight
    );
  }
  
  /**
   * 处理窗口大小变化
   */
  handleResize() {
    this.updateSize();
  }
  
  /**
   * 设置渲染质量
   * @param {string} quality - 质量级别('low'|'medium'|'high')
   */
  setQuality(quality) {
    if (!this.renderer) return;
    
    switch (quality) {
      case 'low':
        this.renderer.setPixelRatio(1);
        this.renderer.shadowMap.enabled = false;
        break;
        
      case 'medium':
        this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
        break;
        
      case 'high':
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        break;
        
      default:
        console.warn(`未知的质量级别: ${quality}，使用中等质量`);
        this.setQuality('medium');
    }
  }
  
  /**
   * 获取最佳像素比
   * @returns {number} 像素比
   */
  getOptimalPixelRatio() {
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // 根据设备性能调整像素比
    // 这里可以添加更复杂的设备性能检测
    if (devicePixelRatio > 2) {
      return 2; // 限制最大像素比为2，以避免性能问题
    }
    
    return devicePixelRatio;
  }
  
  /**
   * 启用后处理效果
   * @param {Array<Effect>} effects - 后处理效果数组
   */
  enablePostProcessing(effects) {
    // 注意：这里需要导入EffectComposer和相关后处理效果
    // 由于这超出了基本实现的范围，这里只提供一个占位符
    console.warn('后处理效果尚未实现');
    this.effectsEnabled = false;
  }
  
  /**
   * 禁用后处理效果
   */
  disablePostProcessing() {
    this.effectsEnabled = false;
  }
  
  /**
   * 获取Three.js渲染器实例
   * @returns {THREE.WebGLRenderer} 渲染器实例
   */
  getRenderer() {
    return this.renderer;
  }
  
  /**
   * 销毁渲染器
   */
  dispose() {
    if (this.renderer) {
      this.renderer.dispose();
      
      if (this.container.contains(this.renderer.domElement)) {
        this.container.removeChild(this.renderer.domElement);
      }
    }
    
    window.removeEventListener('resize', this.handleResize.bind(this));
  }
}
