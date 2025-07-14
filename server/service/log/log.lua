-- 日志服务
-- 负责统一的日志管理和输出

local skynet = require "skynet"

local log = {}

-- 日志级别
local LOG_LEVELS = {
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4,
    FATAL = 5
}

-- 当前日志级别
local current_level = LOG_LEVELS.DEBUG

-- 日志格式化
local function format_log(level, source, ...)
    local timestamp = os.date("%Y-%m-%d %H:%M:%S")
    local level_name = ""
    
    for name, value in pairs(LOG_LEVELS) do
        if value == level then
            level_name = name
            break
        end
    end
    
    local message = table.concat({...}, " ")
    return string.format("[%s] [%s] [%s] %s", timestamp, level_name, source or "UNKNOWN", message)
end

-- 写入日志
local function write_log(level, source, ...)
    if level >= current_level then
        local formatted = format_log(level, source, ...)
        skynet.error(formatted)
    end
end

-- 服务命令处理
local CMD = {}

function CMD.debug(source, ...)
    write_log(LOG_LEVELS.DEBUG, source, ...)
end

function CMD.info(source, ...)
    write_log(LOG_LEVELS.INFO, source, ...)
end

function CMD.warn(source, ...)
    write_log(LOG_LEVELS.WARN, source, ...)
end

function CMD.error(source, ...)
    write_log(LOG_LEVELS.ERROR, source, ...)
end

function CMD.fatal(source, ...)
    write_log(LOG_LEVELS.FATAL, source, ...)
end

function CMD.set_level(level)
    if type(level) == "string" then
        level = LOG_LEVELS[level:upper()]
    end
    
    if level and level >= LOG_LEVELS.DEBUG and level <= LOG_LEVELS.FATAL then
        current_level = level
        return true
    end
    
    return false
end

function CMD.get_level()
    return current_level
end

-- 服务启动
skynet.start(function()
    skynet.error("Log service started")
    
    skynet.dispatch("lua", function(session, address, cmd, ...)
        local f = CMD[cmd]
        if f then
            skynet.ret(skynet.pack(f(...)))
        else
            skynet.error("Unknown command:", cmd)
            skynet.ret(skynet.pack(false))
        end
    end)
end)
