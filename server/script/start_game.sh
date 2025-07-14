#优先执行common脚本
bash ./script/start_common.sh

#工作线程数量(根据CPU核心数而定)
export WORK_THREAD=8
#是否启动为守护模式
export DAEMON=1

#游服配置
export HOST="0.0.0.0"
export PORT=44445
export MAX_CLIENT=10000
export CONNECT_IP="oc.stoneagewm.com"
export CONNECT_REAL_IP="117.24.12.84"
export OPEN_TIME="2022-03-24"

#cluster配置
export MONITOR_NODE_NAME="monitor"
export MONITOR_NODE_IP="127.0.0.1"
export MONITOR_NODE_PORT="57000"

#自身节点信息
export CLUSTER_IP="127.0.0.1"
export CLUSTER_PORT="57005"
export CLUSTER_NODE="game"

#数据库服务节点ID
export DBNODE=1
#中心服务器节点ID
export CENTERNODE=1
#聊天服务器节点ID
export CHATNODE=1
#战斗录像服务节点ID
export VIDEONODE=1
#角色服务器节点ID
export ROLENODE=1
#服务器ID
export SERVER_ID=1
#推送服务器节点ID
export PUSHNODE=1
#日志服务器节点ID
export LOGNODE=1
#服务器时区
export TIMEZONE=8

#WEB监听端口
export WEB_IP="127.0.0.1"
export WEB_PORT=58005

#skynet DEBUG端口(telnet),0为不开启
export DEBUG_PORT=56005

#守护进程模式，0为前台运行，1为后台运行
export DAEMON=0

#游戏服务器配置
export PORT=44445
export CONNECT_IP="127.0.0.1"
export CONNECT_REAL_IP="127.0.0.1"
export MAX_CLIENT=10000
export OPEN_TIME="2024-07-15"
export TIMEZONE=8

#节点配置
export DBNODE=1
export CENTERNODE=1
export CHATNODE=1
export VIDEONODE=1
export ROLENODE=1
export PUSHNODE=1

#启动
chmod +x heartbridge
mkdir -p logs
mkdir -p etc
touch etc/cluster_${CLUSTER_NODE}${SERVER_ID}.lua
echo "启动游戏服务器..."
./heartbridge etc/game.conf
