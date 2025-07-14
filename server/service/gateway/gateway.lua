-- 网关服务
-- 负责处理客户端连接、协议解析和消息路由

local skynet = require "skynet"
local socket = require "skynet.socket"
local pb = require "pb"
local protocol = require "protocol"

local gateway = {}
local connections = {}  -- 连接管理
local services = {}     -- 服务发现

-- 服务配置
local config = {
    port = 8888,
    max_connections = 10000,
    heartbeat_interval = 30,
    timeout = 60
}

-- 初始化网关服务
function gateway.init()
    skynet.error("Gateway service starting...")
    
    -- 加载协议定义
    protocol.load_proto()
    
    -- 注册服务发现
    gateway.register_services()
    
    -- 启动监听
    local listen_fd = socket.listen("0.0.0.0", config.port)
    skynet.error("Gateway listening on port:", config.port)
    
    socket.start(listen_fd, function(fd, addr)
        gateway.on_client_connect(fd, addr)
    end)
    
    -- 启动心跳检测
    skynet.fork(gateway.heartbeat_check)
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
        user_id = nil,
        last_heartbeat = skynet.time(),
        authenticated = false,
        session = nil
    }
    
    connections[fd] = conn
    
    -- 启动消息处理协程
    skynet.fork(function()
        gateway.handle_client_messages(conn)
    end)
end

-- 处理客户端消息
function gateway.handle_client_messages(conn)
    local fd = conn.fd
    
    while true do
        ::continue::
        local data = socket.read(fd)
        if not data then
            gateway.on_client_disconnect(conn)
            break
        end

        -- 解析协议
        local success, msg = pcall(gateway.parse_message, data)
        if not success then
            skynet.error("Parse message failed:", msg)
            goto continue
        end

        -- 处理消息
        gateway.process_message(conn, msg)
    end
end

-- 解析消息
function gateway.parse_message(data)
    -- 消息格式: [length:4][msg_id:2][data:length-2]
    if #data < 6 then
        error("Invalid message length")
    end
    
    local length = string.unpack("<I4", data, 1)
    local msg_id = string.unpack("<I2", data, 5)
    local msg_data = data:sub(7, 4 + length)
    
    return {
        id = msg_id,
        data = msg_data,
        length = length
    }
end

-- 处理消息
function gateway.process_message(conn, msg)
    -- 更新心跳时间
    conn.last_heartbeat = skynet.time()
    
    -- 根据消息ID路由到对应服务
    local service_name = protocol.get_service_by_msg_id(msg.id)
    if not service_name then
        skynet.error("Unknown message id:", msg.id)
        return
    end
    
    -- 检查认证状态
    if not conn.authenticated and service_name ~= "login" then
        gateway.send_error(conn, "Not authenticated")
        return
    end
    
    -- 转发消息到业务服务
    local service_addr = services[service_name]
    if not service_addr then
        skynet.error("Service not found:", service_name)
        gateway.send_error(conn, "Service unavailable")
        return
    end
    
    -- 构造请求
    local request = {
        conn_id = conn.fd,
        user_id = conn.user_id,
        msg_id = msg.id,
        data = msg.data
    }
    
    -- 发送到业务服务
    skynet.send(service_addr, "lua", "process_message", request)
end

-- 发送消息到客户端
function gateway.send_to_client(conn_id, msg_id, data)
    local conn = connections[conn_id]
    if not conn then
        return false
    end
    
    -- 打包消息
    local msg_data = data or ""
    local length = #msg_data + 2
    local packet = string.pack("<I4<I2", length, msg_id) .. msg_data
    
    return socket.write(conn.fd, packet)
end

-- 发送错误消息
function gateway.send_error(conn, error_msg)
    local error_data = pb.encode("ErrorResponse", {
        code = 1,
        message = error_msg
    })
    gateway.send_to_client(conn.fd, protocol.MSG_ERROR, error_data)
end

-- 客户端断开处理
function gateway.on_client_disconnect(conn)
    skynet.error("Client disconnected:", conn.fd, conn.addr)
    
    -- 通知业务服务用户下线
    if conn.authenticated and conn.user_id then
        local game_service = services["game"]
        if game_service then
            skynet.send(game_service, "lua", "user_offline", conn.user_id)
        end
    end
    
    -- 清理连接
    socket.close(conn.fd)
    connections[conn.fd] = nil
end

-- 心跳检测
function gateway.heartbeat_check()
    while true do
        skynet.sleep(config.heartbeat_interval * 100)  -- skynet时间单位是0.01秒
        
        local current_time = skynet.time()
        local timeout_conns = {}
        
        for fd, conn in pairs(connections) do
            if current_time - conn.last_heartbeat > config.timeout then
                table.insert(timeout_conns, conn)
            end
        end
        
        -- 清理超时连接
        for _, conn in ipairs(timeout_conns) do
            skynet.error("Connection timeout:", conn.fd)
            gateway.on_client_disconnect(conn)
        end
    end
end

-- 注册服务发现
function gateway.register_services()
    services["login"] = skynet.queryservice("login")
    services["game"] = skynet.queryservice("game") 
    services["database"] = skynet.queryservice("database")
end

-- 设置用户认证状态
function gateway.set_user_authenticated(conn_id, user_id, session)
    local conn = connections[conn_id]
    if conn then
        conn.authenticated = true
        conn.user_id = user_id
        conn.session = session
        return true
    end
    return false
end

-- 获取连接信息
function gateway.get_connection(conn_id)
    return connections[conn_id]
end

-- 获取在线用户数
function gateway.get_online_count()
    local count = 0
    for _, conn in pairs(connections) do
        if conn.authenticated then
            count = count + 1
        end
    end
    return count
end

-- 消息处理接口
local CMD = {}

-- 发送消息到客户端
function CMD.send_to_client(source, conn_id, msg_id, data)
    return gateway.send_to_client(conn_id, msg_id, data)
end

-- 设置用户认证
function CMD.set_authenticated(source, conn_id, user_id, session)
    return gateway.set_user_authenticated(conn_id, user_id, session)
end

-- 获取在线数量
function CMD.get_online_count(source)
    return gateway.get_online_count()
end

-- 踢出用户
function CMD.kick_user(source, user_id)
    for fd, conn in pairs(connections) do
        if conn.user_id == user_id then
            gateway.on_client_disconnect(conn)
            return true
        end
    end
    return false
end

-- 服务消息分发
skynet.start(function()
    skynet.dispatch("lua", function(session, source, cmd, ...)
        local f = CMD[cmd]
        if f then
            skynet.ret(skynet.pack(f(source, ...)))
        else
            skynet.error("Unknown command:", cmd)
        end
    end)
    
    gateway.init()
end)

return gateway
