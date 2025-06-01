// 实现游戏核心功能
// 注意：确保THREE已经在全局作用域中可用

// 游戏状态
let gameState = {
  running: false,
  scene: null,
  camera: null,
  renderer: null,
  ball: null,
  floor: null,
  walls: [],
  goal: null,
  lastTime: 0,
  deviceOrientation: { beta: 0, gamma: 0 },
  sensitivity: 1.0
};

// 初始化游戏
export function initGame(container) {
  console.log("初始化游戏...");
  
  try {
    // 检查THREE是否已加载
    if (typeof THREE === 'undefined') {
      throw new Error('THREE.js 未加载');
    }
    
    // 创建场景
    gameState.scene = new THREE.Scene();
    gameState.scene.background = new THREE.Color(0x87CEEB); // 天蓝色背景
    
    // 创建相机
    gameState.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    gameState.camera.position.set(0, 10, 10);
    gameState.camera.lookAt(0, 0, 0);
    
    // 创建渲染器
    gameState.renderer = new THREE.WebGLRenderer({ antialias: true });
    gameState.renderer.setSize(window.innerWidth, window.innerHeight);
    gameState.renderer.setPixelRatio(window.devicePixelRatio);
    container.innerHTML = ''; // 清空容器
    container.appendChild(gameState.renderer.domElement);
    
    // 添加灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    gameState.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    gameState.scene.add(directionalLight);
    
    // 创建地板
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4CAF50,
      roughness: 0.8,
      metalness: 0.2
    });
    gameState.floor = new THREE.Mesh(floorGeometry, floorMaterial);
    gameState.floor.rotation.x = -Math.PI / 2;
    gameState.floor.receiveShadow = true;
    gameState.scene.add(gameState.floor);
    
    // 创建小球 - 使用更明显的颜色和大小
    const ballGeometry = new THREE.SphereGeometry(1, 32, 32);
    const ballMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFF0000,
      roughness: 0.4,
      metalness: 0.6
    });
    gameState.ball = new THREE.Mesh(ballGeometry, ballMaterial);
    gameState.ball.position.set(0, 1, 0);
    gameState.ball.castShadow = true;
    gameState.ball.receiveShadow = true;
    gameState.scene.add(gameState.ball);
    
    console.log("小球已创建:", gameState.ball);
    
    // 创建目标点
    const goalGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.1, 32);
    const goalMaterial = new THREE.MeshStandardMaterial({ color: 0xFF5722 });
    gameState.goal = new THREE.Mesh(goalGeometry, goalMaterial);
    gameState.goal.position.set(7, 0.05, 7);
    gameState.scene.add(gameState.goal);
    
    // 创建墙壁
    createWalls();
    
    // 设置窗口大小调整事件
    window.addEventListener('resize', onWindowResize);
    
    // 设置设备方向事件
    window.addEventListener('deviceorientation', handleDeviceOrientation);
    
    console.log("游戏初始化完成");
    
    // 立即渲染一次，确保场景可见
    gameState.renderer.render(gameState.scene, gameState.camera);
    
    return true;
  } catch (error) {
    console.error("游戏初始化失败:", error);
    return false;
  }
}

// 创建墙壁
function createWalls() {
  const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2196F3,
    roughness: 0.7,
    metalness: 0.3
  });
  
  // 简单迷宫布局
  const wallPositions = [
    { x: 0, z: 5, width: 10, height: 1 },
    { x: -5, z: 0, width: 1, height: 10, rotateY: Math.PI / 2 },
    { x: 5, z: 0, width: 1, height: 10, rotateY: Math.PI / 2 },
    { x: 0, z: -5, width: 10, height: 1 },
    { x: -3, z: 2, width: 6, height: 1 },
    { x: 3, z: -2, width: 6, height: 1 }
  ];
  
  wallPositions.forEach(wall => {
    const wallGeometry = new THREE.BoxGeometry(wall.width, 1, 0.2);
    const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
    
    wallMesh.position.x = wall.x;
    wallMesh.position.y = 0.5;
    wallMesh.position.z = wall.z;
    
    if (wall.rotateY) {
      wallMesh.rotation.y = wall.rotateY;
    }
    
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    
    gameState.scene.add(wallMesh);
    gameState.walls.push(wallMesh);
  });
}

