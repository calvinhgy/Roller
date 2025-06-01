/**
 * 关卡生成器，用于程序化生成关卡
 */
export class LevelGenerator {
  /**
   * 创建关卡生成器
   * @param {Object} options - 生成器选项
   */
  constructor(options = {}) {
    this.options = Object.assign({
      minSize: 10,
      maxSize: 30,
      complexity: 0.5, // 0-1，值越大迷宫越复杂
      seed: Math.random() * 1000000 | 0
    }, options);
    
    // 随机数生成器
    this.rng = this.createRNG(this.options.seed);
  }
  
  /**
   * 创建伪随机数生成器
   * @param {number} seed - 随机种子
   * @returns {Function} 随机数生成函数
   */
  createRNG(seed) {
    return function() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }
  
  /**
   * 生成关卡数据
   * @param {number} difficulty - 难度级别(1-5)
   * @returns {Object} 关卡数据
   */
  generateLevel(difficulty = 1) {
    // 根据难度调整参数
    const size = this.calculateSize(difficulty);
    const complexity = this.calculateComplexity(difficulty);
    
    // 生成基本关卡数据
    const level = {
      size: { width: size, height: 1, depth: size },
      start: { x: -size / 2 + 2, y: 0.5, z: -size / 2 + 2 },
      end: { x: size / 2 - 2, y: 0.5, z: size / 2 - 2 },
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
    
    // 生成外墙
    this.generateOuterWalls(level);
    
    // 根据难度生成不同类型的迷宫
    switch (difficulty) {
      case 1:
        this.generateSimpleMaze(level);
        break;
      case 2:
        this.generateGridMaze(level);
        break;
      case 3:
        this.generateRandomMaze(level, complexity);
        break;
      case 4:
        this.generateRandomMaze(level, complexity);
        this.addObstacles(level, 2);
        break;
      case 5:
        this.generateRandomMaze(level, complexity);
        this.addObstacles(level, 4);
        this.addRamps(level, 2);
        break;
      default:
        this.generateSimpleMaze(level);
    }
    
    return level;
  }
  
  /**
   * 根据难度计算关卡大小
   * @param {number} difficulty - 难度级别
   * @returns {number} 关卡大小
   */
  calculateSize(difficulty) {
    const { minSize, maxSize } = this.options;
    const size = minSize + (maxSize - minSize) * (difficulty - 1) / 4;
    return Math.round(size);
  }
  
  /**
   * 根据难度计算迷宫复杂度
   * @param {number} difficulty - 难度级别
   * @returns {number} 复杂度(0-1)
   */
  calculateComplexity(difficulty) {
    const baseComplexity = this.options.complexity;
    return Math.min(1, baseComplexity * difficulty / 3);
  }
  
  /**
   * 生成外墙
   * @param {Object} level - 关卡数据
   */
  generateOuterWalls(level) {
    const { width, depth } = level.size;
    const halfWidth = width / 2;
    const halfDepth = depth / 2;
    
    // 添加四面外墙
    level.walls.push(
      { start: { x: -halfWidth, z: -halfDepth }, end: { x: halfWidth, z: -halfDepth }, height: 2 },
      { start: { x: -halfWidth, z: halfDepth }, end: { x: halfWidth, z: halfDepth }, height: 2 },
      { start: { x: -halfWidth, z: -halfDepth }, end: { x: -halfWidth, z: halfDepth }, height: 2 },
      { start: { x: halfWidth, z: -halfDepth }, end: { x: halfWidth, z: halfDepth }, height: 2 }
    );
  }
  
  /**
   * 生成简单迷宫（教程关卡）
   * @param {Object} level - 关卡数据
   */
  generateSimpleMaze(level) {
    // 简单的直线路径
    level.walls.push(
      { start: { x: -5, z: 0 }, end: { x: 5, z: 0 }, height: 2 }
    );
  }
  
  /**
   * 生成网格迷宫
   * @param {Object} level - 关卡数据
   */
  generateGridMaze(level) {
    const { width, depth } = level.size;
    const gridSize = 5;
    
    // 水平墙
    for (let z = -depth / 2 + gridSize; z < depth / 2; z += gridSize) {
      // 在每行随机添加一个缺口
      const gapPosition = Math.floor(this.rng() * (width / gridSize)) * gridSize - width / 2;
      
      // 左侧墙
      if (gapPosition > -width / 2) {
        level.walls.push({
          start: { x: -width / 2, z },
          end: { x: gapPosition, z },
          height: 2
        });
      }
      
      // 右侧墙
      if (gapPosition < width / 2 - gridSize) {
        level.walls.push({
          start: { x: gapPosition + gridSize, z },
          end: { x: width / 2, z },
          height: 2
        });
      }
    }
    
    // 垂直墙
    for (let x = -width / 2 + gridSize; x < width / 2; x += gridSize) {
      // 在每列随机添加一个缺口
      const gapPosition = Math.floor(this.rng() * (depth / gridSize)) * gridSize - depth / 2;
      
      // 上侧墙
      if (gapPosition > -depth / 2) {
        level.walls.push({
          start: { x, z: -depth / 2 },
          end: { x, z: gapPosition },
          height: 2
        });
      }
      
      // 下侧墙
      if (gapPosition < depth / 2 - gridSize) {
        level.walls.push({
          start: { x, z: gapPosition + gridSize },
          end: { x, z: depth / 2 },
          height: 2
        });
      }
    }
  }
  
  /**
   * 生成随机迷宫
   * @param {Object} level - 关卡数据
   * @param {number} complexity - 复杂度(0-1)
   */
  generateRandomMaze(level, complexity) {
    const { width, depth } = level.size;
    const cellSize = 4;
    const cols = Math.floor(width / cellSize);
    const rows = Math.floor(depth / cellSize);
    
    // 创建迷宫网格
    const grid = Array(rows).fill().map(() => Array(cols).fill(false));
    
    // 使用深度优先搜索生成迷宫
    const stack = [];
    const startCol = Math.floor(cols / 4);
    const startRow = Math.floor(rows / 4);
    
    grid[startRow][startCol] = true;
    stack.push({ row: startRow, col: startCol });
    
    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const { row, col } = current;
      
      // 获取未访问的相邻单元格
      const neighbors = [];
      
      if (row > 0 && !grid[row - 1][col]) neighbors.push({ row: row - 1, col, direction: 'up' });
      if (row < rows - 1 && !grid[row + 1][col]) neighbors.push({ row: row + 1, col, direction: 'down' });
      if (col > 0 && !grid[row][col - 1]) neighbors.push({ row, col: col - 1, direction: 'left' });
      if (col < cols - 1 && !grid[row][col + 1]) neighbors.push({ row, col: col + 1, direction: 'right' });
      
      if (neighbors.length > 0) {
        // 随机选择一个相邻单元格
        const next = neighbors[Math.floor(this.rng() * neighbors.length)];
        
        // 标记为已访问
        grid[next.row][next.col] = true;
        
        // 添加到栈
        stack.push(next);
        
        // 根据复杂度决定是否添加墙
        if (this.rng() < complexity) {
          // 在两个单元格之间添加墙，但留出通道
          this.addWallBetweenCells(level, current, next, cellSize);
        }
      } else {
        // 回溯
        stack.pop();
      }
    }
  }
  
