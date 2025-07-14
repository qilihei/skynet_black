-- 心桥物语游戏服务器主入口文件
-- 简化版本，基于原 CO-Server 架构但去除复杂依赖

local skynet = require "skynet"
require "skynet.manager"

local function initLogicLuaService()
    skynet.error("初始化游戏逻辑服务...")
    
    -- 启动游戏逻辑服务
    skynet.newservice("simple_game")
    skynet.newservice("simple_game")
    
    skynet.error("游戏逻辑服务初始化完成")
end

skynet.start(
    function()
        local selfNodeName = skynet.getenv("clusternode") .. skynet.getenv("serverid")
        skynet.error("=== 心桥物语游戏服务器启动 ===")
        skynet.error("节点名称: " .. selfNodeName)
        skynet.error("服务器ID: " .. (skynet.getenv("serverid") or "1"))
        skynet.error("集群节点: " .. (skynet.getenv("clusternode") or "game"))

        --init debug
        local debugPort = tonumber(skynet.getenv("debugport")) or 0
        if debugPort > 0 then
            skynet.error("启动调试控制台，端口: " .. debugPort)
            skynet.newservice("debug_console", debugPort)
        end

        -- 启动控制台服务 (开发模式)
        if not skynet.getenv("daemon") then
            skynet.error("启动控制台服务...")
            skynet.newservice("console")
        end

        -- 启动日志服务
        skynet.error("启动日志服务...")
        skynet.uniqueservice("log")

        -- 启动集群服务
        local cluster_file = skynet.getenv("cluster")
        if cluster_file then
            skynet.error("启动集群服务，配置文件: " .. cluster_file)
            skynet.uniqueservice("clusterd")
            skynet.uniqueservice("clusteragent")
        end

        --init lua server
        initLogicLuaService()

        --init game gate
        skynet.error("启动游戏网关...")
        local gateway = skynet.uniqueservice("simple_gateway")
        
        -- 配置网关监听
        local port = tonumber(skynet.getenv("port")) or 44445
        local max_client = tonumber(skynet.getenv("maxclient")) or 10000
        local host = skynet.getenv("host") or "0.0.0.0"
        
        skynet.call(gateway, "lua", "start", {
            host = host,
            port = port,
            maxclient = max_client,
            nodelay = true,
        })
        
        skynet.error("游戏网关监听地址: " .. host .. ":" .. port)
        skynet.error("最大客户端连接数: " .. max_client)

        -- log ok
        skynet.error("=== 心桥物语游戏服务器启动完成 ===")
    end
)

-- 测试网络连接 - 可以用 telnet 测试端口 44445
-- 完善游戏逻辑 - 在 simple_game.lua 中添加具体业务
-- 集成数据库 - 添加 MySQL/Redis 支持
-- 实现协议 - 添加 protobuf 协议支持
-- 监控系统 - 添加性能监控和日志分析
