# 核心服务目录

这个目录包含游戏服务器的核心服务模块。

## 目录结构

- `gateway/` - 网关服务，处理客户端连接和协议路由
- `login/` - 登录服务，处理用户认证和会话管理
- `game/` - 游戏主服务，协调各业务模块
- `database/` - 数据库服务，提供数据访问接口
- `log/` - 日志服务，统一日志管理

## 服务启动顺序

1. database - 数据库服务
2. log - 日志服务  
3. login - 登录服务
4. game - 游戏服务
5. gateway - 网关服务

## 服务间通信

所有服务通过Skynet内部消息机制进行通信，使用统一的协议格式。
