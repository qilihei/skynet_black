System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, EventManager, _dec, _class, _class2, _crd, ccclass, GameDataEvent, GameDataManager;

  function _reportPossibleCrUseOfEventManager(extras) {
    _reporterNs.report("EventManager", "./EventManager", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
    }, function (_unresolved_2) {
      EventManager = _unresolved_2.EventManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "a19b93wfGpCx4IBTOU74zzO", "GameDataManager", undefined);

      __checkObsolete__(['_decorator']);

      ({
        ccclass
      } = _decorator);

      _export("GameDataEvent", GameDataEvent = /*#__PURE__*/function (GameDataEvent) {
        GameDataEvent["PLAYER_DATA_UPDATED"] = "player_data_updated";
        GameDataEvent["FARM_DATA_UPDATED"] = "farm_data_updated";
        GameDataEvent["INVENTORY_UPDATED"] = "inventory_updated";
        return GameDataEvent;
      }({}));

      _export("GameDataManager", GameDataManager = (_dec = ccclass('GameDataManager'), _dec(_class = (_class2 = class GameDataManager {
        static getInstance() {
          if (!GameDataManager.instance) {
            GameDataManager.instance = new GameDataManager();
          }

          return GameDataManager.instance;
        }

        constructor() {
          this.eventManager = void 0;
          // 游戏数据
          this.playerData = null;
          this.farmData = null;
          this.inventory = [];
          this.sessionToken = '';
          this.eventManager = (_crd && EventManager === void 0 ? (_reportPossibleCrUseOfEventManager({
            error: Error()
          }), EventManager) : EventManager).getInstance();
        } // 设置会话令牌


        setSessionToken(token) {
          this.sessionToken = token; // 保存到本地存储

          localStorage.setItem('session_token', token);
        } // 获取会话令牌


        getSessionToken() {
          if (!this.sessionToken) {
            this.sessionToken = localStorage.getItem('session_token') || '';
          }

          return this.sessionToken;
        } // 清除会话令牌


        clearSessionToken() {
          this.sessionToken = '';
          localStorage.removeItem('session_token');
        } // 设置玩家数据


        setPlayerData(data) {
          var _data$position, _data$position2, _data$position3, _data$position4;

          this.playerData = {
            id: data.id || data.player_id,
            name: data.name,
            level: data.level,
            gold: data.gold,
            energy: data.energy,
            maxEnergy: data.max_energy || data.maxEnergy,
            avatarId: data.avatar_id || data.avatarId,
            position: {
              x: data.x_position || ((_data$position = data.position) == null ? void 0 : _data$position.x) || 0,
              y: data.y_position || ((_data$position2 = data.position) == null ? void 0 : _data$position2.y) || 0,
              mapId: data.map_id || ((_data$position3 = data.position) == null ? void 0 : _data$position3.map_id) || ((_data$position4 = data.position) == null ? void 0 : _data$position4.mapId) || 1
            }
          };
          this.eventManager.emit(GameDataEvent.PLAYER_DATA_UPDATED, this.playerData);
        } // 获取玩家数据


        getPlayerData() {
          return this.playerData;
        } // 更新玩家位置


        updatePlayerPosition(x, y, mapId) {
          if (this.playerData) {
            this.playerData.position.x = x;
            this.playerData.position.y = y;

            if (mapId !== undefined) {
              this.playerData.position.mapId = mapId;
            }

            this.eventManager.emit(GameDataEvent.PLAYER_DATA_UPDATED, this.playerData);
          }
        } // 更新玩家金币


        updatePlayerGold(gold) {
          if (this.playerData) {
            this.playerData.gold = gold;
            this.eventManager.emit(GameDataEvent.PLAYER_DATA_UPDATED, this.playerData);
          }
        } // 更新玩家体力


        updatePlayerEnergy(energy) {
          if (this.playerData) {
            this.playerData.energy = energy;
            this.eventManager.emit(GameDataEvent.PLAYER_DATA_UPDATED, this.playerData);
          }
        } // 设置农场数据


        setFarmData(data) {
          var _data$size, _data$size2;

          this.farmData = {
            farmId: data.farm_id || data.farmId,
            name: data.name,
            level: data.level,
            size: {
              width: ((_data$size = data.size) == null ? void 0 : _data$size.width) || 10,
              height: ((_data$size2 = data.size) == null ? void 0 : _data$size2.height) || 10
            },
            plots: data.plots || [],
            buildings: data.buildings || [],
            moneyEarned: data.money_earned || data.moneyEarned || 0
          };
          this.eventManager.emit(GameDataEvent.FARM_DATA_UPDATED, this.farmData);
        } // 获取农场数据


        getFarmData() {
          return this.farmData;
        } // 设置背包数据


        setInventory(items) {
          this.inventory = items || [];
          this.eventManager.emit(GameDataEvent.INVENTORY_UPDATED, this.inventory);
        } // 获取背包数据


        getInventory() {
          return this.inventory;
        } // 添加物品到背包


        addItemToInventory(item) {
          this.inventory.push(item);
          this.eventManager.emit(GameDataEvent.INVENTORY_UPDATED, this.inventory);
        } // 从背包移除物品


        removeItemFromInventory(slot) {
          const index = this.inventory.findIndex(item => item.slot === slot);

          if (index !== -1) {
            this.inventory.splice(index, 1);
            this.eventManager.emit(GameDataEvent.INVENTORY_UPDATED, this.inventory);
          }
        } // 更新背包物品


        updateInventoryItem(slot, quantity) {
          const item = this.inventory.find(item => item.slot === slot);

          if (item) {
            item.quantity = quantity;

            if (quantity <= 0) {
              this.removeItemFromInventory(slot);
            } else {
              this.eventManager.emit(GameDataEvent.INVENTORY_UPDATED, this.inventory);
            }
          }
        } // 检查是否已登录


        isLoggedIn() {
          return this.playerData !== null && this.sessionToken !== '';
        } // 清除所有数据


        clearAllData() {
          this.playerData = null;
          this.farmData = null;
          this.inventory = [];
          this.clearSessionToken();
          this.eventManager.emit(GameDataEvent.PLAYER_DATA_UPDATED, null);
          this.eventManager.emit(GameDataEvent.FARM_DATA_UPDATED, null);
          this.eventManager.emit(GameDataEvent.INVENTORY_UPDATED, []);
        } // 保存数据到本地存储


        saveToLocal() {
          try {
            if (this.playerData) {
              localStorage.setItem('player_data', JSON.stringify(this.playerData));
            }

            if (this.farmData) {
              localStorage.setItem('farm_data', JSON.stringify(this.farmData));
            }

            if (this.inventory.length > 0) {
              localStorage.setItem('inventory_data', JSON.stringify(this.inventory));
            }
          } catch (error) {
            console.error('Failed to save data to local storage:', error);
          }
        } // 从本地存储加载数据


        loadFromLocal() {
          try {
            const playerDataStr = localStorage.getItem('player_data');

            if (playerDataStr) {
              this.playerData = JSON.parse(playerDataStr);
              this.eventManager.emit(GameDataEvent.PLAYER_DATA_UPDATED, this.playerData);
            }

            const farmDataStr = localStorage.getItem('farm_data');

            if (farmDataStr) {
              this.farmData = JSON.parse(farmDataStr);
              this.eventManager.emit(GameDataEvent.FARM_DATA_UPDATED, this.farmData);
            }

            const inventoryDataStr = localStorage.getItem('inventory_data');

            if (inventoryDataStr) {
              this.inventory = JSON.parse(inventoryDataStr);
              this.eventManager.emit(GameDataEvent.INVENTORY_UPDATED, this.inventory);
            }
          } catch (error) {
            console.error('Failed to load data from local storage:', error);
          }
        }

      }, _class2.instance = void 0, _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=5f28bb5619e49bf75f267640dc1b33a8c52ee460.js.map