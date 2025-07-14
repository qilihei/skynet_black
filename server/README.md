# 心桥物语游戏服务器

基于Skynet框架开发的模拟经营类游戏服务器，类似星露谷物语的玩法。

## 项目特点

- 🎮 **模拟经营玩法**: 农场种植、动物养殖、商店交易等丰富内容
- 🏗️ **分层架构**: 网关层、业务逻辑层、数据访问层清晰分离
- 🔧 **模块化设计**: 农场、背包、玩家、好友等模块独立开发
- 📡 **高性能通信**: 基于Skynet的高并发消息处理
- 🗄️ **双存储支持**: MySQL持久化 + Redis缓存
- 🛡️ **安全可靠**: 完善的认证、会话管理和数据验证

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                              │
│                    (Unity/Cocos等)                         │
└─────────────────────┬───────────────────────────────────────┘
                      │ TCP/WebSocket + Protobuf
┌─────────────────────▼───────────────────────────────────────┐
│                      网关层                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Gateway   │  │   Gateway   │  │   Gateway   │         │
│  │   Service   │  │   Service   │  │   Service   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────┬───────────────────────────────────────┘
                      │ Skynet内部消息
┌─────────────────────▼───────────────────────────────────────┐
│                    业务逻辑层                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Login     │  │    Game     │  │   Social    │         │
│  │   Service   │  │   Service   │  │   Service   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Farm     │  │    Shop     │  │    Quest    │         │
│  │   Module    │  │   Module    │  │   Module    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────┬───────────────────────────────────────┘
                      │ 数据访问接口
┌─────────────────────▼───────────────────────────────────────┐
│                    数据访问层                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   MySQL     │  │    Redis    │  │    Log      │         │
│  │   Service   │  │   Service   │  │   Service   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────┬───────────────────────────────────────┘
                      │ 数据库连接
┌─────────────────────▼───────────────────────────────────────┐
│                    数据存储层                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    MySQL    │  │    Redis    │  │  Log Files  │         │
│  │  Database   │  │   Cache     │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 目录结构

```
server/
├── 3rd/                   # 第三方库
│   ├── skynet/            # Skynet框架
│   ├── lua-cjson/         # JSON处理库
│   └── lua-protobuf/      # Protocol Buffers
├── common/                # 公共代码
│   ├── lualib/            # 通用Lua库
│   │   ├── protocol.lua   # 协议管理
│   │   ├── mysql.lua      # MySQL封装
│   │   └── redis.lua      # Redis封装
│   └── luaclib/           # 编译好的C库
├── service/               # 核心服务
│   ├── gateway/           # 网关服务
│   ├── login/             # 登录服务
│   ├── game/              # 游戏主服务
│   └── database/          # 数据库服务
├── mod/                   # 业务模块
│   ├── player/            # 玩家系统
│   ├── farm/              # 农场系统
│   ├── inventory/         # 背包系统
│   ├── shop/              # 商店系统
│   ├── friend/            # 好友系统
│   ├── chat/              # 聊天系统
│   └── quest/             # 任务系统
├── config/                # 配置文件
│   ├── server.lua         # 服务器配置
│   ├── database.lua       # 数据库配置
│   └── game.lua           # 游戏配置
├── protocol/              # 协议定义
│   └── game.proto         # Protobuf协议
├── script/                # 脚本工具
│   ├── start.sh           # 启动脚本
│   ├── stop.sh            # 停止脚本
│   ├── dev.sh             # 开发脚本
│   └── init_db.sql        # 数据库初始化
├── test/                  # 测试代码
├── log/                   # 日志文件
└── Makefile               # 构建文件
```

## 快速开始

### 环境要求

- Linux/macOS系统
- GCC编译器
- MySQL 5.7+
- Redis 3.0+
- Lua 5.3+

### 安装依赖

```bash
# Ubuntu/Debian
sudo apt-get install build-essential mysql-server redis-server

# CentOS/RHEL
sudo yum install gcc gcc-c++ mysql-server redis

# macOS
brew install mysql redis
```

### 编译项目

```bash
# 编译所有组件
make all

# 或分别编译
make skynet    # 编译Skynet框架
make cjson     # 编译JSON库
make protobuf  # 编译Protobuf库
```

### 初始化数据库

```bash
# 初始化数据库表结构
make init-db

# 或手动执行
mysql -u root -p < script/init_db.sql
```

### 启动服务器

```bash
# 开发模式启动
make dev

# 生产模式启动
make start

# 后台运行
./script/start.sh -d
```

### 停止服务器

```bash
# 优雅停止
make stop

# 强制停止
./script/stop.sh -f
```

## 开发指南

### 开发环境

```bash
# 启动开发环境
./script/dev.sh

# 开发菜单选项:
# 1. 启动服务器
# 2. 代码检查
# 3. 运行测试
# 4. 初始化数据库
# 5. 清理环境
```

### 添加新模块

1. 在`mod/`目录下创建模块文件夹
2. 实现模块的`init`、`process_message`等接口
3. 在`service/game/game.lua`中注册模块
4. 在`common/lualib/protocol.lua`中添加消息路由

### 协议定义

协议使用Protocol Buffers定义，文件位于`protocol/game.proto`。

消息ID分配规则：
- 1-99: 系统消息
- 100-199: 登录相关
- 200-299: 玩家相关
- 300-399: 背包相关
- 400-499: 农场相关
- 500-599: 商店相关
- 600-699: 好友相关
- 700-799: 聊天相关
- 800-899: 任务相关

### 数据库设计

主要数据表：
- `users`: 用户基础信息
- `player_info`: 玩家扩展信息
- `user_items`: 用户物品
- `user_farms`: 用户农场
- `user_plots`: 农场地块
- `user_friends`: 好友关系
- `chat_messages`: 聊天消息
- `quests`: 任务定义
- `user_quests`: 用户任务进度

## 游戏功能

### 核心系统

- **玩家系统**: 等级、经验、货币、体力管理
- **农场系统**: 作物种植、收获、地块管理
- **背包系统**: 物品管理、使用、整理
- **商店系统**: 物品买卖、商店刷新
- **好友系统**: 添加好友、好友互动
- **聊天系统**: 世界聊天、私聊
- **任务系统**: 主线任务、日常任务、成就

### 游戏内容

- **作物种植**: 萝卜、土豆、玉米、小麦等多种作物
- **工具系统**: 锄头、水壶等农具
- **动物养殖**: 鸡、牛等动物饲养
- **材料收集**: 木材、石头、矿物等资源
- **社交互动**: 好友访问、聊天交流

## 运维管理

### 监控命令

```bash
# 查看服务状态
make status

# 查看日志
make logs

# 性能测试
make benchmark

# 数据备份
make backup
```

### 配置管理

- `config/server.lua`: 服务器基础配置
- `config/database.lua`: 数据库连接配置
- `config/game.lua`: 游戏规则配置

### 日志管理

日志文件分类存储在`log/`目录：
- `system/`: 系统日志
- `service/`: 服务日志
- `business/`: 业务日志
- `performance/`: 性能日志
- `security/`: 安全日志

## 测试

```bash
# 运行所有测试
make test

# 单元测试
./script/test.sh unit

# 集成测试
./script/test.sh integration

# 性能测试
./script/test.sh performance
```

## 部署

```bash
# 创建发布包
make package

# 部署到生产环境
make deploy

# Docker部署
make docker-build
make docker-run
```

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交代码
4. 创建Pull Request

## 许可证

MIT License

## 联系方式

- 项目地址: [GitHub Repository]
- 问题反馈: [Issues]
- 技术讨论: [Discussions]
