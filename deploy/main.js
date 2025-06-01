// 简化版的main.js，用于演示
document.addEventListener('DOMContentLoaded', async () => {
  // 显示加载屏幕
  showScreen('loading-screen');
  
  // 模拟加载过程
  setTimeout(() => {
    // 隐藏加载屏幕，显示主菜单
    hideScreen('loading-screen');
    showScreen('main-menu');
    
    // 设置UI事件监听器
    setupEventListeners();
  }, 1500);
});

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
    startGame();
  }
}

// 请求设备方向权限
async function requestDeviceOrientationPermission() {
  try {
    const permissionState = await DeviceOrientationEvent.requestPermission();
    if (permissionState === 'granted') {
      hideScreen('permission-request');
      startGame();
    } else {
      // 用户拒绝了权限，使用触摸控制
      hideScreen('permission-request');
      startGame(true);
    }
  } catch (error) {
    console.error('请求设备方向权限失败:', error);
    // 使用触摸控制作为备选
    hideScreen('permission-request');
    startGame(true);
  }
}

// 开始游戏
function startGame(useTouchControls = false) {
  showScreen('loading-screen');
  
  // 模拟加载关卡
  setTimeout(() => {
    hideScreen('loading-screen');
    showScreen('game-screen');
    
    // 设置游戏屏幕事件监听器
    document.getElementById('pause').addEventListener('click', () => {
      showScreen('pause-menu');
    });
    
    document.getElementById('reset').addEventListener('click', () => {
      showNotification('重置关卡', { type: 'info' });
    });
    
    document.getElementById('calibrate').addEventListener('click', () => {
      showNotification('校准完成', { type: 'success' });
    });
    
    // 暂停菜单
    document.getElementById('resume').addEventListener('click', () => {
      hideScreen('pause-menu');
    });
    
    document.getElementById('restart').addEventListener('click', () => {
      hideScreen('pause-menu');
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
    
    // 模拟游戏完成
    setTimeout(() => {
      completeLevel();
    }, 5000);
  }, 1500);
}

// 完成关卡
function completeLevel() {
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
  
  // 设置关卡完成事件监听器
  document.getElementById('next-level').addEventListener('click', () => {
    hideScreen('level-complete');
    showScreen('loading-screen');
    
    // 模拟加载下一关
    setTimeout(() => {
      hideScreen('loading-screen');
      showScreen('game-screen');
      showNotification('关卡 2', { type: 'info' });
    }, 1000);
  });
  
  document.getElementById('replay-level').addEventListener('click', () => {
    hideScreen('level-complete');
    showScreen('game-screen');
    showNotification('重新开始关卡', { type: 'info' });
  });
  
  document.getElementById('complete-to-menu').addEventListener('click', () => {
    hideScreen('level-complete');
    populateLevelSelect();
    showScreen('level-select-screen');
  });
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
        startGame();
      });
    }
    
    levelsGrid.appendChild(levelElement);
  });
}

// 显示指定屏幕
function showScreen(screenId) {
  const screen = document.getElementById(screenId);
  screen.classList.remove('hidden');
}

// 隐藏指定屏幕
function hideScreen(screenId) {
  const screen = document.getElementById(screenId);
  screen.classList.add('hidden');
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
