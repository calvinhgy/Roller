/**
 * 音频管理器，处理游戏音效和音乐
 */
export class AudioManager {
  /**
   * 创建音频管理器
   * @param {Object} options - 音频选项
   */
  constructor(options = {}) {
    this.options = Object.assign({
      musicVolume: 0.5,
      sfxVolume: 0.8,
      muted: false
    }, options);
    
    // 音频元素映射
    this.sounds = new Map();
    
    // 当前播放的背景音乐
    this.currentMusic = null;
    
    // 音频上下文（用于高级音频处理）
    this.audioContext = null;
    
    // 初始化音频上下文
    this.initAudioContext();
  }
  
  /**
   * 初始化Web Audio API上下文
   */
  initAudioContext() {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
    } catch (error) {
      console.warn('Web Audio API不受支持，将使用HTML5 Audio');
    }
  }
  
  /**
   * 加载音频
   * @param {string} id - 音频ID
   * @param {string} url - 音频URL
   * @param {Object} options - 音频选项
   * @returns {Promise<HTMLAudioElement>} 音频元素
   */
  async load(id, url, options = {}) {
    const defaults = {
      loop: false,
      volume: this.options.sfxVolume,
      autoplay: false,
      category: 'sfx' // 'sfx' 或 'music'
    };
    
    const settings = { ...defaults, ...options };
    
    // 创建音频元素
    const audio = new Audio();
    audio.src = url;
    audio.loop = settings.loop;
    audio.volume = settings.category === 'music' ? 
      this.options.musicVolume : this.options.sfxVolume;
    audio.muted = this.options.muted;
    
    // 存储音频元素和设置
    this.sounds.set(id, {
      audio,
      settings
    });
    
    // 等待音频加载完成
    return new Promise((resolve, reject) => {
      audio.addEventListener('canplaythrough', () => {
        resolve(audio);
      }, { once: true });
      
      audio.addEventListener('error', (error) => {
        reject(new Error(`加载音频失败: ${url}`));
      }, { once: true });
      
      audio.load();
    });
  }
  
  /**
   * 播放音效
   * @param {string} id - 音频ID
   * @param {Object} options - 播放选项
   * @returns {HTMLAudioElement} 音频元素
   */
  play(id, options = {}) {
    const sound = this.sounds.get(id);
    if (!sound) {
      console.warn(`音频 "${id}" 不存在`);
      return null;
    }
    
    const { audio, settings } = sound;
    
    // 应用播放选项
    if (options.volume !== undefined) {
      audio.volume = options.volume;
    }
    
    if (options.loop !== undefined) {
      audio.loop = options.loop;
    }
    
    // 如果音频正在播放，重置它
    if (!audio.paused) {
      audio.currentTime = 0;
    } else {
      // 播放音频
      const playPromise = audio.play();
      
      // 处理自动播放策略
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('自动播放被阻止:', error);
          
          // 添加用户交互监听器以启用音频
          const enableAudio = () => {
            audio.play();
            document.removeEventListener('click', enableAudio);
            document.removeEventListener('touchstart', enableAudio);
          };
          
          document.addEventListener('click', enableAudio);
          document.addEventListener('touchstart', enableAudio);
        });
      }
    }
    
    return audio;
  }
  
  /**
   * 播放背景音乐
   * @param {string} id - 音频ID
   * @param {Object} options - 播放选项
   */
  playMusic(id, options = {}) {
    // 停止当前音乐
    if (this.currentMusic) {
      this.stop(this.currentMusic);
    }
    
    // 设置为循环播放
    const musicOptions = {
      loop: true,
      ...options
    };
    
    // 播放新音乐
    this.play(id, musicOptions);
    this.currentMusic = id;
  }
  
  /**
   * 停止音频
   * @param {string} id - 音频ID
   */
  stop(id) {
    const sound = this.sounds.get(id);
    if (!sound) return;
    
    const { audio } = sound;
    audio.pause();
    audio.currentTime = 0;
    
    if (this.currentMusic === id) {
      this.currentMusic = null;
    }
  }
  
  /**
   * 暂停音频
   * @param {string} id - 音频ID
   */
  pause(id) {
    const sound = this.sounds.get(id);
    if (!sound) return;
    
    sound.audio.pause();
  }
  
  /**
   * 恢复音频
   * @param {string} id - 音频ID
   */
  resume(id) {
    const sound = this.sounds.get(id);
    if (!sound) return;
    
    sound.audio.play();
  }
  
  /**
   * 设置音频音量
   * @param {string} id - 音频ID
   * @param {number} volume - 音量(0-1)
   */
  setVolume(id, volume) {
    const sound = this.sounds.get(id);
    if (!sound) return;
    
    sound.audio.volume = volume;
  }
  
  /**
   * 设置音乐音量
   * @param {number} volume - 音量(0-1)
   */
  setMusicVolume(volume) {
    this.options.musicVolume = volume;
    
    // 更新所有音乐音量
    this.sounds.forEach((sound, id) => {
      if (sound.settings.category === 'music') {
        sound.audio.volume = volume;
      }
    });
  }
  
  /**
   * 设置音效音量
   * @param {number} volume - 音量(0-1)
   */
  setSfxVolume(volume) {
    this.options.sfxVolume = volume;
    
    // 更新所有音效音量
    this.sounds.forEach((sound, id) => {
      if (sound.settings.category === 'sfx') {
        sound.audio.volume = volume;
      }
    });
  }
  
  /**
   * 设置静音状态
   * @param {boolean} muted - 是否静音
   */
  setMuted(muted) {
    this.options.muted = muted;
    
    // 更新所有音频的静音状态
    this.sounds.forEach((sound) => {
      sound.audio.muted = muted;
    });
  }
  
  /**
   * 预加载常用音效
   * @returns {Promise<void>}
   */
  async preloadCommonSounds() {
    try {
      // 加载常用音效
      await Promise.all([
        this.load('collision', '/assets/sounds/collision.mp3'),
        this.load('win', '/assets/sounds/win.mp3'),
        this.load('button_click', '/assets/sounds/button_click.mp3'),
        this.load('roll', '/assets/sounds/roll.mp3', { loop: true }),
        this.load('background', '/assets/sounds/background.mp3', { 
          loop: true, 
          category: 'music' 
        })
      ]);
      
      console.log('常用音效加载完成');
    } catch (error) {
      console.error('加载音效失败:', error);
    }
  }
}