  /**
   * 在两个单元格之间添加墙
   * @param {Object} level - 关卡数据
   * @param {Object} cell1 - 第一个单元格
   * @param {Object} cell2 - 第二个单元格
   * @param {number} cellSize - 单元格大小
   */
  addWallBetweenCells(level, cell1, cell2, cellSize) {
    const { width, depth } = level.size;
    const halfWidth = width / 2;
    const halfDepth = depth / 2;
    
    // 计算单元格中心坐标
    const x1 = cell1.col * cellSize - halfWidth + cellSize / 2;
    const z1 = cell1.row * cellSize - halfDepth + cellSize / 2;
    const x2 = cell2.col * cellSize - halfWidth + cellSize / 2;
    const z2 = cell2.row * cellSize - halfDepth + cellSize / 2;
    
    // 计算墙的方向
    const direction = cell2.direction;
    
    // 墙的长度（小于单元格大小，留出通道）
    const wallLength = cellSize * 0.6;
    
    // 根据方向添加墙
    switch (direction) {
      case 'up':
      case 'down':
        // 水平墙
        const zWall = (z1 + z2) / 2;
        const xOffset = wallLength / 2;
        
        level.walls.push({
          start: { x: x1 - xOffset, z: zWall },
          end: { x: x1 + xOffset, z: zWall },
          height: 2
        });
        break;
        
      case 'left':
      case 'right':
        // 垂直墙
        const xWall = (x1 + x2) / 2;
        const zOffset = wallLength / 2;
        
        level.walls.push({
          start: { x: xWall, z: z1 - zOffset },
          end: { x: xWall, z: z1 + zOffset },
          height: 2
        });
        break;
    }
  }
  
