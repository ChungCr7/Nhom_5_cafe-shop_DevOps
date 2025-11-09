# 🚀 Quick Start Guide - Security DevOps Setup

Hướng dẫn nhanh để thiết lập Security DevOps cho Cafe Shop project.

## 📋 Yêu Cầu

- **Hệ điều hành**: CentOS Stream 10 (trên máy ảo VMware)
- Docker Engine và Docker Compose
- OpenSSL (để tạo SSL certificates)
- Quyền root/sudo (để cấu hình firewall)
- Java 17 (cho Jenkins)

## ⚡ Triển Khai Nhanh

### 1. Tạo SSL Certificates (Self-Signed cho Development)

```bash
# Tạo thư mục
mkdir -p ssl backend-ssl

# Tạo certificate cho Nginx
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=VN/ST=HoChiMinh/L=HoChiMinh/O=CafeShop/CN=localhost"

# Tạo keystore cho Spring Boot
keytool -genkeypair -alias cafe-shop -keyalg RSA -keysize 2048 \
  -storetype PKCS12 -keystore backend-ssl/keystore.p12 \
  -validity 365 -storepass changeme123
```

### 2. Cấu Hình Firewall (CentOS Stream với firewalld)

```bash
# Chạy script tự động cấu hình firewall
sudo bash scripts/firewall-setup-centos.sh

# Hoặc cấu hình thủ công:
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="127.0.0.1" port protocol="tcp" port="8080" accept'
sudo firewall-cmd --reload
```

### 3. Tạo File Environment Variables

Tạo file `.env` trong thư mục root:

```env
MYSQL_ROOT_PASSWORD=changeme123
MYSQL_USER=cafeshop_user
MYSQL_PASSWORD=changeme123
SSL_KEYSTORE_PASSWORD=changeme123
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://localhost:5173
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRATION=86400000
```

### 4. Deploy với Docker Compose

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### 5. Kiểm Tra

```bash
# Kiểm tra services
docker-compose ps

# Kiểm tra logs
docker-compose logs -f

# Kiểm tra HTTPS
curl -k https://localhost
```

## 🔒 Hardening Jenkins

```bash
# Chạy script hardening
sudo bash scripts/jenkins-hardening.sh

# Hoặc cấu hình thủ công:
# 1. Đăng nhập Jenkins
# 2. Manage Jenkins > Configure Global Security
# 3. Enable security và CSRF protection
# 4. Cài đặt security plugins
```

## 📝 Các Bước Tiếp Theo

1. **Production SSL**: Thay self-signed certificates bằng Let's Encrypt
2. **Environment Variables**: Cập nhật các giá trị thực tế
3. **Monitoring**: Setup log monitoring và alerts
4. **Backup**: Cấu hình backup schedule
5. **Updates**: Cập nhật dependencies và security patches

## ⚠️ Lưu Ý Quan Trọng

1. **Đổi Passwords**: Thay đổi tất cả passwords mặc định
2. **Firewall**: Chỉ mở các port cần thiết
3. **SSL**: Sử dụng Let's Encrypt cho production
4. **Updates**: Thường xuyên cập nhật dependencies
5. **Monitoring**: Monitor logs và security alerts

## 📚 Tài Liệu Chi Tiết

Xem file `SECURITY_SETUP.md` để biết chi tiết đầy đủ.

## 🆘 Troubleshooting

### Lỗi SSL Certificate
```bash
# Kiểm tra certificate
openssl x509 -in ssl/cert.pem -text -noout

# Tạo lại certificate nếu cần
rm ssl/*.pem
# Chạy lại lệnh tạo certificate
```

### Lỗi Firewall
```bash
# Kiểm tra firewall status (CentOS dùng firewalld)
sudo firewall-cmd --list-all
sudo systemctl status firewalld

# Cho phép port nếu bị chặn
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

### Lỗi Docker
```bash
# Kiểm tra Docker logs
docker-compose logs

# Restart services
docker-compose restart
```

---

**Happy Coding! 🎉**

