import { GameLoop } from './Loop.js';
import { ResourceLoader } from './ResourceLoader.js';
import { SceneManager } from '../rendering/Scene.js';
import { Renderer } from '../rendering/Renderer.js';
import { PhysicsWorld } from '../physics/PhysicsWorld.js';
import { MotionController } from '../physics/MotionSensor.js';
import { LevelManager } from '../levels/LevelManager.js';
import { UIManager } from '../ui/UIManager.js';
import { EventBus } from '../utils/EventBus.js';
import { AudioManager } from '../utils/AudioManager.js';
import { LevelGenerator } from '../utils/LevelGenerator.js';
import { ParticleSystem } from '../utils/ParticleSystem.js';
import { DebugPanel } from '../utils/DebugPanel.js';
import { TutorialManager } from '../ui/TutorialManager.js';

/**
 * 游戏主类，负责协调所有游戏系统
 */
export class Game {
  /**
   * 创建游戏实例
   * @param {HTMLElement} container - 游戏容器元素
   * @param {Object} options - 游戏配置选项
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = Object.assign({
      debug: false,
      storage: null
    }, options);
    
    this.storage = this.options.storage;
    this.debug = this.options.debug;
    
    // 游戏状态
    this.running = false;
    this.paused = false;
    this.currentLevel = null;
    
    // 默认设置
    this.settings = {
      musicVolume: 0.8,
      sfxVolume: 1.0,
      sensitivity: 'medium',
      quality: 'medium',
      useTouchControls: false
    };
    
    // 游戏系统
    this.eventBus = new EventBus();
    this.resourceLoader = new ResourceLoader();
    this.renderer = null;
    this.sceneManager = null;
    this.physicsWorld = null;
    this.motionController = null;
    this.levelManager = null;
    this.uiManager = null;
    this.audioManager = null;
    this.levelGenerator = null;
    this.particleSystem = null;
    this.debugPanel = null;
    this.tutorialManager = null;
    this.gameLoop = null;
  }
  
  /**
   * 初始化游戏
   * @returns {Promise<void>}
   */
  async init() {
    console.log('初始化游戏...');
    
    try {
      // 加载设置
      await this.loadSettings();
      
      // 初始化渲染器
      this.renderer = new Renderer(
        document.getElementById('game-canvas-container'), 
        { quality: this.settings.quality }
      );
      this.renderer.init();
      
      // 初始化场景管理器
      this.sceneManager = new SceneManager();
      
      // 初始化物理世界
      this.physicsWorld = new PhysicsWorld();
      
      // 初始化运动控制器
      this.motionController = new MotionController({
        sensitivity: this.getSensitivityValue(),
        useTouchControls: this.settings.useTouchControls
      });
      
      // 初始化关卡管理器
      this.levelManager = new LevelManager(this.resourceLoader);
      
      // 初始化UI管理器
      this.uiManager = new UIManager(this.container);
      
      // 初始化音频管理器
      this.audioManager = new AudioManager({
        musicVolume: this.settings.musicVolume,
        sfxVolume: this.settings.sfxVolume,
        muted: false
      });
      
      // 初始化关卡生成器
      this.levelGenerator = new LevelGenerator();
      
      // 初始化调试面板
      this.debugPanel = new DebugPanel(this.container, {
        enabled: this.debug,
        showFPS: true,
        showMemory: true,
        showPhysics: true,
        showPosition: true
      });
      
      // 初始化教程管理器
      this.tutorialManager = new TutorialManager(this.container, this.storage);
      this.tutorialManager.init();
      
      // 定义教程步骤
      this.tutorialManager.defineSteps([
        {
          message: "欢迎来到Roller游戏！在这个游戏中，你需要通过倾斜设备来控制小球移动，到达迷宫的终点。",
          image: "/assets/tutorial/intro.png"
        },
        {
          message: "倾斜你的设备来控制小球的移动方向。向前倾斜使小球向前滚动，向左倾斜使小球向左滚动，以此类推。",
          image: "/assets/tutorial/tilt.png"
        },
        {
          message: "绿色圆圈是起点，红色圆圈是终点。你的目标是将小球从起点滚动到终点。",
          image: "/assets/tutorial/goal.png"
        },
        {
          message: "注意不要让小球掉出边界，否则小球会回到起点。",
          image: "/assets/tutorial/boundary.png"
        },
        {
          message: "完成关卡后，你将获得1-3颗星星，取决于你完成的时间。现在开始你的挑战吧！",
          image: "/assets/tutorial/stars.png"
        }
      ]);
      
      // 创建游戏循环
      this.gameLoop = new GameLoop(
        this.update.bind(this),
        this.render.bind(this)
      );
      
      // 设置事件监听器
      this.setupEventListeners();
      
      // 加载关卡列表
      await this.levelManager.loadLevelList();
      
      // 加载全局资源
      await this.loadGlobalResources();
      
      // 预加载音效
      await this.audioManager.preloadCommonSounds();
      
      console.log('游戏初始化完成');
      return true;
    } catch (error) {
      console.error('游戏初始化失败:', error);
      throw error;
    }
  }
  
