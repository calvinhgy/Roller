// 简单的调试脚本
document.addEventListener('DOMContentLoaded', () => {
  console.log('页面已加载');
  
  // 显示调试信息
  const debugInfo = document.createElement('div');
  debugInfo.style.position = 'fixed';
  debugInfo.style.top = '10px';
  debugInfo.style.left = '10px';
  debugInfo.style.backgroundColor = 'rgba(0,0,0,0.7)';
  debugInfo.style.color = 'white';
  debugInfo.style.padding = '10px';
  debugInfo.style.borderRadius = '5px';
  debugInfo.style.zIndex = '9999';
  debugInfo.style.maxWidth = '80%';
  debugInfo.style.fontSize = '12px';
  debugInfo.id = 'debug-info';
  
  document.body.appendChild(debugInfo);
  
  // 更新调试信息
  function updateDebugInfo() {
    const info = document.getElementById('debug-info');
    if (!info) return;
    
    // 收集错误信息
    const errors = window.errors || [];
    const errorMessages = errors.map(e => `<div>${e.message}</div>`).join('');
    
    // 收集加载状态
    const scripts = Array.from(document.getElementsByTagName('script'));
    const loadedScripts = scripts.filter(s => !s.defer || s.readyState === 'complete').length;
    const totalScripts = scripts.length;
    
    // 显示当前屏幕
    const screens = Array.from(document.querySelectorAll('.screen'));
    const visibleScreens = screens.filter(s => !s.classList.contains('hidden')).map(s => s.id).join(', ');
    
    info.innerHTML = `
      <div><strong>调试信息</strong></div>
      <div>时间: ${new Date().toLocaleTimeString()}</div>
      <div>可见屏幕: ${visibleScreens || '无'}</div>
      <div>脚本加载: ${loadedScripts}/${totalScripts}</div>
      <div>错误数量: ${errors.length}</div>
      ${errorMessages ? '<div><strong>错误:</strong></div>' + errorMessages : ''}
      <div><button id="fix-loading">修复加载</button></div>
    `;
    
    // 添加修复按钮事件
    document.getElementById('fix-loading').addEventListener('click', () => {
      hideScreen('loading-screen');
      showScreen('main-menu');
    });
  }
  
  // 捕获错误
  window.errors = [];
  window.addEventListener('error', (event) => {
    window.errors.push({
      message: event.message,
      source: event.filename,
      line: event.lineno
    });
    updateDebugInfo();
    return false;
  });
  
  // 定期更新调试信息
  setInterval(updateDebugInfo, 1000);
  updateDebugInfo();
  
  // 辅助函数
  window.showScreen = function(screenId) {
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.remove('hidden');
    updateDebugInfo();
  };
  
  window.hideScreen = function(screenId) {
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('hidden');
    updateDebugInfo();
  };
});
