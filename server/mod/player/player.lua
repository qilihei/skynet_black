-- 玩家模块
-- 负责玩家基础信息管理、等级、经验、货币等

local skynet = require "skynet"
local pb = require "pb"
local protocol = require "protocol"

local player = {}
local db_service = nil
local gateway_service = nil

-- 等级配置
local level_config = {
    [1] = {level = 1, exp_required = 0, max_energy = 100},
    [2] = {level = 2, exp_required = 100, max_energy = 110},
    [3] = {level = 3, exp_required = 250, max_energy = 120},
    [4] = {level = 4, exp_required = 450, max_energy = 130},
    [5] = {level = 5, exp_required = 700, max_energy = 140},
    [6] = {level = 6, exp_required = 1000, max_energy = 150},
    [7] = {level = 7, exp_required = 1350, max_energy = 160},
    [8] = {level = 8, exp_required = 1750, max_energy = 170},
    [9] = {level = 9, exp_required = 2200, max_energy = 180},
    [10] = {level = 10, exp_required = 2700, max_energy = 200}
}

-- 初始化玩家模块
function player.init(db, gateway)
    db_service = db
    gateway_service = gateway
    skynet.error("Player module initialized")
end

-- 用户上线处理
function player.on_user_online(user_id, user_data)
    -- 恢复体力值
    player.restore_energy(user_id)
    
    -- 发送玩家详细信息
    player.send_player_info(user_id)
end

-- 用户下线处理
function player.on_user_offline(user_id)
    -- 保存玩家数据
    player.save_player_data(user_id)
end

-- 处理消息
function player.process_message(request)
    local user_id = request.user_id
    local msg_id = request.msg_id
    local data = request.data
    
    if msg_id == protocol.MSG_GET_PLAYER_INFO then
        player.handle_get_player_info(request)
    elseif msg_id == protocol.MSG_CHANGE_NICKNAME then
        player.handle_change_nickname(request)
    elseif msg_id == protocol.MSG_CHANGE_AVATAR then
        player.handle_change_avatar(request)
    elseif msg_id == protocol.MSG_BUY_ENERGY then
        player.handle_buy_energy(request)
    else
        skynet.error("Unknown player message:", msg_id)
    end
end

-- 获取玩家信息
function player.handle_get_player_info(request)
    local user_id = request.user_id
    local conn_id = request.conn_id
    
    local user_data = skynet.call(db_service, "lua", "get_user_by_id", user_id)
    if not user_data then
        return player.send_error(conn_id, "User not found")
    end
    
    -- 获取扩展信息
    local player_info = skynet.call(db_service, "lua", "get_player_info", user_id)
    if not player_info then
        -- 创建默认玩家信息
        player_info = player.create_default_player_info(user_id)
    end
    
    -- 计算当前等级信息
    local level_info = player.calculate_level_info(user_data.exp)
    
    -- 构造响应
    local response = {
        user_id = user_data.user_id,
        username = user_data.username,
        nickname = player_info.nickname or user_data.username,
        avatar = player_info.avatar or 1,
        level = level_info.level,
        exp = user_data.exp,
        exp_to_next = level_info.exp_to_next,
        coins = user_data.coins,
        gems = user_data.gems,
        energy = player_info.energy or 100,
        max_energy = level_info.max_energy,
        last_energy_time = player_info.last_energy_time or skynet.time(),
        create_time = user_data.create_time,
        last_login_time = user_data.last_login_time or 0
    }
    
    local response_data = pb.encode("PlayerInfoResponse", response)
    skynet.call(gateway_service, "lua", "send_to_client", conn_id, protocol.MSG_PLAYER_INFO_RESPONSE, response_data)
end

-- 修改昵称
function player.handle_change_nickname(request)
    local user_id = request.user_id
    local conn_id = request.conn_id
    local data = request.data
    
    local nickname_req = pb.decode("ChangeNicknameRequest", data)
    if not nickname_req then
        return player.send_error(conn_id, "Invalid nickname request")
    end
    
    local new_nickname = nickname_req.nickname
    
    -- 验证昵称
    if not new_nickname or #new_nickname < 2 or #new_nickname > 12 then
        return player.send_error(conn_id, "Nickname length must be 2-12 characters")
    end
    
    -- 检查昵称是否包含非法字符
    if not player.is_valid_nickname(new_nickname) then
        return player.send_error(conn_id, "Invalid nickname format")
    end
    
    -- 检查昵称是否已被使用
    local existing = skynet.call(db_service, "lua", "check_nickname_exists", new_nickname)
    if existing then
        return player.send_error(conn_id, "Nickname already exists")
    end
    
    -- 更新昵称
    local success = skynet.call(db_service, "lua", "update_player_nickname", user_id, new_nickname)
    if not success then
        return player.send_error(conn_id, "Failed to update nickname")
    end
    
    -- 发送成功响应
    local response = {
        success = true,
        nickname = new_nickname
    }
    
    local response_data = pb.encode("ChangeNicknameResponse", response)
    skynet.call(gateway_service, "lua", "send_to_client", conn_id, protocol.MSG_CHANGE_NICKNAME_RESPONSE, response_data)
    
    skynet.error("User changed nickname:", user_id, new_nickname)
end

