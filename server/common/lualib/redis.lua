-- Redis连接池和操作封装

local skynet = require "skynet"
local redis = require "skynet.db.redis"
local config = require "lib.config"

local M = {}

-- 连接池
local connection_pool = {}
local max_pool_size = 20
local redis_config = {}

-- 统计信息
local stats = {
    total_commands = 0,
    active_connections = 0,
    pool_hits = 0,
    pool_misses = 0,
    errors = 0,
}

-- 初始化Redis连接池
function M.init()
    -- 确保配置已加载
    if not config.is_loaded() then
        config.load()
    end

    redis_config = config.get("database.redis")
    if not redis_config then
        skynet.error("Redis config not found")
        return false
    end
    
    max_pool_size = redis_config.pool_size or 20
    
    skynet.error("Redis pool initialized, max_pool_size:", max_pool_size)
    return true
end

-- 创建新的Redis连接
local function create_connection()
    local db = redis.connect({
        host = redis_config.host,
        port = redis_config.port,
        auth = redis_config.auth ~= "" and redis_config.auth or nil,
        db = redis_config.db,
    })
    
    if not db then
        skynet.error("Failed to connect to Redis")
        return nil
    end
    
    stats.active_connections = stats.active_connections + 1
    return db
end

-- 从连接池获取连接
local function get_connection()
    if #connection_pool > 0 then
        stats.pool_hits = stats.pool_hits + 1
        return table.remove(connection_pool)
    end
    
    stats.pool_misses = stats.pool_misses + 1
    return create_connection()
end

-- 归还连接到连接池
local function return_connection(db)
    if not db then
        return
    end
    
    -- 检查连接是否有效
    local ok, err = pcall(function()
        db:ping()
    end)
    
    if ok and #connection_pool < max_pool_size then
        table.insert(connection_pool, db)
    else
        -- 连接无效或池已满，关闭连接
        pcall(function() db:disconnect() end)
        stats.active_connections = stats.active_connections - 1
    end
end

-- 执行Redis命令
function M.command(cmd, ...)
    if not cmd then
        skynet.error("Redis command is nil")
        return nil, "Redis command is nil"
    end
    
    local db = get_connection()
    if not db then
        stats.errors = stats.errors + 1
        return nil, "Failed to get Redis connection"
    end
    
    stats.total_commands = stats.total_commands + 1

    local params = {...}
    local ok, result
    if #params > 0 then
        ok, result = pcall(db[cmd], db, table.unpack(params))
    else
        ok, result = pcall(db[cmd], db)
    end
    
    return_connection(db)
    
    if not ok then
        stats.errors = stats.errors + 1
        skynet.error("Redis command error:", result)
        return nil, result
    end
    
    return result
end

-- 字符串操作
function M.set(key, value, expire)
    if expire then
        return M.command("setex", key, expire, value)
    else
        return M.command("set", key, value)
    end
end

function M.get(key)
    return M.command("get", key)
end

function M.mget(...)
    return M.command("mget", ...)
end

function M.mset(...)
    return M.command("mset", ...)
end

function M.incr(key)
    return M.command("incr", key)
end

function M.decr(key)
    return M.command("decr", key)
end

function M.incrby(key, increment)
    return M.command("incrby", key, increment)
end

function M.decrby(key, decrement)
    return M.command("decrby", key, decrement)
end

-- 哈希操作
function M.hset(key, field, value)
    return M.command("hset", key, field, value)
end

function M.hget(key, field)
    return M.command("hget", key, field)
end

function M.hmset(key, ...)
    return M.command("hmset", key, ...)
end

function M.hmget(key, ...)
    return M.command("hmget", key, ...)
end

function M.hgetall(key)
    return M.command("hgetall", key)
end

function M.hdel(key, ...)
    return M.command("hdel", key, ...)
end

function M.hexists(key, field)
    return M.command("hexists", key, field)
end

