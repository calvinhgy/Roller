import { Game } from './core/Game.js';
import { StorageManager } from './utils/Storage.js';

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', async () => {
  // 初始化存储管理器
  const storage = new StorageManager('roller-game');
  
  // 创建游戏实例
  const gameContainer = document.getElementById('game-container');
  const game = new Game(gameContainer, {
    debug: false,
    storage: storage
  });
  
  try {
    // 显示加载屏幕
    showScreen('loading-screen');
    
    // 初始化游戏
    await game.init();
    
    // 隐藏加载屏幕，显示主菜单
    hideScreen('loading-screen');
    showScreen('main-menu');
    
    // 设置UI事件监听器
    setupEventListeners(game);
    
  } catch (error) {
    console.error('游戏初始化失败:', error);
    // 显示错误信息
    alert('游戏加载失败，请刷新页面重试。');
  }
});

// 设置UI事件监听器
function setupEventListeners(game) {
  // 主菜单按钮
  document.getElementById('start-game').addEventListener('click', () => {
    checkDeviceOrientationPermission(game);
  });
  
  document.getElementById('level-select').addEventListener('click', () => {
    hideScreen('main-menu');
    populateLevelSelect(game);
    showScreen('level-select-screen');
  });
  
  document.getElementById('settings').addEventListener('click', () => {
    hideScreen('main-menu');
    loadSettings(game);
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
  
  // 游戏屏幕
  document.getElementById('pause').addEventListener('click', () => {
    game.pause();
    showScreen('pause-menu');
  });
  
  document.getElementById('reset').addEventListener('click', () => {
    game.reset();
  });
  
  document.getElementById('calibrate').addEventListener('click', () => {
    game.calibrateMotionControls();
  });
  
  // 暂停菜单
  document.getElementById('resume').addEventListener('click', () => {
    hideScreen('pause-menu');
    game.resume();
  });
  
  document.getElementById('restart').addEventListener('click', () => {
    hideScreen('pause-menu');
    game.reset();
    game.resume();
  });
  
  document.getElementById('pause-settings').addEventListener('click', () => {
    hideScreen('pause-menu');
    loadSettings(game);
    showScreen('settings-screen');
  });
  
  document.getElementById('exit-to-menu').addEventListener('click', () => {
    hideScreen('pause-menu');
    hideScreen('game-screen');
    game.end();
    showScreen('main-menu');
  });
  
  // 关卡完成屏幕
  document.getElementById('next-level').addEventListener('click', () => {
    hideScreen('level-complete');
    game.loadNextLevel();
  });
  
  document.getElementById('replay-level').addEventListener('click', () => {
    hideScreen('level-complete');
    game.reset();
    game.resume();
  });
  
  document.getElementById('complete-to-menu').addEventListener('click', () => {
    hideScreen('level-complete');
    hideScreen('game-screen');
    populateLevelSelect(game);
    showScreen('level-select-screen');
  });
  
  // 设置屏幕
  document.getElementById('save-settings').addEventListener('click', () => {
    saveSettings(game);
    hideScreen('settings-screen');
    
    // 返回到之前的屏幕
    if (game.isRunning()) {
      game.resume();
    } else {
      showScreen('main-menu');
    }
  });
  
  document.getElementById('settings-to-menu').addEventListener('click', () => {
    hideScreen('settings-screen');
    
    // 返回到之前的屏幕
    if (game.isRunning()) {
      showScreen('pause-menu');
    } else {
      showScreen('main-menu');
    }
  });
  
  // 关于屏幕
  document.getElementById('about-to-menu').addEventListener('click', () => {
    hideScreen('about-screen');
    showScreen('main-menu');
  });
  
  // 权限请求屏幕
  document.getElementById('request-permission').addEventListener('click', () => {
    requestDeviceOrientationPermission(game);
  });
}

// 检查设备方向权限
async function checkDeviceOrientationPermission(game) {
  if (typeof DeviceOrientationEvent !== 'undefined' && 
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    // iOS 13+ 需要请求权限
    hideScreen('main-menu');
    showScreen('permission-request');
  } else {
    // 其他设备或浏览器不需要请求权限
    startGame(game);
  }
}

// 请求设备方向权限
async function requestDeviceOrientationPermission(game) {
  try {
    const permissionState = await DeviceOrientationEvent.requestPermission();
    if (permissionState === 'granted') {
      hideScreen('permission-request');
      startGame(game);
    } else {
      // 用户拒绝了权限，使用触摸控制
      game.setUseTouchControls(true);
      hideScreen('permission-request');
      startGame(game);
    }
  } catch (error) {
    console.error('请求设备方向权限失败:', error);
    // 使用触摸控制作为备选
    game.setUseTouchControls(true);
    hideScreen('permission-request');
    startGame(game);
  }
}

// 开始游戏
async function startGame(game) {
  try {
    showScreen('loading-screen');
    
    // 加载第一关或上次游玩的关卡
    const lastLevel = await game.storage.load('lastLevel') || 1;
    await game.start(lastLevel);
    
    hideScreen('loading-screen');
    showScreen('game-screen');
  } catch (error) {
    console.error('开始游戏失败:', error);
    hideScreen('loading-screen');
    showScreen('main-menu');
    alert('加载关卡失败，请重试。');
  }
}

// 填充关卡选择界面
function populateLevelSelect(game) {
  const levelsGrid = document.getElementById('levels-grid');
  levelsGrid.innerHTML = '';
  
  const levels = game.getLevelList();
  const completedLevels = game.getCompletedLevels();
  
  levels.forEach((level, index) => {
    const levelId = index + 1;
    const isCompleted = completedLevels.includes(levelId);
    const isLocked = levelId > 1 && !completedLevels.includes(levelId - 1);
    
    const levelElement = document.createElement('div');
    levelElement.className = `level-item ${isLocked ? 'level-locked' : ''}`;
    
    const levelNumber = document.createElement('div');
    levelNumber.className = 'level-number';
    levelNumber.textContent = levelId;
    
    const levelStars = document.createElement('div');
    levelStars.className = 'level-stars';
    
    // 显示已获得的星星
    if (isCompleted) {
      const stars = game.getLevelStars(levelId);
      levelStars.textContent = '★'.repeat(stars);
    }
    
    levelElement.appendChild(levelNumber);
    levelElement.appendChild(levelStars);
    
    if (!isLocked) {
      levelElement.addEventListener('click', async () => {
        hideScreen('level-select-screen');
        showScreen('loading-screen');
        
        try {
          await game.start(levelId);
          hideScreen('loading-screen');
          showScreen('game-screen');
        } catch (error) {
          console.error('加载关卡失败:', error);
          hideScreen('loading-screen');
          showScreen('level-select-screen');
          alert('加载关卡失败，请重试。');
        }
      });
    }
    
    levelsGrid.appendChild(levelElement);
  });
}

// 加载设置
function loadSettings(game) {
  const settings = game.getSettings();
  
  document.getElementById('music-volume').value = settings.musicVolume * 100;
  document.getElementById('sfx-volume').value = settings.sfxVolume * 100;
  document.getElementById('sensitivity').value = settings.sensitivity;
  document.getElementById('quality').value = settings.quality;
  document.getElementById('touch-controls').checked = settings.useTouchControls;
}

// 保存设置
function saveSettings(game) {
  const settings = {
    musicVolume: document.getElementById('music-volume').value / 100,
    sfxVolume: document.getElementById('sfx-volume').value / 100,
    sensitivity: document.getElementById('sensitivity').value,
    quality: document.getElementById('quality').value,
    useTouchControls: document.getElementById('touch-controls').checked
  };
  
  game.updateSettings(settings);
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
