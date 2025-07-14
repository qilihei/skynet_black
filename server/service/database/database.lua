-- 数据库服务
-- 负责MySQL和Redis的连接管理和数据访问

local skynet = require "skynet"
local mysql = require "mysql"
local redis = require "redis"

local database = {}
local mysql_pool = {}
local redis_pool = {}

-- 数据库配置
local mysql_config = {
    host = "127.0.0.1",
    port = 3306,
    database = "heartbridge_game",
    user = "root",
    password = "password",
    charset = "utf8mb4",
    max_packet_size = 1024 * 1024,
    pool_size = 10
}

local redis_config = {
    host = "127.0.0.1",
    port = 6379,
    password = "",
    database = 0,
    pool_size = 10
}

-- 初始化数据库服务
function database.init()
    skynet.error("Database service starting...")
    
    -- 初始化MySQL连接池
    database.init_mysql_pool()
    
    -- 初始化Redis连接池
    database.init_redis_pool()
    
    skynet.error("Database service started")
end

-- 初始化MySQL连接池
function database.init_mysql_pool()
    for i = 1, mysql_config.pool_size do
        local db = mysql.connect(mysql_config)
        if not db then
            skynet.error("Failed to connect to MySQL")
            return false
        end
        table.insert(mysql_pool, db)
    end
    skynet.error("MySQL pool initialized with", #mysql_pool, "connections")
    return true
end

-- 初始化Redis连接池
function database.init_redis_pool()
    for i = 1, redis_config.pool_size do
        local rdb = redis.connect(redis_config)
        if not rdb then
            skynet.error("Failed to connect to Redis")
            return false
        end
        table.insert(redis_pool, rdb)
    end
    skynet.error("Redis pool initialized with", #redis_pool, "connections")
    return true
end

-- 获取MySQL连接
function database.get_mysql_connection()
    if #mysql_pool > 0 then
        return table.remove(mysql_pool)
    end
    -- 如果池中没有连接，创建新连接
    return mysql.connect(mysql_config)
end

-- 归还MySQL连接
function database.return_mysql_connection(db)
    if #mysql_pool < mysql_config.pool_size then
        table.insert(mysql_pool, db)
    else
        db:disconnect()
    end
end

-- 获取Redis连接
function database.get_redis_connection()
    if #redis_pool > 0 then
        return table.remove(redis_pool)
    end
    -- 如果池中没有连接，创建新连接
    return redis.connect(redis_config)
end

-- 归还Redis连接
function database.return_redis_connection(rdb)
    if #redis_pool < redis_config.pool_size then
        table.insert(redis_pool, rdb)
    else
        rdb:disconnect()
    end
end

-- 执行MySQL查询
function database.mysql_query(sql, ...)
    local db = database.get_mysql_connection()
    if not db then
        skynet.error("Failed to get MySQL connection")
        return nil
    end
    
    local result = db:query(sql, ...)
    database.return_mysql_connection(db)
    
    return result
end

-- 执行Redis命令
function database.redis_command(cmd, ...)
    local rdb = database.get_redis_connection()
    if not rdb then
        skynet.error("Failed to get Redis connection")
        return nil
    end
    
    local result = rdb[cmd](rdb, ...)
    database.return_redis_connection(rdb)
    
    return result
end

-- 用户相关数据库操作
function database.get_user_by_username(username)
    local sql = "SELECT * FROM users WHERE username = ?"
    local result = database.mysql_query(sql, username)
    return result and result[1]
end

function database.get_user_by_id(user_id)
    local sql = "SELECT * FROM users WHERE user_id = ?"
    local result = database.mysql_query(sql, user_id)
    return result and result[1]
end

function database.create_user(user_data)
    local sql = [[
        INSERT INTO users (username, password_hash, salt, email, create_time, status, level, exp, coins, gems)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ]]
    local result = database.mysql_query(sql, 
        user_data.username,
        user_data.password_hash,
        user_data.salt,
        user_data.email,
        user_data.create_time,
        user_data.status,
        user_data.level,
        user_data.exp,
        user_data.coins,
        user_data.gems
    )
    return result and result.insert_id
end

function database.update_user_login(user_id, login_time, device_id)
    local sql = "UPDATE users SET last_login_time = ?, last_device_id = ? WHERE user_id = ?"
    return database.mysql_query(sql, login_time, device_id, user_id)
end

function database.update_user_coins(user_id, coins)
    local sql = "UPDATE users SET coins = ? WHERE user_id = ?"
    return database.mysql_query(sql, coins, user_id)
end

function database.update_user_gems(user_id, gems)
    local sql = "UPDATE users SET gems = ? WHERE user_id = ?"
    return database.mysql_query(sql, gems, user_id)
end

-- 初始化用户游戏数据
function database.init_user_game_data(user_id)
    -- 创建用户农场数据
    local farm_sql = [[
        INSERT INTO user_farms (user_id, farm_level, farm_exp, max_plots, create_time)
        VALUES (?, 1, 0, 9, ?)
    ]]
    database.mysql_query(farm_sql, user_id, skynet.time())
    
    -- 创建初始背包数据
    local inventory_sql = [[
        INSERT INTO user_inventories (user_id, max_slots, create_time)
        VALUES (?, 20, ?)
    ]]
    database.mysql_query(inventory_sql, user_id, skynet.time())
    
    -- 给予初始物品
    database.add_user_item(user_id, 1001, 10)  -- 萝卜种子 x10
    database.add_user_item(user_id, 1002, 5)   -- 土豆种子 x5
    database.add_user_item(user_id, 2001, 1)   -- 基础锄头 x1
    database.add_user_item(user_id, 2002, 1)   -- 基础水壶 x1
end

-- 物品相关操作
function database.add_user_item(user_id, item_id, quantity)
    -- 检查是否已有该物品
    local check_sql = "SELECT * FROM user_items WHERE user_id = ? AND item_id = ?"
    local existing = database.mysql_query(check_sql, user_id, item_id)
    
    if existing and existing[1] then
        -- 更新数量
        local update_sql = "UPDATE user_items SET quantity = quantity + ? WHERE user_id = ? AND item_id = ?"
        return database.mysql_query(update_sql, quantity, user_id, item_id)
    else
        -- 新增物品
        local insert_sql = "INSERT INTO user_items (user_id, item_id, quantity, create_time) VALUES (?, ?, ?, ?)"
        return database.mysql_query(insert_sql, user_id, item_id, quantity, skynet.time())
    end
end

function database.remove_user_item(user_id, item_id, quantity)
    local sql = "UPDATE user_items SET quantity = quantity - ? WHERE user_id = ? AND item_id = ? AND quantity >= ?"
    local result = database.mysql_query(sql, quantity, user_id, item_id, quantity)
    return result and result.affected_rows > 0
end

function database.get_user_items(user_id)
    local sql = "SELECT * FROM user_items WHERE user_id = ? AND quantity > 0"
    return database.mysql_query(sql, user_id)
end

-- 农场相关操作
function database.get_user_farm(user_id)
    local sql = "SELECT * FROM user_farms WHERE user_id = ?"
    local result = database.mysql_query(sql, user_id)
    return result and result[1]
end

function database.get_user_plots(user_id)
    local sql = "SELECT * FROM user_plots WHERE user_id = ?"
    return database.mysql_query(sql, user_id)
end

function database.plant_crop(user_id, plot_id, crop_id, plant_time)
    local sql = [[
        INSERT INTO user_plots (user_id, plot_id, crop_id, plant_time, status)
        VALUES (?, ?, ?, ?, 'growing')
        ON DUPLICATE KEY UPDATE crop_id = ?, plant_time = ?, status = 'growing'
    ]]
    return database.mysql_query(sql, user_id, plot_id, crop_id, plant_time, crop_id, plant_time)
end

function database.harvest_crop(user_id, plot_id)
    local sql = "UPDATE user_plots SET status = 'empty', crop_id = NULL, plant_time = NULL WHERE user_id = ? AND plot_id = ?"
    return database.mysql_query(sql, user_id, plot_id)
end

-- Redis操作封装
function database.redis_get(key)
    return database.redis_command("get", key)
end

function database.redis_set(key, value)
    return database.redis_command("set", key, value)
end

function database.redis_setex(key, seconds, value)
    return database.redis_command("setex", key, seconds, value)
end

function database.redis_del(key)
    return database.redis_command("del", key)
end

function database.redis_incr(key)
    return database.redis_command("incr", key)
end

function database.redis_expire(key, seconds)
    return database.redis_command("expire", key, seconds)
end

function database.redis_exists(key)
    return database.redis_command("exists", key)
end

-- 消息处理接口
local CMD = {}

-- MySQL操作
function CMD.mysql_query(source, sql, ...)
    return database.mysql_query(sql, ...)
end

-- 用户操作
function CMD.get_user_by_username(source, username)
    return database.get_user_by_username(username)
end

function CMD.get_user_by_id(source, user_id)
    return database.get_user_by_id(user_id)
end

function CMD.create_user(source, user_data)
    return database.create_user(user_data)
end

function CMD.update_user_login(source, user_id, login_time, device_id)
    return database.update_user_login(user_id, login_time, device_id)
end

function CMD.init_user_game_data(source, user_id)
    return database.init_user_game_data(user_id)
end

-- 物品操作
function CMD.add_user_item(source, user_id, item_id, quantity)
    return database.add_user_item(user_id, item_id, quantity)
end

function CMD.remove_user_item(source, user_id, item_id, quantity)
    return database.remove_user_item(user_id, item_id, quantity)
end

function CMD.get_user_items(source, user_id)
    return database.get_user_items(user_id)
end

-- 农场操作
function CMD.get_user_farm(source, user_id)
    return database.get_user_farm(user_id)
end

function CMD.get_user_plots(source, user_id)
    return database.get_user_plots(user_id)
end

function CMD.plant_crop(source, user_id, plot_id, crop_id, plant_time)
    return database.plant_crop(user_id, plot_id, crop_id, plant_time)
end

function CMD.harvest_crop(source, user_id, plot_id)
    return database.harvest_crop(user_id, plot_id)
end

-- Redis操作
function CMD.redis_get(source, key)
    return database.redis_get(key)
end

function CMD.redis_set(source, key, value)
    return database.redis_set(key, value)
end

function CMD.redis_setex(source, key, seconds, value)
    return database.redis_setex(key, seconds, value)
end

function CMD.redis_del(source, key)
    return database.redis_del(key)
end

function CMD.redis_incr(source, key)
    return database.redis_incr(key)
end

function CMD.redis_expire(source, key, seconds)
    return database.redis_expire(key, seconds)
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
    
    database.init()
end)

return database
