-- 登录服务
-- 负责用户认证、会话管理和账号相关操作

local skynet = require "skynet"
local pb = require "pb"
local protocol = require "protocol"
local mysql = require "mysql"
local redis = require "redis"
local utils = require "utils"

local login = {}
local db_service = nil
local gateway_service = nil

-- 服务配置
local config = {
    session_timeout = 7200,  -- 会话超时时间(秒)
    max_login_attempts = 5,  -- 最大登录尝试次数
    login_cooldown = 300     -- 登录冷却时间(秒)
}

-- 初始化登录服务
function login.init()
    skynet.error("Login service starting...")
    
    -- 获取依赖服务
    db_service = skynet.queryservice("database")
    gateway_service = skynet.queryservice("gateway")
    
    skynet.error("Login service started")
end

-- 处理登录请求
function login.handle_login(request)
    local conn_id = request.conn_id
    local data = request.data
    
    -- 解析登录数据
    local login_req = pb.decode("LoginRequest", data)
    if not login_req then
        return login.send_login_response(conn_id, false, "Invalid login data")
    end
    
    local username = login_req.username
    local password = login_req.password
    local device_id = login_req.device_id or ""
    
    -- 参数验证
    if not username or not password then
        return login.send_login_response(conn_id, false, "Username and password required")
    end
    
    if #username < 3 or #username > 20 then
        return login.send_login_response(conn_id, false, "Invalid username length")
    end
    
    if #password < 6 or #password > 32 then
        return login.send_login_response(conn_id, false, "Invalid password length")
    end
    
    -- 检查登录频率限制
    local login_key = "login_attempts:" .. username
    local attempts = skynet.call(db_service, "lua", "redis_get", login_key) or 0
    attempts = tonumber(attempts) or 0
    
    if attempts >= config.max_login_attempts then
        return login.send_login_response(conn_id, false, "Too many login attempts, please try later")
    end
    
    -- 查询用户信息
    local user_info = skynet.call(db_service, "lua", "get_user_by_username", username)
    if not user_info then
        -- 记录失败尝试
        skynet.call(db_service, "lua", "redis_incr", login_key)
        skynet.call(db_service, "lua", "redis_expire", login_key, config.login_cooldown)
        return login.send_login_response(conn_id, false, "Invalid username or password")
    end
    
    -- 验证密码
    local password_hash = utils.hash_password(password, user_info.salt)
    if password_hash ~= user_info.password_hash then
        -- 记录失败尝试
        skynet.call(db_service, "lua", "redis_incr", login_key)
        skynet.call(db_service, "lua", "redis_expire", login_key, config.login_cooldown)
        return login.send_login_response(conn_id, false, "Invalid username or password")
    end
    
    -- 检查账号状态
    if user_info.status ~= 1 then
        return login.send_login_response(conn_id, false, "Account is disabled")
    end
    
    -- 检查是否已在线
    local session_key = "session:" .. user_info.user_id
    local existing_session = skynet.call(db_service, "lua", "redis_get", session_key)
    if existing_session then
        -- 踢出已有连接
        skynet.call(gateway_service, "lua", "kick_user", user_info.user_id)
    end
    
    -- 创建会话
    local session_id = utils.generate_session_id()
    local session_data = {
        user_id = user_info.user_id,
        username = username,
        login_time = skynet.time(),
        device_id = device_id,
        ip = "unknown"  -- TODO: 从连接获取真实IP
    }
    
    -- 保存会话到Redis
    skynet.call(db_service, "lua", "redis_setex", session_key, config.session_timeout, utils.encode_json(session_data))
    
    -- 更新用户登录信息
    skynet.call(db_service, "lua", "update_user_login", user_info.user_id, skynet.time(), device_id)
    
    -- 设置网关认证状态
    skynet.call(gateway_service, "lua", "set_authenticated", conn_id, user_info.user_id, session_id)
    
    -- 清除登录失败记录
    skynet.call(db_service, "lua", "redis_del", login_key)
    
    -- 发送登录成功响应
    login.send_login_response(conn_id, true, "Login successful", {
        user_id = user_info.user_id,
        username = username,
        session_id = session_id,
        level = user_info.level,
        exp = user_info.exp,
        coins = user_info.coins,
        gems = user_info.gems
    })
    
    skynet.error("User login successful:", username, user_info.user_id)
end

