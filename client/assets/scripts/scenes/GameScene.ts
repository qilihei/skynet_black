import { _decorator, Component, Node, Label, Button, Sprite, Vec3, tween } from 'cc';
import { NetworkManager, NetworkEvent } from '../network/NetworkManager';
import { ProtocolManager } from '../protocol/ProtocolManager';
import { EventManager } from '../managers/EventManager';
import { GameDataManager, GameDataEvent, PlayerData } from '../managers/GameDataManager';
import { SceneManager } from '../managers/SceneManager';

const { ccclass, property } = _decorator;

@ccclass('GameScene')
export class GameScene extends Component {
    @property(Label)
    playerNameLabel: Label = null!;
    
    @property(Label)
    playerLevelLabel: Label = null!;
    
    @property(Label)
    playerGoldLabel: Label = null!;
    
    @property(Label)
    playerEnergyLabel: Label = null!;
    
    @property(Button)
    logoutButton: Button = null!;
    
    @property(Button)
    farmButton: Button = null!;
    
    @property(Button)
    inventoryButton: Button = null!;
    
    @property(Node)
    playerNode: Node = null!;
    
    @property(Node)
    farmArea: Node = null!;
    
    @property(Label)
    statusLabel: Label = null!;
    
    private networkManager: NetworkManager;
    private protocolManager: ProtocolManager;
    private eventManager: EventManager;
    private gameDataManager: GameDataManager;
    private sceneManager: SceneManager;
    
    private playerData: PlayerData | null = null;
    
    onLoad() {
        // 获取管理器实例
        this.networkManager = NetworkManager.getInstance();
        this.protocolManager = ProtocolManager.getInstance();
        this.eventManager = EventManager.getInstance();
        this.gameDataManager = GameDataManager.getInstance();
        this.sceneManager = SceneManager.getInstance();
        
        // 注册事件监听
        this.registerEventListeners();
        
        // 设置按钮事件
        this.setupButtons();
        
        // 检查登录状态
        this.checkLoginStatus();
        
        // 初始化游戏数据
        this.initializeGameData();
    }
    
    onDestroy() {
        // 移除事件监听
        this.eventManager.off(GameDataEvent.PLAYER_DATA_UPDATED);
        this.eventManager.off(NetworkEvent.DISCONNECTED);
        this.eventManager.off(NetworkEvent.MESSAGE_RECEIVED);
    }
    
    private registerEventListeners(): void {
        // 游戏数据事件
        this.eventManager.on(GameDataEvent.PLAYER_DATA_UPDATED, this.onPlayerDataUpdated, this);
        
        // 网络事件
        this.eventManager.on(NetworkEvent.DISCONNECTED, this.onNetworkDisconnected, this);
        this.eventManager.on(NetworkEvent.MESSAGE_RECEIVED, this.onMessageReceived, this);
    }
    
