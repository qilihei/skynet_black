# 心桥物语游戏服务器 Makefile

# 自动区分平台
OS := $(shell uname)
ifeq ($(OS), $(filter $(OS), Darwin))
	PLAT=macosx
else
	PLAT=linux
endif

.PHONY: all skynet clean install dev start stop restart test

# 路径配置
SHARED := -fPIC --shared
LUA_CLIB_PATH ?= common/luaclib
LUA_INC_PATH ?= 3rd/skynet/3rd/lua
SKYNET_PATH ?= 3rd/skynet
PREFIX ?= bin
BUILD_DIR ?= build
LUA_CJSON_DIR ?= 3rd/lua-cjson
LUA_PROTOBUF_DIR ?= 3rd/lua-protobuf
PROJECT_NAME ?= heartbridge_server
VERSION ?= 1.0.0
CFLAGS = -g -O2 -Wall -std=gnu99 -lrt
CXXFLAGS = -g -O2 -Wall -lrt -std=c++11

# 可执行文件名 (参考原项目的 co)
BINEXE = heartbridge
TAR ?= HeartBridge-Server.tar.gz

# 库文件定义
CJSON_SO = $(LUA_CLIB_PATH)/cjson.so
PROTOBUF_SO = $(LUA_CLIB_PATH)/protobuf.so

# 需要编译的库文件 (参考原项目但简化)
BIN = $(LUA_CLIB_PATH)/cjson.so \
      $(LUA_CLIB_PATH)/protobuf.so \
      $(LUA_CLIB_PATH)/log.so \
      $(LUA_CLIB_PATH)/timer.so \
      $(LUA_CLIB_PATH)/lfs.so

# 默认目标
all: skynet

# 编译 Skynet (参考原项目的修改)
skynet:
	@echo "编译 Skynet..."
	cd $(SKYNET_PATH) && $(MAKE) $(PLAT) && cd - && cp $(SKYNET_PATH)/skynet $(BINEXE)
	@echo "Skynet 编译完成"

# 编译所有库文件
all: skynet $(BIN)

# 创建目录
$(LUA_CLIB_PATH):
	mkdir -p $(LUA_CLIB_PATH)

# 编译 cjson
$(LUA_CLIB_PATH)/cjson.so: | $(LUA_CLIB_PATH)
	@echo "编译 cjson..."
	@if [ -d "3rd/lua-cjson" ]; then \
		cd 3rd/lua-cjson && $(MAKE) && cd - && cp 3rd/lua-cjson/cjson.so $@; \
	else \
		echo "cjson 源码不存在，跳过编译"; \
		touch $@; \
	fi

# 编译 protobuf
$(LUA_CLIB_PATH)/protobuf.so: | $(LUA_CLIB_PATH)
	@echo "编译 protobuf..."
	@if [ -d "3rd/lua-protobuf" ]; then \
		cd 3rd/lua-protobuf && $(MAKE) && cd - && cp 3rd/lua-protobuf/protobuf.so $@; \
	else \
		echo "protobuf 源码不存在，跳过编译"; \
		touch $@; \
	fi

# 编译日志模块
$(LUA_CLIB_PATH)/log.so: common/luaclib_src/lua-log.c | $(LUA_CLIB_PATH)
	@echo "编译日志模块..."
	@if [ -f "$<" ]; then \
		$(CC) $(CFLAGS) $(SHARED) -I$(LUA_INC_PATH) $^ -o $@; \
	else \
		echo "日志模块源码不存在，跳过编译"; \
		touch $@; \
	fi

# 编译定时器模块
$(LUA_CLIB_PATH)/timer.so: common/luaclib_src/lua-timer.c | $(LUA_CLIB_PATH)
	@echo "编译定时器模块..."
	@if [ -f "$<" ]; then \
		$(CC) $(CFLAGS) $(SHARED) -I$(LUA_INC_PATH) $^ -o $@; \
	else \
		echo "定时器模块源码不存在，跳过编译"; \
		touch $@; \
	fi

# 编译文件系统模块
$(LUA_CLIB_PATH)/lfs.so: | $(LUA_CLIB_PATH)
	@echo "编译文件系统模块..."
	@if [ -d "3rd/luafilesystem" ]; then \
		cd 3rd/luafilesystem && $(MAKE) && cd - && cp 3rd/luafilesystem/src/lfs.so $@; \
	else \
		echo "luafilesystem 源码不存在，跳过编译"; \
		touch $@; \
	fi
	@echo ""
	@echo "环境变量:"
	@echo "  PLAT=linux|macosx  - 指定平台"
	@echo "  DEBUG=1            - 启用调试模式"

# 编译lua-cjson (使用智能检测版本)
cjson: $(CJSON_SO)

# 编译lua-protobuf (使用智能检测版本)
protobuf: $(PROTOBUF_SO)

