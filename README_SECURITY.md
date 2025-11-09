# 🔒 Cafe Shop DevOps Security

Dự án này bao gồm các tính năng bảo mật toàn diện cho Cafe Shop application, bao gồm SSL/TLS, Firewall, Application Hardening, và Jenkins Security.

## 📁 Cấu Trúc Dự Án

```
cafe-shop_DevOps-security/
├── baochung_st22a/                 # Backend Spring Boot
│   ├── Dockerfile                  # Hardened Dockerfile
│   ├── src/main/resources/
│   │   ├── application.properties  # Development config
│   │   └── application-prod.properties  # Production config với SSL
│   └── src/main/java/.../config/
│       └── SecurityConfig.java     # Spring Security config với security headers
│
├── coffee-shop-master/             # Frontend React
│   ├── Dockerfile                  # Hardened Dockerfile
│   ├── nginx.conf                  # Nginx config với SSL và security headers
│   └── nginx-ssl.conf              # Nginx config cho production với Let's Encrypt
│
├── scripts/                        # Security scripts
│   ├── firewall-setup-centos.sh    # Firewall configuration (CentOS/firewalld)
│   ├── jenkins-hardening.sh        # Jenkins security hardening
│   └── generate-ssl.sh             # SSL certificate generation
│
├── docker-compose.yml              # Docker Compose cho development
├── docker-compose.prod.yml         # Docker Compose cho production với security
├── Jenkinsfile                     # Hardened CI/CD pipeline với security scanning
│
├── SECURITY_SETUP.md               # Tài liệu hướng dẫn chi tiết
├── QUICK_START.md                  # Hướng dẫn triển khai nhanh
└── README_SECURITY.md              # File này
```

## 🎯 Tính Năng Bảo Mật

### 1. SSL/TLS 🔐
- ✅ SSL/TLS cho Nginx (Frontend)
- ✅ HTTPS cho Spring Boot (Backend)
- ✅ SSL cho MySQL connection
- ✅ Self-signed certificates cho development
- ✅ Hỗ trợ Let's Encrypt cho production
- ✅ HSTS (HTTP Strict Transport Security)
- ✅ SSL/TLS best practices

### 2. Firewall 🛡️
- ✅ Firewalld configuration (CentOS Stream 10)
- ✅ Port restrictions
- ✅ IP whitelisting
- ✅ Service-based rules
- ✅ Rich rules for advanced filtering

### 3. Application Hardening 🔒
- ✅ Security headers (CSP, HSTS, X-Frame-Options, etc.)
- ✅ CORS configuration
- ✅ CSRF protection
- ✅ JWT authentication
- ✅ Password encryption (BCrypt)
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS protection

### 4. Docker Security 🐳
- ✅ Non-root users
- ✅ Read-only filesystems
- ✅ Security options (no-new-privileges)
- ✅ Minimal base images
- ✅ Multi-stage builds
- ✅ Health checks
- ✅ Resource limits
- ✅ Network isolation

### 5. Jenkins Hardening 🔧
- ✅ Security scanning trong CI/CD pipeline
- ✅ Dependency vulnerability scanning
- ✅ Container image scanning (Trivy)
- ✅ Code quality checks (SonarQube)
- ✅ Security best practices
- ✅ Credentials management
- ✅ CSRF protection
- ✅ Access control

## 🚀 Quick Start

### 1. Tạo SSL Certificates

```bash
bash scripts/generate-ssl.sh
```

### 2. Cấu Hình Firewall

```bash
# Linux
sudo bash scripts/firewall-setup.sh

# Windows
.\scripts\firewall-setup.ps1
```

### 3. Deploy

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

Xem `QUICK_START.md` để biết chi tiết.

## 📚 Tài Liệu

- **[SECURITY_SETUP.md](SECURITY_SETUP.md)**: Hướng dẫn chi tiết về tất cả các tính năng bảo mật
- **[QUICK_START.md](QUICK_START.md)**: Hướng dẫn triển khai nhanh

## 🔍 Security Scanning

### Dependency Scanning
- **Backend**: Maven Dependency Check (OWASP)
- **Frontend**: npm audit

### Container Scanning
- **Trivy**: Container image vulnerability scanning

### Code Quality
- **SonarQube**: Code quality và security analysis
- **Checkstyle**: Code style checking

Tất cả các scans được tự động chạy trong Jenkins pipeline.

## 🔐 Best Practices

### Development
1. Sử dụng self-signed certificates
2. Chạy trên localhost
3. Firewall rules lỏng lẻo hơn
4. Debug logging enabled

### Production
1. Sử dụng Let's Encrypt hoặc CA chính thức
2. Firewall rules chặt chẽ
3. Chỉ mở các port cần thiết
4. Logging và monitoring
5. Regular security updates
6. Backup và disaster recovery

## 📊 Security Checklist

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

## 🆘 Troubleshooting

### SSL Certificate Issues
```bash
# Kiểm tra certificate
openssl x509 -in ssl/cert.pem -text -noout

# Tạo lại certificate
bash scripts/generate-ssl.sh
```

### Firewall Issues
```bash
# Kiểm tra firewall status
sudo ufw status verbose

# Cho phép port
sudo ufw allow 443/tcp
```

### Docker Issues
```bash
# Kiểm tra logs
docker-compose logs

# Restart services
docker-compose restart
```

## 🔗 Liên Kết Hữu Ích

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Spring Security](https://spring.io/projects/spring-security)
- [Docker Security](https://docs.docker.com/engine/security/)
- [Jenkins Security](https://www.jenkins.io/doc/book/security/)
- [Nginx Security](https://www.nginx.com/blog/nginx-secure-link-module/)
- [Let's Encrypt](https://letsencrypt.org/)

## 📝 Changelog

### Version 1.0.0 (2024-01-XX)
- ✅ Initial release
- ✅ SSL/TLS configuration
- ✅ Firewall configuration
- ✅ Application hardening
- ✅ Docker security
- ✅ Jenkins hardening
- ✅ Security scanning
- ✅ Documentation

## 🤝 Đóng Góp

Nếu bạn muốn đóng góp hoặc báo cáo lỗi bảo mật, vui lòng tạo issue hoặc pull request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Tiến** - Security DevOps Implementation

---

**Lưu ý**: Đây là một dự án bảo mật nghiêm túc. Vui lòng đọc kỹ tài liệu trước khi triển khai vào production.

