System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, director, game, sys, NetworkManager, EventManager, GameDataManager, SceneManager, _dec, _class, _class2, _crd, ccclass, property, GameApp;

  function _reportPossibleCrUseOfNetworkManager(extras) {
    _reporterNs.report("NetworkManager", "./network/NetworkManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEventManager(extras) {
    _reporterNs.report("EventManager", "./managers/EventManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameDataManager(extras) {
    _reporterNs.report("GameDataManager", "./managers/GameDataManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSceneManager(extras) {
    _reporterNs.report("SceneManager", "./managers/SceneManager", _context.meta, extras);
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
      director = _cc.director;
      game = _cc.game;
      sys = _cc.sys;
    }, function (_unresolved_2) {
      NetworkManager = _unresolved_2.NetworkManager;
    }, function (_unresolved_3) {
      EventManager = _unresolved_3.EventManager;
    }, function (_unresolved_4) {
      GameDataManager = _unresolved_4.GameDataManager;
    }, function (_unresolved_5) {
      SceneManager = _unresolved_5.SceneManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "2767eIQEcZONZ1ic4FJXyGS", "GameApp", undefined);

      __checkObsolete__(['_decorator', 'Component', 'director', 'game', 'sys']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("GameApp", GameApp = (_dec = ccclass('GameApp'), _dec(_class = (_class2 = class GameApp extends Component {
        constructor(...args) {
          super(...args);
          // 管理器实例
          this.networkManager = void 0;
          this.eventManager = void 0;
          this.gameDataManager = void 0;
          this.sceneManager = void 0;
          // 应用配置
          this.config = {
            serverUrl: 'ws://localhost:8888',
            version: '1.0.0',
            debug: true
          };
        }

        static getInstance() {
          return GameApp.instance;
        }

        onLoad() {
          // 设置单例
          if (GameApp.instance) {
            this.node.destroy();
            return;
          }

          GameApp.instance = this; // 设置为常驻节点

          director.addPersistRootNode(this.node); // 初始化应用

          this.initializeApp();
        }

        initializeApp() {
          console.log('=== Farm Game Client Starting ===');
          console.log('Version:', this.config.version);
          console.log('Platform:', sys.platform);
          console.log('Debug Mode:', this.config.debug); // 初始化管理器

          this.initializeManagers(); // 设置应用配置

          this.setupAppConfig(); // 注册全局事件

          this.registerGlobalEvents(); // 加载本地数据

          this.loadLocalData();
          console.log('=== Game App Initialized ===');
        }

        initializeManagers() {
          // 按顺序初始化管理器
          this.eventManager = (_crd && EventManager === void 0 ? (_reportPossibleCrUseOfEventManager({
            error: Error()
          }), EventManager) : EventManager).getInstance();
          this.gameDataManager = (_crd && GameDataManager === void 0 ? (_reportPossibleCrUseOfGameDataManager({
            error: Error()
          }), GameDataManager) : GameDataManager).getInstance();
          this.networkManager = (_crd && NetworkManager === void 0 ? (_reportPossibleCrUseOfNetworkManager({
            error: Error()
          }), NetworkManager) : NetworkManager).getInstance();
          this.sceneManager = (_crd && SceneManager === void 0 ? (_reportPossibleCrUseOfSceneManager({
            error: Error()
          }), SceneManager) : SceneManager).getInstance();
          console.log('All managers initialized');
        }

        setupAppConfig() {
          // 设置网络配置
          this.networkManager.setServerUrl(this.config.serverUrl); // 设置调试模式

          if (this.config.debug) {
            // 启用调试日志
            console.log('Debug mode enabled');
          } // 设置游戏帧率


          game.frameRate = 60; // 设置屏幕适配

          this.setupScreenAdapter();
        }

        setupScreenAdapter() {
          // 根据平台设置屏幕适配策略
          if (sys.isMobile) {
            // 移动端适配
            console.log('Mobile platform detected');
          } else {
            // 桌面端适配
            console.log('Desktop platform detected');
          }
        }

        registerGlobalEvents() {
          // 注册应用生命周期事件
          game.on(game.EVENT_SHOW, this.onGameShow, this);
          game.on(game.EVENT_HIDE, this.onGameHide, this); // 注册错误处理

          window.addEventListener('error', this.onGlobalError.bind(this));
          window.addEventListener('unhandledrejection', this.onUnhandledRejection.bind(this));
          console.log('Global events registered');
        }

        loadLocalData() {
          try {
            // 加载本地存储的游戏数据
            this.gameDataManager.loadFromLocal();
            console.log('Local data loaded');
          } catch (error) {
            console.error('Failed to load local data:', error);
          }
        } // 应用生命周期事件


        onGameShow() {
          console.log('Game show'); // 游戏进入前台时的处理

          if (this.networkManager.isConnected()) {
            // 重新开始心跳
            console.log('Resume network heartbeat');
          }
        }

        onGameHide() {
          console.log('Game hide'); // 游戏进入后台时的处理
          // 保存游戏数据

          this.gameDataManager.saveToLocal();
        } // 错误处理


        onGlobalError(event) {
          console.error('Global error:', event.error); // 可以在这里添加错误上报逻辑

          this.reportError('GlobalError', event.error);
        }

        onUnhandledRejection(event) {
          console.error('Unhandled promise rejection:', event.reason); // 可以在这里添加错误上报逻辑

          this.reportError('UnhandledRejection', event.reason);
        }

        reportError(type, error) {
          // TODO: 实现错误上报
          console.log('Report error:', type, error);
        } // 公共方法


        getConfig() {
          return this.config;
        }

        setServerUrl(url) {
          this.config.serverUrl = url;
          this.networkManager.setServerUrl(url);
        }

        getVersion() {
          return this.config.version;
        }

        isDebugMode() {
          return this.config.debug;
        } // 应用退出


        exitApp() {
          console.log('Exiting application...'); // 保存数据

          this.gameDataManager.saveToLocal(); // 断开网络连接

          this.networkManager.disconnect(); // 清理资源

          this.cleanup(); // 退出游戏

          game.end();
        }

        cleanup() {
          // 清理管理器
          this.eventManager.clear(); // 移除全局事件监听

          game.off(game.EVENT_SHOW, this.onGameShow, this);
          game.off(game.EVENT_HIDE, this.onGameHide, this);
          console.log('Application cleanup completed');
        }

        onDestroy() {
          this.cleanup();
        }

      }, _class2.instance = void 0, _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=6a0ebf4204807e7c637a7ee549c9bc5febac9526.js.map