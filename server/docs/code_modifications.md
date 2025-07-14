# 原始代码修改指南

## 1. 修改概述

为了解决启动问题和实现基本功能验证，我们对原始代码进行了以下修改：

### 1.1 问题解决
- ✅ 修复了 `continue` 语句在 Lua 中不存在的问题
- ✅ 修复了 skynet 配置文件格式问题
- ✅ 解决了服务路径配置问题
- ✅ 创建了简化版本避免外部依赖

### 1.2 架构调整
- ✅ 将登录服务和游戏服务分离
- ✅ 创建了独立的配置文件
- ✅ 实现了基本的文本协议通信

## 2. 需要修改的原始文件

### 2.1 启动脚本修改

#### script/start.sh
```bash
# 原始配置
CONFIG_FILE="$PROJECT_ROOT/config/server.lua"

# 修改为
CONFIG_FILE="$PROJECT_ROOT/config/skynet.lua"
```

#### script/dev.sh
需要修改开发脚本以使用正确的配置文件：
```bash
# 第189行附近，修改配置文件路径
local config_to_use="$PROJECT_ROOT/config/dev.lua"
```

### 2.2 配置文件修改

#### config/server.lua
原始文件是 Lua 表格式，需要转换为 skynet 配置格式，或者保持原样作为应用层配置。

#### config/dev.lua
```lua
-- 原始版本（有问题）
local config = require "config.server"

-- 修改为 skynet 格式
root = "./"
thread = 8
harbor = 0
start = "main"
-- ... 其他配置
```

### 2.3 服务文件修改

#### service/gateway/gateway.lua
**问题**: 第87行的 `continue` 语句
```lua
-- 原始代码（错误）
if not success then
    skynet.error("Parse message failed:", msg)
    continue  -- Lua 中不存在 continue
end

-- 修改为
if not success then
    skynet.error("Parse message failed:", msg)
    goto continue
end
-- 在循环开始处添加标签
while true do
    ::continue::
    -- ... 循环体
end
```

#### service/login/login.lua
**问题**: 依赖外部库 (pb, mysql, redis)
```lua
-- 原始代码（依赖问题）
local pb = require "pb"
local mysql = require "mysql"
local redis = require "redis"

-- 临时解决方案：使用简化版本
-- 创建 service/simple_login.lua 替代
```

#### service/database/database.lua
**问题**: MySQL 和 Redis 依赖
```lua
-- 原始代码
local mysql = require "mysql"
local redis = require "redis"

-- 需要先编译相关库或使用模拟实现
```

## 3. 外部依赖解决方案

### 3.1 缺失的库文件

需要编译或安装以下库：
- `pb.so` (protobuf)
- `mysql.so` (MySQL 连接器)
- `redis.so` (Redis 连接器)
- `cjson.so` (JSON 处理)

### 3.2 编译命令

```bash
# 编译 protobuf
make protobuf

# 编译 cjson
make cjson

# 编译 MySQL 支持
# 需要安装 MySQL 开发库
sudo apt-get install libmysqlclient-dev
make mysql

# 编译 Redis 支持
make redis
```

### 3.3 路径配置

确保编译后的 .so 文件在正确路径：
```lua
lua_cpath = root.."common/luaclib/?.so;"..root.."3rd/skynet/luaclib/?.so"
```

## 4. 原始服务恢复步骤

### 4.1 恢复登录服务

1. **编译依赖库**
```bash
make protobuf cjson mysql redis
```

2. **修复 continue 问题**
```lua
-- 在所有使用 continue 的地方替换为 goto
```

3. **更新 main.lua**
```lua
-- 从
local login_service = skynet.newservice("simple_login")
-- 改为
local login_service = skynet.newservice("login")
```

### 4.2 恢复网关服务

1. **确保 protobuf 库可用**
2. **修复 continue 语句**
3. **更新协议处理逻辑**

### 4.3 恢复数据库服务

1. **安装 MySQL 和 Redis**
2. **配置数据库连接**
3. **初始化数据库表结构**

## 5. 渐进式恢复建议

### 阶段1：基础功能验证 ✅
- [x] 使用简化服务验证启动流程
- [x] 实现基本的登录功能
- [x] 验证网络通信

### 阶段2：协议升级
- [ ] 编译 protobuf 库
- [ ] 实现 protobuf 协议
- [ ] 升级网关服务

### 阶段3：数据库集成
- [ ] 编译数据库连接库
- [ ] 配置数据库连接
- [ ] 迁移用户数据

### 阶段4：完整功能
- [ ] 恢复所有原始服务
- [ ] 实现完整的游戏逻辑
- [ ] 性能优化和监控

## 6. 配置文件对应关系

### 6.1 当前简化版本
```
config/test.lua          -> 登录服务器配置
config/game_server.lua   -> 游戏服务器配置
service/main.lua         -> 登录服务器入口
service/game_main.lua    -> 游戏服务器入口
```

### 6.2 原始完整版本
```
config/server.lua        -> 应用层配置
config/dev.lua          -> 开发环境配置
config/skynet.lua       -> skynet 框架配置
service/login/login.lua -> 完整登录服务
service/gateway/gateway.lua -> 完整网关服务
```

## 7. 测试验证步骤

### 7.1 简化版本测试
```bash
# 启动服务器
./3rd/skynet/skynet config/test.lua

# 测试连接
telnet localhost 8888
LOGIN:test,123456
```

### 7.2 完整版本测试
```bash
# 编译依赖
make all

# 初始化数据库
make init-db

# 启动服务器
./script/start.sh

# 使用客户端测试
```

## 8. 注意事项

1. **备份原始代码**: 在修改前备份所有原始文件
2. **渐进式升级**: 不要一次性修改所有文件
3. **测试验证**: 每个阶段都要充分测试
4. **依赖管理**: 确保所有依赖库正确编译和配置
5. **配置一致性**: 保持配置文件之间的一致性

## 9. 常见问题解决

### 9.1 编译问题
- 检查系统依赖库是否安装
- 确认编译工具链完整
- 查看 Makefile 中的路径配置

### 9.2 运行时问题
- 检查 .so 文件路径
- 验证配置文件格式
- 查看服务启动日志

### 9.3 协议问题
- 确认 protobuf 版本兼容性
- 检查协议定义文件
- 验证消息序列化/反序列化
