import { _decorator, Component, Node, Prefab, instantiate, Canvas, find } from 'cc';
import { EventManager } from '../managers/EventManager';

const { ccclass, property } = _decorator;

export enum UILayer {
    BACKGROUND = 0,
    NORMAL = 1,
    POPUP = 2,
    SYSTEM = 3,
    TOP = 4
}

export interface UIConfig {
    prefab: Prefab;
    layer: UILayer;
    singleton: boolean;
    cache: boolean;
}

@ccclass('UIManager')
export class UIManager {
    private static instance: UIManager;
    
    private canvas: Canvas = null!;
    private layers: Node[] = [];
    private uiConfigs: Map<string, UIConfig> = new Map();
    private uiInstances: Map<string, Node> = new Map();
    private uiCache: Map<string, Node> = new Map();
    private eventManager: EventManager;
    
    public static getInstance(): UIManager {
        if (!UIManager.instance) {
            UIManager.instance = new UIManager();
        }
        return UIManager.instance;
    }
    
    private constructor() {
        this.eventManager = EventManager.getInstance();
        this.initializeLayers();
    }
    
    private initializeLayers(): void {
        // 查找Canvas节点
        const canvasNode = find('Canvas');
        if (canvasNode) {
            this.canvas = canvasNode.getComponent(Canvas)!;
        }
        
        if (!this.canvas) {
            console.error('Canvas not found! UI system may not work properly.');
            return;
        }
        
        // 创建UI层级
        for (let i = 0; i <= UILayer.TOP; i++) {
            const layerNode = new Node(`UILayer_${i}`);
            layerNode.parent = this.canvas.node;
            layerNode.setSiblingIndex(i);
            this.layers[i] = layerNode;
        }
        
        console.log('UI layers initialized');
    }
    
    // 注册UI配置
    public registerUI(name: string, config: UIConfig): void {
        this.uiConfigs.set(name, config);
    }
    
    // 批量注册UI
    public registerUIs(configs: { [name: string]: UIConfig }): void {
        for (const name in configs) {
            this.registerUI(name, configs[name]);
        }
    }
    
    // 显示UI
    public async showUI(name: string, data?: any): Promise<Node | null> {
        const config = this.uiConfigs.get(name);
        if (!config) {
            console.error(`UI config not found: ${name}`);
            return null;
        }
        
        // 检查单例模式
        if (config.singleton && this.uiInstances.has(name)) {
            const existingUI = this.uiInstances.get(name)!;
            existingUI.active = true;
            this.bringToFront(existingUI);
            
            // 触发显示事件
            this.notifyUIEvent(name, 'show', data);
            return existingUI;
        }
        
        // 从缓存获取或创建新实例
        let uiNode = this.getFromCache(name);
        if (!uiNode) {
            uiNode = this.createUIInstance(name, config);
            if (!uiNode) {
                return null;
            }
        }
        
        // 设置父节点和层级
        uiNode.parent = this.layers[config.layer];
        uiNode.active = true;
        
        // 记录实例
        if (config.singleton) {
            this.uiInstances.set(name, uiNode);
        }
        
        // 触发显示事件
        this.notifyUIEvent(name, 'show', data);
        
        console.log(`UI shown: ${name}`);
        return uiNode;
    }
    
    // 隐藏UI
    public hideUI(name: string, destroy: boolean = false): void {
        const uiNode = this.uiInstances.get(name);
        if (!uiNode) {
            console.warn(`UI not found: ${name}`);
            return;
        }
        
        uiNode.active = false;
        
        // 触发隐藏事件
        this.notifyUIEvent(name, 'hide');
        
        if (destroy) {
            this.destroyUI(name);
        } else {
            const config = this.uiConfigs.get(name);
            if (config && config.cache) {
                this.addToCache(name, uiNode);
            }
        }
        
        console.log(`UI hidden: ${name}`);
    }
    
    // 销毁UI
    public destroyUI(name: string): void {
        const uiNode = this.uiInstances.get(name);
        if (uiNode) {
            uiNode.destroy();
            this.uiInstances.delete(name);
        }
        
        // 从缓存中移除
        this.removeFromCache(name);
        
        // 触发销毁事件
        this.notifyUIEvent(name, 'destroy');
        
        console.log(`UI destroyed: ${name}`);
    }
    
    // 切换UI显示状态
    public toggleUI(name: string, data?: any): void {
        const uiNode = this.uiInstances.get(name);
        if (uiNode && uiNode.active) {
            this.hideUI(name);
        } else {
            this.showUI(name, data);
        }
    }
    
    // 检查UI是否显示
    public isUIShown(name: string): boolean {
        const uiNode = this.uiInstances.get(name);
        return uiNode ? uiNode.active : false;
    }
    
    // 获取UI实例
    public getUI(name: string): Node | null {
        return this.uiInstances.get(name) || null;
    }
    
    // 关闭所有UI
    public closeAllUI(except?: string[]): void {
        const exceptSet = new Set(except || []);
        
        for (const [name, uiNode] of this.uiInstances) {
            if (!exceptSet.has(name) && uiNode.active) {
                this.hideUI(name);
            }
        }
    }
    
    // 关闭指定层级的所有UI
    public closeUIByLayer(layer: UILayer): void {
        for (const [name, uiNode] of this.uiInstances) {
            const config = this.uiConfigs.get(name);
            if (config && config.layer === layer && uiNode.active) {
                this.hideUI(name);
            }
        }
    }
    
    // 将UI置于最前
    public bringToFront(uiNode: Node): void {
        if (uiNode.parent) {
            uiNode.setSiblingIndex(-1);
        }
    }
    
    // 创建UI实例
    private createUIInstance(name: string, config: UIConfig): Node | null {
        if (!config.prefab) {
            console.error(`UI prefab not found: ${name}`);
            return null;
        }
        
        try {
            const uiNode = instantiate(config.prefab);
            uiNode.name = name;
            return uiNode;
        } catch (error) {
            console.error(`Failed to create UI instance: ${name}`, error);
            return null;
        }
    }
    
    // 缓存管理
    private addToCache(name: string, uiNode: Node): void {
        const config = this.uiConfigs.get(name);
        if (config && config.cache) {
            uiNode.parent = null;
            this.uiCache.set(name, uiNode);
        }
    }
    
    private getFromCache(name: string): Node | null {
        return this.uiCache.get(name) || null;
    }
    
    private removeFromCache(name: string): void {
        const cachedNode = this.uiCache.get(name);
        if (cachedNode) {
            cachedNode.destroy();
            this.uiCache.delete(name);
        }
    }
    
    // 事件通知
    private notifyUIEvent(name: string, event: string, data?: any): void {
        this.eventManager.emit(`ui_${name}_${event}`, data);
        this.eventManager.emit(`ui_${event}`, name, data);
    }
    
    // 清理所有UI
    public cleanup(): void {
        // 销毁所有实例
        for (const [name] of this.uiInstances) {
            this.destroyUI(name);
        }
        
        // 清理缓存
        for (const [name, cachedNode] of this.uiCache) {
            cachedNode.destroy();
        }
        this.uiCache.clear();
        
        console.log('UI system cleaned up');
    }
    
    // 获取统计信息
    public getStats(): any {
        return {
            totalConfigs: this.uiConfigs.size,
            activeInstances: this.uiInstances.size,
            cachedInstances: this.uiCache.size,
            layers: this.layers.length
        };
    }
}
