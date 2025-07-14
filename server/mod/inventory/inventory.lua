-- 背包模块
-- 负责物品管理、背包操作等功能

local skynet = require "skynet"
local pb = require "pb"
local protocol = require "protocol"

local inventory = {}
local db_service = nil
local gateway_service = nil

-- 物品配置
local item_config = {
    -- 种子类
    [1001] = {id = 1001, name = "萝卜种子", type = "seed", max_stack = 99, price = 10},
    [1002] = {id = 1002, name = "土豆种子", type = "seed", max_stack = 99, price = 20},
    [1003] = {id = 1003, name = "玉米种子", type = "seed", max_stack = 99, price = 40},
    [1004] = {id = 1004, name = "小麦种子", type = "seed", max_stack = 99, price = 80},
    
    -- 作物类
    [2001] = {id = 2001, name = "萝卜", type = "crop", max_stack = 99, price = 20},
    [2002] = {id = 2002, name = "土豆", type = "crop", max_stack = 99, price = 35},
    [2003] = {id = 2003, name = "玉米", type = "crop", max_stack = 99, price = 60},
    [2004] = {id = 2004, name = "小麦", type = "crop", max_stack = 99, price = 100},
    
    -- 工具类
    [3001] = {id = 3001, name = "基础锄头", type = "tool", max_stack = 1, price = 100},
    [3002] = {id = 3002, name = "基础水壶", type = "tool", max_stack = 1, price = 80},
    [3003] = {id = 3003, name = "高级锄头", type = "tool", max_stack = 1, price = 500},
    [3004] = {id = 3004, name = "高级水壶", type = "tool", max_stack = 1, price = 400},
    
    -- 材料类
    [4001] = {id = 4001, name = "木材", type = "material", max_stack = 99, price = 5},
    [4002] = {id = 4002, name = "石头", type = "material", max_stack = 99, price = 3},
    [4003] = {id = 4003, name = "铁矿", type = "material", max_stack = 99, price = 15},
    [4004] = {id = 4004, name = "金矿", type = "material", max_stack = 99, price = 50}
}

-- 初始化背包模块
function inventory.init(db, gateway)
    db_service = db
    gateway_service = gateway
    skynet.error("Inventory module initialized")
end

-- 用户上线处理
function inventory.on_user_online(user_id, user_data)
    -- 可以在这里做一些背包数据的预处理
end

-- 用户下线处理
function inventory.on_user_offline(user_id)
    -- 保存背包数据
    inventory.save_inventory_data(user_id)
end

-- 处理消息
function inventory.process_message(request)
    local user_id = request.user_id
    local msg_id = request.msg_id
    local data = request.data
    
    if msg_id == protocol.MSG_GET_INVENTORY then
        inventory.handle_get_inventory(request)
    elseif msg_id == protocol.MSG_USE_ITEM then
        inventory.handle_use_item(request)
    elseif msg_id == protocol.MSG_SORT_INVENTORY then
        inventory.handle_sort_inventory(request)
    elseif msg_id == protocol.MSG_EXPAND_INVENTORY then
        inventory.handle_expand_inventory(request)
    else
        skynet.error("Unknown inventory message:", msg_id)
    end
end

-- 获取背包信息
function inventory.handle_get_inventory(request)
    local user_id = request.user_id
    local conn_id = request.conn_id
    
    -- 获取背包基础信息
    local inventory_info = skynet.call(db_service, "lua", "get_user_inventory", user_id)
    if not inventory_info then
        return inventory.send_error(conn_id, "Inventory not found")
    end
    
    -- 获取物品列表
    local items = skynet.call(db_service, "lua", "get_user_items", user_id) or {}
    
    -- 构造响应
    local response = {
        max_slots = inventory_info.max_slots,
        used_slots = #items,
        items = {}
    }
    
    for _, item in ipairs(items) do
        local item_info = item_config[item.item_id]
        if item_info then
            table.insert(response.items, {
                item_id = item.item_id,
                quantity = item.quantity,
                slot_id = item.slot_id or 0
            })
        end
    end
    
    local response_data = pb.encode("InventoryResponse", response)
    skynet.call(gateway_service, "lua", "send_to_client", conn_id, protocol.MSG_INVENTORY_RESPONSE, response_data)
end

