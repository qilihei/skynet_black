# Makefile 使用说明

## 概述

这个 Makefile 参考了你提供的 CO-Server 项目的 Makefile，并适配了心桥物语游戏服务器的项目结构。它提供了完整的编译、部署和开发工具链。

## 主要特性

### 1. 平台自动检测
```bash
# 自动检测 macOS 或 Linux
OS := $(shell uname)
ifeq ($(OS), $(filter $(OS), Darwin))
    PLAT=macosx
else 
    PLAT=linux
endif
```

### 2. 模块化编译
支持独立编译各个组件：
- Skynet 框架
- cjson 库
- protobuf 库
- 日志模块
- 定时器模块
- 文件系统模块

### 3. 智能依赖检测
如果某个依赖库不存在，会跳过编译而不是报错：
```bash
@if [ -d "3rd/lua-cjson" ]; then \
    cd 3rd/lua-cjson && $(MAKE) && cd - && cp 3rd/lua-cjson/cjson.so $@; \
else \
    echo "cjson 源码不存在，跳过编译"; \
    touch $@; \
fi
```

## 常用命令

### 基础编译
```bash
# 编译所有组件
make all

# 只编译 Skynet
make skynet

# 清理编译文件
make clean

# 完全重新编译
make remake
```

### 服务器管理
```bash
# 启动开发环境
make dev

# 启动生产环境
make start

# 停止服务
make stop

# 重启服务
make restart

# 启动登录服务器
make start-login

# 启动游戏服务器
make start-game
```

### 开发工具
```bash
# 代码检查
make lint

# 生成文档
make docs

# 运行测试
make test

# 初始化数据库
make init-db
```

### 部署相关
```bash
# 安装到 bin 目录
make install

# 创建发布包
make package

# Docker 构建
make docker-build

# Docker 运行
make docker-run
```

## 目录结构对应

### 编译输出目录
```
common/luaclib/          # Lua C 库输出目录
├── cjson.so            # JSON 处理库
├── protobuf.so         # Protobuf 库
├── log.so              # 日志模块
├── timer.so            # 定时器模块
└── lfs.so              # 文件系统库
```

### 安装目录 (make install)
```
bin/                     # 安装目录
├── common/             # 公共库和模块
├── service/            # 服务文件
├── config/             # 配置文件
├── script/             # 脚本文件
├── 3rd/skynet/         # Skynet 框架文件
└── heartbridge         # 主程序
```

## 配置变量

### 可自定义的变量
```bash
# 编译时指定平台
make PLAT=macosx

# 指定安装目录
make install PREFIX=/opt/heartbridge

# 指定 Lua C 库路径
make LUA_CLIB_PATH=custom/path
```

### 环境变量
```bash
export PLAT=linux           # 平台类型
export DEBUG=1              # 启用调试模式
export PREFIX=/opt/game     # 安装前缀
```

## 与原 CO-Server Makefile 的对比

### 相似之处
1. **平台检测机制** - 自动识别 macOS/Linux
2. **模块化编译** - 支持独立编译各个组件
3. **智能依赖处理** - 缺失依赖时跳过而不报错
4. **完整的生命周期** - 编译、安装、打包、部署

### 适配修改
1. **项目名称** - 从 `co` 改为 `heartbridge`
2. **目录结构** - 适配心桥物语项目的目录布局
3. **简化依赖** - 移除了复杂的导航网格等依赖
4. **服务分离** - 支持登录服务器和游戏服务器独立启动

### 新增功能
1. **服务器分离启动** - `make start-login` 和 `make start-game`
2. **Docker 支持** - Docker 构建和运行命令
3. **开发工具集成** - 代码检查、文档生成等

## 故障排除

### 常见问题

1. **编译失败**
```bash
# 检查依赖
ls 3rd/
# 确保 skynet 目录存在

# 清理后重新编译
make clean
make all
```

2. **权限问题**
```bash
# 给 Makefile 执行权限
chmod +x Makefile

# 给脚本执行权限
chmod +x script/*.sh
```

3. **路径问题**
```bash
# 检查当前目录
pwd
# 应该在项目根目录

# 检查 skynet 路径
ls 3rd/skynet/skynet
```

### 调试模式
```bash
# 启用详细输出
make V=1 all

# 查看实际执行的命令
make -n all
```

## 扩展建议

### 添加新的库
1. 在 `BIN` 变量中添加新的 .so 文件
2. 创建对应的编译规则
3. 添加到 `install` 目标中

### 自定义脚本
1. 在 `script/` 目录下添加脚本
2. 在 Makefile 中创建对应的目标
3. 添加到帮助信息中

### 集成 CI/CD
```bash
# 在 CI 中使用
make clean
make all
make test
make package
```

这个 Makefile 为心桥物语游戏服务器提供了完整的构建和部署解决方案，既保持了原 CO-Server 项目的优秀设计，又适配了当前项目的具体需求。
