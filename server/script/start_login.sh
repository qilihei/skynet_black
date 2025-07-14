#优先执行common脚本
bash etc/start_common.sh

#工作线程数量(根据CPU核心数而定)
export WORK_THREAD=8
#是否启动为守护模式
export DAEMON=1

#cluster配置
export MONITOR_NODE_NAME="monitor"
export MONITOR_NODE_IP="127.0.0.1"
export MONITOR_NODE_PORT="57000"

#自身节点信息
export CLUSTER_NODE="login"
export CLUSTER_IP="127.0.0.1"
export CLUSTER_PORT="57001"

#登陆服务器端口
export PORT=58888

#WEB监听端口
export WEB_IP="127.0.0.1"
export WEB_PORT=58001

#skynet DEBUG端口(telnet),0为不开启
export DEBUG_PORT=56001

#服务器ID
export SERVER_ID=1
#日志服务器节点ID
export LOGNODE=1

#启动
chmod +x co
mkdir -p logs
touch etc/cluster_${CLUSTER_NODE}${SERVER_ID}.lua
./co etc/login.conf
