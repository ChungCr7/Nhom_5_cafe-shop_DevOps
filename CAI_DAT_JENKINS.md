# 🔧 Hướng Dẫn Chi Tiết: Cài Đặt Jenkins

Hướng dẫn từng bước để cài đặt và cấu hình Jenkins cho dự án Cafe Shop.

## 📋 Yêu Cầu Hệ Thống

- **OS**: CentOS Stream 10 (trên máy ảo VMware)
- **RAM**: Tối thiểu 2GB (khuyến nghị 4GB)
- **Disk**: Tối thiểu 10GB trống
- **Java**: Java 17 (khuyến nghị)
- **Network**: Có kết nối Internet

---

## 🚀 BƯỚC 1: CHUẨN BỊ HỆ THỐNG

### 1.1. Cập Nhật Hệ Thống

```bash
# Đăng nhập vào máy ảo/server
ssh username@your-server-ip

# Cập nhật hệ thống
sudo apt update
sudo apt upgrade -y

# Cài đặt các công cụ cần thiết
sudo apt install -y curl wget git vim net-tools
```

### 1.2. Cài Đặt Java

Jenkins yêu cầu Java 11 hoặc 17:

```bash
# Cài đặt Java 17
sudo apt install -y openjdk-17-jdk

# Kiểm tra Java đã cài đặt
java -version
# Kết quả mong đợi: openjdk version "17.0.x"

# Thiết lập JAVA_HOME (nếu cần)
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
source ~/.bashrc
```

---

## 🔧 BƯỚC 2: CÀI ĐẶT JENKINS

### 2.1. Thêm Jenkins Repository

```bash
# Thêm GPG key của Jenkins
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

# Thêm Jenkins repository
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Cập nhật package list
sudo apt update
```

### 2.2. Cài Đặt Jenkins

```bash
# Cài đặt Jenkins
sudo apt install -y jenkins

# Khởi động Jenkins
sudo systemctl start jenkins

# Cho phép Jenkins khởi động cùng hệ thống
sudo systemctl enable jenkins

# Kiểm tra Jenkins đang chạy
sudo systemctl status jenkins
```

**Kết quả mong đợi**: `Active: active (running)`

---

## 🔐 BƯỚC 3: CẤU HÌNH JENKINS LẦN ĐẦU

### 3.1. Lấy Mật Khẩu Ban Đầu

```bash
# Xem mật khẩu ban đầu
sudo cat /var/lib/jenkins/secrets/initialAdminPassword

# Copy mật khẩu này (sẽ dùng ở bước sau)
```

### 3.2. Truy Cập Jenkins Web UI

1. **Mở trình duyệt** và truy cập:
   ```
   http://YOUR_SERVER_IP:8080
   ```
   - Thay `YOUR_SERVER_IP` bằng IP của máy ảo/server
   - Ví dụ: `http://192.168.1.100:8080`

2. **Nhập mật khẩu ban đầu**:
   - Paste mật khẩu đã copy ở bước 3.1
   - Click **Continue**

### 3.3. Cài Đặt Plugins

1. Chọn **"Install suggested plugins"**
   - Jenkins sẽ tự động cài các plugins cơ bản
   - Quá trình này mất khoảng 5-10 phút

2. Đợi quá trình cài đặt hoàn tất

### 3.4. Tạo Admin User

1. **Username**: `admin` (hoặc tên bạn muốn)
2. **Password**: Tạo password mạnh (ít nhất 8 ký tự, có chữ hoa, chữ thường, số)
3. **Full name**: Tên của bạn
4. **Email**: Email của bạn
5. Click **Save and Continue**

### 3.5. Cấu Hình Jenkins URL

1. Giữ nguyên URL mặc định hoặc thay đổi nếu cần
   - Mặc định: `http://YOUR_SERVER_IP:8080/`
2. Click **Save and Finish**
3. Click **Start using Jenkins**

---

## 🛡️ BƯỚC 4: BẢO MẬT JENKINS

### 4.1. Cấu Hình Firewall

