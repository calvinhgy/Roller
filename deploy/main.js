// 主入口文件
import { initGame, startGame, pauseGame, resumeGame, setSensitivity } from './game-implementation.js';

// 全局调试对象
window.debugInfo = {
  errors: [],
  logs: []
};

// 捕获错误
window.addEventListener('error', (event) => {
  window.debugInfo.errors.push({
    message: event.message,
    source: event.filename,
    line: event.lineno
  });
  
  // 在调试面板中显示错误
  updateDebugPanel();
  
  return false;
});

// 重写console.log
const originalLog = console.log;
console.log = function() {
  window.debugInfo.logs.push(Array.from(arguments).join(' '));
  originalLog.apply(console, arguments);
  
  // 更新调试面板
  updateDebugPanel();
};

// 更新调试面板
function updateDebugPanel() {
  const debugPanel = document.getElementById('debug-panel');
  if (!debugPanel) return;
  
  const errors = window.debugInfo.errors.slice(-5).map(e => 
    `<div style="color:red">${e.message} (${e.source}:${e.line})</div>`
  ).join('');
  
  const logs = window.debugInfo.logs.slice(-5).map(log => 
    `<div>${log}</div>`
  ).join('');
  
  debugPanel.innerHTML = `
    <div><strong>调试信息</strong> <button id="hide-debug">隐藏</button></div>
    <div><strong>错误:</strong></div>
    ${errors || '<div>无错误</div>'}
    <div><strong>日志:</strong></div>
    ${logs || '<div>无日志</div>'}
    <div>
      <button id="fix-loading">修复加载</button>
      <button id="force-init">强制初始化</button>
    </div>
  `;
  
  // 添加按钮事件
  document.getElementById('hide-debug').addEventListener('click', () => {
    debugPanel.style.display = 'none';
  });
  
  document.getElementById('fix-loading').addEventListener('click', () => {
    hideScreen('loading-screen');
    showScreen('main-menu');
  });
  
  document.getElementById('force-init').addEventListener('click', () => {
    forceInitGame();
  });
}

// 强制初始化游戏
function forceInitGame() {
  hideScreen('loading-screen');
  hideScreen('main-menu');
  showScreen('game-screen');
  
  const container = document.getElementById('game-canvas-container');
  if (container) {
    initGame(container);
    startGame();
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM已加载完成');
  
  // 创建调试面板
  createDebugPanel();
  
  // 显示加载屏幕
  showScreen('loading-screen');
  
  try {
    // 检查THREE是否已加载
    if (typeof THREE === 'undefined') {
      throw new Error('THREE.js 未加载，请检查网络连接');
    }
    
    // 设置UI事件监听器
    setupEventListeners();
    
    // 延迟一下，模拟加载过程
    setTimeout(() => {
      console.log('准备显示主菜单');
      // 隐藏加载屏幕，显示主菜单
      hideScreen('loading-screen');
      showScreen('main-menu');
    }, 1000);
  } catch (error) {
    console.error('初始化错误:', error);
    // 出错时也显示主菜单
    hideScreen('loading-screen');
    showScreen('main-menu');
  }
});

// 创建调试面板
function createDebugPanel() {
  const debugPanel = document.createElement('div');
  debugPanel.id = 'debug-panel';
  debugPanel.style.position = 'fixed';
  debugPanel.style.top = '10px';
  debugPanel.style.left = '10px';
  debugPanel.style.backgroundColor = 'rgba(0,0,0,0.7)';
  debugPanel.style.color = 'white';
  debugPanel.style.padding = '10px';
  debugPanel.style.borderRadius = '5px';
  debugPanel.style.zIndex = '9999';
  debugPanel.style.maxWidth = '80%';
  debugPanel.style.maxHeight = '50%';
  debugPanel.style.overflow = 'auto';
  debugPanel.style.fontSize = '12px';
  
  document.body.appendChild(debugPanel);
  updateDebugPanel();
}

