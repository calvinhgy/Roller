import * as THREE from 'three';

/**
 * 场景管理器，管理3D场景内容
 */
export class SceneManager {
  /**
   * 创建场景管理器
   */
  constructor() {
    this.scenes = new Map();
    
    // 创建默认场景
    this.createScene('game');
  }
  
  /**
   * 创建新场景
   * @param {string} id - 场景ID
   * @returns {THREE.Scene} 创建的场景
   */
  createScene(id) {
    if (this.scenes.has(id)) {
      console.warn(`场景 "${id}" 已存在，返回现有场景`);
      return this.scenes.get(id);
    }
    
    const scene = new THREE.Scene();
    
    // 设置默认背景
    scene.background = new THREE.Color(0x87CEEB); // 天蓝色
    
    // 设置默认雾效果
    scene.fog = new THREE.FogExp2(0x87CEEB, 0.01);
    
    this.scenes.set(id, scene);
    return scene;
  }
  
  /**
   * 加载场景
   * @param {Object} sceneData - 场景数据
   * @returns {Promise<THREE.Scene>} 加载的场景
   */
  async loadScene(sceneData) {
    const { id, background, fog, environment } = sceneData;
    
    // 创建新场景或获取现有场景
    const scene = this.createScene(id);
    
    // 设置背景
    if (background) {
      if (background.color) {
        scene.background = new THREE.Color(background.color);
      } else if (background.texture) {
        // 加载背景纹理
        const textureLoader = new THREE.TextureLoader();
        const texture = await new Promise((resolve, reject) => {
          textureLoader.load(
            background.texture,
            resolve,
            undefined,
            reject
          );
        });
        
        scene.background = texture;
      }
    }
    
    // 设置雾效果
    if (fog) {
      if (fog.type === 'linear') {
        scene.fog = new THREE.Fog(
          new THREE.Color(fog.color),
          fog.near,
          fog.far
        );
      } else if (fog.type === 'exponential') {
        scene.fog = new THREE.FogExp2(
          new THREE.Color(fog.color),
          fog.density
        );
      }
    }
    
    // 设置环境
    if (environment) {
      await this.setEnvironment(id, environment);
    }
    
    return scene;
  }
  
  /**
   * 添加对象到场景
   * @param {string} sceneId - 场景ID
   * @param {THREE.Object3D} object - 3D对象
   */
  addToScene(sceneId, object) {
    const scene = this.getScene(sceneId);
    if (scene) {
      scene.add(object);
    } else {
      console.error(`场景 "${sceneId}" 不存在`);
    }
  }
  
  /**
   * 从场景移除对象
   * @param {string} sceneId - 场景ID
   * @param {THREE.Object3D} object - 3D对象
   */
  removeFromScene(sceneId, object) {
    const scene = this.getScene(sceneId);
    if (scene) {
      scene.remove(object);
    } else {
      console.error(`场景 "${sceneId}" 不存在`);
    }
  }
  
  /**
   * 设置场景环境光
   * @param {string} sceneId - 场景ID
   * @param {Object} lightOptions - 光照选项
   * @returns {Promise<void>}
   */
  async setEnvironment(sceneId, lightOptions) {
    const scene = this.getScene(sceneId);
    if (!scene) {
      console.error(`场景 "${sceneId}" 不存在`);
      return;
    }
    
    // 清除现有灯光
    scene.traverse((object) => {
      if (object instanceof THREE.Light) {
        scene.remove(object);
      }
    });
    
    // 添加环境光
    if (lightOptions.ambient) {
      const ambientLight = new THREE.AmbientLight(
        new THREE.Color(lightOptions.ambient.color),
        lightOptions.ambient.intensity || 0.5
      );
      scene.add(ambientLight);
    }
    
    // 添加方向光
    if (lightOptions.directional) {
      const directionalLight = new THREE.DirectionalLight(
        new THREE.Color(lightOptions.directional.color),
        lightOptions.directional.intensity || 0.8
      );
      
      directionalLight.position.set(
        lightOptions.directional.position.x || 5,
        lightOptions.directional.position.y || 10,
        lightOptions.directional.position.z || 7
      );
      
      // 设置阴影
      if (lightOptions.directional.castShadow) {
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        
        const size = lightOptions.directional.shadowSize || 10;
        directionalLight.shadow.camera.left = -size;
        directionalLight.shadow.camera.right = size;
        directionalLight.shadow.camera.top = size;
        directionalLight.shadow.camera.bottom = -size;
      }
      
      scene.add(directionalLight);
    }
    
    // 添加点光源
    if (lightOptions.point && Array.isArray(lightOptions.point)) {
      lightOptions.point.forEach(pointLight => {
        const light = new THREE.PointLight(
          new THREE.Color(pointLight.color),
          pointLight.intensity || 1,
          pointLight.distance || 100,
          pointLight.decay || 2
        );
        
        light.position.set(
          pointLight.position.x || 0,
          pointLight.position.y || 0,
          pointLight.position.z || 0
        );
        
        if (pointLight.castShadow) {
          light.castShadow = true;
          light.shadow.mapSize.width = 512;
          light.shadow.mapSize.height = 512;
        }
        
        scene.add(light);
      });
    }
    
    // 添加半球光
    if (lightOptions.hemisphere) {
      const hemisphereLight = new THREE.HemisphereLight(
        new THREE.Color(lightOptions.hemisphere.skyColor),
        new THREE.Color(lightOptions.hemisphere.groundColor),
        lightOptions.hemisphere.intensity || 0.6
      );
      
      scene.add(hemisphereLight);
    }
  }
  
  /**
   * 获取场景
   * @param {string} id - 场景ID
   * @returns {THREE.Scene} 场景对象
   */
  getScene(id) {
    return this.scenes.get(id);
  }
  
  /**
   * 清除场景
   * @param {string} id - 场景ID
   */
  clearScene(id) {
    const scene = this.getScene(id);
    if (!scene) return;
    
    // 递归清除场景中的所有对象
    while (scene.children.length > 0) {
      this.disposeObject(scene.children[0]);
      scene.remove(scene.children[0]);
    }
  }
  
  /**
   * 清除所有场景
   */
  clearAllScenes() {
    for (const id of this.scenes.keys()) {
      this.clearScene(id);
    }
  }
  
  /**
   * 销毁对象及其资源
   * @param {THREE.Object3D} object - 要销毁的对象
   */
  disposeObject(object) {
    if (!object) return;
    
    // 递归处理子对象
    if (object.children && object.children.length > 0) {
      // 创建副本，因为在循环中会修改children数组
      const children = [...object.children];
      for (const child of children) {
        this.disposeObject(child);
        object.remove(child);
      }
    }
    
    // 处理几何体
    if (object.geometry) {
      object.geometry.dispose();
    }
    
    // 处理材质
    if (object.material) {
      if (Array.isArray(object.material)) {
        for (const material of object.material) {
          this.disposeMaterial(material);
        }
      } else {
        this.disposeMaterial(object.material);
      }
    }
  }
  
  /**
   * 销毁材质及其纹理
   * @param {THREE.Material} material - 要销毁的材质
   */
  disposeMaterial(material) {
    if (!material) return;
    
    // 处理纹理
    for (const key of Object.keys(material)) {
      const value = material[key];
      if (value && typeof value === 'object' && value.isTexture) {
        value.dispose();
      }
    }
    
    material.dispose();
  }
}
