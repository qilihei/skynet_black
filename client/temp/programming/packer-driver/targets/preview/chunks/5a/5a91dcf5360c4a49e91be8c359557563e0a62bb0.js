System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, director, EventManager, _dec, _class, _class2, _crd, ccclass, SceneName, SceneEvent, SceneManager;

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
      director = _cc.director;
    }, function (_unresolved_2) {
      EventManager = _unresolved_2.EventManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "0f120LzvoZHNJTX72YQjlyq", "SceneManager", undefined);

      __checkObsolete__(['_decorator', 'director', 'Scene']);

      ({
        ccclass
      } = _decorator);

      _export("SceneName", SceneName = /*#__PURE__*/function (SceneName) {
        SceneName["LOGIN"] = "LoginScene";
        SceneName["GAME"] = "GameScene";
        SceneName["LOADING"] = "LoadingScene";
        return SceneName;
      }({}));

      _export("SceneEvent", SceneEvent = /*#__PURE__*/function (SceneEvent) {
        SceneEvent["SCENE_LOADING"] = "scene_loading";
        SceneEvent["SCENE_LOADED"] = "scene_loaded";
        SceneEvent["SCENE_LAUNCH_FINISHED"] = "scene_launch_finished";
        return SceneEvent;
      }({}));

      _export("SceneManager", SceneManager = (_dec = ccclass('SceneManager'), _dec(_class = (_class2 = class SceneManager {
        static getInstance() {
          if (!SceneManager.instance) {
            SceneManager.instance = new SceneManager();
          }

          return SceneManager.instance;
        }

        constructor() {
          this.eventManager = void 0;
          this.currentScene = '';
          this.isLoading = false;
          this.eventManager = (_crd && EventManager === void 0 ? (_reportPossibleCrUseOfEventManager({
            error: Error()
          }), EventManager) : EventManager).getInstance();
        } // 加载场景


        loadScene(sceneName, onProgress) {
          return new Promise((resolve, reject) => {
            if (this.isLoading) {
              reject(new Error('Scene is already loading'));
              return;
            }

            if (this.currentScene === sceneName) {
              resolve();
              return;
            }

            this.isLoading = true;
            this.eventManager.emit(SceneEvent.SCENE_LOADING, sceneName);
            console.log("Loading scene: " + sceneName);
            director.loadScene(sceneName, error => {
              this.isLoading = false;

              if (error) {
                console.error("Failed to load scene " + sceneName + ":", error);
                reject(error);
              } else {
                console.log("Scene loaded: " + sceneName);
                this.currentScene = sceneName;
                this.eventManager.emit(SceneEvent.SCENE_LOADED, sceneName);
                resolve();
              }
            });
          });
        } // 预加载场景


        preloadScene(sceneName, onProgress) {
          return new Promise((resolve, reject) => {
            console.log("Preloading scene: " + sceneName);
            director.preloadScene(sceneName, (completedCount, totalCount, item) => {
              var progress = completedCount / totalCount;

              if (onProgress) {
                onProgress(progress);
              }
            }, error => {
              if (error) {
                console.error("Failed to preload scene " + sceneName + ":", error);
                reject(error);
              } else {
                console.log("Scene preloaded: " + sceneName);
                resolve();
              }
            });
          });
        } // 切换到登录场景


        gotoLoginScene() {
          return this.loadScene(SceneName.LOGIN);
        } // 切换到游戏场景


        gotoGameScene() {
          return this.loadScene(SceneName.GAME);
        } // 切换到加载场景


        gotoLoadingScene() {
          return this.loadScene(SceneName.LOADING);
        } // 获取当前场景名称


        getCurrentScene() {
          return this.currentScene;
        } // 是否正在加载


        isSceneLoading() {
          return this.isLoading;
        } // 重新加载当前场景


        reloadCurrentScene() {
          if (!this.currentScene) {
            return Promise.reject(new Error('No current scene to reload'));
          }

          var sceneName = this.currentScene;
          this.currentScene = '';
          return this.loadScene(sceneName);
        }

      }, _class2.instance = void 0, _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=5a91dcf5360c4a49e91be8c359557563e0a62bb0.js.map