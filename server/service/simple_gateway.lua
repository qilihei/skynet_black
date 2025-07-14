-- 简化的网关服务
-- 用于测试基本功能，不依赖外部库

local skynet = require "skynet"
local socket = require "skynet.socket"

local gateway = {}
local connections = {}  -- 连接管理

-- 服务配置
local config = {
    port = 8888,
    max_connections = 1000,
    heartbeat_interval = 30,
    timeout = 60
}

-- 初始化网关服务
function gateway.init()
    skynet.error("Simple gateway service starting...")
end

-- 客户端连接处理
function gateway.on_client_connect(fd, addr)
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
    skynet.fork(gateway.handle_client_messages, conn)
end

-- 客户端断开处理
function gateway.on_client_disconnect(conn)
    skynet.error("Client disconnected:", conn.fd, conn.addr)
    
    -- 清理连接
    connections[conn.fd] = nil
    socket.close(conn.fd)
end

-- 处理客户端消息
function gateway.handle_client_messages(conn)
    local fd = conn.fd

    -- 启动 socket
    socket.start(fd)

    while true do
        local data = socket.read(fd)
        if not data then
            gateway.on_client_disconnect(conn)
            break
        end

        skynet.error("Received data from fd", fd, ":", data)

        -- 按行分割数据
        for line in data:gmatch("([^\r\n]+)") do
            if line and line ~= "" then
                skynet.error("Processing line:", line)

                -- 简单的文本协议处理
                local success, result = pcall(gateway.parse_simple_message, line)
                if not success then
                    skynet.error("Parse message failed:", result)
                else
                    if result then
                        -- 处理消息
                        gateway.process_message(conn, result)
                    end
                end
            end
        end
    end
end

-- 解析简单消息 (JSON格式)
function gateway.parse_simple_message(data)
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
function gateway.process_message(conn, msg)
    skynet.error("Process message:", msg.cmd, "from", conn.fd)
    
    if msg.cmd == "LOGIN" then
        gateway.handle_login(conn, msg.params)
    elseif msg.cmd == "PING" then
        gateway.handle_ping(conn, msg.params)
    elseif msg.cmd == "LOGOUT" then
        gateway.handle_logout(conn, msg.params)
    else
        gateway.send_response(conn, "ERROR", "Unknown command: " .. msg.cmd)
    end
end

-- 处理登录
function gateway.handle_login(conn, params)
    if #params < 2 then
        gateway.send_response(conn, "ERROR", "Invalid login parameters")
        return
    end
    
    local username = params[1]
    local password = params[2]
    
    -- 调用登录服务
    local login_service = skynet.uniqueservice("simple_login")
    local success, result = skynet.call(login_service, "lua", "login", username, password)
    
    if success then
        conn.authenticated = true
        conn.user_id = result.user_id
        conn.session_id = result.session_id
        gateway.send_response(conn, "LOGIN_SUCCESS", result.session_id)
        skynet.error("User login success:", username, "fd:", conn.fd)
    else
        gateway.send_response(conn, "LOGIN_FAILED", result)
        skynet.error("User login failed:", username, result)
    end
end

-- 处理心跳
function gateway.handle_ping(conn, params)
    conn.last_heartbeat = skynet.time()
    gateway.send_response(conn, "PONG", "")
end

-- 处理登出
function gateway.handle_logout(conn, params)
    if conn.session_id then
        local login_service = skynet.uniqueservice("simple_login")
        skynet.call(login_service, "lua", "logout", conn.session_id)
    end
    
    conn.authenticated = false
    conn.user_id = nil
    conn.session_id = nil
    gateway.send_response(conn, "LOGOUT_SUCCESS", "")
end

-- 发送响应
function gateway.send_response(conn, status, message)
    local response = status .. ":" .. tostring(message) .. "\n"
    socket.write(conn.fd, response)
end

-- 心跳检测
function gateway.heartbeat_check()
    while true do
        skynet.sleep(config.heartbeat_interval * 100)  -- skynet.sleep 单位是 1/100 秒
        
        local current_time = skynet.time()
        local timeout_connections = {}
        
        for fd, conn in pairs(connections) do
            if current_time - conn.last_heartbeat > config.timeout then
                table.insert(timeout_connections, conn)
            end
        end
        
        for _, conn in ipairs(timeout_connections) do
            skynet.error("Connection timeout:", conn.fd, conn.addr)
            gateway.on_client_disconnect(conn)
        end
    end
end

-- 服务命令处理
local CMD = {}

function CMD.start(conf)
    config.port = conf.port or config.port
    config.max_connections = conf.maxclient or config.max_connections
    
    -- 启动监听
    local listen_fd = socket.listen("0.0.0.0", config.port)
    skynet.error("Gateway listening on port:", config.port)
    
    socket.start(listen_fd, gateway.on_client_connect)
    
    -- 启动心跳检测
    skynet.fork(gateway.heartbeat_check)
    
    return true
end

function CMD.stop()
    -- 关闭所有连接
    for fd, conn in pairs(connections) do
        gateway.on_client_disconnect(conn)
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

-- 服务启动
skynet.start(function()
    gateway.init()
    
    skynet.dispatch("lua", function(session, address, cmd, ...)
        local f = CMD[cmd]
        if f then
            skynet.ret(skynet.pack(f(...)))
        else
            skynet.error("Unknown command:", cmd)
            skynet.ret(skynet.pack(false, "Unknown command"))
        end
    end)
end)
