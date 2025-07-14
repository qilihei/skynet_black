-- 游戏主服务
-- 负责协调各业务模块，处理游戏核心逻辑

local skynet = require "skynet"
local pb = require "pb"
local protocol = require "protocol"

local game = {}
local db_service = nil
local gateway_service = nil
local online_users = {}  -- 在线用户管理

-- 业务模块管理
local modules = {}

-- 初始化游戏服务
function game.init()
    skynet.error("Game service starting...")
    
    -- 获取依赖服务
    db_service = skynet.queryservice("database")
    gateway_service = skynet.queryservice("gateway")
    
    -- 加载业务模块
    game.load_modules()
    
    skynet.error("Game service started")
end

-- 加载业务模块
function game.load_modules()
    -- 加载各个业务模块
    modules.player = require "mod.player.player"
    modules.farm = require "mod.farm.farm"
    modules.inventory = require "mod.inventory.inventory"
    modules.shop = require "mod.shop.shop"
    modules.friend = require "mod.friend.friend"
    modules.quest = require "mod.quest.quest"
    modules.chat = require "mod.chat.chat"
    
    -- 初始化模块
    for name, module in pairs(modules) do
        if module.init then
            module.init(db_service, gateway_service)
            skynet.error("Module loaded:", name)
        end
    end
end

-- 处理消息
function game.process_message(request)
    local conn_id = request.conn_id
    local user_id = request.user_id
    local msg_id = request.msg_id
    local data = request.data
    
    -- 验证用户是否在线
    if not online_users[user_id] then
        game.user_online(user_id, conn_id)
    end
    
    -- 更新用户活跃时间
    online_users[user_id].last_active = skynet.time()
    
    -- 根据消息ID分发到对应模块
    local module_name = protocol.get_module_by_msg_id(msg_id)
    if not module_name then
        skynet.error("Unknown message id:", msg_id)
        return
    end
    
    local module = modules[module_name]
    if not module then
        skynet.error("Module not found:", module_name)
        return
    end
    
    -- 调用模块处理函数
    if module.process_message then
        module.process_message(request)
    else
        skynet.error("Module has no process_message function:", module_name)
    end
end

-- 用户上线
function game.user_online(user_id, conn_id)
    skynet.error("User online:", user_id)
    
    -- 加载用户数据
    local user_data = skynet.call(db_service, "lua", "get_user_by_id", user_id)
    if not user_data then
        skynet.error("Failed to load user data:", user_id)
        return
    end
    
    -- 创建用户会话
    online_users[user_id] = {
        conn_id = conn_id,
        user_data = user_data,
        login_time = skynet.time(),
        last_active = skynet.time(),
        modules_data = {}
    }
    
    -- 通知各模块用户上线
    for name, module in pairs(modules) do
        if module.on_user_online then
            module.on_user_online(user_id, user_data)
        end
    end
    
    -- 发送用户数据到客户端
    game.send_user_data(user_id)
end

-- 用户下线
function game.user_offline(user_id)
    skynet.error("User offline:", user_id)
    
    local user_session = online_users[user_id]
    if not user_session then
        return
    end
    
    -- 通知各模块用户下线
    for name, module in pairs(modules) do
        if module.on_user_offline then
            module.on_user_offline(user_id)
        end
    end
    
    -- 保存用户数据
    game.save_user_data(user_id)
    
    -- 清除用户会话
    online_users[user_id] = nil
end

-- 发送用户数据
function game.send_user_data(user_id)
    local user_session = online_users[user_id]
    if not user_session then
        return
    end
    
    local user_data = user_session.user_data
    local response = {
        user_id = user_data.user_id,
        username = user_data.username,
        level = user_data.level,
        exp = user_data.exp,
        coins = user_data.coins,
        gems = user_data.gems
    }
    
    local response_data = pb.encode("UserDataResponse", response)
    skynet.call(gateway_service, "lua", "send_to_client", user_session.conn_id, protocol.MSG_USER_DATA, response_data)
end

-- 保存用户数据
function game.save_user_data(user_id)
    local user_session = online_users[user_id]
    if not user_session then
        return
    end
    
    -- 这里可以实现定期保存或立即保存用户数据的逻辑
    -- 目前各模块会自己处理数据保存
end

-- 获取在线用户
function game.get_online_user(user_id)
    return online_users[user_id]
end

-- 获取在线用户数量
function game.get_online_count()
    local count = 0
    for _ in pairs(online_users) do
        count = count + 1
    end
    return count
end

-- 广播消息给所有在线用户
function game.broadcast_message(msg_id, data)
    for user_id, user_session in pairs(online_users) do
        skynet.call(gateway_service, "lua", "send_to_client", user_session.conn_id, msg_id, data)
    end
end

-- 发送消息给指定用户
function game.send_to_user(user_id, msg_id, data)
    local user_session = online_users[user_id]
    if user_session then
        skynet.call(gateway_service, "lua", "send_to_client", user_session.conn_id, msg_id, data)
        return true
    end
    return false
end

-- 定时任务：清理不活跃用户
function game.cleanup_inactive_users()
    while true do
        skynet.sleep(6000)  -- 60秒检查一次
        
        local current_time = skynet.time()
        local inactive_users = {}
        
        for user_id, user_session in pairs(online_users) do
            if current_time - user_session.last_active > 300 then  -- 5分钟无活动
                table.insert(inactive_users, user_id)
            end
        end
        
        for _, user_id in ipairs(inactive_users) do
            skynet.error("Cleanup inactive user:", user_id)
            game.user_offline(user_id)
            skynet.call(gateway_service, "lua", "kick_user", user_id)
        end
    end
end

-- 消息处理接口
local CMD = {}

-- 处理消息
function CMD.process_message(source, request)
    game.process_message(request)
end

-- 用户下线
function CMD.user_offline(source, user_id)
    game.user_offline(user_id)
end

-- 获取在线用户
function CMD.get_online_user(source, user_id)
    return game.get_online_user(user_id)
end

-- 获取在线数量
function CMD.get_online_count(source)
    return game.get_online_count()
end

-- 发送消息给用户
function CMD.send_to_user(source, user_id, msg_id, data)
    return game.send_to_user(user_id, msg_id, data)
end

-- 广播消息
function CMD.broadcast_message(source, msg_id, data)
    game.broadcast_message(msg_id, data)
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
    
    game.init()
    
    -- 启动定时任务
    skynet.fork(game.cleanup_inactive_users)
end)

return game
