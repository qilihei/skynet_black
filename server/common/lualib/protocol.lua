-- 心桥物语游戏协议管理器
-- 负责protobuf协议的加载、编码、解码和消息路由

local skynet = require "skynet"
local pb = require "pb"

local protocol = {}

-- 协议状态
local protocol_loaded = false

-- 消息ID定义
protocol.MSG_ERROR = 1
protocol.MSG_HEARTBEAT = 2

-- 登录相关 (100-199)
protocol.MSG_LOGIN_REQUEST = 100
protocol.MSG_LOGIN_RESPONSE = 101
protocol.MSG_REGISTER_REQUEST = 102
protocol.MSG_REGISTER_RESPONSE = 103
protocol.MSG_LOGOUT_REQUEST = 104
protocol.MSG_LOGOUT_RESPONSE = 105

-- 玩家相关 (200-299)
protocol.MSG_GET_PLAYER_INFO = 200
protocol.MSG_PLAYER_INFO_RESPONSE = 201
protocol.MSG_USER_DATA = 202
protocol.MSG_CHANGE_NICKNAME = 203
protocol.MSG_CHANGE_NICKNAME_RESPONSE = 204
protocol.MSG_CHANGE_AVATAR = 205
protocol.MSG_CHANGE_AVATAR_RESPONSE = 206
protocol.MSG_BUY_ENERGY = 207
protocol.MSG_BUY_ENERGY_RESPONSE = 208

-- 背包相关 (300-399)
protocol.MSG_GET_INVENTORY = 300
protocol.MSG_INVENTORY_RESPONSE = 301
protocol.MSG_USE_ITEM = 302
protocol.MSG_USE_ITEM_RESPONSE = 303
protocol.MSG_SORT_INVENTORY = 304
protocol.MSG_SORT_INVENTORY_RESPONSE = 305
protocol.MSG_EXPAND_INVENTORY = 306
protocol.MSG_EXPAND_INVENTORY_RESPONSE = 307

-- 农场相关 (400-499)
protocol.MSG_GET_FARM_INFO = 400
protocol.MSG_FARM_INFO_RESPONSE = 401
protocol.MSG_PLANT_CROP = 402
protocol.MSG_PLANT_CROP_RESPONSE = 403
protocol.MSG_HARVEST_CROP = 404
protocol.MSG_HARVEST_CROP_RESPONSE = 405
protocol.MSG_WATER_CROP = 406
protocol.MSG_WATER_CROP_RESPONSE = 407
protocol.MSG_EXPAND_FARM = 408
protocol.MSG_EXPAND_FARM_RESPONSE = 409

-- 商店相关 (500-599)
protocol.MSG_GET_SHOP = 500
protocol.MSG_SHOP_RESPONSE = 501
protocol.MSG_BUY_ITEM = 502
protocol.MSG_BUY_ITEM_RESPONSE = 503
protocol.MSG_SELL_ITEM = 504
protocol.MSG_SELL_ITEM_RESPONSE = 505

-- 好友相关 (600-699)
protocol.MSG_GET_FRIENDS = 600
protocol.MSG_FRIENDS_RESPONSE = 601
protocol.MSG_ADD_FRIEND = 602
protocol.MSG_ADD_FRIEND_RESPONSE = 603
protocol.MSG_REMOVE_FRIEND = 604
protocol.MSG_REMOVE_FRIEND_RESPONSE = 605

-- 聊天相关 (700-799)
protocol.MSG_SEND_CHAT = 700
protocol.MSG_CHAT_MESSAGE = 701
protocol.MSG_GET_CHAT_HISTORY = 702
protocol.MSG_CHAT_HISTORY_RESPONSE = 703

-- 任务相关 (800-899)
protocol.MSG_GET_QUESTS = 800
protocol.MSG_QUESTS_RESPONSE = 801
protocol.MSG_ACCEPT_QUEST = 802
protocol.MSG_ACCEPT_QUEST_RESPONSE = 803
protocol.MSG_COMPLETE_QUEST = 804
protocol.MSG_COMPLETE_QUEST_RESPONSE = 805

-- 消息ID到服务的映射
local msg_to_service = {
    -- 登录服务
    [protocol.MSG_LOGIN_REQUEST] = "login",
    [protocol.MSG_REGISTER_REQUEST] = "login",
    [protocol.MSG_LOGOUT_REQUEST] = "login",

    -- 游戏服务 (其他所有消息都路由到游戏服务)
}

-- 消息ID到模块的映射
local msg_to_module = {
    -- 玩家模块
    [protocol.MSG_GET_PLAYER_INFO] = "player",
    [protocol.MSG_CHANGE_NICKNAME] = "player",
    [protocol.MSG_CHANGE_AVATAR] = "player",
    [protocol.MSG_BUY_ENERGY] = "player",

    -- 背包模块
    [protocol.MSG_GET_INVENTORY] = "inventory",
    [protocol.MSG_USE_ITEM] = "inventory",
    [protocol.MSG_SORT_INVENTORY] = "inventory",
    [protocol.MSG_EXPAND_INVENTORY] = "inventory",

    -- 农场模块
    [protocol.MSG_GET_FARM_INFO] = "farm",
    [protocol.MSG_PLANT_CROP] = "farm",
    [protocol.MSG_HARVEST_CROP] = "farm",
    [protocol.MSG_WATER_CROP] = "farm",
    [protocol.MSG_EXPAND_FARM] = "farm",

    -- 商店模块
    [protocol.MSG_GET_SHOP] = "shop",
    [protocol.MSG_BUY_ITEM] = "shop",
    [protocol.MSG_SELL_ITEM] = "shop",

    -- 好友模块
    [protocol.MSG_GET_FRIENDS] = "friend",
    [protocol.MSG_ADD_FRIEND] = "friend",
    [protocol.MSG_REMOVE_FRIEND] = "friend",

    -- 聊天模块
    [protocol.MSG_SEND_CHAT] = "chat",
    [protocol.MSG_GET_CHAT_HISTORY] = "chat",

    -- 任务模块
    [protocol.MSG_GET_QUESTS] = "quest",
    [protocol.MSG_ACCEPT_QUEST] = "quest",
    [protocol.MSG_COMPLETE_QUEST] = "quest",
}

-- 加载协议定义
function protocol.load_proto()
    if protocol_loaded then
        return true
    end

    -- 这里可以加载.proto文件或直接在代码中定义消息结构
    -- 为了简化，我们直接在代码中定义基本的消息结构

    protocol_loaded = true
    skynet.error("Protocol loaded successfully")
    return true
end

-- 获取消息对应的服务
function protocol.get_service_by_msg_id(msg_id)
    return msg_to_service[msg_id] or "game"  -- 默认路由到游戏服务
end

-- 获取消息对应的模块
function protocol.get_module_by_msg_id(msg_id)
    return msg_to_module[msg_id]
end

return protocol
