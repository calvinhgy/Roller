import * as CANNON from 'cannon-es';

/**
 * 物理世界类，封装物理引擎
 */
export class PhysicsWorld {
  /**
   * 创建物理世界
   * @param {Object} options - 物理世界配置
   */
  constructor(options = {}) {
    // 创建物理世界
    this.world = new CANNON.World();
    
    // 设置默认重力
    this.world.gravity.set(0, -9.82, 0); // 默认地球重力
    
    // 设置物理世界参数
    this.world.allowSleep = options.allowSleep !== undefined ? options.allowSleep : true;
    this.world.solver.iterations = options.solverIterations || 10;
    
    // 碰撞事件监听器
    this.collisionListeners = new Map();
    this.nextListenerId = 1;
    
    // 设置碰撞事件处理
    this.world.addEventListener('beginContact', this.handleCollision.bind(this));
  }
  
  /**
   * 添加刚体到物理世界
   * @param {Object} bodyDef - 刚体定义
   * @returns {CANNON.Body} 创建的刚体
   */
  addBody(bodyDef) {
    const body = new CANNON.Body({
      mass: bodyDef.mass !== undefined ? bodyDef.mass : 0,
      position: new CANNON.Vec3(
        bodyDef.position?.x || 0,
        bodyDef.position?.y || 0,
        bodyDef.position?.z || 0
      ),
      shape: bodyDef.shape,
      material: bodyDef.material,
      linearDamping: bodyDef.linearDamping !== undefined ? bodyDef.linearDamping : 0.01,
      angularDamping: bodyDef.angularDamping !== undefined ? bodyDef.angularDamping : 0.01
    });
    
    // 添加用户数据
    body.userData = bodyDef.userData || {};
    
    // 添加到世界
    this.world.addBody(body);
    
    return body;
  }
  
  /**
   * 从物理世界移除刚体
   * @param {CANNON.Body} body - 要移除的刚体
   */
  removeBody(body) {
    this.world.removeBody(body);
  }
  
  /**
   * 更新物理世界
   * @param {number} deltaTime - 时间步长(秒)
   */
  update(deltaTime) {
    // 固定时间步长
    const timeStep = 1/60;
    
    // 使用积累器确保物理模拟的稳定性
    this.world.step(timeStep, deltaTime, 3);
  }
  
  /**
   * 应用力到刚体
   * @param {CANNON.Body} body - 目标刚体
   * @param {Object} force - 力向量
   * @param {Object} point - 应用点(可选)
   */
  applyForce(body, force, point = null) {
    const worldForce = new CANNON.Vec3(force.x, force.y, force.z);
    
    if (point) {
      const worldPoint = new CANNON.Vec3(point.x, point.y, point.z);
      body.applyForce(worldForce, worldPoint);
    } else {
      body.applyForce(worldForce, body.position);
    }
  }
  
  /**
   * 设置重力
   * @param {Object} gravity - 重力向量
   */
  setGravity(gravity) {
    this.world.gravity.set(gravity.x, gravity.y, gravity.z);
  }
  
  /**
   * 添加碰撞监听器
   * @param {Function} callback - 碰撞回调函数
   * @returns {string} 监听器ID
   */
  addCollisionListener(callback) {
    const id = this.nextListenerId++;
    this.collisionListeners.set(id, callback);
    return id.toString();
  }
  
  /**
   * 移除碰撞监听器
   * @param {string} id - 监听器ID
   */
  removeCollisionListener(id) {
    this.collisionListeners.delete(parseInt(id));
  }
  
  /**
   * 处理碰撞事件
   * @param {Object} event - 碰撞事件
   */
  handleCollision(event) {
    const { bodyA, bodyB } = event;
    
    // 通知所有监听器
    this.collisionListeners.forEach(callback => {
      callback(bodyA, bodyB);
    });
  }
  
  /**
   * 创建球体刚体
   * @param {Object} options - 球体选项
   * @returns {CANNON.Body} 球体刚体
   */
  createSphere(options) {
    const shape = new CANNON.Sphere(options.radius);
    
    return this.addBody({
      mass: options.mass || 1,
      position: options.position,
      shape: shape,
      material: options.material,
      linearDamping: options.linearDamping,
      angularDamping: options.angularDamping,
      userData: options.userData
    });
  }
  
  /**
   * 创建盒子刚体
   * @param {Object} options - 盒子选项
   * @returns {CANNON.Body} 盒子刚体
   */
  createBox(options) {
    const shape = new CANNON.Box(new CANNON.Vec3(
      options.size.x / 2,
      options.size.y / 2,
      options.size.z / 2
    ));
    
    const body = this.addBody({
      mass: options.isStatic ? 0 : (options.mass || 1),
      position: options.position,
      shape: shape,
      material: options.material,
      linearDamping: options.linearDamping,
      angularDamping: options.angularDamping,
      userData: options.userData
    });
    
    return body;
  }
  
  /**
   * 创建平面刚体
   * @param {Object} options - 平面选项
   * @returns {CANNON.Body} 平面刚体
   */
  createPlane(options) {
    const shape = new CANNON.Plane();
    
    const body = this.addBody({
      mass: 0, // 平面总是静态的
      position: options.position,
      shape: shape,
      material: options.material,
      userData: options.userData
    });
    
    // 设置平面方向
    if (options.quaternion) {
      body.quaternion.copy(options.quaternion);
    }
    
    return body;
  }
  
  /**
   * 创建物理材质
   * @param {Object} options - 材质选项
   * @returns {CANNON.Material} 物理材质
   */
  createMaterial(options) {
    return new CANNON.Material({
      friction: options.friction !== undefined ? options.friction : 0.3,
      restitution: options.restitution !== undefined ? options.restitution : 0.3
    });
  }
  
  /**
   * 创建材质接触参数
   * @param {CANNON.Material} material1 - 第一个材质
   * @param {CANNON.Material} material2 - 第二个材质
   * @param {Object} options - 接触参数
   */
  createContactMaterial(material1, material2, options) {
    const contactMaterial = new CANNON.ContactMaterial(material1, material2, {
      friction: options.friction !== undefined ? options.friction : 0.3,
      restitution: options.restitution !== undefined ? options.restitution : 0.3
    });
    
    this.world.addContactMaterial(contactMaterial);
  }
}
