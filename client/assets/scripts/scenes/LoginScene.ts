import { _decorator, Component, Node, EditBox, Button, Label, director } from 'cc';
import { NetworkManager, NetworkEvent, ConnectionState } from '../network/NetworkManager';
import { ProtocolManager } from '../protocol/ProtocolManager';
import { EventManager } from '../managers/EventManager';
import { GameDataManager } from '../managers/GameDataManager';
import { SceneManager, SceneName } from '../managers/SceneManager';

const { ccclass, property } = _decorator;

@ccclass('LoginScene')
export class LoginScene extends Component {
    @property(EditBox)
    usernameInput: EditBox = null!;
    
    @property(EditBox)
    passwordInput: EditBox = null!;
    
    @property(Button)
    loginButton: Button = null!;
    
    @property(Button)
    connectButton: Button = null!;
    
    @property(Label)
    statusLabel: Label = null!;
    
    @property(Label)
    versionLabel: Label = null!;
    
    @property(Node)
    loadingNode: Node = null!;
    
    private networkManager: NetworkManager;
    private protocolManager: ProtocolManager;
    private eventManager: EventManager;
    private gameDataManager: GameDataManager;
    private sceneManager: SceneManager;
    
    private isLoggingIn: boolean = false;
    
    onLoad() {
        // 获取管理器实例
        this.networkManager = NetworkManager.getInstance();
        this.protocolManager = ProtocolManager.getInstance();
        this.eventManager = EventManager.getInstance();
        this.gameDataManager = GameDataManager.getInstance();
        this.sceneManager = SceneManager.getInstance();
        
        // 设置版本信息
        if (this.versionLabel) {
            this.versionLabel.string = 'v1.0.0';
        }
        
        // 设置默认服务器地址
        this.networkManager.setServerUrl('ws://localhost:8888');
        
        // 注册事件监听
        this.registerEventListeners();
        
        // 设置按钮事件
        this.setupButtons();
        
        // 初始化UI状态
        this.updateUIState();
        
        // 尝试从本地存储恢复登录信息
        this.loadLoginInfo();
    }
    
    onDestroy() {
        // 移除事件监听
        this.eventManager.off(NetworkEvent.CONNECTED);
        this.eventManager.off(NetworkEvent.DISCONNECTED);
        this.eventManager.off(NetworkEvent.RECONNECTING);
        this.eventManager.off(NetworkEvent.ERROR);
    }
    
    private registerEventListeners(): void {
        // 网络连接事件
        this.eventManager.on(NetworkEvent.CONNECTED, this.onNetworkConnected, this);
        this.eventManager.on(NetworkEvent.DISCONNECTED, this.onNetworkDisconnected, this);
        this.eventManager.on(NetworkEvent.RECONNECTING, this.onNetworkReconnecting, this);
        this.eventManager.on(NetworkEvent.ERROR, this.onNetworkError, this);
    }
    
    private setupButtons(): void {
        if (this.connectButton) {
            this.connectButton.node.on(Button.EventType.CLICK, this.onConnectButtonClick, this);
        }
        
        if (this.loginButton) {
            this.loginButton.node.on(Button.EventType.CLICK, this.onLoginButtonClick, this);
        }
    }
    
    private updateUIState(): void {
        const connectionState = this.networkManager.getConnectionState();
        const isConnected = connectionState === ConnectionState.CONNECTED;
        
        // 更新按钮状态
        if (this.connectButton) {
            this.connectButton.interactable = !this.isLoggingIn;
            const connectLabel = this.connectButton.getComponentInChildren(Label);
            if (connectLabel) {
                switch (connectionState) {
                    case ConnectionState.DISCONNECTED:
                        connectLabel.string = '连接服务器';
                        break;
                    case ConnectionState.CONNECTING:
                        connectLabel.string = '连接中...';
                        break;
                    case ConnectionState.CONNECTED:
                        connectLabel.string = '已连接';
                        break;
                    case ConnectionState.RECONNECTING:
                        connectLabel.string = '重连中...';
                        break;
                }
            }
        }
        
        if (this.loginButton) {
            this.loginButton.interactable = isConnected && !this.isLoggingIn;
            const loginLabel = this.loginButton.getComponentInChildren(Label);
            if (loginLabel) {
                loginLabel.string = this.isLoggingIn ? '登录中...' : '登录';
            }
        }
        
        // 更新输入框状态
        if (this.usernameInput) {
            this.usernameInput.enabled = !this.isLoggingIn;
        }
        if (this.passwordInput) {
            this.passwordInput.enabled = !this.isLoggingIn;
        }
        
        // 更新加载动画
        if (this.loadingNode) {
            this.loadingNode.active = this.isLoggingIn;
        }
    }
    
