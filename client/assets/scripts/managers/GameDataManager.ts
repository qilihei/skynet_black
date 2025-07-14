import { _decorator } from 'cc';
import { EventManager } from './EventManager';

const { ccclass } = _decorator;

export interface PlayerData {
    id: number;
    name: string;
    level: number;
    gold: number;
    energy: number;
    maxEnergy: number;
    avatarId: number;
    position: {
        x: number;
        y: number;
        mapId: number;
    };
}

export interface FarmData {
    farmId: number;
    name: string;
    level: number;
    size: {
        width: number;
        height: number;
    };
    plots: any[];
    buildings: any[];
    moneyEarned: number;
}

export enum GameDataEvent {
    PLAYER_DATA_UPDATED = 'player_data_updated',
    FARM_DATA_UPDATED = 'farm_data_updated',
    INVENTORY_UPDATED = 'inventory_updated'
}

@ccclass('GameDataManager')
export class GameDataManager {
    private static instance: GameDataManager;
    private eventManager: EventManager;
    
    // 游戏数据
    private playerData: PlayerData | null = null;
    private farmData: FarmData | null = null;
    private inventory: any[] = [];
    private sessionToken: string = '';
    
    public static getInstance(): GameDataManager {
        if (!GameDataManager.instance) {
            GameDataManager.instance = new GameDataManager();
        }
        return GameDataManager.instance;
    }
    
    private constructor() {
        this.eventManager = EventManager.getInstance();
    }
    
    // 设置会话令牌
    public setSessionToken(token: string): void {
        this.sessionToken = token;
        // 保存到本地存储
        localStorage.setItem('session_token', token);
    }
    
    // 获取会话令牌
    public getSessionToken(): string {
        if (!this.sessionToken) {
            this.sessionToken = localStorage.getItem('session_token') || '';
        }
        return this.sessionToken;
    }
    
    // 清除会话令牌
    public clearSessionToken(): void {
        this.sessionToken = '';
        localStorage.removeItem('session_token');
    }
    
    // 设置玩家数据
    public setPlayerData(data: any): void {
        this.playerData = {
            id: data.id || data.player_id,
            name: data.name,
            level: data.level,
            gold: data.gold,
            energy: data.energy,
            maxEnergy: data.max_energy || data.maxEnergy,
            avatarId: data.avatar_id || data.avatarId,
            position: {
                x: data.x_position || data.position?.x || 0,
                y: data.y_position || data.position?.y || 0,
                mapId: data.map_id || data.position?.map_id || data.position?.mapId || 1
            }
        };
        
        this.eventManager.emit(GameDataEvent.PLAYER_DATA_UPDATED, this.playerData);
    }
    
    // 获取玩家数据
    public getPlayerData(): PlayerData | null {
        return this.playerData;
    }
    
    // 更新玩家位置
    public updatePlayerPosition(x: number, y: number, mapId?: number): void {
        if (this.playerData) {
            this.playerData.position.x = x;
            this.playerData.position.y = y;
            if (mapId !== undefined) {
                this.playerData.position.mapId = mapId;
            }
            this.eventManager.emit(GameDataEvent.PLAYER_DATA_UPDATED, this.playerData);
        }
    }
    
    // 更新玩家金币
    public updatePlayerGold(gold: number): void {
        if (this.playerData) {
            this.playerData.gold = gold;
            this.eventManager.emit(GameDataEvent.PLAYER_DATA_UPDATED, this.playerData);
        }
    }
    
    // 更新玩家体力
    public updatePlayerEnergy(energy: number): void {
        if (this.playerData) {
            this.playerData.energy = energy;
            this.eventManager.emit(GameDataEvent.PLAYER_DATA_UPDATED, this.playerData);
        }
    }
    
    // 设置农场数据
    public setFarmData(data: any): void {
        this.farmData = {
            farmId: data.farm_id || data.farmId,
            name: data.name,
            level: data.level,
            size: {
                width: data.size?.width || 10,
                height: data.size?.height || 10
            },
            plots: data.plots || [],
            buildings: data.buildings || [],
            moneyEarned: data.money_earned || data.moneyEarned || 0
        };
        
        this.eventManager.emit(GameDataEvent.FARM_DATA_UPDATED, this.farmData);
    }
    
    // 获取农场数据
    public getFarmData(): FarmData | null {
        return this.farmData;
    }
    
    // 设置背包数据
    public setInventory(items: any[]): void {
        this.inventory = items || [];
        this.eventManager.emit(GameDataEvent.INVENTORY_UPDATED, this.inventory);
    }
    
    // 获取背包数据
    public getInventory(): any[] {
        return this.inventory;
    }
    
    // 添加物品到背包
    public addItemToInventory(item: any): void {
        this.inventory.push(item);
        this.eventManager.emit(GameDataEvent.INVENTORY_UPDATED, this.inventory);
    }
    
    // 从背包移除物品
    public removeItemFromInventory(slot: number): void {
        const index = this.inventory.findIndex(item => item.slot === slot);
        if (index !== -1) {
            this.inventory.splice(index, 1);
            this.eventManager.emit(GameDataEvent.INVENTORY_UPDATED, this.inventory);
        }
    }
    
    // 更新背包物品
    public updateInventoryItem(slot: number, quantity: number): void {
        const item = this.inventory.find(item => item.slot === slot);
        if (item) {
            item.quantity = quantity;
            if (quantity <= 0) {
                this.removeItemFromInventory(slot);
            } else {
                this.eventManager.emit(GameDataEvent.INVENTORY_UPDATED, this.inventory);
            }
        }
    }
    
    // 检查是否已登录
    public isLoggedIn(): boolean {
        return this.playerData !== null && this.sessionToken !== '';
    }
    
    // 清除所有数据
    public clearAllData(): void {
        this.playerData = null;
        this.farmData = null;
        this.inventory = [];
        this.clearSessionToken();
        
        this.eventManager.emit(GameDataEvent.PLAYER_DATA_UPDATED, null);
        this.eventManager.emit(GameDataEvent.FARM_DATA_UPDATED, null);
        this.eventManager.emit(GameDataEvent.INVENTORY_UPDATED, []);
    }
    
    // 保存数据到本地存储
    public saveToLocal(): void {
        try {
            if (this.playerData) {
                localStorage.setItem('player_data', JSON.stringify(this.playerData));
            }
            if (this.farmData) {
                localStorage.setItem('farm_data', JSON.stringify(this.farmData));
            }
            if (this.inventory.length > 0) {
                localStorage.setItem('inventory_data', JSON.stringify(this.inventory));
            }
        } catch (error) {
            console.error('Failed to save data to local storage:', error);
        }
    }
    
    // 从本地存储加载数据
    public loadFromLocal(): void {
        try {
            const playerDataStr = localStorage.getItem('player_data');
            if (playerDataStr) {
                this.playerData = JSON.parse(playerDataStr);
                this.eventManager.emit(GameDataEvent.PLAYER_DATA_UPDATED, this.playerData);
            }
            
            const farmDataStr = localStorage.getItem('farm_data');
            if (farmDataStr) {
                this.farmData = JSON.parse(farmDataStr);
                this.eventManager.emit(GameDataEvent.FARM_DATA_UPDATED, this.farmData);
            }
            
            const inventoryDataStr = localStorage.getItem('inventory_data');
            if (inventoryDataStr) {
                this.inventory = JSON.parse(inventoryDataStr);
                this.eventManager.emit(GameDataEvent.INVENTORY_UPDATED, this.inventory);
            }
        } catch (error) {
            console.error('Failed to load data from local storage:', error);
        }
    }
}
