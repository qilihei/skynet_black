# 基于Skynet的模拟经营游戏服务器

## 项目简介

这是一个基于Skynet框架开发的模拟经营类游戏服务器，类似于星露谷物语的游戏玩法。玩家可以在游戏中经营农场、种植作物、养殖动物、与其他玩家社交互动。

## 技术栈

- **框架**: Skynet (Actor模型)
- **语言**: Lua
- **数据库**: MySQL 8.0+ (持久化) + Redis 6.0+ (缓存)
- **通信协议**: WebSocket + Protocol Buffers (protobuf)
- **部署**: Docker + Docker Compose

## 核心功能

### 🌱 农场系统
- 作物种植与收获
- 土地管理与升级
- 浇水、施肥等农场操作
- 季节变化影响

### 🐄 动物养殖
- 多种动物饲养
- 动物喂养与照料
- 动物产品收集
- 动物情绪系统

### 🏪 交易系统
- NPC商店买卖
- 玩家间交易
- 拍卖行系统
- 市场价格波动

### 👥 社交功能
- 好友系统
- 聊天系统
- 公会系统
- 农场访问

### 🎯 任务系统
- 主线任务
- 日常任务
- 成就系统
- 限时活动

## 项目结构

```
skynet_farm_game/
├── config/                 # 配置文件
│   ├── server.lua          # 服务器配置
│   ├── database.lua        # 数据库配置
│   └── game_config/        # 游戏配置
├── service/                # 服务模块
│   ├── gateway/            # 网关服务
│   ├── login/              # 登录服务
│   ├── player/             # 玩家管理
│   ├── farm/               # 农场管理
│   ├── trade/              # 交易服务
│   ├── social/             # 社交服务
│   ├── quest/              # 任务服务
│   └── database/           # 数据库服务
├── protocol/               # 协议定义
├── lib/                    # 公共库
├── sql/                    # 数据库脚本
├── test/                   # 测试文件
├── docs/                   # 文档
├── docker/                 # Docker配置
├── main.lua                # 主入口
└── README.md
```

## 快速开始

### 环境要求

- Linux/macOS/Windows
- GCC 4.8+ 或 Clang 3.3+
- MySQL 8.0+
- Redis 6.0+
- Git

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd skynet_farm_game
```

2. **编译Skynet**
```bash
cd skynet
make linux  # Linux系统
# make macosx  # macOS系统
```

3. **配置数据库**
```bash
# 创建数据库
mysql -u root -p < sql/init.sql

# 导入表结构
mysql -u root -p farm_game < sql/tables/create_tables.sql

# 导入初始数据
mysql -u root -p farm_game < sql/data/init_data.sql
```

4. **配置Redis**
```bash
# 启动Redis服务
redis-server

# 或使用Docker
docker run -d -p 6379:6379 redis:6-alpine
```

5. **修改配置文件**
```bash
# 复制配置模板
cp config/server.lua.example config/server.lua
cp config/database.lua.example config/database.lua

# 修改数据库连接信息
vim config/database.lua
```

6. **启动服务器**
```bash
./skynet/skynet config/server.lua
```

### Docker部署

1. **使用Docker Compose**
```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f game-server
```

2. **单独构建镜像**
```bash
# 构建游戏服务器镜像
docker build -t farm-game-server .

# 运行容器
docker run -d -p 8888:8888 --name farm-game farm-game-server
```

## 配置说明

### 服务器配置 (config/server.lua)

```lua
-- 服务器基础配置
server = {
    host = "0.0.0.0",
    port = 8888,
    max_client = 1000,
    thread = 8,
}

-- 日志配置
logger = {
    level = "INFO",
    file = "logs/server.log",
    max_size = "100MB",
}

-- 游戏配置
game = {
    tick_interval = 100,  -- 游戏tick间隔(ms)
    save_interval = 300,  -- 数据保存间隔(s)
    max_energy = 100,     -- 玩家最大体力
}
```

### 数据库配置 (config/database.lua)

```lua
-- MySQL配置
mysql = {
    host = "127.0.0.1",
    port = 3306,
    database = "farm_game",
    user = "root",
    password = "password",
    charset = "utf8mb4",
    max_packet_size = 1024 * 1024,
}

-- Redis配置
redis = {
    host = "127.0.0.1",
    port = 6379,
    auth = "",
    db = 0,
}
```

## API文档

详细的API协议文档请参考：[协议设计文档](docs/协议设计文档.md)

### 主要接口

- **登录认证**: `login.request` / `login.response`
- **玩家信息**: `player.get_info` / `player.update_position`
- **农场操作**: `farm.plant_crop` / `farm.harvest_crop`
- **交易系统**: `trade.buy_item` / `trade.sell_item`
- **社交功能**: `social.get_friends` / `social.send_message`

## 开发指南

### 添加新功能

1. **创建服务模块**
```bash
mkdir service/new_feature
touch service/new_feature/init.lua
```

2. **定义协议**
```lua
-- protocol/new_feature.lua
local protocol = {}

protocol.request = {
    -- 请求协议定义
}

protocol.response = {
    -- 响应协议定义
}

return protocol
```

3. **实现服务逻辑**
```lua
-- service/new_feature/init.lua
local skynet = require "skynet"

local function handle_request(cmd, data)
    -- 处理业务逻辑
end

skynet.start(function()
    skynet.dispatch("lua", function(session, address, cmd, ...)
        local f = handle_request
        skynet.ret(skynet.pack(f(cmd, ...)))
    end)
end)
```

### 测试

```bash
# 运行单元测试
lua test/test_player.lua

# 运行集成测试
lua test/test_integration.lua

# 压力测试
lua test/stress_test.lua
```

### 调试

```bash
# 启动调试模式
./skynet/skynet config/debug.lua

# 连接调试控制台
telnet 127.0.0.1 8000
```

## 性能优化

### 数据库优化
- 使用连接池减少连接开销
- 合理设计索引提高查询效率
- 读写分离减少主库压力
- 定期清理过期数据

### 缓存策略
- 热点数据Redis缓存
- 玩家在线数据内存缓存
- 配置数据启动时预加载
- 合理设置缓存过期时间

### 网络优化
- 消息压缩减少带宽
- 批量操作减少网络请求
- 心跳机制检测连接状态
- 断线重连机制

## 监控运维

### 日志管理
- 分级日志记录
- 日志文件轮转
- 关键操作审计
- 错误告警机制

### 性能监控
- 服务器资源监控
- 数据库性能监控
- 网络流量监控
- 业务指标监控

### 部署策略
- 蓝绿部署
- 灰度发布
- 自动扩容
- 故障转移

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目维护者：[Your Name]
- 邮箱：[your.email@example.com]
- 项目地址：[https://github.com/username/skynet_farm_game]

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 基础农场系统
- 玩家管理系统
- 简单交易系统

### v0.9.0 (2023-12-15)
- Beta版本
- 核心功能开发完成
- 基础测试通过

## 致谢

- [Skynet](https://github.com/cloudwu/skynet) - 优秀的Actor模型框架
- [Lua](https://www.lua.org/) - 轻量级脚本语言
- 所有贡献者和测试者
