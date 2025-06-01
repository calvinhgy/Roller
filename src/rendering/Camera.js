import * as THREE from 'three';

/**
 * 相机控制类，管理游戏相机
 */
export class Camera {
  /**
   * 创建相机控制器
   * @param {Object} options - 相机选项
   */
  constructor(options = {}) {
    this.options = Object.assign({
      fov: 60,
      near: 0.1,
      far: 1000,
      position: { x: 0, y: 10, z: 10 },
      lookAt: { x: 0, y: 0, z: 0 },
      followDistance: 7,
      followHeight: 5,
      followLerp: 0.1,
      followTarget: null
    }, options);
    
    // 创建透视相机
    this.camera = new THREE.PerspectiveCamera(
      this.options.fov,
      window.innerWidth / window.innerHeight,
      this.options.near,
      this.options.far
    );
    
    // 设置初始位置
    this.camera.position.set(
      this.options.position.x,
      this.options.position.y,
      this.options.position.z
    );
    
    // 设置初始朝向
    this.camera.lookAt(
      this.options.lookAt.x,
      this.options.lookAt.y,
      this.options.lookAt.z
    );
    
    // 跟随目标
    this.followTarget = this.options.followTarget;
    
    // 相机偏移
    this.offset = new THREE.Vector3(0, this.options.followHeight, this.options.followDistance);
    
    // 理想位置（用于平滑跟随）
    this.idealPosition = new THREE.Vector3();
    
    // 理想朝向
    this.idealLookAt = new THREE.Vector3();
    
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  /**
   * 更新相机
   * @param {number} deltaTime - 帧间隔时间(秒)
   */
  update(deltaTime) {
    if (!this.followTarget) return;
    
    // 获取目标位置
    const targetPosition = this.getTargetPosition();
    
    // 计算理想位置
    this.idealPosition.copy(targetPosition).add(this.offset);
    
    // 平滑移动相机
    this.camera.position.lerp(this.idealPosition, this.options.followLerp);
    
    // 计算理想朝向
    this.idealLookAt.copy(targetPosition);
    
    // 相机始终看向目标
    this.camera.lookAt(this.idealLookAt);
  }
  
  /**
   * 获取目标位置
   * @returns {THREE.Vector3} 目标位置
   */
  getTargetPosition() {
    if (!this.followTarget) {
      return new THREE.Vector3(0, 0, 0);
    }
    
    // 如果目标是Three.js对象
    if (this.followTarget instanceof THREE.Object3D) {
      return this.followTarget.position.clone();
    }
    
    // 如果目标是物理对象
    if (this.followTarget.position) {
      return new THREE.Vector3(
        this.followTarget.position.x,
        this.followTarget.position.y,
        this.followTarget.position.z
      );
    }
    
    // 默认返回原点
    return new THREE.Vector3(0, 0, 0);
  }
  
  /**
   * 设置跟随目标
   * @param {Object|THREE.Object3D} target - 跟随目标
   */
  setFollowTarget(target) {
    this.followTarget = target;
  }
  
  /**
   * 设置跟随参数
   * @param {Object} params - 跟随参数
   */
  setFollowParams(params) {
    if (params.distance !== undefined) {
      this.offset.z = params.distance;
    }
    
    if (params.height !== undefined) {
      this.offset.y = params.height;
    }
    
    if (params.lerp !== undefined) {
      this.options.followLerp = params.lerp;
    }
  }
  
  /**
   * 处理窗口大小变化
   */
  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
  
  /**
   * 获取相机实例
   * @returns {THREE.Camera} 相机实例
   */
  getCamera() {
    return this.camera;
  }
  
  /**
   * 设置相机位置
   * @param {Object} position - 位置坐标
   */
  setPosition(position) {
    this.camera.position.set(
      position.x,
      position.y,
      position.z
    );
  }
  
  /**
   * 设置相机朝向
   * @param {Object} target - 目标点坐标
   */
  lookAt(target) {
    this.camera.lookAt(
      target.x,
      target.y,
      target.z
    );
  }
  
  /**
   * 设置相机视场角
   * @param {number} fov - 视场角(度)
   */
  setFOV(fov) {
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  }
  
  /**
   * 震动相机
   * @param {number} intensity - 震动强度
   * @param {number} duration - 震动持续时间(秒)
   */
  shake(intensity = 0.5, duration = 0.5) {
    // 保存原始位置
    const originalPosition = this.camera.position.clone();
    
    // 震动开始时间
    const startTime = performance.now();
    
    // 震动函数
    const shakeCamera = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      
      if (elapsed < duration) {
        // 计算震动衰减
        const damping = 1 - elapsed / duration;
        
        // 添加随机偏移
        const offsetX = (Math.random() * 2 - 1) * intensity * damping;
        const offsetY = (Math.random() * 2 - 1) * intensity * damping;
        const offsetZ = (Math.random() * 2 - 1) * intensity * damping;
        
        this.camera.position.set(
          originalPosition.x + offsetX,
          originalPosition.y + offsetY,
          originalPosition.z + offsetZ
        );
        
        // 继续震动
        requestAnimationFrame(shakeCamera);
      } else {
        // 震动结束，恢复原始位置
        this.camera.position.copy(originalPosition);
      }
    };
    
    // 开始震动
    shakeCamera();
  }
}
