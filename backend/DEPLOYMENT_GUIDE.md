# MGSDB 后端服务部署指南 (Systemd)

本指南提供使用 systemd 部署 MGSDB 后端服务的详细步骤。

## 前提条件

- Linux 系统（支持 systemd）
- Python 3.11+
- PostgreSQL 数据库
- 已克隆的 MGSDB 代码仓库

## 部署步骤

### 1. 准备 Python 虚拟环境

```bash
cd /d/Data/Code/MGSDB_1017/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 2. 配置环境变量

根据部署环境选择合适的配置文件：

- 开发环境：
  ```bash
  cp .env.dev.py config.py
  ```

- 测试环境：
  ```bash
  cp .env.beta.py config.py
  ```

- 生产环境：
  ```bash
  cp .env.prod.py config.py
  ```

也可以直接修改 `.env.example` 文件并保存为 `.env`，然后在 `settings.py` 中加载它。

### 3. 设置 PostgreSQL 数据库

确保 PostgreSQL 服务已启动，并创建所需的数据库和用户：

```bash
sudo -u postgres psql
CREATE USER unikorn WITH PASSWORD '123456';
CREATE DATABASE unikorn OWNER unikorn;
\q
```

### 4. 配置 systemd 服务

已创建 `mgsdb-backend.service` 文件，请根据实际环境修改：

```bash
# 编辑服务文件
sudo nano /etc/systemd/system/mgsdb-backend.service

# 复制文件内容（从项目中的 mgsdb-backend.service 复制）
```

主要需要修改的部分：
- `WorkingDirectory`：后端代码的实际路径
- `Environment` 中的数据库配置
- `SECRET_KEY`：使用强随机密钥
- `ExecStart`：虚拟环境的实际路径

### 5. 启用并启动服务

```bash
# 重新加载 systemd 配置
sudo systemctl daemon-reload

# 启用服务（开机自启）
sudo systemctl enable mgsdb-backend.service

# 启动服务
sudo systemctl start mgsdb-backend.service
```

### 6. 验证服务状态

```bash
# 检查服务状态
sudo systemctl status mgsdb-backend.service

# 查看服务日志
sudo journalctl -u mgsdb-backend.service -f
```

## 管理命令

```bash
# 停止服务
sudo systemctl stop mgsdb-backend.service

# 重启服务
sudo systemctl restart mgsdb-backend.service

# 查看服务状态历史
sudo systemctl status mgsdb-backend.service
```

## 日志管理

服务日志默认输出到 systemd journal，可以通过以下命令访问：

```bash
# 查看最近的日志
sudo journalctl -u mgsdb-backend.service

# 实时查看日志
sudo journalctl -u mgsdb-backend.service -f

# 查看特定时间范围的日志
sudo journalctl -u mgsdb-backend.service --since "24 hours ago"
```

## 故障排查

1. **服务无法启动**
   - 检查 PostgreSQL 服务是否运行
   - 验证数据库连接配置
   - 查看日志中的错误信息

2. **权限问题**
   - 确保运行服务的用户（默认为 www-data）对项目目录有适当的权限
   - 检查虚拟环境的权限

3. **端口占用**
   - 确保 8000 端口未被其他服务占用
   - 可以修改服务文件中的端口配置

## 安全建议

1. 生产环境中使用强密码和复杂的 SECRET_KEY
2. 限制 CORS_ORIGINS 为特定域名，不要使用通配符 `*`
3. 考虑配置反向代理（如 Nginx）处理 HTTPS
4. 定期更新依赖包和系统

## 注意事项

- 本部署指南假设使用 Linux 系统
- Windows 系统不支持 systemd，请考虑使用其他方式部署
- 生产环境中应使用非 root 用户运行服务
- 定期备份数据库和重要配置文件