// 设置UI事件监听器
function setupEventListeners() {
  // 主菜单按钮
  document.getElementById('start-game').addEventListener('click', () => {
    checkDeviceOrientationPermission();
  });
  
  document.getElementById('level-select').addEventListener('click', () => {
    hideScreen('main-menu');
    populateLevelSelect();
    showScreen('level-select-screen');
  });
  
  document.getElementById('settings').addEventListener('click', () => {
    hideScreen('main-menu');
    showScreen('settings-screen');
  });
  
  document.getElementById('about').addEventListener('click', () => {
    hideScreen('main-menu');
    showScreen('about-screen');
  });
  
  // 关卡选择屏幕
  document.getElementById('back-to-menu').addEventListener('click', () => {
    hideScreen('level-select-screen');
    showScreen('main-menu');
  });
  
  // 设置屏幕
  document.getElementById('save-settings').addEventListener('click', () => {
    saveSettings();
    hideScreen('settings-screen');
    showScreen('main-menu');
    showNotification('设置已保存', { type: 'success' });
  });
  
  document.getElementById('settings-to-menu').addEventListener('click', () => {
    hideScreen('settings-screen');
    showScreen('main-menu');
  });
  
  // 关于屏幕
  document.getElementById('about-to-menu').addEventListener('click', () => {
    hideScreen('about-screen');
    showScreen('main-menu');
  });
  
  // 权限请求屏幕
  document.getElementById('request-permission').addEventListener('click', () => {
    requestDeviceOrientationPermission();
  });
  
  // 游戏屏幕按钮
  document.getElementById('pause').addEventListener('click', () => {
    pauseGame();
    showScreen('pause-menu');
  });
  
  document.getElementById('reset').addEventListener('click', () => {
    resetGame();
    showNotification('重置关卡', { type: 'info' });
  });
  
  document.getElementById('calibrate').addEventListener('click', () => {
    calibrateControls();
    showNotification('校准完成', { type: 'success' });
  });
  
  // 暂停菜单
  document.getElementById('resume').addEventListener('click', () => {
    hideScreen('pause-menu');
    resumeGame();
  });
  
  document.getElementById('restart').addEventListener('click', () => {
    hideScreen('pause-menu');
    resetGame();
    showNotification('重新开始', { type: 'info' });
  });
  
  document.getElementById('pause-settings').addEventListener('click', () => {
    hideScreen('pause-menu');
    showScreen('settings-screen');
  });
  
  document.getElementById('exit-to-menu').addEventListener('click', () => {
    hideScreen('pause-menu');
    hideScreen('game-screen');
    showScreen('main-menu');
  });
  
  // 关卡完成屏幕
  document.getElementById('next-level').addEventListener('click', () => {
    hideScreen('level-complete');
    showScreen('loading-screen');
    
    // 模拟加载下一关
    setTimeout(() => {
      hideScreen('loading-screen');
      showScreen('game-screen');
      startGame();
      showNotification('关卡 2', { type: 'info' });
    }, 1000);
  });
  
  document.getElementById('replay-level').addEventListener('click', () => {
    hideScreen('level-complete');
    showScreen('game-screen');
    startGame();
    showNotification('重新开始关卡', { type: 'info' });
  });
  
  document.getElementById('complete-to-menu').addEventListener('click', () => {
    hideScreen('level-complete');
    populateLevelSelect();
    showScreen('level-select-screen');
  });
  
  // 监听游戏胜利事件
  window.addEventListener('game:win', handleLevelComplete);
}

// 检查设备方向权限
function checkDeviceOrientationPermission() {
  if (typeof DeviceOrientationEvent !== 'undefined' && 
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    // iOS 13+ 需要请求权限
    hideScreen('main-menu');
    showScreen('permission-request');
  } else {
    // 其他设备或浏览器不需要请求权限
    startGameFlow();
  }
}

// 请求设备方向权限
async function requestDeviceOrientationPermission() {
  try {
    const permissionState = await DeviceOrientationEvent.requestPermission();
    if (permissionState === 'granted') {
      hideScreen('permission-request');
      startGameFlow();
    } else {
      // 用户拒绝了权限，使用触摸控制
      hideScreen('permission-request');
      startGameFlow(true);
    }
  } catch (error) {
    console.error('请求设备方向权限失败:', error);
    // 使用触摸控制作为备选
    hideScreen('permission-request');
    startGameFlow(true);
  }
}

// 开始游戏流程
function startGameFlow(useTouchControls = false) {
  showScreen('loading-screen');
  
  // 初始化游戏
  const container = document.getElementById('game-canvas-container');
  
  // 清除之前的canvas
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  
  try {
    // 初始化游戏
    const success = initGame(container);
    
    if (!success) {
      throw new Error('游戏初始化失败');
    }
    
    // 设置控制方式
    if (useTouchControls) {
      // 这里可以设置触摸控制
      console.log('使用触摸控制');
    }
    
    // 加载完成后显示游戏屏幕
    setTimeout(() => {
      hideScreen('loading-screen');
      showScreen('game-screen');
      startGame();
    }, 1000);
  } catch (error) {
    console.error('游戏启动错误:', error);
    hideScreen('loading-screen');
    showScreen('main-menu');
    showNotification('游戏启动失败，请重试', { type: 'error' });
  }
}

