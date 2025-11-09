# 🔒 Hướng Dẫn Triển Khai Security DevOps cho Cafe Shop

Tài liệu này hướng dẫn chi tiết cách triển khai các tính năng bảo mật cho dự án Cafe Shop DevOps, bao gồm SSL/TLS, Firewall, Hardening và Jenkins Security.

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [SSL/TLS Configuration](#ssltls-configuration)
3. [Firewall Configuration](#firewall-configuration)
4. [Application Hardening](#application-hardening)
5. [Jenkins Hardening](#jenkins-hardening)
6. [Docker Security](#docker-security)
7. [Triển Khai Production](#triển-khai-production)
8. [Monitoring và Maintenance](#monitoring-và-maintenance)

---

## 🎯 Tổng Quan

Dự án này bao gồm các thành phần bảo mật sau:

- **SSL/TLS**: Mã hóa kết nối giữa client và server
- **Firewall**: Bảo vệ server khỏi các tấn công từ bên ngoài
- **Application Hardening**: Tăng cường bảo mật cho ứng dụng
- **Jenkins Hardening**: Bảo mật CI/CD pipeline
- **Docker Security**: Bảo mật container và images

---

## 🔐 SSL/TLS Configuration

### 1. Tạo SSL Certificates

#### Option 1: Self-Signed Certificate (Development)

```bash
# Tạo thư mục cho SSL certificates
mkdir -p ssl

# Tạo self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=VN/ST=HoChiMinh/L=HoChiMinh/O=CafeShop/CN=localhost"
```

#### Option 2: Let's Encrypt (Production)

```bash
# Cài đặt Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Tạo certificate cho domain của bạn
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certificates sẽ được lưu tại:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### 2. Cấu Hình Nginx với SSL

File `nginx.conf` đã được cấu hình với SSL. Đảm bảo:

1. Certificates được mount vào container:
```yaml
volumes:
  - ./ssl/cert.pem:/etc/nginx/ssl/cert.pem:ro
  - ./ssl/key.pem:/etc/nginx/ssl/key.pem:ro
```

2. Nginx config đã được cập nhật với SSL settings (đã có trong file)

### 3. Cấu Hình Spring Boot với HTTPS

1. Tạo keystore cho Spring Boot:
```bash
keytool -genkeypair -alias cafe-shop -keyalg RSA -keysize 2048 \
  -storetype PKCS12 -keystore backend-ssl/keystore.p12 \
  -validity 365 -storepass YOUR_PASSWORD
```

2. Cấu hình trong `application-prod.properties`:
```properties
server.ssl.enabled=true
server.ssl.key-store=classpath:ssl/keystore.p12
server.ssl.key-store-password=${SSL_KEYSTORE_PASSWORD}
server.ssl.key-store-type=PKCS12
server.ssl.key-alias=cafe-shop
```

### 4. Kiểm Tra SSL

```bash
# Kiểm tra SSL certificate
openssl s_client -connect localhost:443 -servername yourdomain.com

# Kiểm tra SSL Labs rating
# Truy cập: https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com
```

---

## 🛡️ Firewall Configuration

### 1. Cấu Hình Firewall (CentOS Stream với firewalld)

#### Sử dụng Script Tự Động (Khuyến nghị)

```bash
# Chạy script tự động
sudo bash scripts/firewall-setup-centos.sh
```

#### Cấu Hình Thủ Công

```bash
# Khởi động firewalld (nếu chưa chạy)
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Cho phép SSH (22) - QUAN TRỌNG: Không tắt!
sudo firewall-cmd --permanent --add-service=ssh

# Cho phép HTTP (80)
sudo firewall-cmd --permanent --add-service=http

# Cho phép HTTPS (443)
sudo firewall-cmd --permanent --add-service=https

# Cho phép Jenkins (8080) chỉ từ localhost
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="127.0.0.1" port protocol="tcp" port="8080" accept'

# Hoặc cho phép từ mạng nội bộ (ví dụ: 192.168.1.0/24)
# sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.1.0/24" port protocol="tcp" port="8080" accept'

# Cho phép MySQL (3306) chỉ từ Docker network
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="172.28.0.0/16" port protocol="tcp" port="3306" accept'

# Cho phép Docker network communication
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="172.28.0.0/16" accept'

# Áp dụng thay đổi
sudo firewall-cmd --reload

# Kiểm tra cấu hình
sudo firewall-cmd --list-all
```

### 2. Kiểm Tra Firewall

```bash
# Kiểm tra các port đang mở
sudo netstat -tulpn | grep LISTEN
# Hoặc dùng ss (nhanh hơn)
sudo ss -tulpn | grep LISTEN

# Kiểm tra firewall rules
sudo firewall-cmd --list-all

# Kiểm tra các services đã được cho phép
sudo firewall-cmd --list-services

# Kiểm tra các ports đã được mở
sudo firewall-cmd --list-ports

# Kiểm tra rich rules
sudo firewall-cmd --list-rich-rules

# Kiểm tra firewalld status
sudo systemctl status firewalld
```

---

## 🔒 Application Hardening

### 1. Backend Hardening (Spring Boot)

#### Security Headers

File `SecurityConfig.java` đã được cấu hình với:
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

#### CORS Configuration

CORS đã được cấu hình để chỉ cho phép các origins được chỉ định:
```java
// Có thể config qua environment variable
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

#### Database Security

1. Sử dụng SSL cho MySQL connection:
```properties
spring.datasource.url=jdbc:mysql://mysql:3306/cafeshop?useSSL=true&requireSSL=true&verifyServerCertificate=true
```

2. Sử dụng strong passwords
3. Giới hạn database user permissions

### 2. Frontend Hardening (React + Nginx)

#### Security Headers trong Nginx

File `nginx.conf` đã được cấu hình với các security headers:
- Strict-Transport-Security
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Content-Security-Policy
- Referrer-Policy

#### Content Security Policy

CSP đã được cấu hình để ngăn chặn XSS attacks. Điều chỉnh theo nhu cầu của ứng dụng.

### 3. Docker Security

#### Non-root User

Cả backend và frontend Dockerfile đã được cấu hình để chạy với non-root user:

- **Backend**: User `appuser` (UID 1001)
- **Frontend**: Nginx worker processes chạy với user `nginx`

#### Read-only Filesystem

Docker compose đã được cấu hình với:
```yaml
read_only: true
tmpfs:
  - /tmp
  - /app/logs
```

#### Security Options

```yaml
security_opt:
  - no-new-privileges:true
```

---

## 🔧 Jenkins Hardening

### 1. Cài Đặt và Cấu Hình

#### Chạy Script Hardening

```bash
# Chạy script tự động
sudo bash scripts/jenkins-hardening.sh
```

#### Cấu Hình Thủ Công

1. **Enable Security**:
   - Manage Jenkins > Configure Global Security
   - Enable "Enable security"
   - Chọn "Matrix-based security" hoặc "Role-Based Strategy"

2. **CSRF Protection**:
   - Enable "Enable CSRF protection"

3. **CLI Security**:
   - Disable "CLI over remoting"

4. **Agent Security**:
   - Configure agent port (default: 50000)
   - Restrict agent access via firewall

### 2. Jenkins Plugins Security

Cài đặt các plugins bảo mật:
- **Credentials Binding**: Quản lý credentials an toàn
- **OWASP Dependency Check**: Quét dependencies
- **SonarQube**: Code quality và security
- **Trivy**: Container image scanning

### 3. Jenkinsfile Security

Jenkinsfile đã được cấu hình với:
- Dependency scanning
- Code quality checks
- Container image scanning
- Security cleanup

### 4. Best Practices

1. **Strong Passwords**: Sử dụng strong passwords cho tất cả users
2. **2FA**: Enable two-factor authentication nếu có thể
3. **Regular Updates**: Cập nhật Jenkins và plugins thường xuyên
4. **Backup**: Backup Jenkins config thường xuyên
5. **Access Control**: Giới hạn quyền truy cập theo nguyên tắc least privilege

---

## 🐳 Docker Security

### 1. Image Security

#### Scan Images với Trivy

```bash
# Cài đặt Trivy
sudo apt-get install wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy

# Scan images
trivy image chungcr7/coffee-backend:latest
trivy image chungcr7/coffee-frontend:latest
```

#### Build Secure Images

Dockerfiles đã được cấu hình với:
- Multi-stage builds
- Non-root users
- Minimal base images
- Security updates
- Health checks

### 2. Container Security

#### Docker Compose Security

File `docker-compose.prod.yml` đã được cấu hình với:
- Read-only filesystems
- Security options
- Resource limits
- Health checks
- Network isolation

### 3. Docker Network Security

```yaml
networks:
  cafe-shop-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

---

## 🚀 Triển Khai Production

### 1. Chuẩn Bị

1. **SSL Certificates**: Tạo hoặc lấy SSL certificates
2. **Environment Variables**: Thiết lập các biến môi trường
3. **Firewall**: Cấu hình firewall rules
4. **Database**: Setup MySQL với SSL

### 2. Deploy với Docker Compose

```bash
# Sử dụng production compose file
docker-compose -f docker-compose.prod.yml up -d

# Kiểm tra logs
docker-compose -f docker-compose.prod.yml logs -f

# Kiểm tra health
docker-compose -f docker-compose.prod.yml ps
```

### 3. Environment Variables

Tạo file `.env` với các biến sau:

```env
# Database
MYSQL_ROOT_PASSWORD=your_strong_password
MYSQL_USER=cafeshop_user
MYSQL_PASSWORD=your_strong_password

# SSL
SSL_KEYSTORE_PASSWORD=your_keystore_password
ACME_EMAIL=your_email@example.com

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=86400000
```

### 4. Kiểm Tra Deployment

```bash
# Kiểm tra services
curl https://yourdomain.com/api/home/health
curl https://yourdomain.com

# Kiểm tra SSL
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Kiểm tra security headers
curl -I https://yourdomain.com
```

---

## 📊 Monitoring và Maintenance

### 1. Log Monitoring

#### Application Logs

```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# MySQL logs
docker-compose logs -f mysql
```

#### Security Logs

```bash
# Firewall logs
sudo tail -f /var/log/ufw.log
# hoặc
sudo journalctl -u firewalld -f

# Jenkins logs
sudo tail -f /var/log/jenkins/jenkins.log
```

### 2. Security Scanning

#### Regular Scans

```bash
# Scan Docker images
trivy image chungcr7/coffee-backend:latest
trivy image chungcr7/coffee-frontend:latest

# Scan dependencies
cd baochung_st22a && mvn dependency-check:check
cd coffee-shop-master && npm audit
```

#### Automated Scanning

Jenkins pipeline đã được cấu hình để tự động scan trong mỗi build.

### 3. Updates và Patches

#### Application Updates

```bash
# Update backend dependencies
cd baochung_st22a && mvn versions:display-dependency-updates

# Update frontend dependencies
cd coffee-shop-master && npm outdated
```

#### System Updates

```bash
# Update system packages
sudo apt-get update && sudo apt-get upgrade

# Update Docker images
docker-compose pull
docker-compose up -d
```

#### Security Patches

- Theo dõi security advisories
- Cập nhật dependencies có vulnerability
- Cập nhật base images
- Cập nhật Jenkins và plugins

### 4. Backup

#### Database Backup

```bash
# Backup MySQL
docker exec cafe-shop-mysql mysqldump -u root -p cafeshop > backup.sql

# Restore MySQL
docker exec -i cafe-shop-mysql mysql -u root -p cafeshop < backup.sql
```

#### Jenkins Backup

```bash
# Backup Jenkins config
tar -czf jenkins-backup.tar.gz /var/lib/jenkins

# Restore Jenkins
tar -xzf jenkins-backup.tar.gz -C /
```

### 5. Incident Response

1. **Identify**: Xác định vấn đề bảo mật
2. **Contain**: Ngăn chặn thiệt hại
3. **Eradicate**: Loại bỏ nguyên nhân
4. **Recover**: Khôi phục hệ thống
5. **Lessons Learned**: Rút kinh nghiệm

---

## 📝 Checklist Triển Khai

### Pre-deployment

- [ ] SSL certificates đã được tạo/cấu hình
- [ ] Firewall rules đã được cấu hình
- [ ] Environment variables đã được thiết lập
- [ ] Database đã được setup với SSL
- [ ] Docker images đã được scan
- [ ] Security headers đã được cấu hình
- [ ] Jenkins đã được harden

### Deployment

- [ ] Deploy với docker-compose.prod.yml
- [ ] Kiểm tra SSL certificates
- [ ] Kiểm tra security headers
- [ ] Kiểm tra firewall rules
- [ ] Kiểm tra application health
- [ ] Kiểm tra database connection

### Post-deployment

- [ ] Monitor logs
- [ ] Setup automated scanning
- [ ] Setup backup schedule
- [ ] Document incident response procedures
- [ ] Train team on security practices

---

## 🔗 Tài Liệu Tham Khảo

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Jenkins Security](https://www.jenkins.io/doc/book/security/)
- [Nginx Security Headers](https://www.nginx.com/blog/nginx-secure-link-module/)
- [Let's Encrypt](https://letsencrypt.org/)

---

## 📞 Hỗ Trợ

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ:
- Email: support@cafeshop.com
- GitHub Issues: https://github.com/your-repo/issues

---

**Lưu ý**: Tài liệu này được cập nhật thường xuyên. Vui lòng kiểm tra phiên bản mới nhất trước khi triển khai.

