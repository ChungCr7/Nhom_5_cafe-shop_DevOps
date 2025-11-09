# 📜 Security Scripts

Thư mục này chứa các scripts để cấu hình và thiết lập bảo mật cho dự án Cafe Shop DevOps.

## 📋 Danh Sách Scripts

### 1. `generate-ssl.sh`
**Mô tả**: Tạo SSL certificates cho development (self-signed)

**Sử dụng**:
```bash
bash scripts/generate-ssl.sh
```

**Tạo ra**:
- `ssl/cert.pem` và `ssl/key.pem` - SSL certificates cho Nginx
- `backend-ssl/keystore.p12` - Keystore cho Spring Boot
- `mysql-ssl/*.pem` - SSL certificates cho MySQL

**Lưu ý**: 
- Chỉ dùng cho development
- Cho production, sử dụng Let's Encrypt

---

### 2. `firewall-setup-centos.sh`
**Mô tả**: Cấu hình firewall cho CentOS Stream 10 (sử dụng firewalld)

**Sử dụng**:
```bash
sudo bash scripts/firewall-setup-centos.sh
```

**Cấu hình**:
- Cho phép SSH (22) - QUAN TRỌNG: Không tắt!
- Cho phép HTTP (80) và HTTPS (443)
- Cho phép Jenkins (8080) chỉ từ localhost
- Cho phép MySQL (3306) chỉ từ Docker network (172.28.0.0/16)
- Cho phép Docker network communication

**Lưu ý**: 
- Cần quyền root/sudo
- Chỉ dành cho CentOS Stream 10 (sử dụng firewalld)
- Đảm bảo bạn có thể truy cập SSH trước khi chạy
- Script sẽ tự động khởi động và enable firewalld

---

### 3. `jenkins-hardening.sh`
**Mô tả**: Hardening Jenkins với các best practices

**Sử dụng**:
```bash
sudo bash scripts/jenkins-hardening.sh
```

**Cấu hình**:
- Enable security
- Configure authorization
- Setup firewall rules
- Configure log rotation
- Create admin user
- Setup environment variables

**Lưu ý**: 
- Cần quyền root/sudo
- Một số cấu hình cần thực hiện thủ công từ Jenkins UI

---

## 🔒 Security Best Practices

### 1. SSL Certificates
- ✅ Không commit SSL certificates vào Git
- ✅ Sử dụng strong passwords cho keystores
- ✅ Rotate certificates định kỳ
- ✅ Sử dụng Let's Encrypt cho production

### 2. Firewall
- ✅ Chỉ mở các port cần thiết
- ✅ Giới hạn truy cập theo IP khi có thể
- ✅ Thường xuyên review firewall rules
- ✅ Monitor firewall logs

### 3. Jenkins
- ✅ Sử dụng strong passwords
- ✅ Enable 2FA nếu có thể
- ✅ Regular updates
- ✅ Backup config thường xuyên
- ✅ Giới hạn quyền truy cập

### 4. Scripts
- ✅ Chạy scripts với quyền tối thiểu cần thiết
- ✅ Review scripts trước khi chạy
- ✅ Backup trước khi thay đổi cấu hình
- ✅ Test trên môi trường development trước

---

## 📝 Checklist Trước Khi Chạy Scripts

- [ ] Đã đọc và hiểu script
- [ ] Đã backup cấu hình hiện tại
- [ ] Đã test trên môi trường development
- [ ] Đã có quyền cần thiết (root/sudo/admin)
- [ ] Đã có kế hoạch rollback nếu có vấn đề

---

## 🆘 Troubleshooting

### Script không chạy được
```bash
# Kiểm tra quyền
ls -l scripts/*.sh

# Cấp quyền execute
chmod +x scripts/*.sh

# Kiểm tra syntax
bash -n scripts/firewall-setup-centos.sh
```

### Firewall block kết nối (CentOS với firewalld)
```bash
# Kiểm tra firewall status
sudo firewall-cmd --list-all
sudo systemctl status firewalld

# Cho phép port cụ thể
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload

# Xem logs firewall
sudo journalctl -u firewalld -f
```

### SSL certificate không hoạt động
```bash
# Kiểm tra certificate
openssl x509 -in ssl/cert.pem -text -noout

# Kiểm tra permissions
ls -l ssl/

# Tạo lại certificate
bash scripts/generate-ssl.sh
```

---

## 📚 Tài Liệu Tham Khảo

- [SECURITY_SETUP.md](../SECURITY_SETUP.md) - Tài liệu chi tiết
- [QUICK_START.md](../QUICK_START.md) - Hướng dẫn nhanh
- [README_SECURITY.md](../README_SECURITY.md) - Tổng quan bảo mật

---

**Lưu ý**: Các scripts này được thiết kế để tăng cường bảo mật. Vui lòng đọc kỹ và test trước khi sử dụng trong production.

