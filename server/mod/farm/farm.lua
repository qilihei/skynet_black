-- 农场模块
-- 负责农场相关功能：种植、收获、动物养殖等

local skynet = require "skynet"
local pb = require "pb"
local protocol = require "protocol"

local farm = {}
local db_service = nil
local gateway_service = nil

-- 作物配置
local crop_config = {
    [1001] = {id = 1001, name = "萝卜", grow_time = 300, yield = {2001, 1}, exp = 10, price = 20},
    [1002] = {id = 1002, name = "土豆", grow_time = 600, yield = {2002, 2}, exp = 20, price = 35},
    [1003] = {id = 1003, name = "玉米", grow_time = 1200, yield = {2003, 3}, exp = 40, price = 60},
    [1004] = {id = 1004, name = "小麦", grow_time = 1800, yield = {2004, 4}, exp = 60, price = 100}
}

-- 初始化农场模块
function farm.init(db, gateway)
    db_service = db
    gateway_service = gateway
    skynet.error("Farm module initialized")
end

-- 用户上线处理
function farm.on_user_online(user_id, user_data)
    -- 检查作物成熟状态
    farm.check_crop_maturity(user_id)
end

-- 用户下线处理
function farm.on_user_offline(user_id)
    -- 保存农场数据
    farm.save_farm_data(user_id)
end

-- 处理消息
function farm.process_message(request)
    local user_id = request.user_id
    local msg_id = request.msg_id
    local data = request.data
    
    if msg_id == protocol.MSG_GET_FARM_INFO then
        farm.handle_get_farm_info(request)
    elseif msg_id == protocol.MSG_PLANT_CROP then
        farm.handle_plant_crop(request)
    elseif msg_id == protocol.MSG_HARVEST_CROP then
        farm.handle_harvest_crop(request)
    elseif msg_id == protocol.MSG_WATER_CROP then
        farm.handle_water_crop(request)
    elseif msg_id == protocol.MSG_EXPAND_FARM then
        farm.handle_expand_farm(request)
    else
        skynet.error("Unknown farm message:", msg_id)
    end
end

-- 获取农场信息
function farm.handle_get_farm_info(request)
    local user_id = request.user_id
    local conn_id = request.conn_id
    
    -- 获取农场基础信息
    local farm_info = skynet.call(db_service, "lua", "get_user_farm", user_id)
    if not farm_info then
        farm.send_error(conn_id, "Farm not found")
        return
    end
    
    -- 获取地块信息
    local plots = skynet.call(db_service, "lua", "get_user_plots", user_id) or {}
    
    -- 检查作物成熟状态
    local current_time = skynet.time()
    for _, plot in ipairs(plots) do
        if plot.status == "growing" and plot.plant_time then
            local crop = crop_config[plot.crop_id]
            if crop and current_time - plot.plant_time >= crop.grow_time then
                plot.status = "mature"
            end
        end
    end
    
    -- 构造响应
    local response = {
        farm_level = farm_info.farm_level,
        farm_exp = farm_info.farm_exp,
        max_plots = farm_info.max_plots,
        plots = {}
    }
    
    for _, plot in ipairs(plots) do
        table.insert(response.plots, {
            plot_id = plot.plot_id,
            crop_id = plot.crop_id or 0,
            status = plot.status or "empty",
            plant_time = plot.plant_time or 0,
            water_level = plot.water_level or 0
        })
    end
    
    local response_data = pb.encode("FarmInfoResponse", response)
    skynet.call(gateway_service, "lua", "send_to_client", conn_id, protocol.MSG_FARM_INFO_RESPONSE, response_data)
end

-- 种植作物
function farm.handle_plant_crop(request)
    local user_id = request.user_id
    local conn_id = request.conn_id
    local data = request.data
    
    local plant_req = pb.decode("PlantCropRequest", data)
    if not plant_req then
        return farm.send_error(conn_id, "Invalid plant request")
    end
    
    local plot_id = plant_req.plot_id
    local crop_id = plant_req.crop_id
    
    -- 验证作物配置
    local crop = crop_config[crop_id]
    if not crop then
        return farm.send_error(conn_id, "Invalid crop id")
    end
    
    -- 检查是否有种子
    local user_items = skynet.call(db_service, "lua", "get_user_items", user_id)
    local has_seed = false
    for _, item in ipairs(user_items or {}) do
        if item.item_id == crop_id and item.quantity > 0 then
            has_seed = true
            break
        end
    end
    
    if not has_seed then
        return farm.send_error(conn_id, "No seeds available")
    end
    
    -- 检查地块状态
    local plots = skynet.call(db_service, "lua", "get_user_plots", user_id) or {}
    local target_plot = nil
    for _, plot in ipairs(plots) do
        if plot.plot_id == plot_id then
            target_plot = plot
            break
        end
    end
    
    if target_plot and target_plot.status ~= "empty" then
        return farm.send_error(conn_id, "Plot is not empty")
    end
    
    -- 消耗种子
    local success = skynet.call(db_service, "lua", "remove_user_item", user_id, crop_id, 1)
    if not success then
        return farm.send_error(conn_id, "Failed to consume seed")
    end
    
    -- 种植作物
    local plant_time = skynet.time()
    skynet.call(db_service, "lua", "plant_crop", user_id, plot_id, crop_id, plant_time)
    
    -- 发送成功响应
    local response = {
        success = true,
        plot_id = plot_id,
        crop_id = crop_id,
        plant_time = plant_time
    }
    
    local response_data = pb.encode("PlantCropResponse", response)
    skynet.call(gateway_service, "lua", "send_to_client", conn_id, protocol.MSG_PLANT_CROP_RESPONSE, response_data)
    
    skynet.error("User planted crop:", user_id, plot_id, crop_id)
