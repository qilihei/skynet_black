# 脚本目录

这个目录包含各种运维和开发脚本。

## 脚本分类

### 构建脚本
- `build.sh` - 编译构建脚本
- `install_deps.sh` - 依赖安装脚本
- `clean.sh` - 清理脚本

### 部署脚本
- `deploy.sh` - 部署脚本
- `start.sh` - 启动脚本
- `stop.sh` - 停止脚本
- `restart.sh` - 重启脚本

### 数据库脚本
- `init_db.sql` - 数据库初始化
- `migrate.sh` - 数据库迁移
- `backup.sh` - 数据备份

### 开发工具
- `dev.sh` - 开发环境启动
- `test.sh` - 测试脚本
- `hotfix.sh` - 热更新脚本

### 监控脚本
- `monitor.sh` - 服务监控
- `health_check.sh` - 健康检查
- `log_rotate.sh` - 日志轮转

## 使用说明

所有脚本都应该在项目根目录下执行。
脚本支持参数传递和环境配置。