  /**
   * 开始游戏
   * @param {number|string} levelId - 关卡ID
   * @returns {Promise<void>}
   */
  async start(levelId) {
    console.log(`开始游戏，关卡: ${levelId}`);
    
    try {
      // 保存最后游玩的关卡
      await this.storage.save('lastLevel', levelId);
      
      // 加载关卡
      this.currentLevel = await this.levelManager.loadLevel(levelId);
      
      // 初始化关卡
      await this.currentLevel.init(
        this.sceneManager.getScene('game'),
        this.physicsWorld
      );
      
      // 设置物理世界重力
      this.physicsWorld.setGravity({ x: 0, y: -9.8, z: 0 });
      
      // 初始化运动控制器
      await this.motionController.init();
      
      // 设置运动控制器回调
      this.motionController.onOrientationChange((orientation) => {
        if (this.running && !this.paused && this.currentLevel) {
          const force = this.calculateForceFromOrientation(orientation);
          const ball = this.currentLevel.getBall();
          if (ball) {
            this.physicsWorld.applyForce(ball, force);
          }
        }
      });
      
      // 初始化粒子系统
      this.particleSystem = new ParticleSystem(this.sceneManager.getScene('game'));
      
      // 开始监听设备方向
      this.motionController.start();
      
      // 开始游戏循环
      this.running = true;
      this.paused = false;
      this.gameLoop.start();
      
      // 触发游戏开始事件
      this.eventBus.publish('game:start', { levelId });
      
      // 播放背景音乐
      this.audioManager.playMusic('background');
      
      // 如果是第一关，显示教程
      if (parseInt(levelId) === 1) {
        this.tutorialManager.isCompleted().then(completed => {
          if (!completed) {
            // 暂停游戏
            this.pause();
            
            // 显示教程
            this.tutorialManager.show(() => {
              // 教程完成后恢复游戏
              this.resume();
            });
          }
        });
      }
      
      return true;
    } catch (error) {
      console.error('开始游戏失败:', error);
      throw error;
    }
  }
  
  /**
   * 暂停游戏
   */
  pause() {
    if (this.running && !this.paused) {
      console.log('暂停游戏');
      this.paused = true;
      this.gameLoop.pause();
      this.eventBus.publish('game:pause', {});
    }
  }
  
  /**
   * 恢复游戏
   */
  resume() {
    if (this.running && this.paused) {
      console.log('恢复游戏');
      this.paused = false;
      this.gameLoop.resume();
      this.eventBus.publish('game:resume', {});
    }
  }
  
  /**
   * 重置当前关卡
   * @returns {Promise<void>}
   */
  async reset() {
    if (this.currentLevel) {
      console.log('重置关卡');
      this.currentLevel.reset();
      this.eventBus.publish('level:reset', { levelId: this.currentLevel.id });
    }
  }
  
  /**
   * 结束游戏
   */
  end() {
    console.log('结束游戏');
    
    if (this.running) {
      this.running = false;
      this.paused = false;
      this.gameLoop.stop();
      
      if (this.motionController) {
        this.motionController.stop();
      }
      
      if (this.currentLevel) {
        this.currentLevel = null;
      }
      
      this.eventBus.publish('game:end', { reason: 'user' });
    }
  }
  
  /**
   * 更新游戏状态
   * @param {number} deltaTime - 帧间隔时间(秒)
   */
  update(deltaTime) {
    if (!this.running || this.paused) return;
    
    // 更新物理世界
    this.physicsWorld.update(deltaTime);
    
    // 更新当前关卡
    if (this.currentLevel) {
      this.currentLevel.update(deltaTime);
      
      // 检查胜利条件
      if (this.currentLevel.checkWinCondition()) {
        this.handleLevelComplete();
      }
    }
    
    // 更新粒子系统
    if (this.particleSystem) {
      this.particleSystem.update(deltaTime);
    }
    
    // 更新调试面板
    if (this.debugPanel && this.debug) {
      const ballPosition = this.currentLevel ? this.currentLevel.getBall().position : null;
      this.debugPanel.update({
        physicsWorld: this.physicsWorld,
        position: ballPosition
      });
    }
  }
  
