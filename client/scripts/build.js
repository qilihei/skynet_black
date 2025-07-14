const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 构建脚本
console.log('=== Farm Game Client Build Script ===');

const projectRoot = path.join(__dirname, '..');
const buildDir = path.join(projectRoot, 'build');

// 构建配置
const buildConfigs = {
    web: {
        platform: 'web-desktop',
        outputDir: path.join(buildDir, 'web'),
        options: {
            debug: false,
            sourceMaps: false,
            optimize: true
        }
    },
    android: {
        platform: 'android',
        outputDir: path.join(buildDir, 'android'),
        options: {
            debug: false,
            optimize: true,
            packageName: 'com.farmgame.client'
        }
    },
    ios: {
        platform: 'ios',
        outputDir: path.join(buildDir, 'ios'),
        options: {
            debug: false,
            optimize: true,
            bundleId: 'com.farmgame.client'
        }
    }
};

// 解析命令行参数
const args = process.argv.slice(2);
const platform = args[0] || 'web';
const isDebug = args.includes('--debug');

if (!buildConfigs[platform]) {
    console.error('Unsupported platform:', platform);
    console.log('Supported platforms:', Object.keys(buildConfigs).join(', '));
    process.exit(1);
}

const config = buildConfigs[platform];

// 构建前准备
function prepareBuild() {
    console.log('Preparing build...');
    
    // 创建构建目录
    if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir, { recursive: true });
    }
    
    // 生成协议代码
    console.log('Generating protocol code...');
    try {
        execSync('npm run generate-proto', { 
            cwd: projectRoot, 
            stdio: 'inherit' 
        });
    } catch (error) {
        console.error('Failed to generate protocol code:', error.message);
        process.exit(1);
    }
    
    console.log('Build preparation completed');
}

// 执行构建
function executeBuild() {
    console.log(\`Building for platform: \${platform}\`);
    console.log(\`Output directory: \${config.outputDir}\`);
    console.log(\`Debug mode: \${isDebug}\`);
    
    try {
        // 构建命令
        const buildCmd = \`cocos build --platform \${config.platform} --build-dir \${config.outputDir}\`;
        
        // 添加调试选项
        const finalCmd = isDebug ? \`\${buildCmd} --debug\` : buildCmd;
        
        console.log('Executing build command:', finalCmd);
        execSync(finalCmd, { 
            cwd: projectRoot, 
            stdio: 'inherit' 
        });
        
        console.log('Build completed successfully!');
        
    } catch (error) {
        console.error('Build failed:', error.message);
        process.exit(1);
    }
}

// 构建后处理
function postBuild() {
    console.log('Post-build processing...');
    
    // 复制额外资源
    copyAdditionalResources();
    
    // 生成版本信息
    generateVersionInfo();
    
    console.log('Post-build processing completed');
}

// 复制额外资源
function copyAdditionalResources() {
    const resourcesDir = path.join(projectRoot, 'resources');
    const targetDir = path.join(config.outputDir, 'resources');
    
    if (fs.existsSync(resourcesDir)) {
        console.log('Copying additional resources...');
        // 这里可以添加复制逻辑
    }
}

// 生成版本信息
function generateVersionInfo() {
    const packageJson = require(path.join(projectRoot, 'package.json'));
    const versionInfo = {
        version: packageJson.version,
        buildTime: new Date().toISOString(),
        platform: platform,
        debug: isDebug,
        commit: getGitCommit()
    };
    
    const versionFile = path.join(config.outputDir, 'version.json');
    fs.writeFileSync(versionFile, JSON.stringify(versionInfo, null, 2));
    
    console.log('Version info generated:', versionFile);
}

// 获取Git提交信息
function getGitCommit() {
    try {
        return execSync('git rev-parse --short HEAD', { 
            encoding: 'utf8' 
        }).trim();
    } catch (error) {
        return 'unknown';
    }
}

// 主函数
function main() {
    try {
        prepareBuild();
        executeBuild();
        postBuild();
        
        console.log('=== Build Process Completed ===');
        console.log(\`Platform: \${platform}\`);
        console.log(\`Output: \${config.outputDir}\`);
        
    } catch (error) {
        console.error('Build process failed:', error);
        process.exit(1);
    }
}

// 显示帮助信息
function showHelp() {
    console.log('Usage: node build.js [platform] [options]');
    console.log('');
    console.log('Platforms:');
    console.log('  web      Build for web (default)');
    console.log('  android  Build for Android');
    console.log('  ios      Build for iOS');
    console.log('');
    console.log('Options:');
    console.log('  --debug  Build in debug mode');
    console.log('  --help   Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  node build.js web');
    console.log('  node build.js android --debug');
    console.log('  node build.js ios');
}

// 检查帮助参数
if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
}

// 运行主函数
main();
