const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 协议生成脚本
console.log('=== 生成Protocol Buffers代码 ===');

const protoDir = path.join(__dirname, '../protocol');
const outputDir = path.join(__dirname, '../assets/scripts/protocol');

// 创建输出目录
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// 查找所有.proto文件
const protoFiles = fs.readdirSync(protoDir)
    .filter(file => file.endsWith('.proto'))
    .map(file => path.join(protoDir, file));

if (protoFiles.length === 0) {
    console.log('没有找到.proto文件');
    process.exit(1);
}

console.log('找到协议文件:', protoFiles);

// 生成TypeScript代码
try {
    for (const protoFile of protoFiles) {
        const fileName = path.basename(protoFile, '.proto');
        const outputFile = path.join(outputDir, `${fileName}.ts`);
        
        console.log(`生成 ${fileName}.ts...`);
        
        // 使用pbjs生成静态代码
        const pbjsCmd = `npx pbjs -t static-module -w es6 -o ${outputFile} ${protoFile}`;
        execSync(pbjsCmd, { stdio: 'inherit' });
        
        // 使用pbts生成类型定义
        const pbtsCmd = `npx pbts -o ${outputFile.replace('.ts', '.d.ts')} ${outputFile}`;
        execSync(pbtsCmd, { stdio: 'inherit' });
        
        console.log(`✅ ${fileName}.ts 生成完成`);
    }
    
    // 生成协议管理器
    generateProtocolManager(outputDir);
    
    console.log('=== 协议代码生成完成 ===');
    
} catch (error) {
    console.error('生成失败:', error.message);
    process.exit(1);
}

// 生成协议管理器
function generateProtocolManager(outputDir) {
    const managerCode = `
// 自动生成的协议管理器
// 请勿手动修改此文件

import * as GameProto from './game';

export class ProtocolManager {
    private static instance: ProtocolManager;
    
    // 命令ID映射
    private static readonly CMD_MAP = {
        // 系统相关
        HEARTBEAT: 0,
        ANNOUNCEMENT: 1,
        
        // 登录相关
        LOGIN_REQUEST: 100,
        LOGOUT: 101,
        
        // 玩家相关
        PLAYER_GET_INFO: 200,
        PLAYER_UPDATE_POSITION: 201,
        PLAYER_GET_INVENTORY: 202,
        PLAYER_USE_ITEM: 203,
        
        // 农场相关
        FARM_GET_INFO: 300,
        FARM_PLANT_CROP: 301,
        FARM_HARVEST_CROP: 302,
        FARM_WATER_CROP: 303,
    };
    
    public static getInstance(): ProtocolManager {
        if (!ProtocolManager.instance) {
            ProtocolManager.instance = new ProtocolManager();
        }
        return ProtocolManager.instance;
    }
    
    // 获取命令ID
    public getCommandId(name: string): number {
        return ProtocolManager.CMD_MAP[name] || 0;
    }
    
    // 编码消息包装器
    public encodeWrapper(cmd: number, seq: number, data: Uint8Array): Uint8Array {
        const wrapper = GameProto.game.protocol.MessageWrapper.create({
            cmd: cmd,
            seq: seq,
            timestamp: Date.now(),
            data: data
        });
        return GameProto.game.protocol.MessageWrapper.encode(wrapper).finish();
    }
    
    // 解码响应包装器
    public decodeResponse(data: Uint8Array): any {
        return GameProto.game.protocol.ResponseWrapper.decode(data);
    }
    
    // 编码登录请求
    public encodeLoginRequest(username: string, password: string): Uint8Array {
        const request = GameProto.game.protocol.LoginRequest.create({
            username: username,
            password: password,
            client_version: "1.0.0",
            device_id: this.getDeviceId(),
            platform: "cocos"
        });
        return GameProto.game.protocol.LoginRequest.encode(request).finish();
    }
    
    // 解码登录响应
    public decodeLoginResponse(data: Uint8Array): any {
        return GameProto.game.protocol.LoginResponse.decode(data);
    }
    
    // 编码心跳请求
    public encodeHeartbeatRequest(): Uint8Array {
        const request = GameProto.game.protocol.HeartbeatRequest.create({
            client_time: Date.now()
        });
        return GameProto.game.protocol.HeartbeatRequest.encode(request).finish();
    }
    
    // 解码心跳响应
    public decodeHeartbeatResponse(data: Uint8Array): any {
        return GameProto.game.protocol.HeartbeatResponse.decode(data);
    }
    
    // 编码获取玩家信息请求
    public encodeGetPlayerInfoRequest(playerId?: number): Uint8Array {
        const request = GameProto.game.protocol.GetPlayerInfoRequest.create({
            player_id: playerId || 0
        });
        return GameProto.game.protocol.GetPlayerInfoRequest.encode(request).finish();
    }
    
    // 解码获取玩家信息响应
    public decodeGetPlayerInfoResponse(data: Uint8Array): any {
        return GameProto.game.protocol.GetPlayerInfoResponse.decode(data);
    }
    
    // 获取设备ID
    private getDeviceId(): string {
        // 简单的设备ID生成
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
            deviceId = 'cocos_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('device_id', deviceId);
        }
        return deviceId;
    }
}

export default ProtocolManager;
`;
    
    const managerFile = path.join(outputDir, 'ProtocolManager.ts');
    fs.writeFileSync(managerFile, managerCode.trim());
    console.log('✅ ProtocolManager.ts 生成完成');
}