  /**
   * 渲染游戏
   */
  render() {
    if (!this.running) return;
    
    const scene = this.sceneManager.getScene('game');
    const camera = this.currentLevel ? this.currentLevel.getCamera() : null;
    
    if (scene && camera) {
      this.renderer.render(scene, camera);
    }
  }
  
  /**
   * 处理关卡完成
   */
  handleLevelComplete() {
    if (!this.currentLevel) return;
    
    console.log(`关卡完成: ${this.currentLevel.id}`);
    
    // 暂停游戏
    this.pause();
    
    // 播放胜利音效
    this.audioManager.play('win');
    
    // 创建胜利粒子效果
    if (this.particleSystem && this.currentLevel.objects.ball) {
      const ballPosition = this.currentLevel.objects.ball.position;
      
      // 创建五彩纸屑效果
      this.particleSystem.createEffect('confetti', {
        position: new THREE.Vector3(ballPosition.x, ballPosition.y + 2, ballPosition.z),
        count: 100,
        lifetime: 3
      });
      
      // 创建闪光效果
      this.particleSystem.createEffect('sparkle', {
        position: new THREE.Vector3(ballPosition.x, ballPosition.y, ballPosition.z),
        count: 30,
        color: 0xFFD700, // 金色
        lifetime: 1.5
      });
    }
    
    // 计算星级
    const stats = this.currentLevel.getCompletionStats();
    const stars = this.calculateStars(stats);
    
    // 保存进度
    this.saveLevelProgress(this.currentLevel.id, stars, stats);
    
    // 触发关卡完成事件
    this.eventBus.publish('level:complete', {
      levelId: this.currentLevel.id,
      stats,
      stars
    });
    
    // 更新UI
    document.getElementById('completion-time').textContent = `时间: ${this.formatTime(stats.time)}`;
    
    // 更新星星
    const starElements = document.querySelectorAll('.star');
    starElements.forEach((star, index) => {
      if (index < stars) {
        star.classList.add('earned');
      } else {
        star.classList.remove('earned');
      }
    });
    
    // 显示完成屏幕
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('level-complete').classList.remove('hidden');
  }
  
  /**
   * 加载下一关卡
   */
  async loadNextLevel() {
    if (!this.currentLevel) return;
    
    const nextLevelId = this.currentLevel.id + 1;
    const levels = this.levelManager.getLevelList();
    
    if (nextLevelId <= levels.length) {
      document.getElementById('level-complete').classList.add('hidden');
      document.getElementById('loading-screen').classList.remove('hidden');
      
      try {
        await this.start(nextLevelId);
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
      } catch (error) {
        console.error('加载下一关卡失败:', error);
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
        alert('加载关卡失败，请重试。');
      }
    } else {
      // 所有关卡都完成了
      document.getElementById('level-complete').classList.add('hidden');
      document.getElementById('main-menu').classList.remove('hidden');
      alert('恭喜！您已完成所有关卡！');
    }
  }
  
  /**
   * 校准运动控制器
   */
  calibrateMotionControls() {
    if (this.motionController) {
      console.log('校准运动控制器');
      this.motionController.calibrate();
    }
  }
  
  /**
   * 设置是否使用触摸控制
   * @param {boolean} useTouch - 是否使用触摸控制
   */
  setUseTouchControls(useTouch) {
    this.settings.useTouchControls = useTouch;
    
    if (this.motionController) {
      this.motionController.setUseTouchControls(useTouch);
    }
    
    this.saveSettings();
  }
  
  /**
   * 获取游戏是否正在运行
   * @returns {boolean} 游戏是否正在运行
   */
  isRunning() {
    return this.running;
  }
  
  /**
   * 获取游戏是否暂停
   * @returns {boolean} 游戏是否暂停
   */
  isPaused() {
    return this.paused;
  }
  
  /**
   * 获取关卡列表
   * @returns {Array<Object>} 关卡信息数组
   */
  getLevelList() {
    return this.levelManager ? this.levelManager.getLevelList() : [];
  }
  
  /**
   * 获取已完成的关卡ID列表
   * @returns {Array<number>} 已完成关卡ID数组
   */
  getCompletedLevels() {
    return this.storage ? this.storage.load('completedLevels') || [] : [];
  }
  
  /**
   * 获取关卡星级
   * @param {number} levelId - 关卡ID
   * @returns {number} 星级(0-3)
   */
  getLevelStars(levelId) {
    const progress = this.storage ? this.storage.load('levelProgress') || {} : {};
    return progress[levelId] ? progress[levelId].stars : 0;
  }
  
  /**
   * 获取游戏设置
   * @returns {Object} 游戏设置
   */
  getSettings() {
    return { ...this.settings };
  }
  
