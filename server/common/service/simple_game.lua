-- 简化的游戏服务
-- 用于测试基本功能，不依赖外部库

local skynet = require "skynet"

local game = {}

-- 服务配置
local config = {
    max_players = 1000,
    tick_interval = 100,  -- 游戏逻辑帧间隔(毫秒)
    save_interval = 30000 -- 数据保存间隔(毫秒)
}

-- 在线玩家数据
local players = {}
local player_count = 0

-- 游戏状态
local game_state = {
    start_time = 0,
    tick_count = 0,
    last_save_time = 0
}

-- 初始化游戏服务
function game.init()
    skynet.error("Simple game service starting...")
    game_state.start_time = skynet.time()
    game_state.last_save_time = skynet.time()
end

-- 玩家进入游戏
function game.player_enter(player_id, player_data)
    skynet.error("Player enter game:", player_id)
    
    if players[player_id] then
        skynet.error("Player already in game:", player_id)
        return false, "玩家已在游戏中"
    end
    
    if player_count >= config.max_players then
        skynet.error("Game is full, reject player:", player_id)
        return false, "游戏人数已满"
    end
    
    -- 创建玩家对象
    local player = {
        player_id = player_id,
        name = player_data.name or "Player" .. player_id,
        level = player_data.level or 1,
        exp = player_data.exp or 0,
        gold = player_data.gold or 1000,
        enter_time = skynet.time(),
        last_active_time = skynet.time(),
        x = player_data.x or 0,
        y = player_data.y or 0,
        hp = player_data.hp or 100,
        mp = player_data.mp or 50
    }
    
    players[player_id] = player
    player_count = player_count + 1
    
    skynet.error("Player enter success:", player_id, "online count:", player_count)
    
    return true, {
        player_id = player_id,
        name = player.name,
        level = player.level,
        exp = player.exp,
        gold = player.gold,
        x = player.x,
        y = player.y,
        hp = player.hp,
        mp = player.mp
    }
end

-- 玩家离开游戏
function game.player_leave(player_id)
    skynet.error("Player leave game:", player_id)
    
    local player = players[player_id]
    if not player then
        return false, "玩家不在游戏中"
    end
    
    -- 保存玩家数据
    game.save_player_data(player)
    
    players[player_id] = nil
    player_count = player_count - 1
    
    skynet.error("Player leave success:", player_id, "online count:", player_count)
    
    return true
end

-- 玩家移动
function game.player_move(player_id, x, y)
    local player = players[player_id]
    if not player then
        return false, "玩家不在游戏中"
    end
    
    player.x = x
    player.y = y
    player.last_active_time = skynet.time()
    
    -- 广播给其他玩家
    game.broadcast_to_others(player_id, "player_move", {
        player_id = player_id,
        x = x,
        y = y
    })
    
    return true
end

-- 玩家聊天
function game.player_chat(player_id, message)
    local player = players[player_id]
    if not player then
        return false, "玩家不在游戏中"
    end
    
    player.last_active_time = skynet.time()
    
    -- 广播聊天消息
    game.broadcast_to_all("player_chat", {
        player_id = player_id,
        name = player.name,
        message = message,
        timestamp = skynet.time()
    })
    
    skynet.error("Player chat:", player_id, message)
    
    return true
end

-- 广播消息给所有玩家
function game.broadcast_to_all(msg_type, data)
    for player_id, player in pairs(players) do
        -- 这里应该通过网关发送消息给客户端
        -- 暂时只打印日志
        skynet.error("Broadcast to", player_id, msg_type, data)
    end
end

-- 广播消息给其他玩家
function game.broadcast_to_others(exclude_player_id, msg_type, data)
    for player_id, player in pairs(players) do
        if player_id ~= exclude_player_id then
            -- 这里应该通过网关发送消息给客户端
            -- 暂时只打印日志
            skynet.error("Broadcast to", player_id, msg_type, data)
        end
    end
end

-- 保存玩家数据
function game.save_player_data(player)
    -- 这里应该保存到数据库
    -- 暂时只打印日志
    skynet.error("Save player data:", player.player_id, player.name, player.level)
end

-- 游戏逻辑帧更新
function game.tick()
    game_state.tick_count = game_state.tick_count + 1
    local current_time = skynet.time()
    
    -- 检查是否需要保存数据
    if current_time - game_state.last_save_time > config.save_interval / 1000 then
        game.save_all_players()
        game_state.last_save_time = current_time
    end
    
    -- 检查离线玩家
    game.check_offline_players()
end

-- 保存所有玩家数据
function game.save_all_players()
    for player_id, player in pairs(players) do
        game.save_player_data(player)
    end
    skynet.error("Save all players data, count:", player_count)
end

-- 检查离线玩家
function game.check_offline_players()
    local current_time = skynet.time()
    local offline_players = {}
    
    for player_id, player in pairs(players) do
        -- 5分钟无活动视为离线
        if current_time - player.last_active_time > 300 then
            table.insert(offline_players, player_id)
        end
    end
    
    for _, player_id in ipairs(offline_players) do
        game.player_leave(player_id)
    end
end

-- 获取游戏状态
function game.get_status()
    return {
        online_count = player_count,
        max_players = config.max_players,
        tick_count = game_state.tick_count,
        uptime = skynet.time() - game_state.start_time
    }
end

-- 游戏逻辑循环
function game.game_loop()
    while true do
        skynet.sleep(config.tick_interval)
        game.tick()
    end
end

-- 服务命令处理
local CMD = {}

function CMD.enter(player_id, player_data)
    return game.player_enter(player_id, player_data)
end

function CMD.leave(player_id)
    return game.player_leave(player_id)
end

function CMD.move(player_id, x, y)
    return game.player_move(player_id, x, y)
end

function CMD.chat(player_id, message)
    return game.player_chat(player_id, message)
end

function CMD.status()
    return game.get_status()
end

function CMD.ping()
    return "pong"
end

-- 服务启动
skynet.start(function()
    game.init()
    
    -- 启动游戏逻辑循环
    skynet.fork(game.game_loop)
    
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
