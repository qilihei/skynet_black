local skynet = require "skynet"
local socket = require "skynet.socket"

local gateway = {}
local connections = {}  -- 连接管理
local accountList = {
    ["hei"] = {
        password = "123456",
        serverId = "1001"
    }
}  -- 账号列表
-- 服务配置
local config = {
    port = 9999,
    max_connections = 1000,
    heartbeat_interval = 30,
    timeout = 60
}

local serverList = {
    ["1001"] = {
        ip = "127.0.0.1",
        port = 8888,
        status = 0
    }
}


-- 初始化网关服务
function gateway.init()
    skynet.error("Simple gateway service starting...")
end

-- 客户端连接处理
function gateway.onClientConnect(fd, addr)
    skynet.error("Client connected:", fd, addr)
    
    -- 检查连接数限制
    if #connections >= config.max_connections then
        skynet.error("Max connections reached, reject:", fd)
        socket.close(fd)
        return
    end
    
    -- 创建连接对象
    local conn = {
        fd = fd,
        addr = addr,
        connect_time = skynet.time(),
        last_heartbeat = skynet.time(),
        authenticated = false,
        user_id = nil,
        session_id = nil
    }
    
    connections[fd] = conn
    
    -- 启动消息处理协程
    skynet.fork(gateway.handleClientMessages, conn)
end

-- 客户端断开处理
function gateway.onClientDisconnect(conn)
    skynet.error("Client disconnected:", conn.fd, conn.addr)
    
    -- 清理连接
    connections[conn.fd] = nil
    socket.close(conn.fd)
end

-- 处理客户端消息
function gateway.handleClientMessages(conn)
    local fd = conn.fd

    -- 启动 socket
    socket.start(fd)

    while true do
        local data = socket.read(fd)
        if not data then
            gateway.onClientDisconnect(conn)
            break
        end

        skynet.error("Received data from fd", fd, ":", data)

        -- 按行分割数据
        for line in data:gmatch("([^\r\n]+)") do
            if line and line ~= "" then
                skynet.error("Processing line:", line)

                -- 简单的文本协议处理
                local success, result = pcall(gateway.parseSimpleMessage, line)
                if not success then
                    skynet.error("Parse message failed:", result)
                else
                    if result then
                        -- 处理消息
                        gateway.processMessage(conn, result)
                    end
                end
            end
        end
    end
end

-- 解析简单消息 (JSON格式)
function gateway.parseSimpleMessage(data)
    -- 简单的文本协议：每行一个命令
    local line = data:match("([^\r\n]+)")
    if not line then
        return nil
    end
    
    -- 解析命令格式：CMD:param1,param2,param3
    local cmd, params_str = line:match("([^:]+):?(.*)")
    if not cmd then
        return { cmd = line, params = {} }
    end
    
    local params = {}
    if params_str and params_str ~= "" then
        for param in params_str:gmatch("([^,]+)") do
            table.insert(params, param)
        end
    end
    
    return { cmd = cmd, params = params }
end

-- 处理消息
function gateway.processMessage(conn, msg)
    skynet.error("Process message:", msg.cmd, "from", conn.fd)
    
    if msg.cmd == "register" then
        gateway.handleRegister(conn, msg.params)
    elseif msg.cmd == "ping" then
        gateway.handlePing(conn, msg.params)
    elseif msg.cmd == "getServerList" then
        gateway.handleGetServerList(conn, msg.params)
    elseif msg.cmd == "login" then
        gateway.handleLogin(conn, msg.params)
    else
        gateway.sendResponse(conn, "ERROR", "Unknown command: " .. msg.cmd)
    end
end

-- 处理心跳
function gateway.handlePing(conn, params)
    conn.last_heartbeat = skynet.time()
    gateway.sendResponse(conn, "PONG", "")
end

-- 处理登录
function gateway.handleLogin(conn, params)
    local userId = params[1]
    local password = params[2]
    local serverId = params[3]
    local serverInfo = serverList[serverId]
    if not serverInfo then
        gateway.sendResponse(conn, "ERROR", "Server not found")
        return
    end
    if serverInfo.status ~= 0 then
        gateway.sendResponse(conn, "ERROR", "Server is not available")
        return
    end
    gateway.checkAccount(userId, password, serverId)
end

function gateway.checkAccount(conn, userId, password, serverId)
    local account = accountList[userId]
    if not account then
        gateway.sendResponse(conn, "ERROR", "Account not found")
        return
    end
    if account.password ~= password then
        gateway.sendResponse(conn, "ERROR", "Incorrect password")
        return
    end
    if account.serverId ~= serverId then
        gateway.sendResponse(conn, "ERROR", "Account is not on this server")
        return
    end
    gateway.sendResponse(conn, "OK", "Login success")
    -- 清理连接
    gateway.onClientDisconnect(conn)
end

-- 注册账号
function gateway.handleRegister(conn, params)
    local userId = params[1]
    local password = params[2]
    local serverId = params[3]
    if accountList[userId] then
        gateway.sendResponse(conn, "ERROR", "Account already exists")
        return
    end
    accountList[userId] = {
        password = password,
        serverId = serverId
    }
    gateway.sendResponse(conn, "OK", "Register success")
end

-- 获取服务器列表
function gateway.handleGetServerList(conn, params)
    local sendList = {}
    for serverId, serverInfo in pairs(serverList) do
        table.insert(sendList, {
            serverId = serverId,
            serverName = serverInfo.serverName,
            status = serverInfo.status
        })
    end
    gateway.sendResponse(conn, "OK", sendList)
end

-- 服务命令处理
local CMD = {}

function CMD.start(conf)
    config.port = conf.port or config.port
    config.max_connections = conf.maxclient or config.max_connections
    
    -- 启动监听
    local listen_fd = socket.listen("0.0.0.0", config.port)
    skynet.error("Gateway listening on port:", config.port)
    
    socket.start(listen_fd, gateway.onClientConnect)
    
    -- 启动心跳检测
    skynet.fork(gateway.heartbeatCheck)
    
    return true
end

function CMD.stop()
    -- 关闭所有连接
    for fd, conn in pairs(connections) do
        gateway.onClientDisconnect(conn)
    end
    return true
end

function CMD.status()
    return {
        port = config.port,
        connections = #connections,
        max_connections = config.max_connections
    }
end


-- 服务启动函数
-- 这是Skynet服务的标准启动入口点
skynet.start(function()
    -- 初始化网关服务
    -- 调用gateway.init()进行服务的基础初始化工作
    gateway.init()
    
    -- 注册Lua消息处理器
    -- skynet.dispatch用于注册服务的消息处理函数
    -- "lua"表示处理lua类型的消息协议
    skynet.dispatch("lua", function(session, address, cmd, ...)
        -- session: 消息会话ID，用于响应消息
        -- address: 发送方服务地址
        -- cmd: 命令名称（如"start", "stop", "status"等）
        -- ...: 命令参数
        
        -- 从CMD表中查找对应的命令处理函数
        local f = CMD[cmd]
        if f then
            -- 如果找到对应的处理函数，执行并返回结果
            -- skynet.ret用于向调用方返回响应
            -- skynet.pack用于打包返回值
            skynet.ret(skynet.pack(f(...)))
        else
            -- 如果命令不存在，记录错误并返回失败响应
            skynet.error("Unknown command:", cmd)
            skynet.ret(skynet.pack(false, "Unknown command"))
        end
    end)
end)