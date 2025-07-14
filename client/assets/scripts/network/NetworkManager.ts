import { _decorator, Component, director } from 'cc';
import { ProtocolManager } from '../protocol/ProtocolManager';
import { EventManager } from '../managers/EventManager';

const { ccclass, property } = _decorator;

export enum NetworkEvent {
    CONNECTED = 'network_connected',
    DISCONNECTED = 'network_disconnected',
    RECONNECTING = 'network_reconnecting',
    ERROR = 'network_error',
    MESSAGE_RECEIVED = 'network_message_received'
}

export enum ConnectionState {
    DISCONNECTED = 0,
    CONNECTING = 1,
    CONNECTED = 2,
    RECONNECTING = 3
}

@ccclass('NetworkManager')
export class NetworkManager {
    private static instance: NetworkManager;
    
    private websocket: WebSocket | null = null;
    private protocolManager: ProtocolManager;
    private eventManager: EventManager;
    
    // 连接配置
    private serverUrl: string = 'ws://localhost:8888';
    private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectDelay: number = 3000;
    
    // 消息队列
    private messageQueue: Uint8Array[] = [];
    private sequenceNumber: number = 1;
    private pendingRequests: Map<number, any> = new Map();
    
    // 心跳
    private heartbeatInterval: number | null = null;
    private heartbeatTimeout: number | null = null;
    private lastHeartbeatTime: number = 0;
    
    public static getInstance(): NetworkManager {
        if (!NetworkManager.instance) {
            NetworkManager.instance = new NetworkManager();
        }
        return NetworkManager.instance;
    }
    
    private constructor() {
        this.protocolManager = ProtocolManager.getInstance();
        this.eventManager = EventManager.getInstance();
    }
    
    // 设置服务器地址
    public setServerUrl(url: string): void {
        this.serverUrl = url;
    }
    
    // 连接服务器
    public connect(): Promise<void> {
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
                
                this.websocket.onclose = (event) => {
                    console.log('WebSocket closed:', event.code, event.reason);
                    this.handleDisconnection();
                };
                
                this.websocket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    this.connectionState = ConnectionState.DISCONNECTED;
                    this.eventManager.emit(NetworkEvent.ERROR, error);
                    reject(error);
                };
                
                this.websocket.onmessage = (event) => {
                    this.handleMessage(new Uint8Array(event.data));
                };
                
            } catch (error) {
                this.connectionState = ConnectionState.DISCONNECTED;
                reject(error);
            }
        });
    }
    
    // 断开连接
    public disconnect(): void {
        this.connectionState = ConnectionState.DISCONNECTED;
        this.stopHeartbeat();
        
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
        
        this.pendingRequests.clear();
        this.eventManager.emit(NetworkEvent.DISCONNECTED);
    }
    
    // 发送消息
    public sendMessage(cmd: number, data: Uint8Array): number {
        const seq = this.sequenceNumber++;
        const wrapper = this.protocolManager.encodeWrapper(cmd, seq, data);
        
        if (this.connectionState === ConnectionState.CONNECTED && this.websocket) {
            this.websocket.send(wrapper);
        } else {
            // 连接断开时加入队列
            this.messageQueue.push(wrapper);
        }
        
        return seq;
    }
    
    // 发送请求并等待响应
    public sendRequest(cmd: number, data: Uint8Array, timeout: number = 10000): Promise<any> {
        return new Promise((resolve, reject) => {
            const seq = this.sendMessage(cmd, data);
            
            const timeoutId = setTimeout(() => {
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
    }
    
    // 处理接收到的消息
    private handleMessage(data: Uint8Array): void {
        try {
            const response = this.protocolManager.decodeResponse(data);
            
            // 处理心跳响应
            if (response.cmd === 0) { // CMD_HEARTBEAT
                this.handleHeartbeatResponse(response);
                return;
            }
            
            // 处理请求响应
            const pendingRequest = this.pendingRequests.get(response.seq);
            if (pendingRequest) {
                clearTimeout(pendingRequest.timeoutId);
                this.pendingRequests.delete(response.seq);
                
                if (response.code === 0) {
                    pendingRequest.resolve(response);
                } else {
                    pendingRequest.reject(new Error(response.message || 'Server error'));
                }
                return;
            }
            
            // 处理推送消息
            this.eventManager.emit(NetworkEvent.MESSAGE_RECEIVED, response);
            
        } catch (error) {
            console.error('Failed to handle message:', error);
        }
    }
    
    // 处理断线
    private handleDisconnection(): void {
        this.connectionState = ConnectionState.DISCONNECTED;
        this.stopHeartbeat();
        
        if (this.websocket) {
            this.websocket = null;
        }
        
        this.eventManager.emit(NetworkEvent.DISCONNECTED);
        
        // 自动重连
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnect();
        }
    }
    
    // 重连
    private reconnect(): void {
        if (this.connectionState === ConnectionState.RECONNECTING) {
            return;
        }
        
        this.connectionState = ConnectionState.RECONNECTING;
        this.reconnectAttempts++;
        
        console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.eventManager.emit(NetworkEvent.RECONNECTING, this.reconnectAttempts);
        
        setTimeout(() => {
            this.connect().catch((error) => {
                console.error('Reconnect failed:', error);
                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    console.error('Max reconnect attempts reached');
                    this.eventManager.emit(NetworkEvent.ERROR, new Error('Max reconnect attempts reached'));
                }
            });
        }, this.reconnectDelay);
    }
    
    // 处理消息队列
    private processMessageQueue(): void {
        while (this.messageQueue.length > 0 && this.connectionState === ConnectionState.CONNECTED) {
            const message = this.messageQueue.shift();
            if (message && this.websocket) {
                this.websocket.send(message);
            }
        }
    }
    
    // 开始心跳
    private startHeartbeat(): void {
        this.stopHeartbeat();
        
        this.heartbeatInterval = setInterval(() => {
            if (this.connectionState === ConnectionState.CONNECTED) {
                const heartbeatData = this.protocolManager.encodeHeartbeatRequest();
                this.sendMessage(0, heartbeatData); // CMD_HEARTBEAT
                this.lastHeartbeatTime = Date.now();
                
                // 设置心跳超时
                this.heartbeatTimeout = setTimeout(() => {
                    console.warn('Heartbeat timeout');
                    this.handleDisconnection();
                }, 10000);
            }
        }, 30000); // 30秒心跳间隔
    }
    
    // 停止心跳
    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }
    }
    
    // 处理心跳响应
    private handleHeartbeatResponse(response: any): void {
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }
        
        const latency = Date.now() - this.lastHeartbeatTime;
        console.log(`Heartbeat response received, latency: ${latency}ms`);
    }
    
    // 获取连接状态
    public getConnectionState(): ConnectionState {
        return this.connectionState;
    }
    
    // 是否已连接
    public isConnected(): boolean {
        return this.connectionState === ConnectionState.CONNECTED;
    }
}
