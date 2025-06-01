/**
 * 游戏循环类，管理更新和渲染频率
 */
export class GameLoop {
  /**
   * 创建游戏循环
   * @param {Function} updateFn - 更新函数
   * @param {Function} renderFn - 渲染函数
   */
  constructor(updateFn, renderFn) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
    
    this.lastTime = 0;
    this.accumulator = 0;
    this.deltaTime = 1/60; // 固定时间步长 (60fps)
    
    this.rafId = null;
    this.running = false;
    this.paused = false;
    
    this.fps = 0;
    this.framesThisSecond = 0;
    this.lastFpsUpdate = 0;
  }
  
  /**
   * 开始游戏循环
   */
  start() {
    if (this.running) return;
    
    this.running = true;
    this.paused = false;
    this.lastTime = performance.now() / 1000;
    this.rafId = requestAnimationFrame(this.loop.bind(this));
  }
  
  /**
   * 停止游戏循环
   */
  stop() {
    if (!this.running) return;
    
    this.running = false;
    this.paused = false;
    
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
  
  /**
   * 暂停游戏循环
   */
  pause() {
    if (!this.running || this.paused) return;
    
    this.paused = true;
    
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
  
  /**
   * 恢复游戏循环
   */
  resume() {
    if (!this.running || !this.paused) return;
    
    this.paused = false;
    this.lastTime = performance.now() / 1000;
    this.rafId = requestAnimationFrame(this.loop.bind(this));
  }
  
  /**
   * 游戏循环主函数
   * @param {number} timestamp - 当前时间戳
   */
  loop(timestamp) {
    if (!this.running || this.paused) return;
    
    // 计算时间增量
    const currentTime = timestamp / 1000;
    let deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    // 防止过大的时间步长（例如切换标签页后返回）
    if (deltaTime > 0.25) deltaTime = 0.25;
    
    // 更新FPS计数器
    this.updateFPS(currentTime);
    
    // 累积时间
    this.accumulator += deltaTime;
    
    // 固定时间步长更新
    while (this.accumulator >= this.deltaTime) {
      this.updateFn(this.deltaTime);
      this.accumulator -= this.deltaTime;
    }
    
    // 渲染
    this.renderFn();
    
    // 继续循环
    this.rafId = requestAnimationFrame(this.loop.bind(this));
  }
  
  /**
   * 更新FPS计数
   * @param {number} currentTime - 当前时间
   */
  updateFPS(currentTime) {
    this.framesThisSecond++;
    
    if (currentTime > this.lastFpsUpdate + 1) {
      this.fps = this.framesThisSecond;
      this.framesThisSecond = 0;
      this.lastFpsUpdate = currentTime;
    }
  }
  
  /**
   * 获取当前FPS
   * @returns {number} 当前帧率
   */
  getFPS() {
    return this.fps;
  }
}
