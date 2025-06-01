import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Camera } from '../rendering/Camera.js';

/**
 * 关卡类，表示单个游戏关卡
 */
export class Level {
  /**
   * 创建关卡实例
   * @param {number} id - 关卡ID
   * @param {Object} data - 关卡数据
   */
  constructor(id, data) {
    this.id = id;
    this.data = data;
    
    // 关卡状态
    this.initialized = false;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.completed = false;
    
    // 游戏对象
    this.objects = {
      ball: null,
      floor: null,
      walls: [],
      obstacles: [],
      decorations: [],
      startMarker: null,
      endMarker: null
    };
    
    // 物理对象
    this.physics = {
      ball: null,
      floor: null,
      walls: [],
      obstacles: []
    };
    
    // 相机
    this.camera = null;
  }
  
  /**
   * 初始化关卡
   * @param {THREE.Scene} scene - 3D场景
   * @param {PhysicsWorld} physicsWorld - 物理世界
   * @returns {Promise<void>}
   */
  async init(scene, physicsWorld) {
    if (this.initialized) return;
    
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    
    // 创建相机
    this.camera = new Camera({
      position: { x: 0, y: 10, z: 10 },
      lookAt: { x: 0, y: 0, z: 0 },
      followDistance: 7,
      followHeight: 5
    });
    
    // 创建关卡元素
    await this.createLevel();
    
    // 设置相机跟随目标
    this.camera.setFollowTarget(this.objects.ball);
    
    // 重置关卡
    this.reset();
    
    this.initialized = true;
  }
  
  /**
   * 创建关卡元素
   * @returns {Promise<void>}
   */
  async createLevel() {
    // 创建地板
    this.createFloor();
    
    // 创建墙壁
    this.createWalls();
    
    // 创建障碍物
    this.createObstacles();
    
    // 创建小球
    this.createBall();
    
    // 创建起点和终点标记
    this.createMarkers();
    
    // 创建装饰物
    this.createDecorations();
  }
  
  /**
   * 创建地板
   */
  createFloor() {
    const { size, floor } = this.data.data;
    
    // 创建地板几何体
    const geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    
    // 创建地板材质
    const material = this.createMaterial(floor.material);
    
    // 创建地板网格
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.position.set(0, -size.height / 2, 0);
    
    // 添加到场景
    this.scene.add(mesh);
    this.objects.floor = mesh;
    
    // 创建地板物理体
    const floorShape = new CANNON.Box(new CANNON.Vec3(
      size.width / 2,
      size.height / 2,
      size.depth / 2
    ));
    
    const floorBody = this.physicsWorld.createBox({
      size: {
        x: size.width,
        y: size.height,
        z: size.depth
      },
      position: {
        x: 0,
        y: -size.height / 2,
        z: 0
      },
      isStatic: true
    });
    
    this.physics.floor = floorBody;
  }
  
