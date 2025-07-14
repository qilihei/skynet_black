System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, EditBox, Button, Label, NetworkManager, NetworkEvent, ConnectionState, ProtocolManager, EventManager, GameDataManager, SceneManager, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _crd, ccclass, property, LoginScene;

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

  function _reportPossibleCrUseOfConnectionState(extras) {
    _reporterNs.report("ConnectionState", "../network/NetworkManager", _context.meta, extras);
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
      EditBox = _cc.EditBox;
      Button = _cc.Button;
      Label = _cc.Label;
    }, function (_unresolved_2) {
      NetworkManager = _unresolved_2.NetworkManager;
      NetworkEvent = _unresolved_2.NetworkEvent;
      ConnectionState = _unresolved_2.ConnectionState;
    }, function (_unresolved_3) {
      ProtocolManager = _unresolved_3.ProtocolManager;
    }, function (_unresolved_4) {
      EventManager = _unresolved_4.EventManager;
    }, function (_unresolved_5) {
      GameDataManager = _unresolved_5.GameDataManager;
    }, function (_unresolved_6) {
      SceneManager = _unresolved_6.SceneManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "f8f434+Y2VPD4/EvgnV88ta", "LoginScene", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'EditBox', 'Button', 'Label', 'director']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("LoginScene", LoginScene = (_dec = ccclass('LoginScene'), _dec2 = property(EditBox), _dec3 = property(EditBox), _dec4 = property(Button), _dec5 = property(Button), _dec6 = property(Label), _dec7 = property(Label), _dec8 = property(Node), _dec(_class = (_class2 = class LoginScene extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "usernameInput", _descriptor, this);

          _initializerDefineProperty(this, "passwordInput", _descriptor2, this);

          _initializerDefineProperty(this, "loginButton", _descriptor3, this);

          _initializerDefineProperty(this, "connectButton", _descriptor4, this);

          _initializerDefineProperty(this, "statusLabel", _descriptor5, this);

          _initializerDefineProperty(this, "versionLabel", _descriptor6, this);

          _initializerDefineProperty(this, "loadingNode", _descriptor7, this);

          this.networkManager = void 0;
          this.protocolManager = void 0;
          this.eventManager = void 0;
          this.gameDataManager = void 0;
          this.sceneManager = void 0;
          this.isLoggingIn = false;
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
          }), SceneManager) : SceneManager).getInstance(); // 设置版本信息

          if (this.versionLabel) {
            this.versionLabel.string = 'v1.0.0';
          } // 设置默认服务器地址


          this.networkManager.setServerUrl('ws://localhost:8888'); // 注册事件监听

          this.registerEventListeners(); // 设置按钮事件

          this.setupButtons(); // 初始化UI状态

          this.updateUIState(); // 尝试从本地存储恢复登录信息

          this.loadLoginInfo();
        }

        onDestroy() {
          // 移除事件监听
          this.eventManager.off((_crd && NetworkEvent === void 0 ? (_reportPossibleCrUseOfNetworkEvent({
            error: Error()
          }), NetworkEvent) : NetworkEvent).CONNECTED);
          this.eventManager.off((_crd && NetworkEvent === void 0 ? (_reportPossibleCrUseOfNetworkEvent({
            error: Error()
          }), NetworkEvent) : NetworkEvent).DISCONNECTED);
          this.eventManager.off((_crd && NetworkEvent === void 0 ? (_reportPossibleCrUseOfNetworkEvent({
            error: Error()
          }), NetworkEvent) : NetworkEvent).RECONNECTING);
          this.eventManager.off((_crd && NetworkEvent === void 0 ? (_reportPossibleCrUseOfNetworkEvent({
            error: Error()
          }), NetworkEvent) : NetworkEvent).ERROR);
        }

        registerEventListeners() {
          // 网络连接事件
          this.eventManager.on((_crd && NetworkEvent === void 0 ? (_reportPossibleCrUseOfNetworkEvent({
            error: Error()
          }), NetworkEvent) : NetworkEvent).CONNECTED, this.onNetworkConnected, this);
          this.eventManager.on((_crd && NetworkEvent === void 0 ? (_reportPossibleCrUseOfNetworkEvent({
            error: Error()
          }), NetworkEvent) : NetworkEvent).DISCONNECTED, this.onNetworkDisconnected, this);
          this.eventManager.on((_crd && NetworkEvent === void 0 ? (_reportPossibleCrUseOfNetworkEvent({
            error: Error()
          }), NetworkEvent) : NetworkEvent).RECONNECTING, this.onNetworkReconnecting, this);
          this.eventManager.on((_crd && NetworkEvent === void 0 ? (_reportPossibleCrUseOfNetworkEvent({
            error: Error()
          }), NetworkEvent) : NetworkEvent).ERROR, this.onNetworkError, this);
        }

        setupButtons() {
          if (this.connectButton) {
            this.connectButton.node.on(Button.EventType.CLICK, this.onConnectButtonClick, this);
          }

          if (this.loginButton) {
            this.loginButton.node.on(Button.EventType.CLICK, this.onLoginButtonClick, this);
          }
        }

        updateUIState() {
          var connectionState = this.networkManager.getConnectionState();
          var isConnected = connectionState === (_crd && ConnectionState === void 0 ? (_reportPossibleCrUseOfConnectionState({
            error: Error()
          }), ConnectionState) : ConnectionState).CONNECTED; // 更新按钮状态

          if (this.connectButton) {
            this.connectButton.interactable = !this.isLoggingIn;
            var connectLabel = this.connectButton.getComponentInChildren(Label);

            if (connectLabel) {
              switch (connectionState) {
                case (_crd && ConnectionState === void 0 ? (_reportPossibleCrUseOfConnectionState({
                  error: Error()
                }), ConnectionState) : ConnectionState).DISCONNECTED:
                  connectLabel.string = '连接服务器';
                  break;

                case (_crd && ConnectionState === void 0 ? (_reportPossibleCrUseOfConnectionState({
                  error: Error()
                }), ConnectionState) : ConnectionState).CONNECTING:
                  connectLabel.string = '连接中...';
                  break;

                case (_crd && ConnectionState === void 0 ? (_reportPossibleCrUseOfConnectionState({
                  error: Error()
                }), ConnectionState) : ConnectionState).CONNECTED:
                  connectLabel.string = '已连接';
                  break;

                case (_crd && ConnectionState === void 0 ? (_reportPossibleCrUseOfConnectionState({
                  error: Error()
                }), ConnectionState) : ConnectionState).RECONNECTING:
                  connectLabel.string = '重连中...';
                  break;
              }
            }
          }

          if (this.loginButton) {
            this.loginButton.interactable = isConnected && !this.isLoggingIn;
            var loginLabel = this.loginButton.getComponentInChildren(Label);

            if (loginLabel) {
              loginLabel.string = this.isLoggingIn ? '登录中...' : '登录';
            }
          } // 更新输入框状态


          if (this.usernameInput) {
            this.usernameInput.enabled = !this.isLoggingIn;
          }

          if (this.passwordInput) {
            this.passwordInput.enabled = !this.isLoggingIn;
          } // 更新加载动画


          if (this.loadingNode) {
            this.loadingNode.active = this.isLoggingIn;
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

        onConnectButtonClick() {
          if (this.networkManager.isConnected()) {
            this.networkManager.disconnect();
          } else {
            this.connectToServer();
          }
        }

        connectToServer() {
          var _this = this;

          return _asyncToGenerator(function* () {
            _this.updateStatusLabel('正在连接服务器...');

            try {
              yield _this.networkManager.connect();

              _this.updateStatusLabel('服务器连接成功');
            } catch (error) {
              _this.updateStatusLabel('连接服务器失败: ' + error.message, true);
            }
          })();
        }

        onLoginButtonClick() {
          var _this$usernameInput, _this$passwordInput;

          if (!this.networkManager.isConnected()) {
            this.updateStatusLabel('请先连接服务器', true);
            return;
          }

          var username = (_this$usernameInput = this.usernameInput) == null || (_this$usernameInput = _this$usernameInput.string) == null ? void 0 : _this$usernameInput.trim();
          var password = (_this$passwordInput = this.passwordInput) == null || (_this$passwordInput = _this$passwordInput.string) == null ? void 0 : _this$passwordInput.trim();

          if (!username || !password) {
            this.updateStatusLabel('请输入用户名和密码', true);
            return;
          }

          this.login(username, password);
        }

        login(username, password) {
          var _this2 = this;

          return _asyncToGenerator(function* () {
            _this2.isLoggingIn = true;

            _this2.updateUIState();

            _this2.updateStatusLabel('正在登录...');

            try {
              // 编码登录请求
              var loginData = _this2.protocolManager.encodeLoginRequest(username, password);

              var cmdId = _this2.protocolManager.getCommandId('LOGIN_REQUEST'); // 发送登录请求


              var response = yield _this2.networkManager.sendRequest(cmdId, loginData, 10000);

              if (response.code === 0) {
                // 登录成功
                var loginResponse = _this2.protocolManager.decodeLoginResponse(response.data); // 保存登录数据


                _this2.gameDataManager.setSessionToken(loginResponse.session_token);

                _this2.gameDataManager.setPlayerData(loginResponse.player_info); // 保存登录信息到本地


                _this2.saveLoginInfo(username);

                _this2.updateStatusLabel('登录成功，正在进入游戏...'); // 延迟一下再跳转，让用户看到成功消息


                setTimeout(() => {
                  _this2.enterGame();
                }, 1000);
              } else {
                _this2.updateStatusLabel('登录失败: ' + response.message, true);
              }
            } catch (error) {
              _this2.updateStatusLabel('登录失败: ' + error.message, true);
            } finally {
              _this2.isLoggingIn = false;

              _this2.updateUIState();
            }
          })();
        }

        enterGame() {
          var _this3 = this;

          return _asyncToGenerator(function* () {
            try {
              yield _this3.sceneManager.gotoGameScene();
            } catch (error) {
              _this3.updateStatusLabel('进入游戏失败: ' + error.message, true);
            }
          })();
        }

        saveLoginInfo(username) {
          try {
            localStorage.setItem('last_username', username);
          } catch (error) {
            console.error('Failed to save login info:', error);
          }
        }

        loadLoginInfo() {
          try {
            var lastUsername = localStorage.getItem('last_username');

            if (lastUsername && this.usernameInput) {
              this.usernameInput.string = lastUsername;
            }
          } catch (error) {
            console.error('Failed to load login info:', error);
          }
        } // 网络事件处理


        onNetworkConnected() {
          this.updateStatusLabel('服务器连接成功');
          this.updateUIState();
        }

        onNetworkDisconnected() {
          this.updateStatusLabel('与服务器断开连接', true);
          this.updateUIState();
        }

        onNetworkReconnecting(attempts) {
          this.updateStatusLabel("\u6B63\u5728\u91CD\u8FDE... (" + attempts + "/5)");
          this.updateUIState();
        }

        onNetworkError(error) {
          this.updateStatusLabel('网络错误: ' + error.message, true);
          this.updateUIState();
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "usernameInput", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "passwordInput", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "loginButton", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "connectButton", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "statusLabel", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "versionLabel", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "loadingNode", [_dec8], {
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
//# sourceMappingURL=659451abb1b2357945dc26a139228d2c164da7d6.js.map