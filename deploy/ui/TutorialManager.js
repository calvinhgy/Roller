/**
 * 教程管理器，处理游戏内教程
 */
export class TutorialManager {
  /**
   * 创建教程管理器
   * @param {HTMLElement} container - 容器元素
   * @param {StorageManager} storage - 存储管理器
   */
  constructor(container, storage) {
    this.container = container;
    this.storage = storage;
    this.tutorialElement = null;
    this.currentStep = 0;
    this.tutorialSteps = [];
    this.isActive = false;
    this.onComplete = null;
  }
  
  /**
   * 初始化教程管理器
   */
  init() {
    // 创建教程元素
    this.tutorialElement = document.createElement('div');
    this.tutorialElement.className = 'tutorial-container hidden';
    this.container.appendChild(this.tutorialElement);
    
    // 创建教程内容
    this.createTutorialContent();
  }
  
  /**
   * 创建教程内容
   */
  createTutorialContent() {
    this.tutorialElement.innerHTML = `
      <div class="tutorial-content">
        <div class="tutorial-header">
          <h2 class="tutorial-title">游戏教程</h2>
          <button class="tutorial-close">✕</button>
        </div>
        <div class="tutorial-body">
          <div class="tutorial-message"></div>
          <div class="tutorial-image-container">
            <img class="tutorial-image" src="" alt="教程图片">
          </div>
        </div>
        <div class="tutorial-footer">
          <button class="tutorial-prev">上一步</button>
          <div class="tutorial-progress">
            <span class="tutorial-step-current">1</span>/<span class="tutorial-step-total">5</span>
          </div>
          <button class="tutorial-next">下一步</button>
        </div>
      </div>
    `;
    
    // 添加事件监听器
    const closeButton = this.tutorialElement.querySelector('.tutorial-close');
    closeButton.addEventListener('click', () => this.hide());
    
    const prevButton = this.tutorialElement.querySelector('.tutorial-prev');
    prevButton.addEventListener('click', () => this.prevStep());
    
    const nextButton = this.tutorialElement.querySelector('.tutorial-next');
    nextButton.addEventListener('click', () => this.nextStep());
  }
  
  /**
   * 定义教程步骤
   * @param {Array<Object>} steps - 教程步骤
   */
  defineSteps(steps) {
    this.tutorialSteps = steps;
  }
  
  /**
   * 显示教程
   * @param {Function} onComplete - 完成回调
   */
  show(onComplete = null) {
    // 检查是否已经完成过教程
    this.storage.load('tutorialCompleted').then(completed => {
      if (completed) {
        // 已完成教程，不再显示
        if (onComplete) onComplete();
        return;
      }
      
      // 显示教程
      this.isActive = true;
      this.currentStep = 0;
      this.onComplete = onComplete;
      this.tutorialElement.classList.remove('hidden');
      
      // 更新步骤总数
      const totalElement = this.tutorialElement.querySelector('.tutorial-step-total');
      totalElement.textContent = this.tutorialSteps.length.toString();
      
      // 显示第一步
      this.showStep(0);
    });
  }
  
  /**
   * 隐藏教程
   */
  hide() {
    this.isActive = false;
    this.tutorialElement.classList.add('hidden');
    
    // 标记教程为已完成
    this.storage.save('tutorialCompleted', true);
    
    // 调用完成回调
    if (this.onComplete) {
      this.onComplete();
    }
  }
  
  /**
   * 显示指定步骤
   * @param {number} stepIndex - 步骤索引
   */
  showStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.tutorialSteps.length) {
      return;
    }
    
    this.currentStep = stepIndex;
    const step = this.tutorialSteps[stepIndex];
    
    // 更新消息
    const messageElement = this.tutorialElement.querySelector('.tutorial-message');
    messageElement.innerHTML = step.message;
    
    // 更新图片
    const imageElement = this.tutorialElement.querySelector('.tutorial-image');
    if (step.image) {
      imageElement.src = step.image;
      imageElement.style.display = 'block';
    } else {
      imageElement.style.display = 'none';
    }
    
    // 更新当前步骤
    const currentElement = this.tutorialElement.querySelector('.tutorial-step-current');
    currentElement.textContent = (stepIndex + 1).toString();
    
    // 更新按钮状态
    const prevButton = this.tutorialElement.querySelector('.tutorial-prev');
    prevButton.disabled = stepIndex === 0;
    
    const nextButton = this.tutorialElement.querySelector('.tutorial-next');
    nextButton.textContent = stepIndex === this.tutorialSteps.length - 1 ? '完成' : '下一步';
  }
  
  /**
   * 下一步
   */
  nextStep() {
    if (this.currentStep === this.tutorialSteps.length - 1) {
      // 最后一步，完成教程
      this.hide();
    } else {
      this.showStep(this.currentStep + 1);
    }
  }
  
  /**
   * 上一步
   */
  prevStep() {
    if (this.currentStep > 0) {
      this.showStep(this.currentStep - 1);
    }
  }
  
  /**
   * 重置教程状态
   */
  reset() {
    this.storage.delete('tutorialCompleted');
  }
  
  /**
   * 检查教程是否已完成
   * @returns {Promise<boolean>} 是否已完成
   */
  async isCompleted() {
    return await this.storage.load('tutorialCompleted') || false;
  }
}