  /**
   * 创建墙壁
   */
  createWalls() {
    const { walls } = this.data.data;
    
    walls.forEach((wall, index) => {
      // 计算墙壁尺寸和位置
      const start = new THREE.Vector3(wall.start.x, 0, wall.start.z);
      const end = new THREE.Vector3(wall.end.x, 0, wall.end.z);
      
      const direction = end.clone().sub(start);
      const length = direction.length();
      const center = start.clone().add(end).multiplyScalar(0.5);
      
      // 计算旋转角度
      const angle = Math.atan2(direction.z, direction.x);
      
      // 创建墙壁几何体
      const geometry = new THREE.BoxGeometry(length, wall.height, 0.5);
      
      // 创建墙壁材质
      const material = new THREE.MeshStandardMaterial({
        color: 0x8B4513, // 棕色
        metalness: 0.1,
        roughness: 0.8
      });
      
      // 创建墙壁网格
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.set(center.x, wall.height / 2, center.z);
      mesh.rotation.set(0, angle + Math.PI / 2, 0);
      
      // 添加到场景
      this.scene.add(mesh);
      this.objects.walls.push(mesh);
      
      // 创建墙壁物理体
      const wallBody = this.physicsWorld.createBox({
        size: {
          x: length,
          y: wall.height,
          z: 0.5
        },
        position: {
          x: center.x,
          y: wall.height / 2,
          z: center.z
        },
        isStatic: true
      });
      
      // 设置旋转
      const quaternion = new CANNON.Quaternion();
      quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angle + Math.PI / 2);
      wallBody.quaternion.copy(quaternion);
      
      this.physics.walls.push(wallBody);
    });
  }
  
  /**
   * 创建障碍物
   */
  createObstacles() {
    const { obstacles } = this.data.data;
    
    if (!obstacles) return;
    
    obstacles.forEach((obstacle, index) => {
      switch (obstacle.type) {
        case 'ramp':
          this.createRamp(obstacle, index);
          break;
          
        // 可以添加更多障碍物类型
        
        default:
          console.warn(`未知的障碍物类型: ${obstacle.type}`);
      }
    });
  }
  
  /**
   * 创建斜坡
   * @param {Object} data - 斜坡数据
   * @param {number} index - 索引
   */
  createRamp(data, index) {
    // 创建斜坡几何体
    const geometry = new THREE.BoxGeometry(
      data.size.width,
      data.size.height,
      data.size.depth
    );
    
    // 创建斜坡材质
    const material = this.createMaterial(data.material);
    
    // 创建斜坡网格
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(
      data.position.x,
      data.position.y + data.size.height / 2,
      data.position.z
    );
    
    // 设置旋转
    mesh.rotation.set(
      data.rotation.x || 0,
      data.rotation.y || 0,
      data.rotation.z || 0
    );
    
    // 添加到场景
    this.scene.add(mesh);
    this.objects.obstacles.push(mesh);
    
    // 创建斜坡物理体
    const rampShape = new CANNON.Box(new CANNON.Vec3(
      data.size.width / 2,
      data.size.height / 2,
      data.size.depth / 2
    ));
    
    const rampBody = this.physicsWorld.addBody({
      mass: 0, // 静态物体
      position: new CANNON.Vec3(
        data.position.x,
        data.position.y + data.size.height / 2,
        data.position.z
      ),
      shape: rampShape
    });
    
    // 设置旋转
    const quaternion = new CANNON.Quaternion();
    quaternion.setFromEuler(
      data.rotation.x || 0,
      data.rotation.y || 0,
      data.rotation.z || 0,
      'XYZ'
    );
    rampBody.quaternion.copy(quaternion);
    
    this.physics.obstacles.push(rampBody);
  }
  
  /**
   * 创建小球
   */
  createBall() {
    const { ball, start } = this.data.data;
    
    // 创建小球几何体
    const geometry = new THREE.SphereGeometry(ball.radius, 32, 32);
    
    // 创建小球材质
    const material = this.createMaterial(ball.material);
    
    // 创建小球网格
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(start.x, start.y, start.z);
    
    // 添加到场景
    this.scene.add(mesh);
    this.objects.ball = mesh;
    
    // 创建小球物理体
    const ballBody = this.physicsWorld.createSphere({
      radius: ball.radius,
      mass: ball.mass,
      position: {
        x: start.x,
        y: start.y,
        z: start.z
      },
      linearDamping: 0.2, // 线性阻尼
      angularDamping: 0.2 // 角阻尼
    });
    
    // 添加碰撞监听
    this.physicsWorld.addCollisionListener((bodyA, bodyB) => {
      // 检查是否是小球碰撞
      if ((bodyA === ballBody || bodyB === ballBody) && 
          window.game && window.game.audioManager) {
        // 获取碰撞速度
        const relativeVelocity = bodyA.velocity.distanceTo(bodyB.velocity);
        
        // 只有当碰撞速度足够大时才播放音效
        if (relativeVelocity > 1) {
          // 根据碰撞强度调整音量
          const volume = Math.min(relativeVelocity / 10, 1) * 0.5;
          window.game.audioManager.play('collision', { volume });
        }
      }
    });
    
    this.physics.ball = ballBody;
  }
  
  /**
   * 创建起点和终点标记
   */
  createMarkers() {
    const { start, end } = this.data.data;
    
    // 创建起点标记
    const startGeometry = new THREE.CylinderGeometry(1, 1, 0.1, 32);
    const startMaterial = new THREE.MeshStandardMaterial({
      color: 0x00FF00, // 绿色
      transparent: true,
      opacity: 0.5
    });
    
    const startMarker = new THREE.Mesh(startGeometry, startMaterial);
    startMarker.position.set(start.x, 0.05, start.z);
    this.scene.add(startMarker);
    this.objects.startMarker = startMarker;
    
    // 创建终点标记
    const endGeometry = new THREE.CylinderGeometry(1, 1, 0.1, 32);
    const endMaterial = new THREE.MeshStandardMaterial({
      color: 0xFF0000, // 红色
      transparent: true,
      opacity: 0.5
    });
    
    const endMarker = new THREE.Mesh(endGeometry, endMaterial);
    endMarker.position.set(end.x, 0.05, end.z);
    this.scene.add(endMarker);
    this.objects.endMarker = endMarker;
  }
  
  /**
   * 创建装饰物
   */
  createDecorations() {
    // 这里可以添加一些装饰物，如树木、岩石等
    // 为了简化，这里暂不实现
  }
  
  /**
   * 创建材质
   * @param {Object} materialData - 材质数据
   * @returns {THREE.Material} 创建的材质
   */
  createMaterial(materialData) {
    switch (materialData.type) {
      case 'basic':
        return new THREE.MeshStandardMaterial({
          color: materialData.color,
          metalness: materialData.metalness || 0.1,
          roughness: materialData.roughness || 0.8
        });
        
      case 'phong':
        return new THREE.MeshPhongMaterial({
          color: materialData.color,
          specular: materialData.specular || 0x111111,
          shininess: materialData.shininess || 30
        });
        
      case 'lambert':
        return new THREE.MeshLambertMaterial({
          color: materialData.color
        });
        
      default:
        console.warn(`未知的材质类型: ${materialData.type}，使用标准材质`);
        return new THREE.MeshStandardMaterial({
          color: materialData.color || 0xCCCCCC
        });
    }
  }
  
  /**
   * 更新关卡状态
   * @param {number} deltaTime - 帧间隔时间(秒)
   */
  update(deltaTime) {
    if (!this.initialized || this.completed) return;
    
    // 更新计时器
    this.elapsedTime += deltaTime;
    
    // 更新小球位置
    if (this.objects.ball && this.physics.ball) {
      this.objects.ball.position.copy(this.physics.ball.position);
      this.objects.ball.quaternion.copy(this.physics.ball.quaternion);
      
      // 检查小球是否在移动，如果是则播放滚动音效
      const velocity = this.physics.ball.velocity;
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
      
      if (speed > 0.5 && window.game && window.game.audioManager) {
        if (!this.isRollingSoundPlaying) {
          window.game.audioManager.play('roll', { volume: Math.min(speed / 10, 1) * 0.3 });
          this.isRollingSoundPlaying = true;
        }
      } else if (this.isRollingSoundPlaying && window.game && window.game.audioManager) {
        window.game.audioManager.stop('roll');
        this.isRollingSoundPlaying = false;
      }
    }
    
    // 更新相机
    if (this.camera) {
      this.camera.update(deltaTime);
    }
    
    // 检查小球是否掉出边界
    this.checkBoundaries();
  }
  
  /**
   * 检查小球是否掉出边界
   */
  checkBoundaries() {
    if (!this.physics.ball) return;
    
    const ballPosition = this.physics.ball.position;
    const { size } = this.data.data;
    
    // 如果小球掉出边界，重置位置
    if (ballPosition.y < -10 || 
        Math.abs(ballPosition.x) > size.width / 2 + 5 || 
        Math.abs(ballPosition.z) > size.depth / 2 + 5) {
      this.resetBall();
    }
  }
  
  /**
   * 重置小球位置
   */
  resetBall() {
    const { start } = this.data.data;
    
    if (this.physics.ball) {
      // 重置位置
      this.physics.ball.position.set(start.x, start.y, start.z);
      
      // 重置速度和角速度
      this.physics.ball.velocity.set(0, 0, 0);
      this.physics.ball.angularVelocity.set(0, 0, 0);
    }
  }
  
  /**
   * 检查胜利条件
   * @returns {boolean} 满足胜利条件返回true
   */
  checkWinCondition() {
    if (!this.physics.ball || this.completed) return false;
    
    const ballPosition = this.physics.ball.position;
    const { end } = this.data.data;
    
    // 计算小球与终点的距离
    const distance = Math.sqrt(
      Math.pow(ballPosition.x - end.x, 2) +
      Math.pow(ballPosition.z - end.z, 2)
    );
    
    // 如果小球接近终点，则胜利
    if (distance < 1.5) {
      this.completed = true;
      return true;
    }
    
    return false;
  }
  
  /**
   * 重置关卡
   */
  reset() {
    // 重置状态
    this.startTime = Date.now();
    this.elapsedTime = 0;
    this.completed = false;
    
    // 重置小球位置
    this.resetBall();
  }
  
  /**
   * 获取关卡难度
   * @returns {number} 难度级别(1-5)
   */
  getDifficulty() {
    return this.data.difficulty || 1;
  }
  
  /**
   * 获取起点位置
   * @returns {Object} 起点坐标
   */
  getStartPosition() {
    return { ...this.data.data.start };
  }
  
  /**
   * 获取终点位置
   * @returns {Object} 终点坐标
   */
  getEndPosition() {
    return { ...this.data.data.end };
  }
  
  /**
   * 获取小球
   * @returns {Object} 小球物理对象
   */
  getBall() {
    return this.physics.ball;
  }
  
  /**
   * 获取相机
   * @returns {Camera} 相机对象
   */
  getCamera() {
    return this.camera ? this.camera.getCamera() : null;
  }
  
  /**
   * 获取完成统计数据
   * @returns {Object} 完成统计数据
   */
  getCompletionStats() {
    return {
      time: this.elapsedTime,
      parTime: this.data.parTime
    };
  }
}
