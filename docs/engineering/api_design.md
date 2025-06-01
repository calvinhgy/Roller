# Roller - API设计文档

## 核心API概述

Roller游戏的API设计遵循模块化和组件化原则，以下是主要API模块及其交互方式。

## 1. 游戏核心API (Game Core)

### Game 类

游戏的主控制类，负责初始化和协调其他系统。

```javascript
/**
 * 游戏主类，负责协调所有游戏系统
 */
class Game {
  /**
   * 创建游戏实例
   * @param {HTMLElement} container - 游戏容器元素
   * @param {Object} options - 游戏配置选项
   */
  constructor(container, options = {});
  
  /**
   * 初始化游戏
   * @returns {Promise<void>}
   */
  async init();
  
  /**
   * 开始游戏
   * @param {string} levelId - 关卡ID
   * @returns {Promise<void>}
   */
  async start(levelId);
  
  /**
   * 暂停游戏
   */
  pause();
  
  /**
   * 恢复游戏
   */
  resume();
  
  /**
   * 重置当前关卡
   * @returns {Promise<void>}
   */
  async reset();
  
  /**
   * 结束游戏
   */
  end();
  
  /**
   * 更新游戏状态
   * @param {number} deltaTime - 帧间隔时间(秒)
   */
  update(deltaTime);
}
```

### GameLoop 类

管理游戏循环，控制更新和渲染频率。

```javascript
/**
 * 游戏循环类，管理更新和渲染频率
 */
class GameLoop {
  /**
   * 创建游戏循环
   * @param {Function} updateFn - 更新函数
   * @param {Function} renderFn - 渲染函数
   */
  constructor(updateFn, renderFn);
  
  /**
   * 开始游戏循环
   */
  start();
  
  /**
   * 停止游戏循环
   */
  stop();
  
  /**
   * 暂停游戏循环
   */
  pause();
  
  /**
   * 恢复游戏循环
   */
  resume();
  
  /**
   * 获取当前FPS
   * @returns {number} 当前帧率
   */
  getFPS();
}
```

### ResourceManager 类

管理游戏资源的加载和卸载。

```javascript
/**
 * 资源管理器，处理游戏资源的加载和卸载
 */
class ResourceManager {
  /**
   * 加载资源
   * @param {Array<Object>} resources - 资源描述对象数组
   * @param {Function} progressCallback - 进度回调函数
   * @returns {Promise<Object>} 加载的资源
   */
  async load(resources, progressCallback);
  
  /**
   * 卸载资源
   * @param {string} resourceId - 资源ID
   * @returns {boolean} 卸载成功返回true
   */
  unload(resourceId);
  
  /**
   * 获取已加载的资源
   * @param {string} resourceId - 资源ID
   * @returns {Object} 资源对象
   */
  get(resourceId);
  
  /**
   * 预加载资源
   * @param {Array<Object>} resources - 资源描述对象数组
   * @returns {Promise<void>}
   */
  preload(resources);
}
```

## 2. 物理系统API (Physics)

### PhysicsWorld 类

封装物理引擎，管理物理世界。

```javascript
/**
 * 物理世界类，封装物理引擎
 */
class PhysicsWorld {
  /**
   * 创建物理世界
   * @param {Object} options - 物理世界配置
   */
  constructor(options = {});
  
  /**
   * 添加刚体到物理世界
   * @param {Object} bodyDef - 刚体定义
   * @returns {Object} 创建的刚体
   */
  addBody(bodyDef);
  
  /**
   * 从物理世界移除刚体
   * @param {Object} body - 要移除的刚体
   */
  removeBody(body);
  
  /**
   * 更新物理世界
   * @param {number} deltaTime - 时间步长(秒)
   */
  update(deltaTime);
  
  /**
   * 应用力到刚体
   * @param {Object} body - 目标刚体
   * @param {Vector3} force - 力向量
   * @param {Vector3} point - 应用点(可选)
   */
  applyForce(body, force, point);
  
  /**
   * 设置重力
   * @param {Vector3} gravity - 重力向量
   */
  setGravity(gravity);
  
  /**
   * 添加碰撞监听器
   * @param {Function} callback - 碰撞回调函数
   * @returns {string} 监听器ID
   */
  addCollisionListener(callback);
}
```

### MotionController 类

处理设备方向传感器数据，控制小球移动。

```javascript
/**
 * 运动控制器，处理设备方向传感器
 */
class MotionController {
  /**
   * 创建运动控制器
   * @param {Object} options - 控制器选项
   */
  constructor(options = {});
  
  /**
   * 初始化设备传感器
   * @returns {Promise<boolean>} 初始化成功返回true
   */
  async init();
  
  /**
   * 开始监听设备方向
   */
  start();
  
  /**
   * 停止监听设备方向
   */
  stop();
  
  /**
   * 校准初始方向
   */
  calibrate();
  
  /**
   * 获取当前设备方向
   * @returns {Object} 包含alpha、beta、gamma值的对象
   */
  getOrientation();
  
  /**
   * 设置方向变化回调
   * @param {Function} callback - 方向变化回调函数
   */
  onOrientationChange(callback);
  
  /**
   * 检查设备是否支持方向传感器
   * @returns {boolean} 支持返回true
   */
  static isSupported();
}
```