-- 修改头像
function player.handle_change_avatar(request)
    local user_id = request.user_id
    local conn_id = request.conn_id
    local data = request.data
    
    local avatar_req = pb.decode("ChangeAvatarRequest", data)
    if not avatar_req then
        return player.send_error(conn_id, "Invalid avatar request")
    end
    
    local avatar_id = avatar_req.avatar_id
    
    -- 验证头像ID
    if not avatar_id or avatar_id < 1 or avatar_id > 20 then
        return player.send_error(conn_id, "Invalid avatar id")
    end
    
    -- 更新头像
    local success = skynet.call(db_service, "lua", "update_player_avatar", user_id, avatar_id)
    if not success then
        return player.send_error(conn_id, "Failed to update avatar")
    end
    
    -- 发送成功响应
    local response = {
        success = true,
        avatar_id = avatar_id
    }
    
    local response_data = pb.encode("ChangeAvatarResponse", response)
    skynet.call(gateway_service, "lua", "send_to_client", conn_id, protocol.MSG_CHANGE_AVATAR_RESPONSE, response_data)
    
    skynet.error("User changed avatar:", user_id, avatar_id)
end

-- 购买体力
function player.handle_buy_energy(request)
    local user_id = request.user_id
    local conn_id = request.conn_id
    
    -- 检查宝石数量
    local user_data = skynet.call(db_service, "lua", "get_user_by_id", user_id)
    if not user_data or user_data.gems < 10 then
        return player.send_error(conn_id, "Not enough gems")
    end
    
    -- 扣除宝石
    local success = skynet.call(db_service, "lua", "update_user_gems", user_id, user_data.gems - 10)
    if not success then
        return player.send_error(conn_id, "Failed to consume gems")
    end
    
    -- 恢复体力
    local level_info = player.calculate_level_info(user_data.exp)
    skynet.call(db_service, "lua", "update_player_energy", user_id, level_info.max_energy)
    
    -- 发送成功响应
    local response = {
        success = true,
        energy = level_info.max_energy,
        gems_consumed = 10
    }
    
    local response_data = pb.encode("BuyEnergyResponse", response)
    skynet.call(gateway_service, "lua", "send_to_client", conn_id, protocol.MSG_BUY_ENERGY_RESPONSE, response_data)
    
    skynet.error("User bought energy:", user_id)
end

-- 创建默认玩家信息
function player.create_default_player_info(user_id)
    local default_info = {
        user_id = user_id,
        nickname = "",
        avatar = 1,
        energy = 100,
        last_energy_time = skynet.time()
    }
    
    skynet.call(db_service, "lua", "create_player_info", default_info)
    return default_info
end

-- 计算等级信息
function player.calculate_level_info(exp)
    local level = 1
    local exp_to_next = 100
    local max_energy = 100
    
    for i = 1, #level_config do
        local config = level_config[i]
        if exp >= config.exp_required then
            level = config.level
            max_energy = config.max_energy
            
            local next_config = level_config[i + 1]
            if next_config then
                exp_to_next = next_config.exp_required - exp
            else
                exp_to_next = 0  -- 已达到最高等级
            end
        else
            break
        end
    end
    
    return {
        level = level,
        exp_to_next = exp_to_next,
        max_energy = max_energy
    }
end

-- 恢复体力值
function player.restore_energy(user_id)
    local player_info = skynet.call(db_service, "lua", "get_player_info", user_id)
    if not player_info then
        return
    end
    
    local current_time = skynet.time()
    local time_diff = current_time - (player_info.last_energy_time or current_time)
    
    -- 每5分钟恢复1点体力
    local energy_to_restore = math.floor(time_diff / 300)
    if energy_to_restore > 0 then
        local user_data = skynet.call(db_service, "lua", "get_user_by_id", user_id)
        local level_info = player.calculate_level_info(user_data.exp)
        
        local new_energy = math.min(player_info.energy + energy_to_restore, level_info.max_energy)
        skynet.call(db_service, "lua", "update_player_energy", user_id, new_energy, current_time)
    end
end

-- 发送玩家信息
function player.send_player_info(user_id)
    -- 这个函数会在用户上线时自动调用
    -- 可以在这里发送一些额外的玩家信息
end

-- 验证昵称格式
function player.is_valid_nickname(nickname)
    -- 简单的昵称验证，只允许字母、数字和中文
    return string.match(nickname, "^[%w\u4e00-\u9fa5]+$") ~= nil
end

-- 增加经验
function player.add_exp(user_id, exp)
    local user_data = skynet.call(db_service, "lua", "get_user_by_id", user_id)
    if not user_data then
        return false
    end
    
    local old_level_info = player.calculate_level_info(user_data.exp)
    local new_exp = user_data.exp + exp
    local new_level_info = player.calculate_level_info(new_exp)
    
    -- 更新经验
    skynet.call(db_service, "lua", "update_user_exp", user_id, new_exp)
    
    -- 检查是否升级
    if new_level_info.level > old_level_info.level then
        player.on_level_up(user_id, old_level_info.level, new_level_info.level)
    end
    
    return true
end

-- 升级处理
function player.on_level_up(user_id, old_level, new_level)
    skynet.error("User level up:", user_id, old_level, "->", new_level)
    
    -- TODO: 发送升级通知给客户端
    -- TODO: 给予升级奖励
end

-- 消耗体力
function player.consume_energy(user_id, energy)
    local player_info = skynet.call(db_service, "lua", "get_player_info", user_id)
    if not player_info or player_info.energy < energy then
        return false
    end
    
    local new_energy = player_info.energy - energy
    skynet.call(db_service, "lua", "update_player_energy", user_id, new_energy)
    return true
end

-- 保存玩家数据
function player.save_player_data(user_id)
    -- 玩家数据实时保存到数据库，这里可以做一些缓存清理
end

-- 发送错误消息
function player.send_error(conn_id, error_msg)
    local error_data = pb.encode("ErrorResponse", {
        code = 1,
        message = error_msg
    })
    skynet.call(gateway_service, "lua", "send_to_client", conn_id, protocol.MSG_ERROR, error_data)
end

return player