-- 使用物品
function inventory.handle_use_item(request)
    local user_id = request.user_id
    local conn_id = request.conn_id
    local data = request.data
    
    local use_req = pb.decode("UseItemRequest", data)
    if not use_req then
        return inventory.send_error(conn_id, "Invalid use item request")
    end
    
    local item_id = use_req.item_id
    local quantity = use_req.quantity or 1
    
    -- 验证物品配置
    local item_info = item_config[item_id]
    if not item_info then
        return inventory.send_error(conn_id, "Invalid item id")
    end
    
    -- 检查是否有足够的物品
    local user_items = skynet.call(db_service, "lua", "get_user_items", user_id)
    local has_item = false
    local current_quantity = 0
    
    for _, item in ipairs(user_items or {}) do
        if item.item_id == item_id then
            current_quantity = item.quantity
            if current_quantity >= quantity then
                has_item = true
            end
            break
        end
    end
    
    if not has_item then
        return inventory.send_error(conn_id, "Not enough items")
    end
    
    -- 根据物品类型执行不同的使用逻辑
    local use_result = inventory.use_item_by_type(user_id, item_id, quantity, item_info)
    if not use_result.success then
        return inventory.send_error(conn_id, use_result.error or "Failed to use item")
    end
    
    -- 消耗物品
    local success = skynet.call(db_service, "lua", "remove_user_item", user_id, item_id, quantity)
    if not success then
        return inventory.send_error(conn_id, "Failed to consume item")
    end
    
    -- 发送成功响应
    local response = {
        success = true,
        item_id = item_id,
        quantity_used = quantity,
        effect = use_result.effect or ""
    }
    
    local response_data = pb.encode("UseItemResponse", response)
    skynet.call(gateway_service, "lua", "send_to_client", conn_id, protocol.MSG_USE_ITEM_RESPONSE, response_data)
    
    skynet.error("User used item:", user_id, item_id, quantity)
end

-- 根据物品类型使用物品
function inventory.use_item_by_type(user_id, item_id, quantity, item_info)
    local item_type = item_info.type
    
    if item_type == "seed" then
        -- 种子类物品不能直接使用，需要在农场种植
        return {success = false, error = "Seeds must be planted in farm"}
        
    elseif item_type == "crop" then
        -- 作物类物品可以直接出售获得金币
        local coins = item_info.price * quantity
        inventory.add_user_coins(user_id, coins)
        return {success = true, effect = "Sold for " .. coins .. " coins"}
        
    elseif item_type == "tool" then
        -- 工具类物品装备到工具栏
        inventory.equip_tool(user_id, item_id)
        return {success = true, effect = "Tool equipped"}
        
    elseif item_type == "material" then
        -- 材料类物品可以用于制作或出售
        local coins = item_info.price * quantity
        inventory.add_user_coins(user_id, coins)
        return {success = true, effect = "Sold for " .. coins .. " coins"}
        
    else
        return {success = false, error = "Unknown item type"}
    end
end

-- 整理背包
function inventory.handle_sort_inventory(request)
    local user_id = request.user_id
    local conn_id = request.conn_id
    
    -- TODO: 实现背包整理逻辑
    -- 按物品类型和ID排序，合并相同物品
    
    local response = {
        success = true
    }
    
    local response_data = pb.encode("SortInventoryResponse", response)
    skynet.call(gateway_service, "lua", "send_to_client", conn_id, protocol.MSG_SORT_INVENTORY_RESPONSE, response_data)
end

-- 扩展背包
function inventory.handle_expand_inventory(request)
    local user_id = request.user_id
    local conn_id = request.conn_id
    
    -- TODO: 实现背包扩展逻辑
    -- 需要消耗宝石来增加背包容量
    
    inventory.send_error(conn_id, "Inventory expansion not implemented yet")
end

-- 添加物品到背包
function inventory.add_item(user_id, item_id, quantity)
    local item_info = item_config[item_id]
    if not item_info then
        return false, "Invalid item id"
    end
    
    -- 检查背包容量
    local inventory_info = skynet.call(db_service, "lua", "get_user_inventory", user_id)
    local current_items = skynet.call(db_service, "lua", "get_user_items", user_id) or {}
    
    if #current_items >= inventory_info.max_slots then
        return false, "Inventory is full"
    end
    
    -- 添加物品
    local success = skynet.call(db_service, "lua", "add_user_item", user_id, item_id, quantity)
    return success, success and "Item added" or "Failed to add item"
end

-- 移除物品
function inventory.remove_item(user_id, item_id, quantity)
    local success = skynet.call(db_service, "lua", "remove_user_item", user_id, item_id, quantity)
    return success
end

-- 检查是否有指定物品
function inventory.has_item(user_id, item_id, quantity)
    local user_items = skynet.call(db_service, "lua", "get_user_items", user_id)
    
    for _, item in ipairs(user_items or {}) do
        if item.item_id == item_id and item.quantity >= quantity then
            return true
        end
    end
    
    return false
end

-- 装备工具
function inventory.equip_tool(user_id, tool_id)
    -- TODO: 实现工具装备逻辑
    skynet.error("Tool equipped:", user_id, tool_id)
end

-- 增加用户金币
function inventory.add_user_coins(user_id, coins)
    -- TODO: 调用用户模块增加金币
    skynet.error("Add coins:", user_id, coins)
end

-- 保存背包数据
function inventory.save_inventory_data(user_id)
    -- 背包数据实时保存到数据库，这里可以做一些缓存清理
end

-- 发送错误消息
function inventory.send_error(conn_id, error_msg)
    local error_data = pb.encode("ErrorResponse", {
        code = 1,
        message = error_msg
    })
    skynet.call(gateway_service, "lua", "send_to_client", conn_id, protocol.MSG_ERROR, error_data)
end

-- 获取物品配置
function inventory.get_item_config(item_id)
    return item_config[item_id]
end

-- 获取所有物品配置
function inventory.get_all_item_config()
    return item_config
end

return inventory
