import { Level } from './Level.js';

/**
 * 关卡管理器，处理关卡加载和状态
 */
export class LevelManager {
  /**
   * 创建关卡管理器
   * @param {ResourceLoader} resourceLoader - 资源管理器实例
   */
  constructor(resourceLoader) {
    this.resourceLoader = resourceLoader;
    this.levels = [];
    this.currentLevel = null;
  }
  
  /**
   * 加载关卡列表
   * @returns {Promise<Array>} 关卡列表
   */
  async loadLevelList() {
    try {
      // 在实际应用中，这里应该从服务器或本地文件加载关卡列表
      // 为了简化，这里直接硬编码一些关卡数据
      this.levels = [
        {
          id: 1,
          name: "教程关卡",
          difficulty: 1,
          parTime: 30, // 完成关卡的标准时间(秒)
          file: "level1.json"
        },
        {
          id: 2,
          name: "简单迷宫",
          difficulty: 2,
          parTime: 45,
          file: "level2.json"
        },
        {
          id: 3,
          name: "斜坡挑战",
          difficulty: 3,
          parTime: 60,
          file: "level3.json"
        },
        {
          id: 4,
          name: "复杂迷宫",
          difficulty: 4,
          parTime: 90,
          file: "level4.json"
        },
        {
          id: 5,
          name: "终极挑战",
          difficulty: 5,
          parTime: 120,
          file: "level5.json"
        }
      ];
      
      return this.levels;
    } catch (error) {
      console.error('加载关卡列表失败:', error);
      throw error;
    }
  }
  
  /**
   * 加载关卡
   * @param {number|string} levelId - 关卡ID
   * @returns {Promise<Level>} 加载的关卡
   */
  async loadLevel(levelId) {
    try {
      // 查找关卡信息
      const levelInfo = this.levels.find(level => level.id === parseInt(levelId));
      
      if (!levelInfo) {
        throw new Error(`关卡 ${levelId} 不存在`);
      }
      
      console.log(`加载关卡: ${levelInfo.name} (ID: ${levelInfo.id})`);
      
      // 在实际应用中，这里应该加载关卡文件
      // 为了简化，这里直接生成一个关卡数据
      const levelData = await this.generateLevelData(levelInfo);
      
      // 创建关卡实例
      this.currentLevel = new Level(levelInfo.id, {
        ...levelInfo,
        data: levelData
      });
      
      return this.currentLevel;
    } catch (error) {
      console.error(`加载关卡 ${levelId} 失败:`, error);
      throw error;
    }
  }
  
