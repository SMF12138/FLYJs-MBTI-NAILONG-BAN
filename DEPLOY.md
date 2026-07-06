# 腾讯云服务器部署说明

## 一、服务器要求

| 项目 | 最低要求 | 你的配置 |
|------|---------|---------|
| 系统 | Ubuntu 20.04+ 或 CentOS 7+ | 3.7GB / 200GB |
| CPU | 1核 | 2核 ✅ |
| 流量 | 100GB/月 | 200GB/月 ✅ |

## 二、部署流程

### Step 1：SSH 连接服务器

```bash
ssh 你的用户名@服务器IP
```

### Step 2：安装 Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx -y

# 或 CentOS
sudo yum install nginx -y
```

### Step 3：创建项目目录

```bash
sudo mkdir -p /var/www/mbti
sudo chown -R $USER:$USER /var/www/mbti
sudo chmod -R 755 /var/www/mbti
```

### Step 4：上传构建文件

**方法 1：本地电脑上传（推荐）**

在你本地电脑终端执行：
```bash
cd D:\风不死\编码\Code\Mimo\MBTI-Character-Test\app
npm run build
scp -r dist/* 你的用户名@服务器IP:/var/www/mbti/
```

**方法 2：如果不会 SCP，直接解压到服务器**

```bash
# 在服务器上下载你的 zip 包（先本地打包 dist/ 为 mbti.zip）
wget 你的下载链接 -O /tmp/mbti.zip
sudo unzip /tmp/mbti.zip -d /var/www/mbti/
```

### Step 5：配置 Nginx

```bash
sudo nano /etc/nginx/sites-available/mbti
```

粘贴以下配置：

```nginx
server {
    listen 80;
    server_name 你的IP或域名;  # 比如 1.2.3.4 或 mbti.example.com

    root /var/www/mbti;
    index index.html;

    # 访问日志（统计总访问量）
    access_log /var/log/nginx/mbti_access.log;

    # 点赞统计端点（记录点赞次数）
    location /api/like {
        access_log /var/log/nginx/mbti_likes.log;
        add_header Content-Type text/plain;
        return 200 'ok';
    }

    # 静态文件和页面
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

保存退出。

### Step 6：启用站点

```bash
sudo ln -s /etc/nginx/sites-available/mbti /etc/nginx/sites-enabled/mbti
sudo nginx -t          # 测试配置
sudo systemctl reload nginx   # 重载
sudo systemctl enable nginx   # 开机自启
```

### Step 7：浏览器访问

```
http://你的IP或域名
```

---

## 三、查看统计

```bash
# 查看总访问量
sudo wc -l /var/log/nginx/mbti_access.log

# 查看总点赞数
sudo wc -l /var/log/nginx/mbti_likes.log
```

---

## 四、更新代码

每次改代码后，重新构建上传：

```bash
cd D:\风不死\编码\Code\Mimo\MBTI-Character-Test\app
npm run build
scp -r dist/* 你的用户名@服务器IP:/var/www/mbti/
```

---

## 五、防火墙设置（如未开）

```bash
# Ubuntu
sudo ufw allow 'Nginx Full'

# CentOS
sudo firewall-cmd --zone=public --add-service=http --permanent
sudo firewall-cmd --reload
```

---

## 六、前端修改：点赞时发送请求

在 `src/components/ResultScreen.vue` 的 `handleLike` 函数加上：

```javascript
const handleLike = () => {
  if (liked.value) return
  liked.value = true
  try {
    localStorage.setItem('mbti_liked', 'true')
    const prev = Number(localStorage.getItem('mbti_like_count')) || 0
    const next = Math.max(prev + 1, Math.floor(Math.random() * 4001) + 1000)
    likeCount.value = next
    localStorage.setItem('mbti_like_count', String(next))
  } catch (e) {}
  store.dimensionScores.D7 += 1
  store.normalizeScores()
  
  // 发点赞请求（不影响体验，失败也正常）
  fetch('/api/like', { method: 'POST' }).catch(() => {})
}
```

然后重新构建上传。

---

## 七、常见问题

### Q: 访问 403 禁止
```bash
sudo chown -R www-data:www-data /var/www/mbti
sudo chmod -R 755 /var/www/mbti
sudo systemctl reload nginx
```

### Q: 不显示头像图片
```bash
# 确认头像文件在 dist/assets/ 目录下
ls /var/www/mbti/assets/
# 如果有 avatars/ 目录，确认 Nginx 没拦截
sudo nginx -t && sudo systemctl reload nginx
```

### Q: 想看今天访问量
```bash
sudo grep "$(date +%d/%b/%Y)" /var/log/nginx/mbti_access.log | wc -l
```
