-- 心桥物语游戏服务器主入口文件
-- 基于原 CO-Server 架构设计

local skynet = require "skynet"

-- 启动函数
skynet.start(function()
    skynet.error("=== 心桥物语游戏服务器启动 ===")
    skynet.error("服务器版本: " .. (skynet.getenv("game_version") or "1.0.0"))
    skynet.error("服务器名称: " .. (skynet.getenv("game_name") or "HeartBridge"))
    skynet.error("服务器ID: " .. (skynet.getenv("serverid") or "1"))
    skynet.error("集群节点: " .. (skynet.getenv("clusternode") or "game"))

    -- 启动控制台服务 (开发模式)
    if not skynet.getenv("daemon") then
        skynet.error("启动控制台服务...")
        skynet.newservice("console")
    end

    -- 启动调试控制台
    local debug_port = tonumber(skynet.getenv("debugport")) or 0
    if debug_port > 0 then
        skynet.error("启动调试控制台，端口: " .. debug_port)
        skynet.newservice("debug_console", debug_port)
    end

    -- 启动日志服务
    skynet.error("启动日志服务...")
    local log_service = skynet.uniqueservice("log")

    -- 启动集群服务
    local cluster_file = skynet.getenv("cluster")
    if cluster_file then
        skynet.error("启动集群服务，配置文件: " .. cluster_file)
        skynet.uniqueservice("clusterd")
        skynet.uniqueservice("cluster_agent")
    end

    -- 启动数据库服务
    skynet.error("启动数据库服务...")
    local database = skynet.uniqueservice("database")

    -- 启动游戏逻辑服务
    skynet.error("启动游戏逻辑服务...")
    local game_service1 = skynet.newservice("simple_game")
    local game_service2 = skynet.newservice("simple_game")

    -- 启动网关服务
    skynet.error("启动游戏网关服务...")
    local gateway = skynet.newservice("simple_gateway")

    -- 配置网关监听
    local port = tonumber(skynet.getenv("port")) or 44445
    local max_client = tonumber(skynet.getenv("maxclient")) or 10000
    local host = skynet.getenv("host") or "0.0.0.0"

    skynet.error("配置游戏网关监听...")
    skynet.call(gateway, "lua", "start", {
        host = host,
        port = port,
        maxclient = max_client,
        nodelay = true,
    })

    skynet.error("游戏网关监听地址: " .. host .. ":" .. port)
    skynet.error("最大客户端连接数: " .. max_client)

    skynet.error("=== 心桥物语游戏服务器启动完成 ===")

    -- 主服务不退出，保持运行
    -- skynet.exit()
end)
