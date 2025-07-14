import { _decorator } from 'cc';

const { ccclass } = _decorator;

export type EventCallback = (...args: any[]) => void;

@ccclass('EventManager')
export class EventManager {
    private static instance: EventManager;
    private eventMap: Map<string, EventCallback[]> = new Map();
    
    public static getInstance(): EventManager {
        if (!EventManager.instance) {
            EventManager.instance = new EventManager();
        }
        return EventManager.instance;
    }
    
    private constructor() {}
    
    // 注册事件监听
    public on(event: string, callback: EventCallback, target?: any): void {
        if (!this.eventMap.has(event)) {
            this.eventMap.set(event, []);
        }
        
        const callbacks = this.eventMap.get(event)!;
        
        // 绑定目标对象
        if (target) {
            callback = callback.bind(target);
        }
        
        callbacks.push(callback);
    }
    
    // 注册一次性事件监听
    public once(event: string, callback: EventCallback, target?: any): void {
        const onceCallback = (...args: any[]) => {
            callback.apply(target, args);
            this.off(event, onceCallback);
        };
        
        this.on(event, onceCallback);
    }
    
    // 移除事件监听
    public off(event: string, callback?: EventCallback): void {
        if (!this.eventMap.has(event)) {
            return;
        }
        
        const callbacks = this.eventMap.get(event)!;
        
        if (callback) {
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        } else {
            // 移除所有监听
            callbacks.length = 0;
        }
        
        // 如果没有监听器了，删除事件
        if (callbacks.length === 0) {
            this.eventMap.delete(event);
        }
    }
    
    // 触发事件
    public emit(event: string, ...args: any[]): void {
        if (!this.eventMap.has(event)) {
            return;
        }
        
        const callbacks = this.eventMap.get(event)!;
        
        // 复制数组，避免在回调中修改原数组导致问题
        const callbacksCopy = [...callbacks];
        
        for (const callback of callbacksCopy) {
            try {
                callback(...args);
            } catch (error) {
                console.error(`Error in event callback for '${event}':`, error);
            }
        }
    }
    
    // 检查是否有监听器
    public hasListener(event: string): boolean {
        return this.eventMap.has(event) && this.eventMap.get(event)!.length > 0;
    }
    
    // 获取监听器数量
    public getListenerCount(event: string): number {
        return this.eventMap.has(event) ? this.eventMap.get(event)!.length : 0;
    }
    
    // 清除所有事件监听
    public clear(): void {
        this.eventMap.clear();
    }
    
    // 获取所有事件名称
    public getEventNames(): string[] {
        return Array.from(this.eventMap.keys());
    }
}