// 重置游戏
function resetGame() {
  startGame();
}

// 校准控制
function calibrateControls() {
  // 校准设备方向
}

// 处理关卡完成
function handleLevelComplete() {
  hideScreen('game-screen');
  
  // 更新完成时间
  document.getElementById('completion-time').textContent = '时间: 00:45';
  
  // 更新星星
  const stars = document.querySelectorAll('.star');
  stars.forEach((star, index) => {
    if (index < 2) {
      star.classList.add('earned');
    } else {
      star.classList.remove('earned');
    }
  });
  
  showScreen('level-complete');
}

// 保存设置
function saveSettings() {
  const musicVolume = document.getElementById('music-volume').value / 100;
  const sfxVolume = document.getElementById('sfx-volume').value / 100;
  const sensitivity = document.getElementById('sensitivity').value;
  const quality = document.getElementById('quality').value;
  const touchControls = document.getElementById('touch-controls').checked;
  
  // 更新游戏设置
  setSensitivity(getSensitivityValue(sensitivity));
  
  // 保存到本地存储
  const settings = {
    musicVolume,
    sfxVolume,
    sensitivity,
    quality,
    touchControls
  };
  
  localStorage.setItem('roller-settings', JSON.stringify(settings));
}

// 获取灵敏度值
function getSensitivityValue(sensitivity) {
  switch (sensitivity) {
    case 'low': return 0.5;
    case 'high': return 2.0;
    case 'medium':
    default: return 1.0;
  }
}

// 填充关卡选择界面
function populateLevelSelect() {
  const levelsGrid = document.getElementById('levels-grid');
  levelsGrid.innerHTML = '';
  
  // 模拟关卡数据
  const levels = [
    { id: 1, name: "教程关卡", completed: true, stars: 2 },
    { id: 2, name: "简单迷宫", completed: false },
    { id: 3, name: "斜坡挑战", locked: true },
    { id: 4, name: "复杂迷宫", locked: true },
    { id: 5, name: "终极挑战", locked: true }
  ];
  
  levels.forEach((level) => {
    const levelElement = document.createElement('div');
    levelElement.className = `level-item ${level.locked ? 'level-locked' : ''}`;
    
    const levelNumber = document.createElement('div');
    levelNumber.className = 'level-number';
    levelNumber.textContent = level.id;
    
    const levelName = document.createElement('div');
    levelName.className = 'level-name';
    levelName.textContent = level.name;
    
    const levelStars = document.createElement('div');
    levelStars.className = 'level-stars';
    
    // 显示已获得的星星
    if (level.completed && level.stars) {
      levelStars.textContent = '★'.repeat(level.stars);
    }
    
    levelElement.appendChild(levelNumber);
    levelElement.appendChild(levelName);
    levelElement.appendChild(levelStars);
    
    if (!level.locked) {
      levelElement.addEventListener('click', () => {
        hideScreen('level-select-screen');
        startGameFlow();
      });
    }
    
    levelsGrid.appendChild(levelElement);
  });
}

// 显示指定屏幕
function showScreen(screenId) {
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.remove('hidden');
    console.log(`显示屏幕: ${screenId}`);
  } else {
    console.error(`找不到屏幕: ${screenId}`);
  }
}

// 隐藏指定屏幕
function hideScreen(screenId) {
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.add('hidden');
    console.log(`隐藏屏幕: ${screenId}`);
  } else {
    console.error(`找不到屏幕: ${screenId}`);
  }
}

// 显示通知
function showNotification(message, options = {}) {
  const defaults = {
    duration: 3000,
    type: 'info'
  };
  
  const settings = { ...defaults, ...options };
  
  // 创建通知元素
  const notification = document.createElement('div');
  notification.className = `notification ${settings.type}`;
  notification.textContent = message;
  
  // 添加到容器
  document.getElementById('game-container').appendChild(notification);
  
  // 显示动画
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // 自动隐藏
  setTimeout(() => {
    notification.classList.remove('show');
    
    // 移除元素
    setTimeout(() => {
      notification.parentNode.removeChild(notification);
    }, 300);
  }, settings.duration);
}
