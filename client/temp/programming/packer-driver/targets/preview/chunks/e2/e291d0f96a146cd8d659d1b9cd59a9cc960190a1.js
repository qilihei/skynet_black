System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Node, instantiate, Canvas, find, EventManager, _dec, _class, _class2, _crd, ccclass, property, UILayer, UIManager;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  function _reportPossibleCrUseOfEventManager(extras) {
    _reporterNs.report("EventManager", "../managers/EventManager", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Node = _cc.Node;
      instantiate = _cc.instantiate;
      Canvas = _cc.Canvas;
      find = _cc.find;
    }, function (_unresolved_2) {
      EventManager = _unresolved_2.EventManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "8110a5S49ZBDrveEB44tg0Z", "UIManager", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Prefab', 'instantiate', 'Canvas', 'find']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("UILayer", UILayer = /*#__PURE__*/function (UILayer) {
        UILayer[UILayer["BACKGROUND"] = 0] = "BACKGROUND";
        UILayer[UILayer["NORMAL"] = 1] = "NORMAL";
        UILayer[UILayer["POPUP"] = 2] = "POPUP";
        UILayer[UILayer["SYSTEM"] = 3] = "SYSTEM";
        UILayer[UILayer["TOP"] = 4] = "TOP";
        return UILayer;
      }({}));

      _export("UIManager", UIManager = (_dec = ccclass('UIManager'), _dec(_class = (_class2 = class UIManager {
        static getInstance() {
          if (!UIManager.instance) {
            UIManager.instance = new UIManager();
          }

          return UIManager.instance;
        }

        constructor() {
          this.canvas = null;
          this.layers = [];
          this.uiConfigs = new Map();
          this.uiInstances = new Map();
          this.uiCache = new Map();
          this.eventManager = void 0;
          this.eventManager = (_crd && EventManager === void 0 ? (_reportPossibleCrUseOfEventManager({
            error: Error()
          }), EventManager) : EventManager).getInstance();
          this.initializeLayers();
        }

        initializeLayers() {
          // 查找Canvas节点
          var canvasNode = find('Canvas');

          if (canvasNode) {
            this.canvas = canvasNode.getComponent(Canvas);
          }

          if (!this.canvas) {
            console.error('Canvas not found! UI system may not work properly.');
            return;
          } // 创建UI层级


          for (var i = 0; i <= UILayer.TOP; i++) {
            var layerNode = new Node("UILayer_" + i);
            layerNode.parent = this.canvas.node;
            layerNode.setSiblingIndex(i);
            this.layers[i] = layerNode;
          }

          console.log('UI layers initialized');
        } // 注册UI配置


        registerUI(name, config) {
          this.uiConfigs.set(name, config);
        } // 批量注册UI


        registerUIs(configs) {
          for (var _name in configs) {
            this.registerUI(_name, configs[_name]);
          }
        } // 显示UI


        showUI(name, data) {
          var _this = this;

          return _asyncToGenerator(function* () {
            var config = _this.uiConfigs.get(name);

            if (!config) {
              console.error("UI config not found: " + name);
              return null;
            } // 检查单例模式


            if (config.singleton && _this.uiInstances.has(name)) {
              var existingUI = _this.uiInstances.get(name);

              existingUI.active = true;

              _this.bringToFront(existingUI); // 触发显示事件


              _this.notifyUIEvent(name, 'show', data);

              return existingUI;
            } // 从缓存获取或创建新实例


            var uiNode = _this.getFromCache(name);

            if (!uiNode) {
              uiNode = _this.createUIInstance(name, config);

              if (!uiNode) {
                return null;
              }
            } // 设置父节点和层级


            uiNode.parent = _this.layers[config.layer];
            uiNode.active = true; // 记录实例

            if (config.singleton) {
              _this.uiInstances.set(name, uiNode);
            } // 触发显示事件


            _this.notifyUIEvent(name, 'show', data);

            console.log("UI shown: " + name);
            return uiNode;
          })();
        } // 隐藏UI


        hideUI(name, destroy) {
          if (destroy === void 0) {
            destroy = false;
          }

          var uiNode = this.uiInstances.get(name);

          if (!uiNode) {
            console.warn("UI not found: " + name);
            return;
          }

          uiNode.active = false; // 触发隐藏事件

          this.notifyUIEvent(name, 'hide');

          if (destroy) {
            this.destroyUI(name);
          } else {
            var config = this.uiConfigs.get(name);

            if (config && config.cache) {
              this.addToCache(name, uiNode);
            }
          }

          console.log("UI hidden: " + name);
        } // 销毁UI


        destroyUI(name) {
          var uiNode = this.uiInstances.get(name);

          if (uiNode) {
            uiNode.destroy();
            this.uiInstances.delete(name);
          } // 从缓存中移除


          this.removeFromCache(name); // 触发销毁事件

          this.notifyUIEvent(name, 'destroy');
          console.log("UI destroyed: " + name);
        } // 切换UI显示状态


        toggleUI(name, data) {
          var uiNode = this.uiInstances.get(name);

          if (uiNode && uiNode.active) {
            this.hideUI(name);
          } else {
            this.showUI(name, data);
          }
        } // 检查UI是否显示


        isUIShown(name) {
          var uiNode = this.uiInstances.get(name);
          return uiNode ? uiNode.active : false;
        } // 获取UI实例


        getUI(name) {
          return this.uiInstances.get(name) || null;
        } // 关闭所有UI


        closeAllUI(except) {
          var exceptSet = new Set(except || []);

          for (var [_name2, uiNode] of this.uiInstances) {
            if (!exceptSet.has(_name2) && uiNode.active) {
              this.hideUI(_name2);
            }
          }
        } // 关闭指定层级的所有UI


        closeUIByLayer(layer) {
          for (var [_name3, uiNode] of this.uiInstances) {
            var config = this.uiConfigs.get(_name3);

            if (config && config.layer === layer && uiNode.active) {
              this.hideUI(_name3);
            }
          }
        } // 将UI置于最前


        bringToFront(uiNode) {
          if (uiNode.parent) {
            uiNode.setSiblingIndex(-1);
          }
        } // 创建UI实例


        createUIInstance(name, config) {
          if (!config.prefab) {
            console.error("UI prefab not found: " + name);
            return null;
          }

          try {
            var uiNode = instantiate(config.prefab);
            uiNode.name = name;
            return uiNode;
          } catch (error) {
            console.error("Failed to create UI instance: " + name, error);
            return null;
          }
        } // 缓存管理


        addToCache(name, uiNode) {
          var config = this.uiConfigs.get(name);

          if (config && config.cache) {
            uiNode.parent = null;
            this.uiCache.set(name, uiNode);
          }
        }

        getFromCache(name) {
          return this.uiCache.get(name) || null;
        }

        removeFromCache(name) {
          var cachedNode = this.uiCache.get(name);

          if (cachedNode) {
            cachedNode.destroy();
            this.uiCache.delete(name);
          }
        } // 事件通知


        notifyUIEvent(name, event, data) {
          this.eventManager.emit("ui_" + name + "_" + event, data);
          this.eventManager.emit("ui_" + event, name, data);
        } // 清理所有UI


        cleanup() {
          // 销毁所有实例
          for (var [_name4] of this.uiInstances) {
            this.destroyUI(_name4);
          } // 清理缓存


          for (var [_name5, cachedNode] of this.uiCache) {
            cachedNode.destroy();
          }

          this.uiCache.clear();
          console.log('UI system cleaned up');
        } // 获取统计信息


        getStats() {
          return {
            totalConfigs: this.uiConfigs.size,
            activeInstances: this.uiInstances.size,
            cachedInstances: this.uiCache.size,
            layers: this.layers.length
          };
        }

      }, _class2.instance = void 0, _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=e291d0f96a146cd8d659d1b9cd59a9cc960190a1.js.map