  /**
   * 生成关卡数据
   * @param {Object} levelInfo - 关卡信息
   * @returns {Promise<Object>} 关卡数据
   */
  async generateLevelData(levelInfo) {
    // 根据关卡ID生成不同的关卡数据
    // 这里只是一个简单的示例，实际应用中应该从文件加载
    
    const baseLevel = {
      size: { width: 20, height: 1, depth: 20 },
      start: { x: -8, y: 0.5, z: -8 },
      end: { x: 8, y: 0.5, z: 8 },
      ball: {
        radius: 0.5,
        mass: 1,
        material: {
          type: 'basic',
          color: 0x1E88E5,
          metalness: 0.8,
          roughness: 0.2
        }
      },
      floor: {
        material: {
          type: 'basic',
          color: 0xCCCCCC,
          metalness: 0.1,
          roughness: 0.8
        }
      },
      walls: [],
      obstacles: [],
      decorations: []
    };
    
    // 根据关卡难度添加墙壁和障碍物
    switch (levelInfo.id) {
      case 1: // 教程关卡
        // 简单的直线路径
        baseLevel.walls = [
          { start: { x: -10, z: -5 }, end: { x: 10, z: -5 }, height: 2 },
          { start: { x: -10, z: 5 }, end: { x: 10, z: 5 }, height: 2 },
          { start: { x: -10, z: -5 }, end: { x: -10, z: 5 }, height: 2 },
          { start: { x: 10, z: -5 }, end: { x: 10, z: 5 }, height: 2 }
        ];
        break;
        
      case 2: // 简单迷宫
        baseLevel.walls = [
          // 外墙
          { start: { x: -10, z: -10 }, end: { x: 10, z: -10 }, height: 2 },
          { start: { x: -10, z: 10 }, end: { x: 10, z: 10 }, height: 2 },
          { start: { x: -10, z: -10 }, end: { x: -10, z: 10 }, height: 2 },
          { start: { x: 10, z: -10 }, end: { x: 10, z: 10 }, height: 2 },
          
          // 内墙
          { start: { x: -5, z: -5 }, end: { x: 5, z: -5 }, height: 2 },
          { start: { x: -5, z: 0 }, end: { x: 0, z: 0 }, height: 2 },
          { start: { x: 0, z: 0 }, end: { x: 0, z: 5 }, height: 2 },
          { start: { x: -5, z: 5 }, end: { x: -2, z: 5 }, height: 2 }
        ];
        break;
        
      case 3: // 斜坡挑战
        baseLevel.walls = [
          // 外墙
          { start: { x: -10, z: -10 }, end: { x: 10, z: -10 }, height: 2 },
          { start: { x: -10, z: 10 }, end: { x: 10, z: 10 }, height: 2 },
          { start: { x: -10, z: -10 }, end: { x: -10, z: 10 }, height: 2 },
          { start: { x: 10, z: -10 }, end: { x: 10, z: 10 }, height: 2 }
        ];
        
        // 添加斜坡
        baseLevel.obstacles = [
          {
            type: 'ramp',
            position: { x: 0, y: 0, z: 0 },
            size: { width: 5, height: 1, depth: 10 },
            rotation: { x: Math.PI / 12, y: 0, z: 0 },
            material: {
              type: 'basic',
              color: 0xAAAAAA,
              metalness: 0.2,
              roughness: 0.8
            }
          }
        ];
        break;
        
      case 4: // 复杂迷宫
        baseLevel.size = { width: 30, height: 1, depth: 30 };
        baseLevel.walls = [
          // 外墙
          { start: { x: -15, z: -15 }, end: { x: 15, z: -15 }, height: 2 },
          { start: { x: -15, z: 15 }, end: { x: 15, z: 15 }, height: 2 },
          { start: { x: -15, z: -15 }, end: { x: -15, z: 15 }, height: 2 },
          { start: { x: 15, z: -15 }, end: { x: 15, z: 15 }, height: 2 },
          
          // 内墙 - 复杂迷宫布局
          { start: { x: -10, z: -10 }, end: { x: -5, z: -10 }, height: 2 },
          { start: { x: -10, z: -10 }, end: { x: -10, z: -5 }, height: 2 },
          { start: { x: -5, z: -5 }, end: { x: 0, z: -5 }, height: 2 },
          { start: { x: 0, z: -10 }, end: { x: 0, z: 0 }, height: 2 },
          { start: { x: 5, z: -10 }, end: { x: 5, z: -5 }, height: 2 },
          { start: { x: 5, z: -5 }, end: { x: 10, z: -5 }, height: 2 },
          { start: { x: -10, z: 0 }, end: { x: -5, z: 0 }, height: 2 },
          { start: { x: -5, z: 0 }, end: { x: -5, z: 5 }, height: 2 },
          { start: { x: -5, z: 5 }, end: { x: 0, z: 5 }, height: 2 },
          { start: { x: 0, z: 5 }, end: { x: 0, z: 10 }, height: 2 },
          { start: { x: 0, z: 10 }, end: { x: 5, z: 10 }, height: 2 },
          { start: { x: 5, z: 0 }, end: { x: 5, z: 5 }, height: 2 },
          { start: { x: 5, z: 5 }, end: { x: 10, z: 5 }, height: 2 },
          { start: { x: 10, z: 5 }, end: { x: 10, z: 10 }, height: 2 }
        ];
        break;
        
      case 5: // 终极挑战
        baseLevel.size = { width: 40, height: 1, depth: 40 };
        baseLevel.start = { x: -15, y: 0.5, z: -15 };
        baseLevel.end = { x: 15, y: 0.5, z: 15 };
        
        // 复杂的墙壁布局
        baseLevel.walls = [
          // 外墙
          { start: { x: -20, z: -20 }, end: { x: 20, z: -20 }, height: 2 },
          { start: { x: -20, z: 20 }, end: { x: 20, z: 20 }, height: 2 },
          { start: { x: -20, z: -20 }, end: { x: -20, z: 20 }, height: 2 },
          { start: { x: 20, z: -20 }, end: { x: 20, z: 20 }, height: 2 }
        ];
        
        // 添加更多的墙壁和障碍物
        for (let i = -15; i <= 15; i += 10) {
          for (let j = -15; j <= 15; j += 10) {
            if (Math.random() > 0.3) {
              baseLevel.walls.push({
                start: { x: i, z: j },
                end: { x: i + 5, z: j },
                height: 2
              });
            }
            
            if (Math.random() > 0.3) {
              baseLevel.walls.push({
                start: { x: i, z: j },
                end: { x: i, z: j + 5 },
                height: 2
              });
            }
          }
        }
        
        // 添加斜坡和障碍物
        baseLevel.obstacles = [
          {
            type: 'ramp',
            position: { x: -10, y: 0, z: 10 },
            size: { width: 5, height: 1, depth: 8 },
            rotation: { x: Math.PI / 10, y: 0, z: 0 },
            material: {
              type: 'basic',
              color: 0xAAAAAA,
              metalness: 0.2,
              roughness: 0.8
            }
          },
          {
            type: 'ramp',
            position: { x: 10, y: 0, z: -5 },
            size: { width: 8, height: 1, depth: 5 },
            rotation: { x: 0, y: 0, z: Math.PI / 12 },
            material: {
              type: 'basic',
              color: 0xAAAAAA,
              metalness: 0.2,
              roughness: 0.8
            }
          }
        ];
        break;
    }
    
    return baseLevel;
  }
  
  /**
   * 卸载当前关卡
   */
  unloadCurrentLevel() {
    if (this.currentLevel) {
      this.currentLevel = null;
    }
  }
  
  /**
   * 获取关卡列表
   * @returns {Array<Object>} 关卡信息数组
   */
  getLevelList() {
    return this.levels;
  }
  
  /**
   * 获取当前关卡
   * @returns {Level} 当前关卡
   */
  getCurrentLevel() {
    return this.currentLevel;
  }
  
  /**
   * 检查关卡完成状态
   * @param {number} levelId - 关卡ID
   * @returns {boolean} 已完成返回true
   */
  isLevelCompleted(levelId) {
    // 这个方法应该从存储中获取关卡完成状态
    // 这里简单返回false，实际应用中应该检查存储
    return false;
  }
  
  /**
   * 标记关卡为已完成
   * @param {number} levelId - 关卡ID
   * @param {Object} stats - 完成统计数据
   */
  markLevelCompleted(levelId, stats) {
    // 这个方法应该将关卡完成状态保存到存储中
    console.log(`关卡 ${levelId} 已完成，统计数据:`, stats);
  }
}
