# Roller - 3D滚珠游戏产品需求文档

## 产品概述

Roller是一款专为iPhone用户设计的3D滚珠游戏，玩家通过倾斜iPhone设备来控制小球在3D迷宫中的滚动方向和速度，目标是将小球成功引导至迷宫终点。游戏基于Web技术开发，可在iPhone自带的Safari浏览器中直接运行，无需下载安装。

## 目标用户

- iPhone用户
- 休闲游戏爱好者
- 各年龄段用户（特别是喜欢益智解谜类游戏的用户）

## 核心功能需求

### 1. 游戏机制

- **重力感应控制**：利用iPhone的加速度计和陀螺仪，通过倾斜设备控制小球移动
- **物理引擎**：实现真实的物理效果，包括重力、摩擦力、碰撞等
- **关卡设计**：提供多个难度递增的迷宫关卡
- **胜利条件**：小球到达终点区域时判定为胜利

### 2. 用户界面

- **开始界面**：包含游戏标题、开始按钮和关卡选择
- **游戏界面**：3D迷宫视图、计时器、当前关卡信息
- **暂停菜单**：暂停、重新开始、返回主菜单选项
- **胜利界面**：显示完成时间、星级评价、下一关按钮

### 3. 技术要求

- **Web兼容性**：在Safari浏览器中流畅运行
- **响应式设计**：适配不同iPhone型号的屏幕尺寸
- **设备API访问**：获取设备方向和运动数据
- **离线功能**：支持PWA（Progressive Web App）模式，允许离线游戏

### 4. 性能要求

- **帧率**：保持稳定的60FPS
- **加载时间**：初始加载时间不超过5秒
- **响应延迟**：设备倾斜与球体移动之间的延迟不超过100ms

## 非功能性需求

### 1. 可用性

- 简洁直观的用户界面
- 包含简短的游戏教程
- 支持触摸屏操作作为备选控制方式

### 2. 可靠性

- 在网络连接不稳定的情况下仍能正常运行
- 游戏进度自动保存

### 3. 安全性

- 不收集用户个人信息
- 符合Apple的隐私政策要求

## 约束条件

- 必须在Safari浏览器中运行良好
- 必须适配iOS 14及以上版本
- 必须遵循Web内容无障碍指南(WCAG)2.1标准

## 验收标准

1. 游戏可在iPhone Safari浏览器中流畅运行
2. 设备倾斜能准确控制小球移动
3. 碰撞检测准确，无穿墙等物理异常
4. 所有关卡可正常加载并完成
5. 游戏界面在不同iPhone型号上显示正常
6. 离线模式功能正常

## 未来扩展

- 添加多人竞赛模式
- 实现自定义关卡编辑器
- 添加社交分享功能
- 引入更多游戏元素（如收集物品、移动障碍等）