  /**
   * 更新游戏设置
   * @param {Object} newSettings - 新的设置值
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    
    // 更新相关系统
    if (this.renderer && newSettings.quality) {
      this.renderer.setQuality(newSettings.quality);
    }
    
    if (this.motionController) {
      if (newSettings.sensitivity) {
        this.motionController.setSensitivity(this.getSensitivityValue());
      }
      
      if (typeof newSettings.useTouchControls !== 'undefined') {
        this.motionController.setUseTouchControls(newSettings.useTouchControls);
      }
    }
    
    // 保存设置
    this.saveSettings();
  }
  
  /**
   * 加载设置
   * @returns {Promise<void>}
   */
  async loadSettings() {
    if (this.storage) {
      const savedSettings = await this.storage.load('settings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...savedSettings };
      }
    }
  }
  
  /**
   * 保存设置
   * @returns {Promise<void>}
   */
  async saveSettings() {
    if (this.storage) {
      await this.storage.save('settings', this.settings);
    }
  }
  
  /**
   * 保存关卡进度
   * @param {number} levelId - 关卡ID
   * @param {number} stars - 获得的星星数
   * @param {Object} stats - 完成统计数据
   * @returns {Promise<void>}
   */
  async saveLevelProgress(levelId, stars, stats) {
    if (!this.storage) return;
    
    // 保存关卡进度
    const progress = await this.storage.load('levelProgress') || {};
    
    // 只有当新的星星数更多时才更新
    if (!progress[levelId] || stars > progress[levelId].stars) {
      progress[levelId] = { stars, stats };
      await this.storage.save('levelProgress', progress);
    }
    
    // 更新已完成关卡列表
    let completedLevels = await this.storage.load('completedLevels') || [];
    if (!completedLevels.includes(levelId)) {
      completedLevels.push(levelId);
      await this.storage.save('completedLevels', completedLevels);
    }
  }
  
  /**
   * 根据完成数据计算星级
   * @param {Object} stats - 完成统计数据
   * @returns {number} 星级(1-3)
   */
  calculateStars(stats) {
    // 这里可以根据关卡难度和完成时间计算星级
    // 简单实现：根据完成时间计算
    const { time, parTime } = stats;
    
    if (time <= parTime * 0.8) {
      return 3; // 优秀
    } else if (time <= parTime * 1.2) {
      return 2; // 良好
    } else {
      return 1; // 完成
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
   * 根据设备方向计算力向量
   * @param {Object} orientation - 设备方向数据
   * @returns {Object} 力向量
   */
  calculateForceFromOrientation(orientation) {
    // 根据设备方向计算力向量
    // beta: 前后倾斜，gamma: 左右倾斜
    const { beta, gamma } = orientation;
    
    // 将角度转换为力
    // 注意：这里的映射关系可能需要根据游戏体验调整
    const forceMultiplier = this.getSensitivityValue();
    
    return {
      x: gamma * forceMultiplier,
      y: 0, // 垂直方向由重力控制
      z: beta * forceMultiplier
    };
  }
  
  /**
   * 获取灵敏度值
   * @returns {number} 灵敏度系数
   */
  getSensitivityValue() {
    switch (this.settings.sensitivity) {
      case 'low': return 0.5;
      case 'high': return 2.0;
      case 'medium':
      default: return 1.0;
    }
  }
  
  /**
   * 加载全局资源
   * @returns {Promise<void>}
   */
  async loadGlobalResources() {
    // 加载全局资源，如音效、通用纹理等
    const resources = [
      // 示例资源
      { id: 'ball-texture', type: 'texture', url: '/assets/textures/ball.png' },
      { id: 'wall-texture', type: 'texture', url: '/assets/textures/wall.png' },
      { id: 'floor-texture', type: 'texture', url: '/assets/textures/floor.png' },
      { id: 'collision-sound', type: 'audio', url: '/assets/sounds/collision.mp3' },
      { id: 'win-sound', type: 'audio', url: '/assets/sounds/win.mp3' }
    ];
    
    try {
      await this.resourceLoader.load(resources, (progress) => {
        console.log(`资源加载进度: ${Math.round(progress * 100)}%`);
      });
    } catch (error) {
      console.error('加载全局资源失败:', error);
      throw error;
    }
  }
  
  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      if (this.renderer) {
        this.renderer.resize(window.innerWidth, window.innerHeight);
      }
    });
    
    // 监听可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.running && !this.paused) {
          this.pause();
        }
      }
    });
    
    // 监听关卡完成事件
    this.eventBus.subscribe('level:complete', (data) => {
      console.log('关卡完成事件:', data);
    });
  }
}