// 处理设备方向变化
function handleDeviceOrientation(event) {
  if (!gameState.running) return;
  
  // 获取设备方向数据
  gameState.deviceOrientation = {
    beta: event.beta || 0,  // 前后倾斜
    gamma: event.gamma || 0 // 左右倾斜
  };
}

// 更新游戏状态
export function updateGame(timestamp) {
  if (!gameState.running) return;
  
  // 计算帧间隔时间
  const deltaTime = timestamp - gameState.lastTime;
  gameState.lastTime = timestamp;
  
  // 根据设备倾斜角度移动小球
  if (gameState.ball) {
    // 将角度转换为速度
    const speedX = gameState.deviceOrientation.gamma * 0.01 * gameState.sensitivity;
    const speedZ = gameState.deviceOrientation.beta * 0.01 * gameState.sensitivity;
    
    // 更新小球位置
    gameState.ball.position.x += speedX;
    gameState.ball.position.z += speedZ;
    
    // 限制小球在地板范围内
    gameState.ball.position.x = Math.max(-9.5, Math.min(9.5, gameState.ball.position.x));
    gameState.ball.position.z = Math.max(-9.5, Math.min(9.5, gameState.ball.position.z));
    
    // 检测与目标的碰撞
    if (checkGoalCollision()) {
      console.log("目标达成！");
      gameState.running = false;
      
      // 触发胜利事件
      const event = new CustomEvent('game:win');
      window.dispatchEvent(event);
    }
    
    // 检测与墙壁的碰撞
    checkWallCollisions();
  }
  
  // 更新相机位置，跟随小球
  if (gameState.camera && gameState.ball) {
    gameState.camera.position.x = gameState.ball.position.x;
    gameState.camera.position.z = gameState.ball.position.z + 10;
    gameState.camera.lookAt(gameState.ball.position);
  }
}

// 渲染游戏
export function renderGame() {
  if (gameState.renderer && gameState.scene && gameState.camera) {
    gameState.renderer.render(gameState.scene, gameState.camera);
  }
}

// 开始游戏
export function startGame() {
  console.log("开始游戏");
  gameState.running = true;
  gameState.lastTime = performance.now();
  
  // 重置小球位置
  if (gameState.ball) {
    gameState.ball.position.set(0, 1, 0);
  }
  
  // 开始游戏循环
  gameLoop();
}

// 游戏循环
function gameLoop(timestamp) {
  updateGame(timestamp);
  renderGame();
  
  if (gameState.running) {
    requestAnimationFrame(gameLoop);
  }
}

// 窗口大小调整
function onWindowResize() {
  if (gameState.camera && gameState.renderer) {
    gameState.camera.aspect = window.innerWidth / window.innerHeight;
    gameState.camera.updateProjectionMatrix();
    gameState.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// 检测与目标的碰撞
function checkGoalCollision() {
  if (!gameState.ball || !gameState.goal) return false;
  
  const ballPos = gameState.ball.position;
  const goalPos = gameState.goal.position;
  
  // 简单距离检测
  const dx = ballPos.x - goalPos.x;
  const dz = ballPos.z - goalPos.z;
  const distance = Math.sqrt(dx * dx + dz * dz);
  
  return distance < 1.0; // 如果距离小于1.0单位，认为碰撞
}

// 检测与墙壁的碰撞
function checkWallCollisions() {
  // 简化版碰撞检测，实际游戏中应使用更精确的碰撞检测
  // 这里仅作示例
}

// 设置灵敏度
export function setSensitivity(value) {
  gameState.sensitivity = value;
}

// 校准设备方向
export function calibrateOrientation() {
  // 重置设备方向基准值
  gameState.deviceOrientation = { beta: 0, gamma: 0 };
}

// 暂停游戏
export function pauseGame() {
  gameState.running = false;
}

// 恢复游戏
export function resumeGame() {
  if (!gameState.running) {
    gameState.running = true;
    gameState.lastTime = performance.now();
    gameLoop();
  }
}

// 清理游戏资源
export function cleanupGame() {
  window.removeEventListener('resize', onWindowResize);
  window.removeEventListener('deviceorientation', handleDeviceOrientation);
  
  // 清理Three.js资源
  if (gameState.renderer) {
    gameState.renderer.dispose();
  }
}