```bash
# Chỉ cho phép truy cập Jenkins từ localhost (an toàn nhất)
sudo ufw allow from 127.0.0.1 to any port 8080

# Hoặc nếu muốn truy cập từ máy khác trong mạng nội bộ
# Thay YOUR_IP bằng IP của máy bạn
sudo ufw allow from YOUR_IP to any port 8080

# Hoặc cho phép cả mạng nội bộ (ví dụ: 192.168.1.0/24)
sudo ufw allow from 192.168.1.0/24 to any port 8080

# Kiểm tra firewall rules
sudo ufw status verbose
```

### 4.2. Cấu Hình Jenkins Security

1. Vào Jenkins: **Manage Jenkins** > **Configure Global Security**

2. **Enable Security**: ✅ Check vào

3. **Security Realm**: 
   - Chọn **"Jenkins' own user database"**
   - ✅ Check **"Allow users to sign up"** (tạm thời, tắt sau khi tạo user)

4. **Authorization**:
   - Chọn **"Matrix-based security"** hoặc **"Role-Based Strategy"**
   - Cấp quyền cho user `admin`:
     - ✅ Overall: Administer
     - ✅ Job: All permissions
     - ✅ View: All permissions

5. **CSRF Protection**: ✅ Enable

6. Click **Save**

### 4.3. Tắt Đăng Ký User Mới (Sau khi đã tạo user)

1. **Manage Jenkins** > **Configure Global Security**
2. Bỏ check **"Allow users to sign up"**
3. Click **Save**

---

## 📦 BƯỚC 5: CÀI ĐẶT PLUGINS CẦN THIẾT

### 5.1. Vào Plugin Manager

1. **Manage Jenkins** > **Manage Plugins**
2. Tab **Available**

### 5.2. Tìm và Cài Đặt Plugins

Tìm và check vào các plugins sau:

#### Plugins Cơ Bản:
- ✅ **Docker Pipeline** - Để build Docker images trong pipeline
- ✅ **Docker** - Tích hợp Docker với Jenkins
- ✅ **Git** - Quản lý Git repositories (thường đã có sẵn)
- ✅ **Credentials Binding** - Quản lý credentials an toàn

#### Plugins Security:
- ✅ **OWASP Dependency-Check** - Quét vulnerabilities trong dependencies
- ✅ **SonarQube Scanner** - Code quality và security analysis
- ✅ **Trivy** - Container image scanning

#### Plugins Hữu Ích:
- ✅ **Blue Ocean** - UI đẹp hơn cho Jenkins
- ✅ **Pipeline** - Để chạy Jenkinsfile (thường đã có sẵn)
- ✅ **Email Extension** - Gửi email notifications

### 5.3. Cài Đặt Plugins

1. Check vào các plugins cần thiết
2. Click **Install without restart**
3. Đợi quá trình cài đặt hoàn tất

---

## 🔑 BƯỚC 6: CẤU HÌNH CREDENTIALS

### 6.1. Tạo Docker Hub Credentials

1. **Manage Jenkins** > **Manage Credentials**
2. Click **Add Credentials**
3. Điền thông tin:
   - **Kind**: Username with password
   - **Scope**: Global
   - **Username**: Docker Hub username của bạn
   - **Password**: Docker Hub password
   - **ID**: `dockerhub` (quan trọng: phải đúng ID này)
   - **Description**: Docker Hub credentials
4. Click **OK**

### 6.2. Tạo SonarQube Token (Nếu dùng SonarQube)

1. Tương tự bước 6.1
2. **ID**: `sonar-token`
3. **Username**: `sonar` (hoặc để trống)
4. **Password**: SonarQube token

### 6.3. Tạo SSH Credentials (Nếu cần deploy qua SSH)

1. Tương tự
2. **Kind**: SSH Username with private key
3. **ID**: `ssh-deploy`

---

## 🎯 BƯỚC 7: TẠO JENKINS JOB

### 7.1. Tạo Pipeline Job

1. Vào Jenkins homepage
2. Click **New Item**
3. Nhập tên: `cafe-shop-pipeline`
4. Chọn **Pipeline**
5. Click **OK**

### 7.2. Cấu Hình Pipeline

1. Scroll xuống phần **Pipeline**

