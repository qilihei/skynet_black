-- 配置管理模块
-- 提供配置文件加载、验证和访问功能

local skynet = require "skynet"

local M = {}

-- 配置数据
local config_data = {}
local config_loaded = false

-- 默认配置值
local default_config = {
    gateway = {
        host = "0.0.0.0",
        port = 8888,
        max_client = 1000,
        timeout = 60,
        nodelay = true,
    },
    database = {
        mysql = {
            host = "127.0.0.1",
            port = 3306,
            database = "farm_game",
            user = "root",
            password = "",
            charset = "utf8mb4",
            max_packet_size = 1024 * 1024,
            pool_size = 10,
            timeout = 5000,
        },
        redis = {
            host = "127.0.0.1",
            port = 6379,
            auth = "",
            db = 0,
            pool_size = 20,
            timeout = 5000,
        }
    },
    game = {
        tick_interval = 100,
        save_interval = 300,
        max_energy = 100,
        energy_recover_interval = 60,
        energy_recover_amount = 1,
    },
    log = {
        level = "INFO",
        max_size = "100MB",
        max_files = 10,
        compress = true,
    },
    security = {
        session_timeout = 7200,
        max_login_attempts = 5,
        login_ban_time = 300,
        password_salt = "farm_game_2024",
        jwt_secret = "default_jwt_secret",
    },
    performance = {
        message_queue_size = 10000,
        worker_pool_size = 4,
        gc_interval = 60,
        memory_limit = "512MB",
    },
    monitor = {
        enable = true,
        port = 8889,
        update_interval = 30,
        metrics = {
            "cpu_usage",
            "memory_usage",
            "connection_count",
            "message_count",
            "database_queries"
        }
    },
    debug = {
        enable = false,
        console_port = 8000,
        protocol_debug = false,
        sql_debug = false,
        profile = false,
    }
}

-- 深度合并表
local function deep_merge(target, source)
    for key, value in pairs(source) do
        if type(value) == "table" and type(target[key]) == "table" then
            deep_merge(target[key], value)
        else
            target[key] = value
        end
    end
    return target
end

-- 验证配置项
local function validate_config(config)
    local errors = {}
    
    -- 验证网关配置
    if config.gateway then
        if not config.gateway.port or config.gateway.port <= 0 or config.gateway.port > 65535 then
            table.insert(errors, "Invalid gateway port")
        end
        if not config.gateway.max_client or config.gateway.max_client <= 0 then
            table.insert(errors, "Invalid max_client value")
        end
    end
    
    -- 验证数据库配置
    if config.database then
        if config.database.mysql then
            local mysql = config.database.mysql
            if not mysql.host or mysql.host == "" then
                table.insert(errors, "MySQL host is required")
            end
            if not mysql.database or mysql.database == "" then
                table.insert(errors, "MySQL database name is required")
            end
            if not mysql.user or mysql.user == "" then
                table.insert(errors, "MySQL user is required")
            end
        end
        
        if config.database.redis then
            local redis = config.database.redis
            if not redis.host or redis.host == "" then
                table.insert(errors, "Redis host is required")
            end
        end
    end
    
    -- 验证游戏配置
    if config.game then
        if config.game.tick_interval and config.game.tick_interval <= 0 then
            table.insert(errors, "Invalid tick_interval")
        end
        if config.game.save_interval and config.game.save_interval <= 0 then
            table.insert(errors, "Invalid save_interval")
        end
    end
    
    return #errors == 0, errors
end

-- 加载配置文件
function M.load(config_file)
    if config_loaded then
        skynet.error("Config already loaded")
        return true
    end

    -- 先使用默认配置
    config_data = deep_merge({}, default_config)

    -- 尝试加载游戏配置文件
    local game_config_file = "config/game.lua"
    local game_chunk, err = loadfile(game_config_file)
    if game_chunk then
        -- 执行游戏配置文件
        local ok, game_config = pcall(game_chunk)
        if ok and game_config then
            config_data = deep_merge(config_data, game_config)
            skynet.error("Game config loaded from:", game_config_file)
        else
            skynet.error("Failed to execute game config file:", game_config)
        end
    else
        skynet.error("Game config file not found, using defaults:", err)
    end

    -- 验证配置（简化版本，只检查必要项）
    if not config_data.database or not config_data.database.mysql then
        skynet.error("Database configuration missing, using defaults")
    end

    config_loaded = true
    skynet.error("Config loaded successfully")
    return true
end

-- 获取配置项
function M.get(path, default_value)
    if not config_loaded then
        skynet.error("Config not loaded yet")
        return default_value
    end
    
    if not path then
        return config_data
    end
    
    local keys = {}
    for key in string.gmatch(path, "[^%.]+") do
        table.insert(keys, key)
    end
    
    local value = config_data
    for _, key in ipairs(keys) do
        if type(value) ~= "table" or value[key] == nil then
            return default_value
        end
        value = value[key]
    end
    
    return value
end

-- 设置配置项（运行时修改）
function M.set(path, value)
    if not config_loaded then
        skynet.error("Config not loaded yet")
        return false
    end
    
    local keys = {}
    for key in string.gmatch(path, "[^%.]+") do
        table.insert(keys, key)
    end
    
    if #keys == 0 then
        return false
    end
    
    local current = config_data
    for i = 1, #keys - 1 do
        local key = keys[i]
        if type(current[key]) ~= "table" then
            current[key] = {}
        end
        current = current[key]
    end
    
    current[keys[#keys]] = value
    return true
end

-- 检查配置是否已加载
function M.is_loaded()
    return config_loaded
end

-- 重新加载配置
function M.reload(config_file)
    config_loaded = false
    config_data = {}
    return M.load(config_file)
end

-- 获取所有配置
function M.get_all()
    return config_data
end

-- 打印配置信息（调试用）
function M.dump()
    if not config_loaded then
        skynet.error("Config not loaded yet")
        return
    end
    
    local function dump_table(t, indent)
        indent = indent or 0
        local prefix = string.rep("  ", indent)
        
        for k, v in pairs(t) do
            if type(v) == "table" then
                skynet.error(prefix .. k .. ":")
                dump_table(v, indent + 1)
            else
                skynet.error(prefix .. k .. ":", v)
            end
        end
    end
    
    skynet.error("=== Configuration Dump ===")
    dump_table(config_data)
    skynet.error("=== End Configuration ===")
end

return M