    private setupButtons(): void {
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
    
    private checkLoginStatus(): void {
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
    
    private async initializeGameData(): Promise<void> {
        // 获取玩家数据
        this.playerData = this.gameDataManager.getPlayerData();
        if (this.playerData) {
            this.updatePlayerUI();
        }
        
        // 请求最新的玩家信息
        try {
            await this.requestPlayerInfo();
            await this.requestFarmInfo();
            await this.requestInventoryInfo();
        } catch (error) {
            console.error('Failed to initialize game data:', error);
            this.updateStatusLabel('获取游戏数据失败: ' + error.message, true);
        }
    }
    
    private async requestPlayerInfo(): Promise<void> {
        try {
            const requestData = this.protocolManager.encodeGetPlayerInfoRequest();
            const cmdId = this.protocolManager.getCommandId('PLAYER_GET_INFO');
            
            const response = await this.networkManager.sendRequest(cmdId, requestData);
            
            if (response.code === 0) {
                const playerInfo = this.protocolManager.decodeGetPlayerInfoResponse(response.data);
                this.gameDataManager.setPlayerData(playerInfo.player_info);
            }
        } catch (error) {
            console.error('Failed to request player info:', error);
        }
    }
    
    private async requestFarmInfo(): Promise<void> {
        try {
            // TODO: 实现农场信息请求
            console.log('Requesting farm info...');
        } catch (error) {
            console.error('Failed to request farm info:', error);
        }
    }
    
    private async requestInventoryInfo(): Promise<void> {
        try {
            // TODO: 实现背包信息请求
            console.log('Requesting inventory info...');
        } catch (error) {
            console.error('Failed to request inventory info:', error);
        }
    }
    
    private updatePlayerUI(): void {
        if (!this.playerData) return;
        
        if (this.playerNameLabel) {
            this.playerNameLabel.string = this.playerData.name;
        }
        
        if (this.playerLevelLabel) {
            this.playerLevelLabel.string = `等级 ${this.playerData.level}`;
        }
        
        if (this.playerGoldLabel) {
            this.playerGoldLabel.string = `金币: ${this.playerData.gold}`;
        }
        
        if (this.playerEnergyLabel) {
            this.playerEnergyLabel.string = `体力: ${this.playerData.energy}/${this.playerData.maxEnergy}`;
        }
        
        // 更新玩家位置
        if (this.playerNode) {
            this.playerNode.setPosition(new Vec3(this.playerData.position.x, this.playerData.position.y, 0));
        }
    }
    
    private updateStatusLabel(message: string, isError: boolean = false): void {
        if (this.statusLabel) {
            this.statusLabel.string = message;
            // 可以根据isError设置不同的颜色
        }
        console.log('Status:', message);
    }
    
    private onLogoutButtonClick(): void {
        this.logout();
    }
    
    private async logout(): Promise<void> {
        try {
            this.updateStatusLabel('正在登出...');
            
            // 发送登出请求
            // TODO: 实现登出协议
            
            // 清除本地数据
            this.gameDataManager.clearAllData();
            
            // 断开网络连接
            this.networkManager.disconnect();
            
            // 返回登录页面
            await this.sceneManager.gotoLoginScene();
            
        } catch (error) {
            console.error('Logout failed:', error);
            this.updateStatusLabel('登出失败: ' + error.message, true);
        }
    }
    
    private onFarmButtonClick(): void {
        this.updateStatusLabel('打开农场界面...');
        // TODO: 实现农场界面
        console.log('Farm button clicked');
    }
    
    private onInventoryButtonClick(): void {
        this.updateStatusLabel('打开背包界面...');
        // TODO: 实现背包界面
        console.log('Inventory button clicked');
    }
    
    // 事件处理
    private onPlayerDataUpdated(playerData: PlayerData): void {
        this.playerData = playerData;
        this.updatePlayerUI();
        
        if (playerData) {
            this.updateStatusLabel(`欢迎回来，${playerData.name}！`);
        }
    }
    
    private onNetworkDisconnected(): void {
        this.updateStatusLabel('网络连接断开，返回登录页面...', true);
        setTimeout(() => {
            this.sceneManager.gotoLoginScene();
        }, 3000);
    }
    
    private onMessageReceived(message: any): void {
        console.log('Received message:', message);
        
        // 处理服务器推送消息
        switch (message.cmd) {
            case 1: // CMD_ANNOUNCEMENT
                this.handleAnnouncement(message);
                break;
            default:
                console.log('Unhandled message:', message);
                break;
        }
    }
    
    private handleAnnouncement(message: any): void {
        // TODO: 处理服务器公告
        console.log('Server announcement:', message);
        this.updateStatusLabel('收到服务器公告');
    }
    
    // 玩家移动（示例）
    public movePlayer(x: number, y: number): void {
        if (!this.playerNode || !this.playerData) return;
        
        const newPosition = new Vec3(x, y, 0);
        
        // 播放移动动画
        tween(this.playerNode)
            .to(0.5, { position: newPosition })
            .call(() => {
                // 更新玩家数据
                this.gameDataManager.updatePlayerPosition(x, y);
                
                // 发送位置更新到服务器
                this.sendPositionUpdate(x, y);
            })
            .start();
    }
    
    private async sendPositionUpdate(x: number, y: number): Promise<void> {
        try {
            // TODO: 实现位置更新协议
            console.log('Sending position update:', x, y);
        } catch (error) {
            console.error('Failed to send position update:', error);
        }
    }
}
