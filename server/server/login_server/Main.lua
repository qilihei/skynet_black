-- 登录服入口文件
local skynet = require "skynet"
require "skynet.manager"

skynet.start(
    function()
        local selfNodeName = skynet.getenv("clusternode") .. skynet.getenv("serverid")
        skynet.error("=== 心桥物语登录服务器启动 ===")
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

        --init game gate
        skynet.error("启动游戏网关...")
        local loginGate = skynet.uniqueservice("LoginGate")
        
        -- 配置网关监听
        local port = tonumber(skynet.getenv("port"))
        local max_client = tonumber(skynet.getenv("maxclient"))
        local host = skynet.getenv("host")
        
        skynet.call(loginGate, "lua", "start", {
            host = host,
            port = port,
            maxclient = max_client,
            nodelay = true,
        })
        
        skynet.error("游戏网关监听地址: " .. host .. ":" .. port)
        skynet.error("最大客户端连接数: " .. max_client)

        -- log ok
        skynet.error("=== 心桥物语登录服务器启动完成 ===")
    end
)