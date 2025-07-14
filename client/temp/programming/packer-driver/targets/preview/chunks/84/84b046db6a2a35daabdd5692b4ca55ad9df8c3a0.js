System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, _dec, _class, _class2, _crd, ccclass, EventManager;

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "c28bdi/YclICbnyt1PXddyG", "EventManager", undefined);

      __checkObsolete__(['_decorator']);

      ({
        ccclass
      } = _decorator);

      _export("EventManager", EventManager = (_dec = ccclass('EventManager'), _dec(_class = (_class2 = class EventManager {
        static getInstance() {
          if (!EventManager.instance) {
            EventManager.instance = new EventManager();
          }

          return EventManager.instance;
        }

        constructor() {
          this.eventMap = new Map();
        } // 注册事件监听


        on(event, callback, target) {
          if (!this.eventMap.has(event)) {
            this.eventMap.set(event, []);
          }

          var callbacks = this.eventMap.get(event); // 绑定目标对象

          if (target) {
            callback = callback.bind(target);
          }

          callbacks.push(callback);
        } // 注册一次性事件监听


        once(event, callback, target) {
          var _this = this;

          var onceCallback = function onceCallback() {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            callback.apply(target, args);

            _this.off(event, onceCallback);
          };

          this.on(event, onceCallback);
        } // 移除事件监听


        off(event, callback) {
          if (!this.eventMap.has(event)) {
            return;
          }

          var callbacks = this.eventMap.get(event);

          if (callback) {
            var index = callbacks.indexOf(callback);

            if (index !== -1) {
              callbacks.splice(index, 1);
            }
          } else {
            // 移除所有监听
            callbacks.length = 0;
          } // 如果没有监听器了，删除事件


          if (callbacks.length === 0) {
            this.eventMap.delete(event);
          }
        } // 触发事件


        emit(event) {
          if (!this.eventMap.has(event)) {
            return;
          }

          var callbacks = this.eventMap.get(event); // 复制数组，避免在回调中修改原数组导致问题

          var callbacksCopy = [...callbacks];

          for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            args[_key2 - 1] = arguments[_key2];
          }

          for (var callback of callbacksCopy) {
            try {
              callback(...args);
            } catch (error) {
              console.error("Error in event callback for '" + event + "':", error);
            }
          }
        } // 检查是否有监听器


        hasListener(event) {
          return this.eventMap.has(event) && this.eventMap.get(event).length > 0;
        } // 获取监听器数量


        getListenerCount(event) {
          return this.eventMap.has(event) ? this.eventMap.get(event).length : 0;
        } // 清除所有事件监听


        clear() {
          this.eventMap.clear();
        } // 获取所有事件名称


        getEventNames() {
          return Array.from(this.eventMap.keys());
        }

      }, _class2.instance = void 0, _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=84b046db6a2a35daabdd5692b4ca55ad9df8c3a0.js.map