-- 发送登录响应
function login.send_login_response(conn_id, success, message, user_data)
    local response = {
        success = success,
        message = message
    }
    
    if success and user_data then
        response.user_data = user_data
    end
    
    local response_data = pb.encode("LoginResponse", response)
    skynet.call(gateway_service, "lua", "send_to_client", conn_id, protocol.MSG_LOGIN_RESPONSE, response_data)
end

-- 处理注册请求
function login.handle_register(request)
    local conn_id = request.conn_id
    local data = request.data
    
    -- 解析注册数据
    local register_req = pb.decode("RegisterRequest", data)
    if not register_req then
        return login.send_register_response(conn_id, false, "Invalid register data")
    end
    
    local username = register_req.username
    local password = register_req.password
    local email = register_req.email or ""
    
    -- 参数验证
    if not username or not password then
        return login.send_register_response(conn_id, false, "Username and password required")
    end
    
    if #username < 3 or #username > 20 then
        return login.send_register_response(conn_id, false, "Username length must be 3-20 characters")
    end
    
    if #password < 6 or #password > 32 then
        return login.send_register_response(conn_id, false, "Password length must be 6-32 characters")
    end
    
    -- 检查用户名格式
    if not utils.is_valid_username(username) then
        return login.send_register_response(conn_id, false, "Invalid username format")
    end
    
    -- 检查用户名是否已存在
    local existing_user = skynet.call(db_service, "lua", "get_user_by_username", username)
    if existing_user then
        return login.send_register_response(conn_id, false, "Username already exists")
    end
    
    -- 创建新用户
    local salt = utils.generate_salt()
    local password_hash = utils.hash_password(password, salt)
    
    local user_data = {
        username = username,
        password_hash = password_hash,
        salt = salt,
        email = email,
        create_time = skynet.time(),
        status = 1,
        level = 1,
        exp = 0,
        coins = 1000,  -- 初始金币
        gems = 0       -- 初始宝石
    }
    
    local user_id = skynet.call(db_service, "lua", "create_user", user_data)
    if not user_id then
        return login.send_register_response(conn_id, false, "Failed to create user")
    end
    
    -- 初始化用户游戏数据
    skynet.call(db_service, "lua", "init_user_game_data", user_id)
    
    login.send_register_response(conn_id, true, "Register successful")
    
    skynet.error("User register successful:", username, user_id)
end

-- 发送注册响应
function login.send_register_response(conn_id, success, message)
    local response = {
        success = success,
        message = message
    }
    
    local response_data = pb.encode("RegisterResponse", response)
    skynet.call(gateway_service, "lua", "send_to_client", conn_id, protocol.MSG_REGISTER_RESPONSE, response_data)
end

-- 处理登出请求
function login.handle_logout(request)
    local user_id = request.user_id
    
    if user_id then
        -- 清除会话
        local session_key = "session:" .. user_id
        skynet.call(db_service, "lua", "redis_del", session_key)
        
        -- 踢出用户
        skynet.call(gateway_service, "lua", "kick_user", user_id)
        
        skynet.error("User logout:", user_id)
    end
end

-- 验证会话
function login.verify_session(user_id, session_id)
    local session_key = "session:" .. user_id
    local session_data = skynet.call(db_service, "lua", "redis_get", session_key)
    
    if not session_data then
        return false
    end
    
    local session = utils.decode_json(session_data)
    return session and session.session_id == session_id
end

-- 消息处理接口
local CMD = {}

-- 处理消息
function CMD.process_message(source, request)
    local msg_id = request.msg_id
    
    if msg_id == protocol.MSG_LOGIN_REQUEST then
        login.handle_login(request)
    elseif msg_id == protocol.MSG_REGISTER_REQUEST then
        login.handle_register(request)
    elseif msg_id == protocol.MSG_LOGOUT_REQUEST then
        login.handle_logout(request)
    else
        skynet.error("Unknown message id in login service:", msg_id)
    end
end

-- 验证会话
function CMD.verify_session(source, user_id, session_id)
    return login.verify_session(user_id, session_id)
end

-- 服务启动
skynet.start(function()
    skynet.dispatch("lua", function(session, source, cmd, ...)
        local f = CMD[cmd]
        if f then
            skynet.ret(skynet.pack(f(source, ...)))
        else
            skynet.error("Unknown command:", cmd)
        end
    end)
    
    login.init()
end)

return login
