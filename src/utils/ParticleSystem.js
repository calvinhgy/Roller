import * as THREE from 'three';

/**
 * 粒子系统，用于创建各种粒子效果
 */
export class ParticleSystem {
  /**
   * 创建粒子系统
   * @param {THREE.Scene} scene - 3D场景
   */
  constructor(scene) {
    this.scene = scene;
    this.particleSystems = new Map();
    this.nextId = 1;
  }
  
  /**
   * 创建粒子效果
   * @param {string} type - 效果类型
   * @param {Object} options - 效果选项
   * @returns {string} 效果ID
   */
  createEffect(type, options = {}) {
    const id = (this.nextId++).toString();
    
    switch (type) {
      case 'confetti':
        this.createConfettiEffect(id, options);
        break;
      case 'sparkle':
        this.createSparkleEffect(id, options);
        break;
      case 'trail':
        this.createTrailEffect(id, options);
        break;
      case 'explosion':
        this.createExplosionEffect(id, options);
        break;
      default:
        console.warn(`未知的粒子效果类型: ${type}`);
        return null;
    }
    
    return id;
  }
  
  /**
   * 创建五彩纸屑效果
   * @param {string} id - 效果ID
   * @param {Object} options - 效果选项
   */
  createConfettiEffect(id, options = {}) {
    const defaults = {
      position: new THREE.Vector3(0, 5, 0),
      count: 100,
      colors: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff],
      size: 0.1,
      lifetime: 3,
      spread: 3
    };
    
    const settings = { ...defaults, ...options };
    