2. **Definition**: Chọn **Pipeline script from SCM**

3. **SCM**: Chọn **Git**

4. **Repository URL**: 
   ```
   https://github.com/ChungCr7/Nhom_5_cafe-shop_DevOps.git
   ```
   (Thay bằng URL thực tế của bạn)

5. **Credentials**: 
   - Nếu repo public: Để trống
   - Nếu repo private: Chọn credentials đã tạo

6. **Branch**: `*/main` hoặc `*/master`

7. **Script Path**: `Jenkinsfile`

8. Click **Save**

### 7.3. Chạy Pipeline Lần Đầu

1. Vào job `cafe-shop-pipeline`
2. Click **Build Now**
3. Xem kết quả:
   - Click vào build number (#1)
   - Click **Console Output** để xem logs

---

## 🔍 BƯỚC 8: KIỂM TRA VÀ TROUBLESHOOTING

### 8.1. Kiểm Tra Jenkins Hoạt Động

```bash
# Kiểm tra Jenkins service
sudo systemctl status jenkins

# Xem Jenkins logs
sudo tail -f /var/log/jenkins/jenkins.log

# Kiểm tra Jenkins port
sudo netstat -tulpn | grep 8080
```

### 8.2. Sửa Lỗi Thường Gặp

#### Lỗi: Không truy cập được Jenkins

```bash
# Kiểm tra Jenkins đang chạy
sudo systemctl status jenkins

# Khởi động lại Jenkins
sudo systemctl restart jenkins

# Kiểm tra firewall
sudo ufw status verbose
sudo ufw allow 8080/tcp  # Nếu cần
```

#### Lỗi: Jenkins không build được Docker images

```bash
# Thêm Jenkins user vào docker group
sudo usermod -aG docker jenkins

# Khởi động lại Jenkins
sudo systemctl restart jenkins

# Kiểm tra Jenkins có thể chạy docker
sudo -u jenkins docker ps
```

#### Lỗi: Permission denied khi chạy scripts

```bash
# Cấp quyền cho Jenkins workspace
sudo chown -R jenkins:jenkins /var/lib/jenkins/workspace
```

#### Lỗi: Không tìm thấy Jenkinsfile

- Kiểm tra branch name đúng chưa
- Kiểm tra Script Path đúng chưa (phải là `Jenkinsfile`)
- Kiểm tra file Jenkinsfile có trong repo chưa

---

## 📊 BƯỚC 9: CẤU HÌNH NÂNG CAO (Tùy Chọn)

### 9.1. Cấu Hình Email Notifications

1. **Manage Jenkins** > **Configure System**
2. Tìm phần **Extended E-mail Notification**
3. Cấu hình SMTP server
4. Test email

### 9.2. Cấu Hình Webhook (Tự động trigger build)

1. Vào GitHub repository
2. **Settings** > **Webhooks**
3. Add webhook:
   - **Payload URL**: `http://YOUR_JENKINS_IP:8080/github-webhook/`
   - **Content type**: application/json
   - **Events**: Just the push event
4. Save

### 9.3. Cấu Hình Build Triggers

1. Vào job configuration
2. **Build Triggers**:
   - ✅ **GitHub hook trigger for GITScm polling** (nếu dùng webhook)
   - Hoặc ✅ **Poll SCM** với schedule: `H/5 * * * *` (check mỗi 5 phút)

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Jenkins đã được cài đặt
- [ ] Jenkins đã được cấu hình lần đầu
- [ ] Admin user đã được tạo
- [ ] Firewall đã được cấu hình
- [ ] Security plugins đã được cài đặt
- [ ] Docker Hub credentials đã được tạo
- [ ] Pipeline job đã được tạo
- [ ] Pipeline chạy thành công
- [ ] Jenkins có thể build Docker images

---

## 🎓 TÀI LIỆU THAM KHẢO

- [Jenkins Official Documentation](https://www.jenkins.io/doc/)
- [Jenkins Security Best Practices](https://www.jenkins.io/doc/book/security/)
- [Docker Pipeline Plugin](https://plugins.jenkins.io/docker-workflow/)

---

**Chúc bạn cài đặt thành công! 🎉**

