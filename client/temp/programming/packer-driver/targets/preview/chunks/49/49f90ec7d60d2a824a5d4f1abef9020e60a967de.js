System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Label, Button, Vec3, tween, NetworkManager, NetworkEvent, ProtocolManager, EventManager, GameDataManager, GameDataEvent, SceneManager, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _crd, ccclass, property, GameScene;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfNetworkManager(extras) {
    _reporterNs.report("NetworkManager", "../network/NetworkManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfNetworkEvent(extras) {
    _reporterNs.report("NetworkEvent", "../network/NetworkManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfProtocolManager(extras) {
    _reporterNs.report("ProtocolManager", "../protocol/ProtocolManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEventManager(extras) {
    _reporterNs.report("EventManager", "../managers/EventManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameDataManager(extras) {
    _reporterNs.report("GameDataManager", "../managers/GameDataManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameDataEvent(extras) {
    _reporterNs.report("GameDataEvent", "../managers/GameDataManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerData(extras) {
    _reporterNs.report("PlayerData", "../managers/GameDataManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSceneManager(extras) {
    _reporterNs.report("SceneManager", "../managers/SceneManager", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Node = _cc.Node;
      Label = _cc.Label;
      Button = _cc.Button;
      Vec3 = _cc.Vec3;
      tween = _cc.tween;
    }, function (_unresolved_2) {
      NetworkManager = _unresolved_2.NetworkManager;
      NetworkEvent = _unresolved_2.NetworkEvent;
    }, function (_unresolved_3) {
      ProtocolManager = _unresolved_3.ProtocolManager;
    }, function (_unresolved_4) {
      EventManager = _unresolved_4.EventManager;
    }, function (_unresolved_5) {
      GameDataManager = _unresolved_5.GameDataManager;
      GameDataEvent = _unresolved_5.GameDataEvent;
    }, function (_unresolved_6) {
      SceneManager = _unresolved_6.SceneManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "395a3Ng2z9NA6gU+ljOETZg", "GameScene", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Label', 'Button', 'Sprite', 'Vec3', 'tween']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("GameScene", GameScene = (_dec = ccclass('GameScene'), _dec2 = property(Label), _dec3 = property(Label), _dec4 = property(Label), _dec5 = property(Label), _dec6 = property(Button), _dec7 = property(Button), _dec8 = property(Button), _dec9 = property(Node), _dec10 = property(Node), _dec11 = property(Label), _dec(_class = (_class2 = class GameScene extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "playerNameLabel", _descriptor, this);

          _initializerDefineProperty(this, "playerLevelLabel", _descriptor2, this);

          _initializerDefineProperty(this, "playerGoldLabel", _descriptor3, this);

          _initializerDefineProperty(this, "playerEnergyLabel", _descriptor4, this);

          _initializerDefineProperty(this, "logoutButton", _descriptor5, this);

          _initializerDefineProperty(this, "farmButton", _descriptor6, this);

          _initializerDefineProperty(this, "inventoryButton", _descriptor7, this);

          _initializerDefineProperty(this, "playerNode", _descriptor8, this);

          _initializerDefineProperty(this, "farmArea", _descriptor9, this);

          _initializerDefineProperty(this, "statusLabel", _descriptor10, this);

          this.networkManager = void 0;
          this.protocolManager = void 0;
          this.eventManager = void 0;
          this.gameDataManager = void 0;
          this.sceneManager = void 0;
          this.playerData = null;
        }

        onLoad() {
          // 获取管理器实例
          this.networkManager = (_crd && NetworkManager === void 0 ? (_reportPossibleCrUseOfNetworkManager({
            error: Error()
          }), NetworkManager) : NetworkManager).getInstance();
          this.protocolManager = (_crd && ProtocolManager === void 0 ? (_reportPossibleCrUseOfProtocolManager({
            error: Error()
          }), ProtocolManager) : ProtocolManager).getInstance();
          this.eventManager = (_crd && EventManager === void 0 ? (_reportPossibleCrUseOfEventManager({
            error: Error()
          }), EventManager) : EventManager).getInstance();
          this.gameDataManager = (_crd && GameDataManager === void 0 ? (_reportPossibleCrUseOfGameDataManager({
            error: Error()
          }), GameDataManager) : GameDataManager).getInstance();
          this.sceneManager = (_crd && SceneManager === void 0 ? (_reportPossibleCrUseOfSceneManager({
            error: Error()
          }), SceneManager) : SceneManager).getInstance(); // 注册事件监听

          this.registerEventListeners(); // 设置按钮事件

          this.setupButtons(); // 检查登录状态

          this.checkLoginStatus(); // 初始化游戏数据

          this.initializeGameData();
        }

        onDestroy() {
          // 移除事件监听
          this.eventManager.off((_crd && GameDataEvent === void 0 ? (_reportPossibleCrUseOfGameDataEvent({
            error: Error()
          }), GameDataEvent) : GameDataEvent).PLAYER_DATA_UPDATED);
          this.eventManager.off((_crd && NetworkEvent === void 0 ? (_reportPossibleCrUseOfNetworkEvent({
            error: Error()
          }), NetworkEvent) : NetworkEvent).DISCONNECTED);
          this.eventManager.off((_crd && NetworkEvent === void 0 ? (_reportPossibleCrUseOfNetworkEvent({
            error: Error()
          }), NetworkEvent) : NetworkEvent).MESSAGE_RECEIVED);
        }

        registerEventListeners() {
          // 游戏数据事件
          this.eventManager.on((_crd && GameDataEvent === void 0 ? (_reportPossibleCrUseOfGameDataEvent({
            error: Error()
          }), GameDataEvent) : GameDataEvent).PLAYER_DATA_UPDATED, this.onPlayerDataUpdated, this); // 网络事件

          this.eventManager.on((_crd && NetworkEvent === void 0 ? (_reportPossibleCrUseOfNetworkEvent({
            error: Error()
          }), NetworkEvent) : NetworkEvent).DISCONNECTED, this.onNetworkDisconnected, this);
          this.eventManager.on((_crd && NetworkEvent === void 0 ? (_reportPossibleCrUseOfNetworkEvent({
            error: Error()
          }), NetworkEvent) : NetworkEvent).MESSAGE_RECEIVED, this.onMessageReceived, this);
        }

        setupButtons() {
          if (this.logoutButton) {
            this.logoutButton.node.on(Button.EventType.CLICK, this.onLogoutButtonClick, this);
          }

          if (this.farmButton) {
            this.farmButton.node.on(Button.EventType.CLICK, this.onFarmButtonClick, this);
          }

          if (this.inventoryButton) {
            this.inventoryButton.node.on(Button.EventType.CLICK, this.onInventoryButtonClick, this);
          }
        }

        checkLoginStatus() {
          if (!this.gameDataManager.isLoggedIn()) {
            this.updateStatusLabel('未登录，返回登录页面...', true);
            setTimeout(() => {
              this.sceneManager.gotoLoginScene();
            }, 2000);
            return;
          }

          if (!this.networkManager.isConnected()) {
            this.updateStatusLabel('网络未连接，返回登录页面...', true);
            setTimeout(() => {
              this.sceneManager.gotoLoginScene();
            }, 2000);
            return;
          }

          this.updateStatusLabel('欢迎来到农场游戏！');
        }

        initializeGameData() {
          var _this = this;

          return _asyncToGenerator(function* () {
            // 获取玩家数据
            _this.playerData = _this.gameDataManager.getPlayerData();

            if (_this.playerData) {
              _this.updatePlayerUI();
            } // 请求最新的玩家信息


            try {
              yield _this.requestPlayerInfo();
              yield _this.requestFarmInfo();
              yield _this.requestInventoryInfo();
            } catch (error) {
              console.error('Failed to initialize game data:', error);

              _this.updateStatusLabel('获取游戏数据失败: ' + error.message, true);
            }
          })();
        }

        requestPlayerInfo() {
          var _this2 = this;

          return _asyncToGenerator(function* () {
            try {
              var requestData = _this2.protocolManager.encodeGetPlayerInfoRequest();

              var cmdId = _this2.protocolManager.getCommandId('PLAYER_GET_INFO');

              var response = yield _this2.networkManager.sendRequest(cmdId, requestData);

              if (response.code === 0) {
                var playerInfo = _this2.protocolManager.decodeGetPlayerInfoResponse(response.data);

                _this2.gameDataManager.setPlayerData(playerInfo.player_info);
              }
            } catch (error) {
              console.error('Failed to request player info:', error);
            }
          })();
        }

        requestFarmInfo() {
          return _asyncToGenerator(function* () {
            try {
              // TODO: 实现农场信息请求
              console.log('Requesting farm info...');
            } catch (error) {
              console.error('Failed to request farm info:', error);
            }
          })();
        }

        requestInventoryInfo() {
          return _asyncToGenerator(function* () {
            try {
              // TODO: 实现背包信息请求
              console.log('Requesting inventory info...');
            } catch (error) {
              console.error('Failed to request inventory info:', error);
            }
          })();
        }

        updatePlayerUI() {
          if (!this.playerData) return;

          if (this.playerNameLabel) {
            this.playerNameLabel.string = this.playerData.name;
          }

          if (this.playerLevelLabel) {
            this.playerLevelLabel.string = "\u7B49\u7EA7 " + this.playerData.level;
          }

          if (this.playerGoldLabel) {
            this.playerGoldLabel.string = "\u91D1\u5E01: " + this.playerData.gold;
          }

          if (this.playerEnergyLabel) {
            this.playerEnergyLabel.string = "\u4F53\u529B: " + this.playerData.energy + "/" + this.playerData.maxEnergy;
          } // 更新玩家位置


          if (this.playerNode) {
            this.playerNode.setPosition(new Vec3(this.playerData.position.x, this.playerData.position.y, 0));
          }
        }

        updateStatusLabel(message, isError) {
          if (isError === void 0) {
            isError = false;
          }

          if (this.statusLabel) {
            this.statusLabel.string = message; // 可以根据isError设置不同的颜色
          }

          console.log('Status:', message);
        }

        onLogoutButtonClick() {
          this.logout();
        }

        logout() {
          var _this3 = this;

          return _asyncToGenerator(function* () {
            try {
              _this3.updateStatusLabel('正在登出...'); // 发送登出请求
              // TODO: 实现登出协议
              // 清除本地数据


              _this3.gameDataManager.clearAllData(); // 断开网络连接


              _this3.networkManager.disconnect(); // 返回登录页面


              yield _this3.sceneManager.gotoLoginScene();
            } catch (error) {
              console.error('Logout failed:', error);

              _this3.updateStatusLabel('登出失败: ' + error.message, true);
            }
          })();
        }

        onFarmButtonClick() {
          this.updateStatusLabel('打开农场界面...'); // TODO: 实现农场界面

          console.log('Farm button clicked');
        }

        onInventoryButtonClick() {
          this.updateStatusLabel('打开背包界面...'); // TODO: 实现背包界面

          console.log('Inventory button clicked');
        } // 事件处理


        onPlayerDataUpdated(playerData) {
          this.playerData = playerData;
          this.updatePlayerUI();

          if (playerData) {
            this.updateStatusLabel("\u6B22\u8FCE\u56DE\u6765\uFF0C" + playerData.name + "\uFF01");
          }
        }

        onNetworkDisconnected() {
          this.updateStatusLabel('网络连接断开，返回登录页面...', true);
          setTimeout(() => {
            this.sceneManager.gotoLoginScene();
          }, 3000);
        }

        onMessageReceived(message) {
          console.log('Received message:', message); // 处理服务器推送消息

          switch (message.cmd) {
            case 1:
              // CMD_ANNOUNCEMENT
              this.handleAnnouncement(message);
              break;

            default:
              console.log('Unhandled message:', message);
              break;
          }
        }

        handleAnnouncement(message) {
          // TODO: 处理服务器公告
          console.log('Server announcement:', message);
          this.updateStatusLabel('收到服务器公告');
        } // 玩家移动（示例）


        movePlayer(x, y) {
          if (!this.playerNode || !this.playerData) return;
          var newPosition = new Vec3(x, y, 0); // 播放移动动画

          tween(this.playerNode).to(0.5, {
            position: newPosition
          }).call(() => {
            // 更新玩家数据
            this.gameDataManager.updatePlayerPosition(x, y); // 发送位置更新到服务器

            this.sendPositionUpdate(x, y);
          }).start();
        }

        sendPositionUpdate(x, y) {
          return _asyncToGenerator(function* () {
            try {
              // TODO: 实现位置更新协议
              console.log('Sending position update:', x, y);
            } catch (error) {
              console.error('Failed to send position update:', error);
            }
          })();
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "playerNameLabel", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "playerLevelLabel", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "playerGoldLabel", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "playerEnergyLabel", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "logoutButton", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "farmButton", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "inventoryButton", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "playerNode", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "farmArea", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "statusLabel", [_dec11], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=49f90ec7d60d2a824a5d4f1abef9020e60a967de.js.map