    // 创建粒子几何体
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];
    const velocities = [];
    const lifetimes = [];
    
    for (let i = 0; i < settings.count; i++) {
      // 初始位置
      positions.push(
        settings.position.x + (Math.random() - 0.5) * 0.5,
        settings.position.y + (Math.random() - 0.5) * 0.5,
        settings.position.z + (Math.random() - 0.5) * 0.5
      );
      
      // 随机颜色
      const color = new THREE.Color(settings.colors[Math.floor(Math.random() * settings.colors.length)]);
      colors.push(color.r, color.g, color.b);
      
      // 随机大小
      sizes.push(settings.size * (0.5 + Math.random() * 0.5));
      
      // 随机速度
      velocities.push(
        (Math.random() - 0.5) * settings.spread,
        Math.random() * settings.spread * 2,
        (Math.random() - 0.5) * settings.spread
      );
      
      // 随机寿命
      lifetimes.push(settings.lifetime * (0.7 + Math.random() * 0.6));
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    
    // 创建粒子材质
    const material = new THREE.PointsMaterial({
      size: settings.size,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      sizeAttenuation: true
    });
    
    // 创建粒子系统
    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);
    
    // 存储粒子系统数据
    this.particleSystems.set(id, {
      particles,
      velocities,
      lifetimes,
      initialLifetimes: [...lifetimes],
      settings,
      type: 'confetti',
      active: true
    });
    
    return id;
  }
  
  /**
   * 创建闪光效果
   * @param {string} id - 效果ID
   * @param {Object} options - 效果选项
   */
  createSparkleEffect(id, options = {}) {
    const defaults = {
      position: new THREE.Vector3(0, 0, 0),
      count: 20,
      color: 0xFFFFFF,
      size: 0.05,
      lifetime: 1,
      radius: 0.5
    };
    
    const settings = { ...defaults, ...options };
    
    // 创建粒子几何体
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];
    const velocities = [];
    const lifetimes = [];
    
    const color = new THREE.Color(settings.color);
    
    for (let i = 0; i < settings.count; i++) {
      // 在球体内随机分布
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = settings.radius * Math.random();
      
      const x = settings.position.x + r * Math.sin(phi) * Math.cos(theta);
      const y = settings.position.y + r * Math.sin(phi) * Math.sin(theta);
      const z = settings.position.z + r * Math.cos(phi);
      
      positions.push(x, y, z);
      
      // 颜色
      colors.push(color.r, color.g, color.b);
      
      // 随机大小
      sizes.push(settings.size * (0.5 + Math.random() * 0.5));
      
      // 向外扩散的速度
      const speed = 0.5 + Math.random() * 0.5;
      velocities.push(
        (x - settings.position.x) * speed,
        (y - settings.position.y) * speed,
        (z - settings.position.z) * speed
      );
      
      // 随机寿命
      lifetimes.push(settings.lifetime * (0.7 + Math.random() * 0.3));
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    
    // 创建粒子材质
    const material = new THREE.PointsMaterial({
      size: settings.size,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });
    
    // 创建粒子系统
    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);
    
    // 存储粒子系统数据
    this.particleSystems.set(id, {
      particles,
      velocities,
      lifetimes,
      initialLifetimes: [...lifetimes],
      settings,
      type: 'sparkle',
      active: true
    });
    
    return id;
  }
  
  /**
   * 创建轨迹效果
   * @param {string} id - 效果ID
   * @param {Object} options - 效果选项
   */
  createTrailEffect(id, options = {}) {
    const defaults = {
      target: null,
      count: 50,
      color: 0x1E88E5,
      size: 0.05,
      lifetime: 1
    };
    
    const settings = { ...defaults, ...options };
    
    if (!settings.target) {
      console.error('轨迹效果需要指定目标对象');
      return null;
    }
    
    // 创建粒子几何体
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];
    const lifetimes = [];
    
    const color = new THREE.Color(settings.color);
    
    for (let i = 0; i < settings.count; i++) {
      // 初始位置（全部在目标位置）
      positions.push(
        settings.target.position.x,
        settings.target.position.y,
        settings.target.position.z
      );
      
      // 颜色
      colors.push(color.r, color.g, color.b);
      
      // 大小
      sizes.push(settings.size * (0.5 + Math.random() * 0.5));
      
      // 寿命（按顺序递减，形成尾巴效果）
      lifetimes.push(settings.lifetime * (i / settings.count));
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    
    // 创建粒子材质
    const material = new THREE.PointsMaterial({
      size: settings.size,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });
    
    // 创建粒子系统
    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);
    
    // 存储粒子系统数据
    this.particleSystems.set(id, {
      particles,
      positions: positions,
      lifetimes,
      initialLifetimes: [...lifetimes],
      settings,
      type: 'trail',
      active: true,
      lastPosition: new THREE.Vector3().copy(settings.target.position)
    });
    
    return id;
  }
  
  /**
   * 创建爆炸效果
   * @param {string} id - 效果ID
   * @param {Object} options - 效果选项
   */
  createExplosionEffect(id, options = {}) {
    const defaults = {
      position: new THREE.Vector3(0, 0, 0),
      count: 100,
      color: 0xFF5722,
      size: 0.1,
      lifetime: 1,
      radius: 0.1,
      speed: 5
    };
    
    const settings = { ...defaults, ...options };
    
    // 创建粒子几何体
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];
    const velocities = [];
    const lifetimes = [];
    
    const baseColor = new THREE.Color(settings.color);
    
    for (let i = 0; i < settings.count; i++) {
      // 初始位置（在球体内随机分布）
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = settings.radius * Math.random();
      
      const x = settings.position.x + r * Math.sin(phi) * Math.cos(theta);
      const y = settings.position.y + r * Math.sin(phi) * Math.sin(theta);
      const z = settings.position.z + r * Math.cos(phi);
      
      positions.push(x, y, z);
      
      // 颜色（从中心颜色到黄色/白色的渐变）
      const colorFactor = Math.random() * 0.4 + 0.6; // 0.6-1.0
      const color = new THREE.Color(baseColor).lerp(new THREE.Color(0xFFFF00), colorFactor);
      colors.push(color.r, color.g, color.b);
      
      // 随机大小
      sizes.push(settings.size * (0.5 + Math.random() * 0.5));
      
      // 向外爆炸的速度
      const speed = settings.speed * (0.8 + Math.random() * 0.4);
      velocities.push(
        (x - settings.position.x) * speed,
        (y - settings.position.y) * speed,
        (z - settings.position.z) * speed
      );
      
      // 随机寿命
      lifetimes.push(settings.lifetime * (0.7 + Math.random() * 0.3));
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    
    // 创建粒子材质
    const material = new THREE.PointsMaterial({
      size: settings.size,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });
    
    // 创建粒子系统
    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);
    
    // 存储粒子系统数据
    this.particleSystems.set(id, {
      particles,
      velocities,
      lifetimes,
      initialLifetimes: [...lifetimes],
      settings,
      type: 'explosion',
      active: true
    });
    
    return id;
  }
  
  /**
   * 更新粒子系统
   * @param {number} deltaTime - 帧间隔时间(秒)
   */
  update(deltaTime) {
    this.particleSystems.forEach((system, id) => {
      if (!system.active) return;
      
      switch (system.type) {
        case 'confetti':
        case 'sparkle':
        case 'explosion':
          this.updateParticles(system, deltaTime);
          break;
        case 'trail':
          this.updateTrail(system, deltaTime);
          break;
      }
      
      // 检查是否所有粒子都已经消失
      const allDead = system.lifetimes.every(life => life <= 0);
      if (allDead) {
        this.removeEffect(id);
      }
    });
  }
  
  /**
   * 更新粒子
   * @param {Object} system - 粒子系统数据
   * @param {number} deltaTime - 帧间隔时间(秒)
   */
  updateParticles(system, deltaTime) {
    const positions = system.particles.geometry.attributes.position.array;
    const sizes = system.particles.geometry.attributes.size.array;
    
    for (let i = 0; i < system.lifetimes.length; i++) {
      // 更新寿命
      system.lifetimes[i] -= deltaTime;
      
      if (system.lifetimes[i] > 0) {
        // 更新位置
        positions[i * 3] += system.velocities[i * 3] * deltaTime;
        positions[i * 3 + 1] += system.velocities[i * 3 + 1] * deltaTime;
        positions[i * 3 + 2] += system.velocities[i * 3 + 2] * deltaTime;
        
        // 应用重力（对于confetti）
        if (system.type === 'confetti') {
          system.velocities[i * 3 + 1] -= 2 * deltaTime; // 重力
        }
        
        // 更新大小（随寿命减小）
        const lifeFactor = system.lifetimes[i] / system.initialLifetimes[i];
        sizes[i] = system.settings.size * lifeFactor;
      } else {
        // 粒子消失
        positions[i * 3] = 0;
        positions[i * 3 + 1] = -1000; // 移到视野外
        positions[i * 3 + 2] = 0;
        sizes[i] = 0;
      }
    }
    
    system.particles.geometry.attributes.position.needsUpdate = true;
    system.particles.geometry.attributes.size.needsUpdate = true;
    
    // 更新材质透明度
    const oldestLife = Math.max(...system.lifetimes);
    const lifeFactor = oldestLife / Math.max(...system.initialLifetimes);
    system.particles.material.opacity = lifeFactor;
  }
  
  /**
   * 更新轨迹效果
   * @param {Object} system - 粒子系统数据
   * @param {number} deltaTime - 帧间隔时间(秒)
   */
  updateTrail(system, deltaTime) {
    const positions = system.particles.geometry.attributes.position.array;
    const sizes = system.particles.geometry.attributes.size.array;
    const target = system.settings.target;
    
    // 检查目标是否移动
    if (target.position.distanceToSquared(system.lastPosition) > 0.0001) {
      // 目标移动了，更新轨迹
      
      // 将所有粒子向后移动一个位置
      for (let i = system.lifetimes.length - 1; i > 0; i--) {
        positions[i * 3] = positions[(i - 1) * 3];
        positions[i * 3 + 1] = positions[(i - 1) * 3 + 1];
        positions[i * 3 + 2] = positions[(i - 1) * 3 + 2];
        
        system.lifetimes[i] = system.lifetimes[i - 1];
      }
      
      // 更新第一个粒子为当前位置
      positions[0] = target.position.x;
      positions[1] = target.position.y;
      positions[2] = target.position.z;
      system.lifetimes[0] = system.initialLifetimes[0];
      
      // 更新上一次位置
      system.lastPosition.copy(target.position);
    }
    
    // 更新所有粒子的寿命和大小
    for (let i = 0; i < system.lifetimes.length; i++) {
      system.lifetimes[i] -= deltaTime;
      
      if (system.lifetimes[i] <= 0) {
        // 隐藏已消失的粒子
        positions[i * 3 + 1] = -1000;
        sizes[i] = 0;
      } else {
        // 更新大小
        const lifeFactor = system.lifetimes[i] / system.initialLifetimes[i];
        sizes[i] = system.settings.size * lifeFactor;
      }
    }
    
    system.particles.geometry.attributes.position.needsUpdate = true;
    system.particles.geometry.attributes.size.needsUpdate = true;
  }
  
  /**
   * 移除粒子效果
   * @param {string} id - 效果ID
   */
  removeEffect(id) {
    const system = this.particleSystems.get(id);
    if (!system) return;
    
    // 从场景中移除
    this.scene.remove(system.particles);
    
    // 释放资源
    system.particles.geometry.dispose();
    system.particles.material.dispose();
    
    // 从映射中移除
    this.particleSystems.delete(id);
  }
  
  /**
   * 暂停粒子效果
   * @param {string} id - 效果ID
   */
  pauseEffect(id) {
    const system = this.particleSystems.get(id);
    if (system) {
      system.active = false;
    }
  }
  
  /**
   * 恢复粒子效果
   * @param {string} id - 效果ID
   */
  resumeEffect(id) {
    const system = this.particleSystems.get(id);
    if (system) {
      system.active = true;
    }
  }
  
  /**
   * 清除所有粒子效果
   */
  clearAllEffects() {
    this.particleSystems.forEach((system, id) => {
      this.removeEffect(id);
    });
  }
}
