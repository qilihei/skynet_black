# 第三方库目录

这个目录用于存放所有的Lua第三方开源库。

## 📁 目录说明

此目录包含项目所需的所有第三方Lua库：

- **lua-protobuf** - Protocol Buffers支持，用于客户端-服务器通信
- **lua-cjson** - JSON编解码库，用于配置文件和API数据交换
- **lua-resty-mysql** - MySQL客户端库，用于数据库操作
- **lua-resty-redis** - Redis客户端库，用于缓存和会话管理
- **lua-resty-http** - HTTP客户端库，用于外部API调用
- **luasocket** - 网络通信库，提供TCP/UDP支持
- **lua-zlib** - 数据压缩库，用于数据传输优化
- **lua-md5** - MD5哈希库，用于密码加密和数据校验

## 🛠️ 管理方式

### 自动管理（推荐）

使用项目提供的管理脚本：

```bash
# 安装所有库
../scripts/manage_3rd_libs.sh install

# 编译所有库
../scripts/manage_3rd_libs.sh build

# 查看状态
../scripts/manage_3rd_libs.sh status

# 更新所有库
../scripts/manage_3rd_libs.sh update
```

### 手动管理

如果需要手动管理某个库：

```bash
# 克隆库
git clone https://github.com/author/library-name.git

# 进入目录编译
cd library-name
make

# 复制编译产物到相应目录
cp *.so ../../skynet/luaclib/
cp *.lua ../../lib/
```

## 📋 添加新库

1. 编辑 `../scripts/manage_3rd_libs.sh`
2. 在 `THIRD_PARTY_LIBS` 数组中添加新库
3. 如需要，添加特定的编译规则
4. 测试安装和编译

## 🔧 编译要求

- GCC编译器
- Make工具
- Lua开发头文件（使用skynet内置的）
- 特定库可能需要额外的系统依赖

## 📚 相关文档

- [第三方库管理文档](../docs/第三方库管理.md)
- [快速安装指南](../docs/快速安装指南.md)
- [环境部署文档](../docs/环境部署文档.md)

## ⚠️ 注意事项

1. **版本兼容性** - 确保库版本与项目兼容
2. **依赖管理** - 某些库可能需要系统级依赖
3. **编译顺序** - 某些库可能依赖其他库
4. **路径配置** - 确保服务器配置中包含正确的搜索路径

## 🔍 故障排除

如果遇到编译问题：

1. 检查系统依赖是否安装完整
2. 确保skynet已正确编译
3. 查看具体的错误信息
4. 参考第三方库的官方文档

---

通过统一管理第三方库，可以确保项目的依赖关系清晰，部署过程简化！
