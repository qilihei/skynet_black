import { _decorator, Component, director, game, sys } from 'cc';
import { NetworkManager } from './network/NetworkManager';
import { EventManager } from './managers/EventManager';
import { GameDataManager } from './managers/GameDataManager';
import { SceneManager } from './managers/SceneManager';

const { ccclass, property } = _decorator;

@ccclass('GameApp')
export class GameApp extends Component {
    private static instance: GameApp;
    
    // 管理器实例
    private networkManager: NetworkManager;
    private eventManager: EventManager;
    private gameDataManager: GameDataManager;
    private sceneManager: SceneManager;
    
    // 应用配置
    private config = {
        serverUrl: 'ws://localhost:8888',
        version: '1.0.0',
        debug: true
    };
    
    public static getInstance(): GameApp {
        return GameApp.instance;
    }
    
    onLoad() {
        // 设置单例
        if (GameApp.instance) {
            this.node.destroy();
            return;
        }
        GameApp.instance = this;
        
        // 设置为常驻节点
        director.addPersistRootNode(this.node);
        
        // 初始化应用
        this.initializeApp();
    }
    
    private initializeApp(): void {
        console.log('=== Farm Game Client Starting ===');
        console.log('Version:', this.config.version);
        console.log('Platform:', sys.platform);
        console.log('Debug Mode:', this.config.debug);
        
        // 初始化管理器
        this.initializeManagers();
        
        // 设置应用配置
        this.setupAppConfig();
        
        // 注册全局事件
        this.registerGlobalEvents();
        
        // 加载本地数据
        this.loadLocalData();
        
        console.log('=== Game App Initialized ===');
    }
    
    private initializeManagers(): void {
        // 按顺序初始化管理器
        this.eventManager = EventManager.getInstance();
        this.gameDataManager = GameDataManager.getInstance();
        this.networkManager = NetworkManager.getInstance();
        this.sceneManager = SceneManager.getInstance();
        
        console.log('All managers initialized');
    }
    
    private setupAppConfig(): void {
        // 设置网络配置
        this.networkManager.setServerUrl(this.config.serverUrl);
        
        // 设置调试模式
        if (this.config.debug) {
            // 启用调试日志
            console.log('Debug mode enabled');
        }
        
        // 设置游戏帧率
        game.frameRate = 60;
        
        // 设置屏幕适配
        this.setupScreenAdapter();
    }
    
    private setupScreenAdapter(): void {
        // 根据平台设置屏幕适配策略
        if (sys.isMobile) {
            // 移动端适配
            console.log('Mobile platform detected');
        } else {
            // 桌面端适配
            console.log('Desktop platform detected');
        }
    }
    
    private registerGlobalEvents(): void {
        // 注册应用生命周期事件
        game.on(game.EVENT_SHOW, this.onGameShow, this);
        game.on(game.EVENT_HIDE, this.onGameHide, this);
        
        // 注册错误处理
        window.addEventListener('error', this.onGlobalError.bind(this));
        window.addEventListener('unhandledrejection', this.onUnhandledRejection.bind(this));
        
        console.log('Global events registered');
    }
    
    private loadLocalData(): void {
        try {
            // 加载本地存储的游戏数据
            this.gameDataManager.loadFromLocal();
            console.log('Local data loaded');
        } catch (error) {
            console.error('Failed to load local data:', error);
        }
    }
    
    // 应用生命周期事件
    private onGameShow(): void {
        console.log('Game show');
        
        // 游戏进入前台时的处理
        if (this.networkManager.isConnected()) {
            // 重新开始心跳
            console.log('Resume network heartbeat');
        }
    }
    
    private onGameHide(): void {
        console.log('Game hide');
        
        // 游戏进入后台时的处理
        // 保存游戏数据
        this.gameDataManager.saveToLocal();
    }
    
    // 错误处理
    private onGlobalError(event: ErrorEvent): void {
        console.error('Global error:', event.error);
        
        // 可以在这里添加错误上报逻辑
        this.reportError('GlobalError', event.error);
    }
    
    private onUnhandledRejection(event: PromiseRejectionEvent): void {
        console.error('Unhandled promise rejection:', event.reason);
        
        // 可以在这里添加错误上报逻辑
        this.reportError('UnhandledRejection', event.reason);
    }
    
    private reportError(type: string, error: any): void {
        // TODO: 实现错误上报
        console.log('Report error:', type, error);
    }
    
    // 公共方法
    public getConfig(): any {
        return this.config;
    }
    
    public setServerUrl(url: string): void {
        this.config.serverUrl = url;
        this.networkManager.setServerUrl(url);
    }
    
    public getVersion(): string {
        return this.config.version;
    }
    
    public isDebugMode(): boolean {
        return this.config.debug;
    }
    
    // 应用退出
    public exitApp(): void {
        console.log('Exiting application...');
        
        // 保存数据
        this.gameDataManager.saveToLocal();
        
        // 断开网络连接
        this.networkManager.disconnect();
        
        // 清理资源
        this.cleanup();
        
        // 退出游戏
        game.end();
    }
    
    private cleanup(): void {
        // 清理管理器
        this.eventManager.clear();
        
        // 移除全局事件监听
        game.off(game.EVENT_SHOW, this.onGameShow, this);
        game.off(game.EVENT_HIDE, this.onGameHide, this);
        
        console.log('Application cleanup completed');
    }
    
    onDestroy() {
        this.cleanup();
    }
}
