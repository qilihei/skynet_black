-- 心桥物语游戏服务器预加载文件
-- 此文件会在所有 Lua 服务启动前运行

-- 设置全局配置
_G.GAME_NAME = "HeartBridge"
_G.GAME_VERSION = "1.0.0"

-- 设置调试模式
_G.DEBUG_MODE = true

-- 预加载常用模块
local skynet = require "skynet"

-- 设置错误处理
local function error_handler(err)
    skynet.error("Preload Error: " .. tostring(err))
    skynet.error(debug.traceback())
end

-- 在保护模式下执行预加载逻辑
local function safe_preload()
    -- 这里可以添加全局初始化代码
    skynet.error("游戏名称: " .. _G.GAME_NAME)
    skynet.error("游戏版本: " .. _G.GAME_VERSION)
    skynet.error("调试模式: " .. tostring(_G.DEBUG_MODE))
    
    -- 可以在这里预加载配置文件、初始化全局变量等
    
    return true
end

-- 执行预加载
local success, result = xpcall(safe_preload, error_handler)