end

-- 收获作物
function farm.handle_harvest_crop(request)
    local user_id = request.user_id
    local conn_id = request.conn_id
    local data = request.data
    
    local harvest_req = pb.decode("HarvestCropRequest", data)
    if not harvest_req then
        return farm.send_error(conn_id, "Invalid harvest request")
    end
    
    local plot_id = harvest_req.plot_id
    
    -- 获取地块信息
    local plots = skynet.call(db_service, "lua", "get_user_plots", user_id) or {}
    local target_plot = nil
    for _, plot in ipairs(plots) do
        if plot.plot_id == plot_id then
            target_plot = plot
            break
        end
    end
    
    if not target_plot or target_plot.status ~= "growing" then
        return farm.send_error(conn_id, "No crop to harvest")
    end
    
    -- 检查作物是否成熟
    local crop = crop_config[target_plot.crop_id]
    if not crop then
        return farm.send_error(conn_id, "Invalid crop")
    end
    
    local current_time = skynet.time()
    if current_time - target_plot.plant_time < crop.grow_time then
        return farm.send_error(conn_id, "Crop is not mature yet")
    end
    
    -- 收获作物
    skynet.call(db_service, "lua", "harvest_crop", user_id, plot_id)
    
    -- 给予收获物品
    local yield_item_id = crop.yield[1]
    local yield_quantity = crop.yield[2]
    skynet.call(db_service, "lua", "add_user_item", user_id, yield_item_id, yield_quantity)
    
    -- 给予经验和金币
    farm.add_farm_exp(user_id, crop.exp)
    farm.add_user_coins(user_id, crop.price)
    
    -- 发送成功响应
    local response = {
        success = true,
        plot_id = plot_id,
        yield_item_id = yield_item_id,
        yield_quantity = yield_quantity,
        exp_gained = crop.exp,
        coins_gained = crop.price
    }
    
    local response_data = pb.encode("HarvestCropResponse", response)
    skynet.call(gateway_service, "lua", "send_to_client", conn_id, protocol.MSG_HARVEST_CROP_RESPONSE, response_data)
    
    skynet.error("User harvested crop:", user_id, plot_id, yield_item_id, yield_quantity)
end

-- 浇水
function farm.handle_water_crop(request)
    local user_id = request.user_id
    local conn_id = request.conn_id
    local data = request.data
    
    local water_req = pb.decode("WaterCropRequest", data)
    if not water_req then
        return farm.send_error(conn_id, "Invalid water request")
    end
    
    local plot_id = water_req.plot_id
    
    -- TODO: 实现浇水逻辑
    -- 浇水可以加速作物生长或提高产量
    
    local response = {
        success = true,
        plot_id = plot_id
    }
    
    local response_data = pb.encode("WaterCropResponse", response)
    skynet.call(gateway_service, "lua", "send_to_client", conn_id, protocol.MSG_WATER_CROP_RESPONSE, response_data)
end

-- 扩展农场
function farm.handle_expand_farm(request)
    local user_id = request.user_id
    local conn_id = request.conn_id
    
    -- TODO: 实现农场扩展逻辑
    -- 需要消耗金币或宝石来增加地块数量
    
    farm.send_error(conn_id, "Farm expansion not implemented yet")
end

-- 检查作物成熟状态
function farm.check_crop_maturity(user_id)
    local plots = skynet.call(db_service, "lua", "get_user_plots", user_id) or {}
    local current_time = skynet.time()
    local mature_plots = {}
    
    for _, plot in ipairs(plots) do
        if plot.status == "growing" and plot.plant_time then
            local crop = crop_config[plot.crop_id]
            if crop and current_time - plot.plant_time >= crop.grow_time then
                table.insert(mature_plots, plot.plot_id)
            end
        end
    end
    
    -- 如果有成熟的作物，通知客户端
    if #mature_plots > 0 then
        -- TODO: 发送作物成熟通知
    end
end

-- 增加农场经验
function farm.add_farm_exp(user_id, exp)
    -- TODO: 实现农场经验和升级逻辑
end

-- 增加用户金币
function farm.add_user_coins(user_id, coins)
    -- TODO: 实现金币增加逻辑
end

-- 保存农场数据
function farm.save_farm_data(user_id)
    -- 农场数据实时保存到数据库，这里可以做一些缓存清理
end

-- 发送错误消息
function farm.send_error(conn_id, error_msg)
    local error_data = pb.encode("ErrorResponse", {
        code = 1,
        message = error_msg
    })
    skynet.call(gateway_service, "lua", "send_to_client", conn_id, protocol.MSG_ERROR, error_data)
end

return farm
