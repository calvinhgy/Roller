# Roller - 3D滚珠迷宫游戏

Roller是一款专为iPhone用户设计的3D滚珠游戏，利用设备的倾斜角度来控制小球在迷宫中的滚动。游戏基于Web技术开发，可在iPhone自带的Safari浏览器中直接运行，无需下载安装。

## 项目概述

Roller游戏让玩家通过倾斜iPhone设备来控制小球在3D迷宫中的移动，目标是将小球成功引导至终点。游戏具有真实的物理效果、精美的3D图形和流畅的控制体验。

### 核心特性

- **设备倾斜控制**：利用iPhone的加速度计和陀螺仪实现直观的游戏控制
- **真实物理效果**：基于物理引擎的真实滚动、碰撞和动量模拟
- **多样化关卡**：提供多个难度递增的迷宫关卡
- **离线游戏**：支持PWA模式，允许离线游戏
- **视觉效果**：精美的3D图形和动画效果
- **进度保存**：自动保存游戏进度和成就

## 技术栈

- **3D渲染**：Three.js
- **物理引擎**：Cannon.js
- **构建工具**：Vite
- **编程语言**：JavaScript (ES6+)

## 项目结构

```
roller/
├── docs/                   # 项目文档
│   ├── requirements/       # 需求文档
│   ├── design/             # 设计文档
│   ├── engineering/        # 工程文档
│   ├── testing/            # 测试文档
│   └── development/        # 开发指南
├── src/                    # 源代码
│   ├── core/               # 游戏核心逻辑
│   ├── physics/            # 物理系统
│   ├── rendering/          # 渲染系统
│   ├── ui/                 # 用户界面
│   ├── levels/             # 关卡系统
│   ├── utils/              # 工具函数
│   └── assets/             # 静态资源
├── public/                 # 公共资源
├── tests/                  # 测试文件
└── README.md               # 项目说明
```

## 开发指南

### 环境设置

1. 克隆仓库：
   ```bash
   git clone https://github.com/yourusername/roller.git
   cd roller
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

4. 构建生产版本：
   ```bash
   npm run build
   ```

### 开发工作流

项目采用Prompt Driven Development (PDD)方法论，详细的开发指南请参考 `docs/development/pdd.md`。

## 测试

项目包含多种测试类型，确保游戏质量和性能：

- **单元测试**：测试独立组件和功能模块
- **集成测试**：测试组件之间的交互
- **性能测试**：评估游戏在不同条件下的性能表现
- **兼容性测试**：确保在所有目标设备上正常运行

运行测试：
```bash
npm test
```

详细的测试计划和用例请参考 `docs/testing/` 目录下的文档。

## 文档

项目文档分为以下几个部分：

- **需求文档**：详细的产品需求和功能规格
- **设计文档**：技术架构和详细设计
- **工程文档**：代码规范、API设计和工程实践
- **测试文档**：测试计划、用例和策略
- **开发指南**：开发流程和最佳实践

## 贡献指南

欢迎贡献代码、报告问题或提出改进建议。请遵循以下步骤：

1. Fork仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

[MIT License](LICENSE)

## 联系方式

项目维护者：Your Name - your.email@example.com

项目链接：https://github.com/yourusername/roller
# Roller
