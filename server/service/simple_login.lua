-- 简化的登录服务
-- 用于测试基本功能，不依赖外部库

local skynet = require "skynet"

local login = {}

-- 服务配置
local config = {
    session_timeout = 7200,  -- 会话超时时间(秒)
    max_login_attempts = 5,  -- 最大登录尝试次数
    login_cooldown = 300     -- 登录冷却时间(秒)
}

-- 内存中的用户数据（仅用于测试）
local users = {
    ["test"] = {
        username = "test",
        password = "123456",
        user_id = 1001
    },
    ["admin"] = {
        username = "admin", 
        password = "admin123",
        user_id = 1002
    }
}

-- 当前在线用户会话
local sessions = {}

-- 登录尝试记录
local login_attempts = {}

-- 初始化服务
function login.init()
    skynet.error("Simple login service started")
end

-- 用户登录
function login.user_login(username, password)
    skynet.error("Login attempt:", username)
    
    -- 检查用户是否存在
    local user = users[username]
    if not user then
        skynet.error("User not found:", username)
        return false, "用户不存在"
    end
    
    -- 验证密码
    if user.password ~= password then
        skynet.error("Password incorrect for user:", username)
        return false, "密码错误"
    end
    
    -- 生成会话ID
    local session_id = "session_" .. user.user_id .. "_" .. skynet.time()
    
    -- 保存会话
    sessions[session_id] = {
        user_id = user.user_id,
        username = username,
        login_time = skynet.time()
    }
    
    skynet.error("User login success:", username, "session:", session_id)
    
    return true, {
        session_id = session_id,
        user_id = user.user_id,
        username = username
    }
end

-- 验证会话
function login.verify_session(session_id)
    local session = sessions[session_id]
    if not session then
        return false, "会话不存在"
    end
    
    -- 检查会话是否过期
    if skynet.time() - session.login_time > config.session_timeout then
        sessions[session_id] = nil
        return false, "会话已过期"
    end
    
    return true, session
end

-- 用户登出
function login.user_logout(session_id)
    if sessions[session_id] then
        local username = sessions[session_id].username
        sessions[session_id] = nil
        skynet.error("User logout:", username)
        return true
    end
    return false
end

-- 获取在线用户数量
function login.get_online_count()
    local count = 0
    for _ in pairs(sessions) do
        count = count + 1
    end
    return count
end

-- 服务命令处理
local CMD = {}

function CMD.login(username, password)
    return login.user_login(username, password)
end

function CMD.verify(session_id)
    return login.verify_session(session_id)
end

function CMD.logout(session_id)
    return login.user_logout(session_id)
end

function CMD.online_count()
    return login.get_online_count()
end

function CMD.ping()
    return "pong"
end

-- 服务启动
skynet.start(function()
    login.init()
    
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