  /**
   * 添加障碍物
   * @param {Object} level - 关卡数据
   * @param {number} count - 障碍物数量
   */
  addObstacles(level, count) {
    const { width, depth } = level.size;
    const halfWidth = width / 2;
    const halfDepth = depth / 2;
    
    for (let i = 0; i < count; i++) {
      // 随机位置
      const x = (this.rng() * (width - 4)) - halfWidth + 2;
      const z = (this.rng() * (depth - 4)) - halfDepth + 2;
      
      // 避免在起点和终点附近放置障碍物
      const distToStart = Math.sqrt(
        Math.pow(x - level.start.x, 2) + 
        Math.pow(z - level.start.z, 2)
      );
      
      const distToEnd = Math.sqrt(
        Math.pow(x - level.end.x, 2) + 
        Math.pow(z - level.end.z, 2)
      );
      
      if (distToStart < 3 || distToEnd < 3) {
        // 太靠近起点或终点，跳过
        continue;
      }
      
      // 随机大小
      const size = 1 + this.rng() * 2;
      
      // 添加障碍物
      level.obstacles.push({
        type: 'box',
        position: { x, y: size / 2, z },
        size: { width: size, height: size, depth: size },
        material: {
          type: 'basic',
          color: 0xAAAAAA,
          metalness: 0.2,
          roughness: 0.8
        }
      });
    }
  }
  
  /**
   * 添加斜坡
   * @param {Object} level - 关卡数据
   * @param {number} count - 斜坡数量
   */
  addRamps(level, count) {
    const { width, depth } = level.size;
    const halfWidth = width / 2;
    const halfDepth = depth / 2;
    
    for (let i = 0; i < count; i++) {
      // 随机位置
      const x = (this.rng() * (width - 8)) - halfWidth + 4;
      const z = (this.rng() * (depth - 8)) - halfDepth + 4;
      
      // 避免在起点和终点附近放置斜坡
      const distToStart = Math.sqrt(
        Math.pow(x - level.start.x, 2) + 
        Math.pow(z - level.start.z, 2)
      );
      
      const distToEnd = Math.sqrt(
        Math.pow(x - level.end.x, 2) + 
        Math.pow(z - level.end.z, 2)
      );
      
      if (distToStart < 5 || distToEnd < 5) {
        // 太靠近起点或终点，跳过
        continue;
      }
      
      // 随机大小和角度
      const width = 3 + this.rng() * 3;
      const depth = 5 + this.rng() * 5;
      const angle = (this.rng() * Math.PI / 6) + Math.PI / 12; // 15-30度
      
      // 随机旋转方向
      const rotationAxis = this.rng() < 0.5 ? 'x' : 'z';
      const rotation = {
        x: rotationAxis === 'x' ? angle : 0,
        y: 0,
        z: rotationAxis === 'z' ? angle : 0
      };
      
      // 添加斜坡
      level.obstacles.push({
        type: 'ramp',
        position: { x, y: 0, z },
        size: { width, height: 1, depth },
        rotation,
        material: {
          type: 'basic',
          color: 0xAAAAAA,
          metalness: 0.2,
          roughness: 0.8
        }
      });
    }
  }
}