## 3. 渲染系统API (Rendering)

### Renderer 类

封装Three.js渲染器，处理场景渲染。

```javascript
/**
 * 渲染器类，封装Three.js渲染器
 */
class Renderer {
  /**
   * 创建渲染器
   * @param {HTMLElement} container - 容器元素
   * @param {Object} options - 渲染器选项
   */
  constructor(container, options = {});
  
  /**
   * 初始化渲染器
   */
  init();
  
  /**
   * 渲染场景
   * @param {Scene} scene - 要渲染的场景
   * @param {Camera} camera - 使用的相机
   */
  render(scene, camera);
  
  /**
   * 调整渲染器大小
   * @param {number} width - 宽度
   * @param {number} height - 高度
   */
  resize(width, height);
  
  /**
   * 设置渲染质量
   * @param {string} quality - 质量级别('low'|'medium'|'high')
   */
  setQuality(quality);
  
  /**
   * 启用后处理效果
   * @param {Array<Effect>} effects - 后处理效果数组
   */
  enablePostProcessing(effects);
}
```

### SceneManager 类

管理3D场景，包括对象、光照等。

```javascript
/**
 * 场景管理器，管理3D场景内容
 */
class SceneManager {
  /**
   * 创建场景管理器
   */
  constructor();
  
  /**
   * 创建新场景
   * @param {string} id - 场景ID
   * @returns {Scene} 创建的场景
   */
  createScene(id);
  
  /**
   * 加载场景
   * @param {Object} sceneData - 场景数据
   * @returns {Promise<Scene>} 加载的场景
   */
  async loadScene(sceneData);
  
  /**
   * 添加对象到场景
   * @param {string} sceneId - 场景ID
   * @param {Object3D} object - 3D对象
   */
  addToScene(sceneId, object);
  
  /**
   * 从场景移除对象
   * @param {string} sceneId - 场景ID
   * @param {Object3D} object - 3D对象
   */
  removeFromScene(sceneId, object);
  
  /**
   * 设置场景环境光
   * @param {string} sceneId - 场景ID
   * @param {Object} lightOptions - 光照选项
   */
  setEnvironment(sceneId, lightOptions);
}
```

## 4. 关卡系统API (Levels)

### LevelManager 类

管理游戏关卡的加载和状态。

```javascript
/**
 * 关卡管理器，处理关卡加载和状态
 */
class LevelManager {
  /**
   * 创建关卡管理器
   * @param {ResourceManager} resourceManager - 资源管理器实例
   */
  constructor(resourceManager);
  
  /**
   * 加载关卡
   * @param {string} levelId - 关卡ID
   * @returns {Promise<Level>} 加载的关卡
   */
  async loadLevel(levelId);
  
  /**
   * 卸载当前关卡
   */
  unloadCurrentLevel();
  
  /**
   * 获取关卡列表
   * @returns {Array<Object>} 关卡信息数组
   */
  getLevelList();
  
  /**
   * 获取当前关卡
   * @returns {Level} 当前关卡
   */
  getCurrentLevel();
  
  /**
   * 检查关卡完成状态
   * @param {string} levelId - 关卡ID
   * @returns {boolean} 已完成返回true
   */
  isLevelCompleted(levelId);
  
  /**
   * 标记关卡为已完成
   * @param {string} levelId - 关卡ID
   * @param {Object} stats - 完成统计数据
   */
  markLevelCompleted(levelId, stats);
}
```

### Level 类

表示单个游戏关卡。

```javascript
/**
 * 关卡类，表示单个游戏关卡
 */
class Level {
  /**
   * 创建关卡实例
   * @param {string} id - 关卡ID
   * @param {Object} data - 关卡数据
   */
  constructor(id, data);
  
  /**
   * 初始化关卡
   * @param {Scene} scene - 3D场景
   * @param {PhysicsWorld} physicsWorld - 物理世界
   * @returns {Promise<void>}
   */
  async init(scene, physicsWorld);
  
  /**
   * 更新关卡状态
   * @param {number} deltaTime - 帧间隔时间(秒)
   */
  update(deltaTime);
  
  /**
   * 检查胜利条件
   * @returns {boolean} 满足胜利条件返回true
   */
  checkWinCondition();
  
  /**
   * 重置关卡
   */
  reset();
  
  /**
   * 获取关卡难度
   * @returns {number} 难度级别(1-5)
   */
  getDifficulty();
  
  /**
   * 获取起点位置
   * @returns {Vector3} 起点坐标
   */
  getStartPosition();
  
  /**
   * 获取终点位置
   * @returns {Vector3} 终点坐标
   */
  getEndPosition();
}
```

## 5. 用户界面API (UI)

### UIManager 类

管理游戏用户界面。

