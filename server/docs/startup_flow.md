# 心桥物语游戏服务器启动流程文档

## 1. 整体架构概述

### 服务器分离架构
- **登录服务器**：负责用户认证、会话管理（端口 8888）
- **游戏服务器**：负责游戏逻辑处理（端口 8889）
- **调试控制台**：开发调试工具（端口 8000/8001）

### 当前简化版本
为了快速验证基本功能，我们创建了简化版本：
- 去除了对外部库的依赖（mysql、redis、protobuf）
- 使用内存存储替代数据库
- 实现了基本的文本协议通信

## 2. 启动流程详解

### 2.1 Skynet 框架启动流程

```
1. skynet 主程序启动
   ↓
2. 加载配置文件 (config/test.lua)
   ↓
3. 启动 bootstrap 服务
   ↓
4. bootstrap 启动核心服务：
   - launcher (服务管理器)
   - cdummy (单机模式占位服务)
   - harbor (集群通信，单机模式为占位)
   - datacenterd (数据中心服务)
   - service_mgr (服务管理)
   ↓
5. 启动主服务 (main.lua)
   ↓
6. bootstrap 完成任务后自动退出 (KILL self)
```

### 2.2 主服务启动流程

```
main.lua 启动流程：
1. 打印启动信息
   ↓
2. 启动控制台服务 (console)
   ↓
3. 启动调试控制台 (debug_console:8000)
   ↓
4. 启动日志服务 (log/log.lua)
   ↓
5. 启动登录服务 (simple_login.lua)
   ↓
6. 启动网关服务 (simple_gateway.lua)
   ↓
7. 配置网关监听端口 8888
   ↓
8. 启动完成，进入服务循环
```

### 2.3 服务间通信流程

```
客户端连接流程：
1. 客户端连接到网关 (8888端口)
   ↓
2. 网关创建连接对象，启动消息处理协程
   ↓
3. 客户端发送登录请求: LOGIN:username,password
   ↓
4. 网关解析消息，调用登录服务验证
   ↓
5. 登录服务验证用户信息，返回会话ID
   ↓
6. 网关返回登录结果给客户端
   ↓
7. 后续消息通过会话ID进行身份验证
```

## 3. 配置文件说明

### 3.1 主要配置文件

- **config/test.lua**: 登录服务器配置
- **config/game_server.lua**: 游戏服务器配置
- **config/skynet.lua**: 通用 skynet 配置模板
- **config/dev.lua**: 开发环境配置

### 3.2 关键配置项

```lua
-- 基础配置
root = "./"                    -- 项目根目录
thread = 8                     -- 工作线程数
harbor = 0                     -- 单机模式
start = "main"                 -- 启动脚本名称
bootstrap = "snlua bootstrap"  -- 引导服务

-- 路径配置
luaservice = "service路径"     -- Lua服务搜索路径
lualoader = "loader路径"       -- Lua加载器路径
lua_path = "Lua模块路径"       -- Lua模块搜索路径
cpath = "C服务路径"            -- C服务搜索路径

-- 服务配置
debug_port = 8000              -- 调试端口
gate_port = 8888               -- 网关端口
max_client = 1000              -- 最大连接数
```

## 4. 服务文件说明

### 4.1 简化服务文件

- **service/main.lua**: 登录服务器主入口
- **service/game_main.lua**: 游戏服务器主入口
- **service/simple_login.lua**: 简化登录服务
- **service/simple_gateway.lua**: 简化网关服务
- **service/log/log.lua**: 日志服务

### 4.2 原始服务文件（需要修改）

- **service/login/login.lua**: 原始登录服务（依赖外部库）
- **service/gateway/gateway.lua**: 原始网关服务（依赖 protobuf）
- **service/database/database.lua**: 数据库服务（依赖 mysql/redis）
- **service/game/game.lua**: 游戏逻辑服务

## 5. 通信协议

### 5.1 简化文本协议

```
登录: LOGIN:username,password
响应: LOGIN_SUCCESS:session_id 或 LOGIN_FAILED:error_message

心跳: PING:
响应: PONG:

登出: LOGOUT:
响应: LOGOUT_SUCCESS:
```

### 5.2 测试账号

```
用户名: test,     密码: 123456
用户名: admin,    密码: admin123
```

## 6. 启动命令

### 6.1 登录服务器启动

```bash
# 直接启动
./3rd/skynet/skynet config/test.lua

# 或使用开发脚本
./script/dev.sh
```

### 6.2 游戏服务器启动

```bash
./3rd/skynet/skynet config/game_server.lua
```

### 6.3 测试连接

```bash
# 使用 telnet 测试
telnet localhost 8888

# 然后输入
LOGIN:test,123456
PING:
LOGOUT:
```

## 7. 日志输出说明

### 7.1 正常启动日志

```
[:00000008] === 心桥物语登录服务器启动 ===
[:0000000a] Start debug console at 127.0.0.1:8000
[:0000000b] Log service started
[:0000000c] Simple login service started
[:0000000d] Gateway listening on port: 8888
[:00000008] === 心桥物语登录服务器启动完成 ===
[:00000002] KILL self  # 这是正常的，bootstrap 完成后退出
```

### 7.2 连接日志

```
[:0000000d] Client connected: 6 127.0.0.1:xxxxx
[:0000000d] Received data from fd 6 : LOGIN:test,123456
[:0000000d] Processing line: LOGIN:test,123456
[:0000000d] Process message: LOGIN from 6
[:0000000c] Login attempt: test
[:0000000c] User login success: test session: session_1001_xxxxx
```

## 8. 故障排除

### 8.1 常见问题

1. **端口被占用**: 修改配置文件中的端口号
2. **权限问题**: 确保 skynet 二进制文件有执行权限
3. **路径问题**: 检查配置文件中的路径设置
4. **依赖缺失**: 使用简化版本避免外部依赖

### 8.2 调试方法

1. 查看启动日志确认服务状态
2. 使用 `netstat -tlnp` 检查端口监听
3. 使用调试控制台 (端口 8000) 进行调试
4. 查看服务器日志输出定位问题

## 9. 下一步开发建议

1. **完善协议**: 实现 protobuf 协议支持
2. **数据库集成**: 集成 MySQL 和 Redis
3. **服务完善**: 完善原始服务的功能
4. **集群支持**: 实现多节点集群架构
5. **监控系统**: 添加性能监控和日志系统