# 清理编译文件
clean:
	@echo "清理编译文件..."
	cd $(SKYNET_PATH) && $(MAKE) clean
	rm -rf $(LUA_CLIB_PATH)/*.so
	rm -rf $(BUILD_DIR)
	rm -rf log/*.log
	@echo "清理完成"

# 安装系统依赖
install:
	@echo "安装系统依赖..."
	./script/install_deps.sh
	@echo "依赖安装完成"

# 初始化数据库
init-db:
	@echo "初始化数据库..."
	mysql -u root -p < script/init_db.sql
	@echo "数据库初始化完成"

# 开发模式
dev: all
	@echo "启动开发环境..."
	./script/dev.sh

# 生产模式启动
start: all
	@echo "启动生产环境..."
	./script/start.sh

# 停止服务
stop:
	@echo "停止服务..."
	./script/stop.sh

# 重启服务
restart: stop start

# 运行测试
test: all
	@echo "运行测试..."
	./script/test.sh

# 代码检查
lint:
	@echo "代码检查..."
	find . -name "*.lua" -not -path "./3rd/*" | xargs luacheck

# 生成文档
docs:
	@echo "生成文档..."
	ldoc -d docs .

# 部署到生产环境
deploy: all test
	@echo "部署到生产环境..."
	./script/deploy.sh

# 备份数据
backup:
	@echo "备份数据..."
	./script/backup.sh

# 恢复数据
restore:
	@echo "恢复数据..."
	./script/restore.sh

# 监控服务状态
status:
	@echo "检查服务状态..."
	./script/status.sh

# 查看日志
logs:
	@echo "查看服务日志..."
	tail -f log/system/skynet.log

# 性能测试
benchmark: all
	@echo "运行性能测试..."
	./script/benchmark.sh

# 热更新
hotfix:
	@echo "执行热更新..."
	./script/hotfix.sh

# 数据库迁移
migrate:
	@echo "执行数据库迁移..."
	./script/migrate.sh

# 创建发布包
package: all test
	@echo "创建发布包..."
	@mkdir -p $(BUILD_DIR)
	tar -czf $(BUILD_DIR)/$(PROJECT_NAME)-$(VERSION).tar.gz \
		--exclude='*.git*' \
		--exclude='$(BUILD_DIR)' \
		--exclude='log/*' \
		--exclude='*.tmp' \
		.
	@echo "发布包创建完成: $(BUILD_DIR)/$(PROJECT_NAME)-$(VERSION).tar.gz"

# 安装发布包
install-package:
	@echo "安装发布包..."
	if [ -f $(BUILD_DIR)/$(PROJECT_NAME)-$(VERSION).tar.gz ]; then \
		tar -xzf $(BUILD_DIR)/$(PROJECT_NAME)-$(VERSION).tar.gz -C /opt/; \
	else \
		echo "发布包不存在，请先运行 make package"; \
	fi

# Docker相关
docker-build:
	@echo "构建Docker镜像..."
	docker build -t $(PROJECT_NAME):$(VERSION) .

docker-run:
	@echo "运行Docker容器..."
	docker run -d --name $(PROJECT_NAME) -p 8888:8888 $(PROJECT_NAME):$(VERSION)

docker-stop:
	@echo "停止Docker容器..."
	docker stop $(PROJECT_NAME)
	docker rm $(PROJECT_NAME)

# 开发工具
format:
	@echo "格式化代码..."
	find . -name "*.lua" -not -path "./3rd/*" | xargs lua-format -i

# 显示帮助信息
help:
	@echo "心桥物语游戏服务器 Makefile"
	@echo "参考 CO-Server 架构，适配心桥物语项目"
	@echo ""
	@echo "可用目标:"
	@echo "  all          - 编译所有组件"
	@echo "  skynet       - 编译 Skynet 框架"
	@echo "  dev          - 启动开发环境"
	@echo "  start        - 启动生产环境"
	@echo "  stop         - 停止服务"
	@echo "  restart      - 重启服务"
	@echo "  start-login  - 启动登录服务器"
	@echo "  start-game   - 启动游戏服务器"
	@echo "  test         - 运行测试"
	@echo "  init-db      - 初始化数据库"
	@echo "  lint         - 代码检查"
	@echo "  docs         - 生成文档"
	@echo "  package      - 创建发布包"
	@echo "  clean        - 清理编译文件"
	@echo "  remake       - 完全重新编译"
	@echo "  help         - 显示此帮助信息"

# 快速重新编译
remake: clean all

# 默认显示帮助
.DEFAULT_GOAL := help

check-deps:
	@echo "检查依赖..."
	@which gcc > /dev/null || (echo "gcc未安装" && exit 1)
	@which mysql > /dev/null || (echo "mysql未安装" && exit 1)
	@which redis-server > /dev/null || (echo "redis未安装" && exit 1)
	@echo "依赖检查通过"

# 性能分析
profile: all
	@echo "启动性能分析..."
	./script/profile.sh

# 内存检查
memcheck: all
	@echo "内存检查..."
	valgrind --tool=memcheck --leak-check=full ./$(SKYNET_PATH)/skynet config/server.lua

# 版本信息
version:
	@echo "项目: $(PROJECT_NAME)"
	@echo "版本: $(VERSION)"
	@echo "构建时间: $(shell date)"
	@echo "Git提交: $(shell git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"

# 清理日志
clean-logs:
	@echo "清理日志文件..."
	find log -name "*.log" -mtime +7 -delete
	@echo "日志清理完成"

# 数据库优化
optimize-db:
	@echo "优化数据库..."
	./script/optimize_db.sh

# 配置验证
validate-config:
	@echo "验证配置文件..."
	lua -e "require('config.server').validate()"
	lua -e "require('config.database').validate()"
	lua -e "require('config.game').validate()"
	@echo "配置验证通过"