```javascript
/**
 * UI管理器，处理游戏界面
 */
class UIManager {
  /**
   * 创建UI管理器
   * @param {HTMLElement} container - UI容器元素
   */
  constructor(container);
  
  /**
   * 显示屏幕
   * @param {string} screenId - 屏幕ID
   * @param {Object} data - 屏幕数据
   */
  showScreen(screenId, data = {});
  
  /**
   * 隐藏屏幕
   * @param {string} screenId - 屏幕ID
   */
  hideScreen(screenId);
  
  /**
   * 更新HUD元素
   * @param {string} elementId - 元素ID
   * @param {*} value - 新值
   */
  updateHUD(elementId, value);
  
  /**
   * 显示通知
   * @param {string} message - 通知消息
   * @param {Object} options - 通知选项
   */
  showNotification(message, options = {});
  
  /**
   * 添加UI事件监听器
   * @param {string} elementId - 元素ID
   * @param {string} eventType - 事件类型
   * @param {Function} callback - 回调函数
   */
  addEventListener(elementId, eventType, callback);
}
```

## 6. 存储API (Storage)

### StorageManager 类

管理游戏数据的持久化存储。

```javascript
/**
 * 存储管理器，处理游戏数据持久化
 */
class StorageManager {
  /**
   * 创建存储管理器
   * @param {string} namespace - 存储命名空间
   */
  constructor(namespace);
  
  /**
   * 保存数据
   * @param {string} key - 数据键
   * @param {*} value - 数据值
   * @returns {Promise<boolean>} 保存成功返回true
   */
  async save(key, value);
  
  /**
   * 加载数据
   * @param {string} key - 数据键
   * @returns {Promise<*>} 加载的数据
   */
  async load(key);
  
  /**
   * 删除数据
   * @param {string} key - 数据键
   * @returns {Promise<boolean>} 删除成功返回true
   */
  async delete(key);
  
  /**
   * 清除所有数据
   * @returns {Promise<boolean>} 清除成功返回true
   */
  async clear();
  
  /**
   * 获取所有键
   * @returns {Promise<Array<string>>} 键数组
   */
  async keys();
}
```

## 7. 事件系统API (Events)

### EventBus 类

实现发布-订阅模式的事件总线。

```javascript
/**
 * 事件总线，实现发布-订阅模式
 */
class EventBus {
  /**
   * 订阅事件
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @returns {string} 订阅ID
   */
  subscribe(event, callback);
  
  /**
   * 取消订阅
   * @param {string} subscriptionId - 订阅ID
   */
  unsubscribe(subscriptionId);
  
  /**
   * 发布事件
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   */
  publish(event, data);
  
  /**
   * 一次性订阅
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @returns {string} 订阅ID
   */
  once(event, callback);
}
```

## API使用示例

### 游戏初始化

```javascript
// 创建游戏实例
const game = new Game(document.getElementById('game-container'), {
  debug: false,
  quality: 'high'
});

// 初始化游戏
await game.init();

// 显示主菜单
game.ui.showScreen('main-menu');

// 开始游戏
async function startGame(levelId) {
  await game.start(levelId);
}
```

### 设备方向控制

```javascript
// 创建运动控制器
const motionController = new MotionController({
  sensitivity: 1.5,
  smoothing: 0.2
});

// 初始化控制器
if (await motionController.init()) {
  // 设置方向变化回调
  motionController.onOrientationChange((orientation) => {
    // 将方向数据转换为力向量
    const force = calculateForceFromOrientation(orientation);
    
    // 应用力到小球
    physicsWorld.applyForce(ballBody, force);
  });
  
  // 开始监听
  motionController.start();
} else {
  // 回退到触摸控制
  setupTouchControls();
}
```

### 关卡加载

```javascript
// 加载关卡
async function loadLevel(levelId) {
  try {
    // 显示加载屏幕
    uiManager.showScreen('loading');
    
    // 加载关卡
    const level = await levelManager.loadLevel(levelId);
    
    // 初始化关卡
    await level.init(sceneManager.getScene('game'), physicsWorld);
    
    // 隐藏加载屏幕
    uiManager.hideScreen('loading');
    
    // 开始游戏循环
    gameLoop.start();
    
    return true;
  } catch (error) {
    console.error('Failed to load level:', error);
    uiManager.showScreen('error', { message: 'Failed to load level' });
    return false;
  }
}
```

## 事件列表

游戏中使用的主要事件：

| 事件名称 | 描述 | 数据 |
|---------|------|------|
| `game:start` | 游戏开始 | `{ levelId }` |
| `game:pause` | 游戏暂停 | `{}` |
| `game:resume` | 游戏恢复 | `{}` |
| `game:end` | 游戏结束 | `{ reason }` |
| `level:load` | 关卡加载 | `{ levelId }` |
| `level:complete` | 关卡完成 | `{ levelId, time, stars }` |
| `ball:collision` | 小球碰撞 | `{ target, velocity }` |
| `ball:outOfBounds` | 小球出界 | `{ position }` |
| `ui:screenChange` | UI屏幕变化 | `{ from, to }` |
| `sensor:unavailable` | 传感器不可用 | `{ reason }` |
