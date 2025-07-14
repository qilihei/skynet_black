-- 心桥物语游戏数据库初始化脚本
-- 创建数据库和表结构

CREATE DATABASE IF NOT EXISTS heartbridge_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE heartbridge_game;

-- 用户基础表
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(32) NOT NULL,
    email VARCHAR(100) DEFAULT '',
    nickname VARCHAR(50) DEFAULT '',
    avatar INT DEFAULT 1,
    status TINYINT DEFAULT 1 COMMENT '1=正常, 0=禁用',
    level INT DEFAULT 1,
    exp BIGINT DEFAULT 0,
    coins BIGINT DEFAULT 1000,
    gems BIGINT DEFAULT 0,
    create_time BIGINT NOT NULL,
    last_login_time BIGINT DEFAULT 0,
    last_device_id VARCHAR(100) DEFAULT '',
    INDEX idx_username (username),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 玩家扩展信息表
CREATE TABLE IF NOT EXISTS player_info (
    user_id BIGINT PRIMARY KEY,
    energy INT DEFAULT 100,
    max_energy INT DEFAULT 100,
    last_energy_time BIGINT DEFAULT 0,
    tutorial_step INT DEFAULT 0,
    settings JSON DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户背包表
CREATE TABLE IF NOT EXISTS user_inventories (
    user_id BIGINT PRIMARY KEY,
    max_slots INT DEFAULT 20,
    create_time BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户物品表
CREATE TABLE IF NOT EXISTS user_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    slot_id INT DEFAULT 0,
    create_time BIGINT NOT NULL,
    update_time BIGINT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_item (user_id, item_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户农场表
CREATE TABLE IF NOT EXISTS user_farms (
    user_id BIGINT PRIMARY KEY,
    farm_level INT DEFAULT 1,
    farm_exp BIGINT DEFAULT 0,
    max_plots INT DEFAULT 9,
    create_time BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户地块表
CREATE TABLE IF NOT EXISTS user_plots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plot_id INT NOT NULL,
    crop_id INT DEFAULT NULL,
    status ENUM('empty', 'growing', 'mature') DEFAULT 'empty',
    plant_time BIGINT DEFAULT NULL,
    water_level INT DEFAULT 0,
    fertilizer_level INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_plot (user_id, plot_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户动物表
CREATE TABLE IF NOT EXISTS user_animals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    animal_id INT NOT NULL,
    animal_type INT NOT NULL,
    name VARCHAR(50) DEFAULT '',
    happiness INT DEFAULT 50,
    hunger INT DEFAULT 50,
    last_feed_time BIGINT DEFAULT 0,
    last_product_time BIGINT DEFAULT 0,
    create_time BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 好友关系表
CREATE TABLE IF NOT EXISTS user_friends (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    friend_id BIGINT NOT NULL,
    status TINYINT DEFAULT 1 COMMENT '1=好友, 0=已删除',
    create_time BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_friend (user_id, friend_id),
    INDEX idx_user_id (user_id),
    INDEX idx_friend_id (friend_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 聊天消息表
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT DEFAULT NULL,
    channel TINYINT NOT NULL COMMENT '1=世界, 2=私聊, 3=公会',
    content TEXT NOT NULL,
    create_time BIGINT NOT NULL,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_channel_time (channel, create_time),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 任务表
CREATE TABLE IF NOT EXISTS quests (
    quest_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    type TINYINT NOT NULL COMMENT '1=主线, 2=支线, 3=日常',
    level_required INT DEFAULT 1,
    prerequisites JSON DEFAULT NULL,
    objectives JSON NOT NULL,
    rewards JSON NOT NULL,
    is_active TINYINT DEFAULT 1,
    create_time BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户任务表
CREATE TABLE IF NOT EXISTS user_quests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    quest_id INT NOT NULL,
    status TINYINT DEFAULT 1 COMMENT '1=进行中, 2=已完成, 3=已放弃',
    progress JSON DEFAULT NULL,
    accept_time BIGINT NOT NULL,
    complete_time BIGINT DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (quest_id) REFERENCES quests(quest_id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_quest (user_id, quest_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 商店表
CREATE TABLE IF NOT EXISTS shop_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    price INT NOT NULL,
    currency_type TINYINT NOT NULL COMMENT '1=金币, 2=宝石',
    stock INT DEFAULT -1 COMMENT '-1=无限',
    is_active TINYINT DEFAULT 1,
    create_time BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 交易记录表
CREATE TABLE IF NOT EXISTS trade_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    trade_type TINYINT NOT NULL COMMENT '1=购买, 2=出售',
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    price INT NOT NULL,
    currency_type TINYINT NOT NULL,
    create_time BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 游戏日志表
CREATE TABLE IF NOT EXISTS game_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT DEFAULT NULL,
    log_type VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details JSON DEFAULT NULL,
    create_time BIGINT NOT NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_log_type (log_type),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入初始数据

-- 插入初始任务
INSERT INTO quests (title, description, type, level_required, objectives, rewards, create_time) VALUES
('新手教程', '欢迎来到心桥物语！让我们开始你的农场生活吧。', 1, 1, 
 '{"plant_crop": {"target": 1, "description": "种植一个作物"}}',
 '{"coins": 100, "exp": 50, "items": [{"item_id": 1001, "quantity": 5}]}',
 UNIX_TIMESTAMP()),
('第一次收获', '收获你种植的第一个作物。', 1, 1,
 '{"harvest_crop": {"target": 1, "description": "收获一个作物"}}',
 '{"coins": 200, "exp": 100}',
 UNIX_TIMESTAMP()),
('扩展农场', '购买更多的地块来扩展你的农场。', 2, 3,
 '{"expand_farm": {"target": 1, "description": "扩展农场一次"}}',
 '{"coins": 500, "exp": 200}',
 UNIX_TIMESTAMP());

-- 插入商店物品
INSERT INTO shop_items (item_id, price, currency_type, create_time) VALUES
(1001, 10, 1, UNIX_TIMESTAMP()),  -- 萝卜种子
(1002, 20, 1, UNIX_TIMESTAMP()),  -- 土豆种子
(1003, 40, 1, UNIX_TIMESTAMP()),  -- 玉米种子
(1004, 80, 1, UNIX_TIMESTAMP()),  -- 小麦种子
(3001, 100, 1, UNIX_TIMESTAMP()), -- 基础锄头
(3002, 80, 1, UNIX_TIMESTAMP()),  -- 基础水壶
(3003, 500, 2, UNIX_TIMESTAMP()), -- 高级锄头
(3004, 400, 2, UNIX_TIMESTAMP()); -- 高级水壶

-- 创建索引优化查询性能
CREATE INDEX idx_users_level ON users(level);
CREATE INDEX idx_user_items_item_id ON user_items(item_id);
CREATE INDEX idx_user_plots_crop_id ON user_plots(crop_id);
CREATE INDEX idx_chat_messages_channel_receiver ON chat_messages(channel, receiver_id);

COMMIT;
