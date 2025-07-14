import { _decorator, director, Scene } from 'cc';
import { EventManager } from './EventManager';

const { ccclass } = _decorator;

export enum SceneName {
    LOGIN = 'LoginScene',
    GAME = 'GameScene',
    LOADING = 'LoadingScene'
}

export enum SceneEvent {
    SCENE_LOADING = 'scene_loading',
    SCENE_LOADED = 'scene_loaded',
    SCENE_LAUNCH_FINISHED = 'scene_launch_finished'
}

@ccclass('SceneManager')
export class SceneManager {
    private static instance: SceneManager;
    private eventManager: EventManager;
    private currentScene: string = '';
    private isLoading: boolean = false;
    
    public static getInstance(): SceneManager {
        if (!SceneManager.instance) {
            SceneManager.instance = new SceneManager();
        }
        return SceneManager.instance;
    }
    
    private constructor() {
        this.eventManager = EventManager.getInstance();
    }
    
    // 加载场景
    public loadScene(sceneName: SceneName, onProgress?: (progress: number) => void): Promise<void> {
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
            
            console.log(`Loading scene: ${sceneName}`);
            
            director.loadScene(sceneName, (error: Error | null) => {
                this.isLoading = false;
                
                if (error) {
                    console.error(`Failed to load scene ${sceneName}:`, error);
                    reject(error);
                } else {
                    console.log(`Scene loaded: ${sceneName}`);
                    this.currentScene = sceneName;
                    this.eventManager.emit(SceneEvent.SCENE_LOADED, sceneName);
                    resolve();
                }
            });
        });
    }
    
    // 预加载场景
    public preloadScene(sceneName: SceneName, onProgress?: (progress: number) => void): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log(`Preloading scene: ${sceneName}`);
            
            director.preloadScene(sceneName, (completedCount: number, totalCount: number, item: any) => {
                const progress = completedCount / totalCount;
                if (onProgress) {
                    onProgress(progress);
                }
            }, (error: Error | null) => {
                if (error) {
                    console.error(`Failed to preload scene ${sceneName}:`, error);
                    reject(error);
                } else {
                    console.log(`Scene preloaded: ${sceneName}`);
                    resolve();
                }
            });
        });
    }
    
    // 切换到登录场景
    public gotoLoginScene(): Promise<void> {
        return this.loadScene(SceneName.LOGIN);
    }
    
    // 切换到游戏场景
    public gotoGameScene(): Promise<void> {
        return this.loadScene(SceneName.GAME);
    }
    
    // 切换到加载场景
    public gotoLoadingScene(): Promise<void> {
        return this.loadScene(SceneName.LOADING);
    }
    
    // 获取当前场景名称
    public getCurrentScene(): string {
        return this.currentScene;
    }
    
    // 是否正在加载
    public isSceneLoading(): boolean {
        return this.isLoading;
    }
    
    // 重新加载当前场景
    public reloadCurrentScene(): Promise<void> {
        if (!this.currentScene) {
            return Promise.reject(new Error('No current scene to reload'));
        }
        
        const sceneName = this.currentScene as SceneName;
        this.currentScene = '';
        return this.loadScene(sceneName);
    }
}
