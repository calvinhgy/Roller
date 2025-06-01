import * as THREE from 'three';

/**
 * 资源管理器，处理游戏资源的加载和卸载
 */
export class ResourceLoader {
  constructor() {
    this.resources = new Map();
    this.loaders = {
      texture: new THREE.TextureLoader(),
      audio: new AudioLoader(),
      json: new JSONLoader(),
      model: new THREE.ObjectLoader()
    };
  }
  
  /**
   * 加载资源
   * @param {Array<Object>} resources - 资源描述对象数组
   * @param {Function} progressCallback - 进度回调函数
   * @returns {Promise<Object>} 加载的资源
   */
  async load(resources, progressCallback = null) {
    const total = resources.length;
    let loaded = 0;
    
    const promises = resources.map(resource => {
      return this.loadResource(resource).then(result => {
        loaded++;
        if (progressCallback) {
          progressCallback(loaded / total);
        }
        return { id: resource.id, result };
      });
    });
    
    const results = await Promise.all(promises);
    
    // 将结果存储到资源映射中
    results.forEach(({ id, result }) => {
      this.resources.set(id, result);
    });
    
    return Object.fromEntries(this.resources);
  }
  
  /**
   * 加载单个资源
   * @param {Object} resource - 资源描述对象
   * @returns {Promise<any>} 加载的资源
   */
  loadResource(resource) {
    const { id, type, url } = resource;
    
    // 检查资源是否已加载
    if (this.resources.has(id)) {
      return Promise.resolve(this.resources.get(id));
    }
    
    // 获取适当的加载器
    const loader = this.loaders[type];
    if (!loader) {
      return Promise.reject(new Error(`未知的资源类型: ${type}`));
    }
    
    // 加载资源
    return loader.load(url);
  }
  
  /**
   * 卸载资源
   * @param {string} resourceId - 资源ID
   * @returns {boolean} 卸载成功返回true
   */
  unload(resourceId) {
    if (!this.resources.has(resourceId)) {
      return false;
    }
    
    const resource = this.resources.get(resourceId);
    
    // 根据资源类型执行适当的清理
    if (resource instanceof THREE.Texture) {
      resource.dispose();
    } else if (resource instanceof THREE.Object3D) {
      this.disposeObject3D(resource);
    }
    
    this.resources.delete(resourceId);
    return true;
  }
  
  /**
   * 清理Three.js对象
   * @param {THREE.Object3D} object - 要清理的3D对象
   */
  disposeObject3D(object) {
    object.traverse(child => {
      if (child.geometry) {
        child.geometry.dispose();
      }
      
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => this.disposeMaterial(material));
        } else {
          this.disposeMaterial(child.material);
        }
      }
    });
  }
  
  /**
   * 清理材质
   * @param {THREE.Material} material - 要清理的材质
   */
  disposeMaterial(material) {
    // 清理材质的纹理
    for (const key in material) {
      const value = material[key];
      if (value instanceof THREE.Texture) {
        value.dispose();
      }
    }
    
    material.dispose();
  }
  
  /**
   * 获取已加载的资源
   * @param {string} resourceId - 资源ID
   * @returns {any} 资源对象
   */
  get(resourceId) {
    return this.resources.get(resourceId);
  }
  
  /**
   * 预加载资源
   * @param {Array<Object>} resources - 资源描述对象数组
   * @returns {Promise<void>}
   */
  async preload(resources) {
    return this.load(resources);
  }
}

/**
 * 音频加载器
 */
class AudioLoader {
  /**
   * 加载音频文件
   * @param {string} url - 音频文件URL
   * @returns {Promise<AudioBuffer>} 音频缓冲区
   */
  load(url) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.src = url;
      
      audio.addEventListener('canplaythrough', () => {
        resolve(audio);
      });
      
      audio.addEventListener('error', () => {
        reject(new Error(`加载音频失败: ${url}`));
      });
      
      audio.load();
    });
  }
}

/**
 * JSON加载器
 */
class JSONLoader {
  /**
   * 加载JSON文件
   * @param {string} url - JSON文件URL
   * @returns {Promise<Object>} JSON对象
   */
  load(url) {
    return fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP错误! 状态: ${response.status}`);
        }
        return response.json();
      });
  }
}
