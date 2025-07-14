-- MySQL数据库连接池和操作封装

local skynet = require "skynet"
local mysql = require "skynet.db.mysql"
local config = require "lib.config"

local M = {}

-- 连接池
local connection_pool = {}
local pool_size = 0
local max_pool_size = 10
local mysql_config = {}

-- 统计信息
local stats = {
    total_queries = 0,
    active_connections = 0,
    pool_hits = 0,
    pool_misses = 0,
    errors = 0,
}

-- 初始化MySQL连接池
function M.init()
    -- 确保配置已加载
    if not config.is_loaded() then
        config.load()
    end

    mysql_config = config.get("database.mysql")
    if not mysql_config then
        skynet.error("MySQL config not found")
        return false
    end
    
    max_pool_size = mysql_config.pool_size or 10
    
    skynet.error("MySQL pool initialized, max_pool_size:", max_pool_size)
    return true
end

-- 创建新的数据库连接
local function create_connection()
    local db = mysql.connect({
        host = mysql_config.host,
        port = mysql_config.port,
        database = mysql_config.database,
        user = mysql_config.user,
        password = mysql_config.password,
        charset = mysql_config.charset,
        max_packet_size = mysql_config.max_packet_size,
        on_connect = function(db)
            -- 连接成功回调
            skynet.error("MySQL connected:", mysql_config.host, mysql_config.port)
        end
    })
    
    if not db then
        skynet.error("Failed to connect to MySQL")
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
        db:query("SELECT 1")
    end)
    
    if ok and #connection_pool < max_pool_size then
        table.insert(connection_pool, db)
    else
        -- 连接无效或池已满，关闭连接
        pcall(function() db:disconnect() end)
        stats.active_connections = stats.active_connections - 1
    end
end

-- 执行SQL查询
function M.query(sql, ...)
    if not sql then
        skynet.error("SQL query is nil")
        return nil, "SQL query is nil"
    end
    
    local db = get_connection()
    if not db then
        stats.errors = stats.errors + 1
        return nil, "Failed to get database connection"
    end
    
    stats.total_queries = stats.total_queries + 1
    
    -- 记录SQL调试信息
    local params = {...}
    if config.get("debug.sql_debug") then
        skynet.error("SQL:", sql)
        if #params > 0 then
            skynet.error("Params:", table.unpack(params))
        end
    end

    local ok, result
    if #params > 0 then
        ok, result = pcall(db.query, db, sql, table.unpack(params))
    else
        ok, result = pcall(db.query, db, sql)
    end
    
    return_connection(db)
    
    if not ok then
        stats.errors = stats.errors + 1
        skynet.error("MySQL query error:", result)
        return nil, result
    end
    
    return result
end

-- 执行事务
function M.transaction(func)
    if not func or type(func) ~= "function" then
        return nil, "Transaction function is required"
    end
    
    local db = get_connection()
    if not db then
        stats.errors = stats.errors + 1
        return nil, "Failed to get database connection"
    end
    
    local ok, result = pcall(function()
        -- 开始事务
        db:query("START TRANSACTION")
        
        -- 执行事务函数
        local success, data = func(db)
        
        if success then
            -- 提交事务
            db:query("COMMIT")
            return data
        else
            -- 回滚事务
            db:query("ROLLBACK")
            error(data or "Transaction failed")
        end
    end)
    
    return_connection(db)
    
    if not ok then
        stats.errors = stats.errors + 1
        skynet.error("MySQL transaction error:", result)
        return nil, result
    end
    
    return result
end

-- 插入数据
function M.insert(table_name, data)
    if not table_name or not data then
        return nil, "Table name and data are required"
    end
    
    local fields = {}
    local values = {}
    local placeholders = {}
    
    for field, value in pairs(data) do
        table.insert(fields, "`" .. field .. "`")
        table.insert(values, value)
        table.insert(placeholders, "?")
    end
    
    local sql = string.format("INSERT INTO `%s` (%s) VALUES (%s)",
        table_name,
        table.concat(fields, ", "),
        table.concat(placeholders, ", ")
    )
    
    return M.query(sql, table.unpack(values))
end

-- 更新数据
function M.update(table_name, data, where_clause, ...)
    if not table_name or not data or not where_clause then
        return nil, "Table name, data and where clause are required"
    end

    local set_parts = {}
    local values = {}

    for field, value in pairs(data) do
        table.insert(set_parts, "`" .. field .. "` = ?")
        table.insert(values, value)
    end

    -- 添加where条件的参数
    local params = {...}
    if #params > 0 then
        for _, param in ipairs(params) do
            table.insert(values, param)
        end
    end
    
    local sql = string.format("UPDATE `%s` SET %s WHERE %s",
        table_name,
        table.concat(set_parts, ", "),
        where_clause
    )
    
    return M.query(sql, table.unpack(values))
end

-- 删除数据
function M.delete(table_name, where_clause, ...)
    if not table_name or not where_clause then
        return nil, "Table name and where clause are required"
    end
    
    local sql = string.format("DELETE FROM `%s` WHERE %s", table_name, where_clause)
    return M.query(sql, ...)
end

-- 查询单条记录
function M.find_one(table_name, where_clause, ...)
    if not table_name then
        return nil, "Table name is required"
    end
    
    local sql = string.format("SELECT * FROM `%s`", table_name)
    if where_clause then
        sql = sql .. " WHERE " .. where_clause
    end
    sql = sql .. " LIMIT 1"
    
    local result, err = M.query(sql, ...)
    if not result then
        return nil, err
    end
    
    return result[1]
end

-- 查询多条记录
function M.find_all(table_name, where_clause, order_by, limit, ...)
    if not table_name then
        return nil, "Table name is required"
    end
    
    local sql = string.format("SELECT * FROM `%s`", table_name)
    if where_clause then
        sql = sql .. " WHERE " .. where_clause
    end
    if order_by then
        sql = sql .. " ORDER BY " .. order_by
    end
    if limit then
        sql = sql .. " LIMIT " .. limit
    end
    
    return M.query(sql, ...)
end

-- 获取统计信息
function M.get_stats()
    return {
        total_queries = stats.total_queries,
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
    skynet.error("MySQL connection pool cleaned up")
end

-- 健康检查
function M.health_check()
    local db = get_connection()
    if not db then
        return false, "Failed to get connection"
    end
    
    local ok, result = pcall(function()
        return db:query("SELECT 1 as health")
    end)
    
    return_connection(db)
    
    if not ok then
        return false, result
    end
    
    return result and result[1] and result[1].health == 1, "OK"
end

return M