function M.hlen(key)
    return M.command("hlen", key)
end

-- 列表操作
function M.lpush(key, ...)
    return M.command("lpush", key, ...)
end

function M.rpush(key, ...)
    return M.command("rpush", key, ...)
end

function M.lpop(key)
    return M.command("lpop", key)
end

function M.rpop(key)
    return M.command("rpop", key)
end

function M.llen(key)
    return M.command("llen", key)
end

function M.lrange(key, start, stop)
    return M.command("lrange", key, start, stop)
end

function M.ltrim(key, start, stop)
    return M.command("ltrim", key, start, stop)
end

-- 集合操作
function M.sadd(key, ...)
    return M.command("sadd", key, ...)
end

function M.srem(key, ...)
    return M.command("srem", key, ...)
end

function M.smembers(key)
    return M.command("smembers", key)
end

function M.sismember(key, member)
    return M.command("sismember", key, member)
end

function M.scard(key)
    return M.command("scard", key)
end

-- 有序集合操作
function M.zadd(key, score, member)
    return M.command("zadd", key, score, member)
end

function M.zrem(key, ...)
    return M.command("zrem", key, ...)
end

function M.zrange(key, start, stop, withscores)
    if withscores then
        return M.command("zrange", key, start, stop, "WITHSCORES")
    else
        return M.command("zrange", key, start, stop)
    end
end

function M.zrevrange(key, start, stop, withscores)
    if withscores then
        return M.command("zrevrange", key, start, stop, "WITHSCORES")
    else
        return M.command("zrevrange", key, start, stop)
    end
end

function M.zrank(key, member)
    return M.command("zrank", key, member)
end

function M.zrevrank(key, member)
    return M.command("zrevrank", key, member)
end

function M.zscore(key, member)
    return M.command("zscore", key, member)
end

function M.zcard(key)
    return M.command("zcard", key)
end

-- 通用操作
function M.exists(key)
    return M.command("exists", key)
end

function M.del(...)
    return M.command("del", ...)
end

function M.expire(key, seconds)
    return M.command("expire", key, seconds)
end

function M.ttl(key)
    return M.command("ttl", key)
end

function M.keys(pattern)
    return M.command("keys", pattern)
end

function M.ping()
    return M.command("ping")
end

-- 管道操作
function M.pipeline(commands)
    if not commands or #commands == 0 then
        return nil, "Commands are required"
    end
    
    local db = get_connection()
    if not db then
        stats.errors = stats.errors + 1
        return nil, "Failed to get Redis connection"
    end
    
    local ok, results = pcall(function()
        local pipeline_results = {}
        for _, cmd in ipairs(commands) do
            local result = db[cmd.command](db, table.unpack(cmd.args or {}))
            table.insert(pipeline_results, result)
        end
        return pipeline_results
    end)
    
    return_connection(db)
    
    if not ok then
        stats.errors = stats.errors + 1
        skynet.error("Redis pipeline error:", results)
        return nil, results
    end
    
    stats.total_commands = stats.total_commands + #commands
    return results
end

-- 获取统计信息
function M.get_stats()
    return {
        total_commands = stats.total_commands,
        active_connections = stats.active_connections,
        pool_size = #connection_pool,
        pool_hits = stats.pool_hits,
        pool_misses = stats.pool_misses,
        errors = stats.errors,
        hit_rate = stats.pool_hits > 0 and (stats.pool_hits / (stats.pool_hits + stats.pool_misses)) or 0,
    }
end

-- 清理连接池
function M.cleanup()
    for _, db in ipairs(connection_pool) do
        pcall(function() db:disconnect() end)
    end
    connection_pool = {}
    stats.active_connections = 0
    skynet.error("Redis connection pool cleaned up")
end

-- 健康检查
function M.health_check()
    local result, err = M.ping()
    if result == "PONG" then
        return true, "OK"
    else
        return false, err or "Ping failed"
    end
end

return M
