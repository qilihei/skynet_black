-- 心桥物语游戏服务器主入口文件

local skynet = require "skynet"

-- 启动函数
skynet.start(function()
    skynet.error("=== 心桥物语游戏服务器启动 ===")
    skynet.error("服务器版本: " .. (skynet.getenv("game_version") or "1.0.0"))
    skynet.error("服务器名称: " .. (skynet.getenv("game_name") or "HeartBridge"))
    
    -- 启动控制台服务 (开发模式)
    if not skynet.getenv("daemon") then
        skynet.error("启动控制台服务...")
        skynet.newservice("console")
    end
    
    -- 启动调试控制台
    local debug_port = tonumber(skynet.getenv("debug_port")) or 8001
    skynet.error("启动调试控制台，端口: " .. debug_port)
    skynet.newservice("debug_console", debug_port)
    
    -- 启动日志服务
    skynet.error("启动日志服务...")
    local log_service = skynet.uniqueservice("log")
    
    -- 启动游戏服务
    skynet.error("启动游戏服务...")
    local game_service1 = skynet.newservice("simple_game")
    local game_service2 = skynet.newservice("simple_game")
    local game_service3 = skynet.newservice("simple_game")
    local game_service4 = skynet.newservice("simple_game")

    -- 启动游戏网关服务
    skynet.error("启动游戏网关服务...")
    local gateway = skynet.newservice("simple_gateway")
    
    -- 配置网关监听
    local gate_port = tonumber(skynet.getenv("gate_port")) or 8889
    local max_client = tonumber(skynet.getenv("max_client")) or 10000
    
    skynet.error("配置游戏网关监听...")
    skynet.call(gateway, "lua", "start", {
        port = gate_port,
        maxclient = max_client,
        nodelay = true,
    })
    
    skynet.error("游戏网关监听端口: " .. gate_port)
    skynet.error("最大客户端连接数: " .. max_client)
    
    skynet.error("=== 心桥物语游戏服务器启动完成 ===")
    
    -- 主服务不退出，保持运行
    -- skynet.exit()
end)
