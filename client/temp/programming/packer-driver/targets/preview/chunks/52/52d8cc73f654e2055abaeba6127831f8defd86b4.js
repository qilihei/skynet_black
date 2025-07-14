System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, ProtocolManager, EventManager, _dec, _class, _class2, _crd, ccclass, property, NetworkEvent, ConnectionState, NetworkManager;

  function _reportPossibleCrUseOfProtocolManager(extras) {
    _reporterNs.report("ProtocolManager", "../protocol/ProtocolManager", _context.meta, extras);
  }

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
    }, function (_unresolved_2) {
      ProtocolManager = _unresolved_2.ProtocolManager;
    }, function (_unresolved_3) {
      EventManager = _unresolved_3.EventManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "45383mfbvtEFJyK3+xry16a", "NetworkManager", undefined);

      __checkObsolete__(['_decorator', 'Component', 'director']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("NetworkEvent", NetworkEvent = /*#__PURE__*/function (NetworkEvent) {
        NetworkEvent["CONNECTED"] = "network_connected";
        NetworkEvent["DISCONNECTED"] = "network_disconnected";
        NetworkEvent["RECONNECTING"] = "network_reconnecting";
        NetworkEvent["ERROR"] = "network_error";
        NetworkEvent["MESSAGE_RECEIVED"] = "network_message_received";
        return NetworkEvent;
      }({}));

      _export("ConnectionState", ConnectionState = /*#__PURE__*/function (ConnectionState) {
        ConnectionState[ConnectionState["DISCONNECTED"] = 0] = "DISCONNECTED";
        ConnectionState[ConnectionState["CONNECTING"] = 1] = "CONNECTING";
        ConnectionState[ConnectionState["CONNECTED"] = 2] = "CONNECTED";
        ConnectionState[ConnectionState["RECONNECTING"] = 3] = "RECONNECTING";
        return ConnectionState;
      }({}));

      _export("NetworkManager", NetworkManager = (_dec = ccclass('NetworkManager'), _dec(_class = (_class2 = class NetworkManager {
        static getInstance() {
          if (!NetworkManager.instance) {
            NetworkManager.instance = new NetworkManager();
          }

          return NetworkManager.instance;
        }

        constructor() {
          this.websocket = null;
          this.protocolManager = void 0;
          this.eventManager = void 0;
          // 连接配置
          this.serverUrl = 'ws://localhost:8888';
          this.connectionState = ConnectionState.DISCONNECTED;
          this.reconnectAttempts = 0;
          this.maxReconnectAttempts = 5;
          this.reconnectDelay = 3000;
          // 消息队列
          this.messageQueue = [];
          this.sequenceNumber = 1;
          this.pendingRequests = new Map();
          // 心跳
          this.heartbeatInterval = null;
          this.heartbeatTimeout = null;
          this.lastHeartbeatTime = 0;
          this.protocolManager = (_crd && ProtocolManager === void 0 ? (_reportPossibleCrUseOfProtocolManager({
            error: Error()
          }), ProtocolManager) : ProtocolManager).getInstance();
          this.eventManager = (_crd && EventManager === void 0 ? (_reportPossibleCrUseOfEventManager({
            error: Error()
          }), EventManager) : EventManager).getInstance();
        } // 设置服务器地址


        setServerUrl(url) {
          this.serverUrl = url;
        } // 连接服务器


        connect() {
          return new Promise((resolve, reject) => {
            if (this.connectionState === ConnectionState.CONNECTED) {
              resolve();
              return;
            }

            if (this.connectionState === ConnectionState.CONNECTING) {
              reject(new Error('Already connecting'));
              return;
            }

            this.connectionState = ConnectionState.CONNECTING;
            console.log('Connecting to server:', this.serverUrl);

            try {
              this.websocket = new WebSocket(this.serverUrl);
              this.websocket.binaryType = 'arraybuffer';

              this.websocket.onopen = () => {
                console.log('WebSocket connected');
                this.connectionState = ConnectionState.CONNECTED;
                this.reconnectAttempts = 0;
                this.startHeartbeat();
                this.processMessageQueue();
                this.eventManager.emit(NetworkEvent.CONNECTED);
                resolve();
              };

              this.websocket.onclose = event => {
                console.log('WebSocket closed:', event.code, event.reason);
                this.handleDisconnection();
              };

              this.websocket.onerror = error => {
                console.error('WebSocket error:', error);
                this.connectionState = ConnectionState.DISCONNECTED;
                this.eventManager.emit(NetworkEvent.ERROR, error);
                reject(error);
              };

              this.websocket.onmessage = event => {
                this.handleMessage(new Uint8Array(event.data));
              };
            } catch (error) {
              this.connectionState = ConnectionState.DISCONNECTED;
              reject(error);
            }
          });
        } // 断开连接


        disconnect() {
          this.connectionState = ConnectionState.DISCONNECTED;
          this.stopHeartbeat();

          if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
          }

          this.pendingRequests.clear();
          this.eventManager.emit(NetworkEvent.DISCONNECTED);
        } // 发送消息


        sendMessage(cmd, data) {
          var seq = this.sequenceNumber++;
          var wrapper = this.protocolManager.encodeWrapper(cmd, seq, data);

          if (this.connectionState === ConnectionState.CONNECTED && this.websocket) {
            this.websocket.send(wrapper);
          } else {
            // 连接断开时加入队列
            this.messageQueue.push(wrapper);
          }

          return seq;
        } // 发送请求并等待响应


        sendRequest(cmd, data, timeout) {
          if (timeout === void 0) {
            timeout = 10000;
          }

          return new Promise((resolve, reject) => {
            var seq = this.sendMessage(cmd, data);
            var timeoutId = setTimeout(() => {
              this.pendingRequests.delete(seq);
              reject(new Error('Request timeout'));
            }, timeout);
            this.pendingRequests.set(seq, {
              resolve,
              reject,
              timeoutId,
              cmd
            });
          });
        } // 处理接收到的消息


        handleMessage(data) {
          try {
            var response = this.protocolManager.decodeResponse(data); // 处理心跳响应

            if (response.cmd === 0) {
              // CMD_HEARTBEAT
              this.handleHeartbeatResponse(response);
              return;
            } // 处理请求响应


            var pendingRequest = this.pendingRequests.get(response.seq);

            if (pendingRequest) {
              clearTimeout(pendingRequest.timeoutId);
              this.pendingRequests.delete(response.seq);

              if (response.code === 0) {
                pendingRequest.resolve(response);
              } else {
                pendingRequest.reject(new Error(response.message || 'Server error'));
              }

              return;
            } // 处理推送消息


            this.eventManager.emit(NetworkEvent.MESSAGE_RECEIVED, response);
          } catch (error) {
            console.error('Failed to handle message:', error);
          }
        } // 处理断线


        handleDisconnection() {
          this.connectionState = ConnectionState.DISCONNECTED;
          this.stopHeartbeat();

          if (this.websocket) {
            this.websocket = null;
          }

          this.eventManager.emit(NetworkEvent.DISCONNECTED); // 自动重连

          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnect();
          }
        } // 重连


        reconnect() {
          if (this.connectionState === ConnectionState.RECONNECTING) {
            return;
          }

          this.connectionState = ConnectionState.RECONNECTING;
          this.reconnectAttempts++;
          console.log("Reconnecting... (" + this.reconnectAttempts + "/" + this.maxReconnectAttempts + ")");
          this.eventManager.emit(NetworkEvent.RECONNECTING, this.reconnectAttempts);
          setTimeout(() => {
            this.connect().catch(error => {
              console.error('Reconnect failed:', error);

              if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('Max reconnect attempts reached');
                this.eventManager.emit(NetworkEvent.ERROR, new Error('Max reconnect attempts reached'));
              }
            });
          }, this.reconnectDelay);
        } // 处理消息队列


        processMessageQueue() {
          while (this.messageQueue.length > 0 && this.connectionState === ConnectionState.CONNECTED) {
            var message = this.messageQueue.shift();

            if (message && this.websocket) {
              this.websocket.send(message);
            }
          }
        } // 开始心跳


        startHeartbeat() {
          this.stopHeartbeat();
          this.heartbeatInterval = setInterval(() => {
            if (this.connectionState === ConnectionState.CONNECTED) {
              var heartbeatData = this.protocolManager.encodeHeartbeatRequest();
              this.sendMessage(0, heartbeatData); // CMD_HEARTBEAT

              this.lastHeartbeatTime = Date.now(); // 设置心跳超时

              this.heartbeatTimeout = setTimeout(() => {
                console.warn('Heartbeat timeout');
                this.handleDisconnection();
              }, 10000);
            }
          }, 30000); // 30秒心跳间隔
        } // 停止心跳


        stopHeartbeat() {
          if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
          }

          if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
          }
        } // 处理心跳响应


        handleHeartbeatResponse(response) {
          if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
          }

          var latency = Date.now() - this.lastHeartbeatTime;
          console.log("Heartbeat response received, latency: " + latency + "ms");
        } // 获取连接状态


        getConnectionState() {
          return this.connectionState;
        } // 是否已连接


        isConnected() {
          return this.connectionState === ConnectionState.CONNECTED;
        }

      }, _class2.instance = void 0, _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=52d8cc73f654e2055abaeba6127831f8defd86b4.js.map