    private updateStatusLabel(message: string, isError: boolean = false): void {
        if (this.statusLabel) {
            this.statusLabel.string = message;
            // 可以根据isError设置不同的颜色
        }
        console.log('Status:', message);
    }
    
    private onConnectButtonClick(): void {
        if (this.networkManager.isConnected()) {
            this.networkManager.disconnect();
        } else {
            this.connectToServer();
        }
    }
    
    private async connectToServer(): Promise<void> {
        this.updateStatusLabel('正在连接服务器...');
        
        try {
            await this.networkManager.connect();
            this.updateStatusLabel('服务器连接成功');
        } catch (error) {
            this.updateStatusLabel('连接服务器失败: ' + error.message, true);
        }
    }
    
    private onLoginButtonClick(): void {
        if (!this.networkManager.isConnected()) {
            this.updateStatusLabel('请先连接服务器', true);
            return;
        }
        
        const username = this.usernameInput?.string?.trim();
        const password = this.passwordInput?.string?.trim();
        
        if (!username || !password) {
            this.updateStatusLabel('请输入用户名和密码', true);
            return;
        }
        
        this.login(username, password);
    }
    
    private async login(username: string, password: string): Promise<void> {
        this.isLoggingIn = true;
        this.updateUIState();
        this.updateStatusLabel('正在登录...');
        
        try {
            // 编码登录请求
            const loginData = this.protocolManager.encodeLoginRequest(username, password);
            const cmdId = this.protocolManager.getCommandId('LOGIN_REQUEST');
            
            // 发送登录请求
            const response = await this.networkManager.sendRequest(cmdId, loginData, 10000);
            
            if (response.code === 0) {
                // 登录成功
                const loginResponse = this.protocolManager.decodeLoginResponse(response.data);
                
                // 保存登录数据
                this.gameDataManager.setSessionToken(loginResponse.session_token);
                this.gameDataManager.setPlayerData(loginResponse.player_info);
                
                // 保存登录信息到本地
                this.saveLoginInfo(username);
                
                this.updateStatusLabel('登录成功，正在进入游戏...');
                
                // 延迟一下再跳转，让用户看到成功消息
                setTimeout(() => {
                    this.enterGame();
                }, 1000);
                
            } else {
                this.updateStatusLabel('登录失败: ' + response.message, true);
            }
            
        } catch (error) {
            this.updateStatusLabel('登录失败: ' + error.message, true);
        } finally {
            this.isLoggingIn = false;
            this.updateUIState();
        }
    }
    
    private async enterGame(): Promise<void> {
        try {
            await this.sceneManager.gotoGameScene();
        } catch (error) {
            this.updateStatusLabel('进入游戏失败: ' + error.message, true);
        }
    }
    
    private saveLoginInfo(username: string): void {
        try {
            localStorage.setItem('last_username', username);
        } catch (error) {
            console.error('Failed to save login info:', error);
        }
    }
    
    private loadLoginInfo(): void {
        try {
            const lastUsername = localStorage.getItem('last_username');
            if (lastUsername && this.usernameInput) {
                this.usernameInput.string = lastUsername;
            }
        } catch (error) {
            console.error('Failed to load login info:', error);
        }
    }
    
    // 网络事件处理
    private onNetworkConnected(): void {
        this.updateStatusLabel('服务器连接成功');
        this.updateUIState();
    }
    
    private onNetworkDisconnected(): void {
        this.updateStatusLabel('与服务器断开连接', true);
        this.updateUIState();
    }
    
    private onNetworkReconnecting(attempts: number): void {
        this.updateStatusLabel(`正在重连... (${attempts}/5)`);
        this.updateUIState();
    }
    
    private onNetworkError(error: Error): void {
        this.updateStatusLabel('网络错误: ' + error.message, true);
        this.updateUIState();
    }
}
