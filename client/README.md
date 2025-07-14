# 农场游戏客户端

基于Cocos Creator和TypeScript开发的农场游戏客户端。

## 技术栈

- **引擎**: Cocos Creator 3.8+
- **语言**: TypeScript
- **协议**: Protocol Buffers
- **通信**: WebSocket

## 项目结构

```
client/
├── assets/                 # 游戏资源
│   ├── scenes/            # 场景文件
│   ├── scripts/           # 脚本文件
│   ├── textures/          # 贴图资源
│   └── prefabs/           # 预制体
├── extensions/            # 编辑器扩展
├── settings/              # 项目设置
├── temp/                  # 临时文件
├── library/               # 库文件
├── local/                 # 本地文件
├── build/                 # 构建输出
├── protocol/              # 协议文件
├── package.json           # 项目配置
└── tsconfig.json          # TypeScript配置
```

## 核心功能

### 网络模块
- WebSocket连接管理
- Protocol Buffers协议处理
- 消息队列和重连机制
- 心跳检测

### 场景管理
- 登录场景
- 游戏主场景
- 场景切换管理

### UI系统
- 登录界面
- 游戏主界面
- 消息提示系统

## 快速开始

1. 使用Cocos Creator打开项目
2. 配置服务器地址
3. 运行项目

## 开发指南

### 添加新协议
1. 在protocol目录添加.proto文件
2. 生成TypeScript代码
3. 在NetworkManager中注册处理函数

### 添加新场景
1. 创建场景文件
2. 编写场景脚本
3. 在SceneManager中注册

### 添加新UI
1. 创建预制体
2. 编写UI脚本
3. 在UIManager中管理
