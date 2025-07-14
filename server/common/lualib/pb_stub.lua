-- lua-protobuf 临时存根文件
-- 用于在没有编译lua-protobuf时提供基本功能，避免启动错误

local M = {}

-- 存根函数，避免调用时出错
function M.decode(...)
    error("protobuf功能未启用，请编译lua-protobuf库")
end

function M.encode(...)
    error("protobuf功能未启用，请编译lua-protobuf库")
end

function M.load(...)
    error("protobuf功能未启用，请编译lua-protobuf库")
end

function M.loadfile(...)
    error("protobuf功能未启用，请编译lua-protobuf库")
end

-- 提供一个检查函数
function M.is_available()
    return false
end

return M
