# 📚 Hướng Dẫn Tổng Hợp - DevOps Security cho Cafe Shop

Tài liệu này giải thích đơn giản và chi tiết về quá trình triển khai Security DevOps.

## 🎯 Mục Đích

Bảo vệ ứng dụng Cafe Shop khỏi các tấn công bằng cách:
- **Mã hóa kết nối** (SSL/TLS) - Giống như khóa cửa cho website
- **Chặn truy cập trái phép** (Firewall) - Giống như cổng bảo vệ
- **Tăng cường bảo mật ứng dụng** (Hardening) - Giống như khóa thêm các cửa
- **Bảo mật quy trình phát triển** (Jenkins Security) - Giống như bảo vệ quy trình làm việc

---

## 📋 Tổng Quan Quy Trình

```
┌─────────────────────────────────────────────────────────────┐
│                    QUY TRÌNH DEVOPS SECURITY                │
└─────────────────────────────────────────────────────────────┘

1. CHUẨN BỊ MÔI TRƯỜNG
   ├── Cài đặt máy ảo (CentOS Stream 10 với VMware)
   ├── Cài đặt Docker Engine & Docker Compose
   └── Cài đặt Jenkins

2. CẤU HÌNH BẢO MẬT
   ├── Tạo SSL Certificates (mã hóa)
   ├── Cấu hình Firewall (chặn truy cập)
   └── Hardening ứng dụng (tăng cường bảo mật)

3. TRIỂN KHAI
   ├── Build Docker images
   ├── Deploy với Docker Compose
   └── Kiểm tra hoạt động

4. JENKINS CI/CD
   ├── Cấu hình Jenkins pipeline
   ├── Tự động build & test
   ├── Security scanning
   └── Tự động deploy

5. MONITORING & MAINTENANCE
   ├── Theo dõi logs
   ├── Cập nhật bảo mật
   └── Backup dữ liệu
```

---

## 🖥️ PHẦN 1: CÀI ĐẶT MÔI TRƯỜNG

### Bước 1.1: Cài Đặt Máy Ảo CentOS Stream 10 với VMware

#### Bước 1.1.1: Tải VMware và CentOS Stream 10

1. **Tải VMware Workstation Pro/Player**:
   - VMware Workstation Player (miễn phí): https://www.vmware.com/products/workstation-player.html
   - Hoặc VMware Workstation Pro (có phí, có bản trial)

2. **Tải CentOS Stream 10 ISO**:
   - Trang chính thức: https://www.centos.org/stream/
   - Hoặc: https://mirror.stream.centos.org/
   - Chọn: **CentOS Stream 10** - Minimal hoặc DVD ISO
   - Kiến trúc: x86_64 (64-bit)

#### Bước 1.1.2: Tạo Máy Ảo trong VMware

1. **Mở VMware Workstation**
2. **Tạo máy ảo mới** (File > New Virtual Machine hoặc Create a New Virtual Machine):
   - **Typical (recommended)** hoặc **Custom**
   - **Installer disc image file (iso)**: Chọn file CentOS Stream 10 ISO đã tải
   - **Guest operating system**: Linux
   - **Version**: Red Hat Enterprise Linux 10 64-bit (hoặc CentOS 10 64-bit)
   - **Virtual machine name**: `cafe-shop-devops`
   - **Location**: Chọn thư mục lưu máy ảo
   - **Disk capacity**: 
     - Tối thiểu: 20GB
     - Khuyến nghị: 40GB hoặc 50GB
     - Chọn "Split virtual disk into multiple files"
   - **Customize Hardware**:
     - **Memory (RAM)**: Tối thiểu 2GB (khuyến nghị 4GB)
     - **Processors**: 2 CPUs (khuyến nghị)
     - **Network Adapter**: NAT (mặc định) hoặc Bridged

3. **Click Finish** để tạo máy ảo

#### Bước 1.1.3: Cài Đặt CentOS Stream 10

1. **Khởi động máy ảo** (Power on this virtual machine)

2. **Chọn ngôn ngữ**: English (United States) hoặc tiếng Việt

3. **Cấu hình Installation Summary**:
   - **LOCALIZATION**:
     - **Keyboard**: English (US) hoặc Vietnamese
     - **Language Support**: English (United States)
     - **Time & Date**: Chọn timezone (Asia/Ho_Chi_Minh)
   
   - **SOFTWARE**:
     - **Installation Source**: Local media (mặc định)
     - **Software Selection**: 
       - Chọn **Server** hoặc **Minimal Install**
       - **QUAN TRỌNG**: Trong phần "Add-ons", chọn **Development Tools** và **Network Tools**
   
   - **SYSTEM**:
     - **Installation Destination**: 
       - Chọn disk
       - Chọn **Automatic partitioning** (hoặc Custom nếu muốn)
     - **Network & Host Name**:
       - Bật Ethernet adapter (ON)
       - Đặt Host name: `cafe-shop-devops` (tùy chọn)
       - Click **Configure** để cấu hình network nếu cần
     - **Security Policy**: Có thể bỏ qua (sẽ cấu hình sau)
     - **Kdump**: Có thể tắt để tiết kiệm RAM

4. **Bắt đầu cài đặt**:
   - Click **Begin Installation**

5. **Cấu hình User và Root**:
   - **Root Password**: 
     - Tạo password mạnh cho root user
     - **QUAN TRỌNG**: Ghi nhớ password này
   - **User Creation**:
     - Tạo user thường (không phải root)
     - Username: `admin` hoặc tên bạn muốn
     - Password: Tạo password mạnh
     - **Make this user administrator**: ✅ Check (để có quyền sudo)

6. **Đợi cài đặt hoàn tất** (5-10 phút)

7. **Khởi động lại**:
   - Click **Reboot**
   - Sau khi reboot, đăng nhập bằng user đã tạo

#### Bước 1.1.4: Cấu Hình Sau Khi Cài Đặt

1. **Đăng nhập** vào hệ thống

2. **Cài đặt OpenSSH Server** (nếu chưa có):
   ```bash
   sudo dnf install -y openssh-server
   sudo systemctl enable sshd
   sudo systemctl start sshd
   ```

3. **Kiểm tra IP address**:
   ```bash
   ip addr show
   # hoặc
   hostname -I
   ```
   - Ghi nhớ IP address (ví dụ: 192.168.1.100)

4. **Cấu hình Firewall** (tạm thời cho phép SSH):
   ```bash
   sudo firewall-cmd --permanent --add-service=ssh
   sudo firewall-cmd --reload
   ```

### Bước 1.2: Kết Nối Vào Máy Ảo

#### Từ Windows (PowerShell hoặc CMD):

```powershell
# Windows 10/11 đã có sẵn SSH client

# Kết nối vào máy ảo
ssh username@IP_ADDRESS
# Ví dụ: ssh admin@192.168.1.100

# Nếu dùng key authentication (sau này):
# ssh -i path/to/private_key username@IP_ADDRESS
```

#### Từ Linux/Mac:

```bash
ssh username@IP_ADDRESS
# Ví dụ: ssh admin@192.168.1.100
```

#### Xem IP Address từ VMware:

1. **Trong VMware Workstation**:
   - Chọn máy ảo
   - Xem thông tin network ở góc dưới
   - Hoặc: Edit > Virtual Network Editor

2. **Hoặc trong máy ảo CentOS**:
   ```bash
   ip addr show
   # Tìm dòng "inet" của interface eth0 hoặc ens33
   ```

**Lưu ý**: 
- `username`: Tên user bạn tạo khi cài CentOS (ví dụ: `admin`)
- `IP_ADDRESS`: Địa chỉ IP của máy ảo (ví dụ: `192.168.1.100`)
- Nếu không kết nối được, kiểm tra:
  - VMware network adapter đã bật chưa
  - Firewall trong CentOS đã cho phép SSH chưa
  - IP address có đúng không

### Bước 1.3: Cập Nhật Hệ Thống

```bash
# Cập nhật hệ thống (CentOS Stream dùng dnf thay vì apt)
sudo dnf update -y

# Cài đặt các công cụ cần thiết
sudo dnf install -y curl wget git vim net-tools

# Cài đặt EPEL repository (chứa nhiều packages hữu ích)
sudo dnf install -y epel-release

# Cài đặt các công cụ bổ sung
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y yum-utils device-mapper-persistent-data lvm2

# Kiểm tra phiên bản hệ điều hành
cat /etc/redhat-release
# Kết quả mong đợi: CentOS Stream release 10
```

---

## 🐳 PHẦN 2: CÀI ĐẶT DOCKER ENGINE

### Bước 2.1: Xóa Docker Cũ (Nếu Có)

```bash
# Xóa các phiên bản Docker cũ (nếu có)
sudo dnf remove -y docker docker-client docker-client-latest \
    docker-common docker-latest docker-latest-logrotate \
    docker-logrotate docker-engine

# Xóa các file cấu hình cũ
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
```

### Bước 2.2: Cài Đặt Docker Repository

```bash
# Cài đặt dependencies
sudo dnf install -y yum-utils

# Thêm Docker's official repository
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Hoặc nếu repository trên không hoạt động, dùng CentOS Stream repository:
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

### Bước 2.3: Cài Đặt Docker Engine

```bash
# Cài đặt Docker Engine, Docker CLI, và Containerd
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Hoặc nếu lệnh trên không hoạt động, cài từng phần:
# sudo dnf install -y docker-ce
# sudo dnf install -y docker-ce-cli
# sudo dnf install -y containerd.io
# sudo dnf install -y docker-buildx-plugin
# sudo dnf install -y docker-compose-plugin

# Kiểm tra Docker đã cài đặt
docker --version
# Kết quả mong đợi: Docker version 24.x.x hoặc cao hơn
```

### Bước 2.4: Khởi Động Docker

```bash
# Khởi động Docker service
sudo systemctl start docker

# Cho phép Docker khởi động cùng hệ thống
sudo systemctl enable docker

# Kiểm tra Docker đang chạy
sudo systemctl status docker

# Kiểm tra Docker hoạt động
sudo docker run hello-world
```

### Bước 2.5: Cấu Hình Docker (Không Cần Sudo)

```bash
# Thêm user vào docker group (để chạy docker không cần sudo)
sudo usermod -aG docker $USER

# Áp dụng thay đổi group (logout và login lại, hoặc chạy):
newgrp docker

# Kiểm tra Docker hoạt động không cần sudo
docker run hello-world

# Nếu vẫn báo lỗi permission, thử:
# 1. Logout và login lại
# 2. Hoặc khởi động lại máy ảo
```

### Bước 2.6: Kiểm Tra Docker Compose

```bash
# Docker Compose đã được cài cùng với Docker (plugin)
# Kiểm tra version
docker compose version

# Hoặc nếu dùng lệnh cũ:
docker-compose --version

# Nếu chưa có, cài đặt riêng:
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
docker-compose --version
```

### Bước 2.7: Cấu Hình Docker Daemon (Tùy Chọn)

```bash
# Tạo thư mục cấu hình (nếu chưa có)
sudo mkdir -p /etc/docker

# Cấu hình Docker daemon (ví dụ: thay đổi storage driver, log driver)
sudo tee /etc/docker/daemon.json <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

# Khởi động lại Docker để áp dụng cấu hình
sudo systemctl restart docker
```

---

## 🔧 PHẦN 3: CÀI ĐẶT JENKINS

### Bước 3.1: Cài Đặt Java (Jenkins cần Java)

```bash
# Cài đặt Java 17 (Jenkins yêu cầu Java 11 hoặc 17)
sudo dnf install -y java-17-openjdk java-17-openjdk-devel

# Kiểm tra Java
java -version
# Kết quả mong đợi: openjdk version "17.0.x"

# Thiết lập JAVA_HOME (nếu cần)
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk' | sudo tee -a /etc/profile
source /etc/profile

# Kiểm tra JAVA_HOME
echo $JAVA_HOME
```

### Bước 3.2: Thêm Jenkins Repository

```bash
# Thêm Jenkins repository cho CentOS/RHEL
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo

# Import Jenkins GPG key
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

# Kiểm tra repository đã được thêm
sudo dnf repolist | grep jenkins
```

### Bước 3.3: Cài Đặt Jenkins

```bash
# Cài đặt Jenkins
sudo dnf install -y jenkins

# Khởi động Jenkins
sudo systemctl start jenkins

# Cho phép Jenkins khởi động cùng hệ thống
sudo systemctl enable jenkins

# Kiểm tra Jenkins đang chạy
sudo systemctl status jenkins

# Kiểm tra Jenkins port
sudo netstat -tulpn | grep 8080
# Hoặc
sudo ss -tulpn | grep 8080
```

### Bước 3.4: Cấu Hình Jenkins Lần Đầu

1. **Mở trình duyệt và truy cập**: `http://YOUR_IP:8080`
   - Thay `YOUR_IP` bằng IP của máy ảo

2. **Lấy mật khẩu ban đầu**:
   ```bash
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```
   - Copy password và paste vào Jenkins

3. **Cài đặt plugins**:
   - Chọn "Install suggested plugins"
   - Đợi quá trình cài đặt hoàn tất

4. **Tạo admin user**:
   - Username: `admin` (hoặc tên bạn muốn)
   - Password: Tạo password mạnh
   - Full name: Tên của bạn
   - Email: Email của bạn

5. **Cấu hình Jenkins URL**: 
   - Giữ nguyên hoặc thay đổi nếu cần
   - Click "Save and Finish"

### Bước 3.5: Cấu Hình Firewall cho Jenkins (CentOS dùng firewalld)

```bash
# CentOS Stream dùng firewalld thay vì ufw
# Kiểm tra firewalld đang chạy
sudo systemctl status firewalld

# Nếu chưa chạy, khởi động firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Cho phép Jenkins port (8080) từ localhost (an toàn nhất)
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="127.0.0.1" port protocol="tcp" port="8080" accept'

# Hoặc nếu muốn truy cập từ máy khác trong mạng nội bộ
# Thay YOUR_IP bằng IP của máy bạn
# sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="YOUR_IP" port protocol="tcp" port="8080" accept'

# Hoặc cho phép cả mạng nội bộ (ví dụ: 192.168.1.0/24)
# sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.1.0/24" port protocol="tcp" port="8080" accept'

# Áp dụng thay đổi firewall
sudo firewall-cmd --reload

# Kiểm tra firewall rules
sudo firewall-cmd --list-all

# Xem các port đang mở
sudo firewall-cmd --list-ports
```

### Bước 3.6: Cài Đặt Jenkins Plugins Cần Thiết

1. Vào Jenkins: **Manage Jenkins** > **Manage Plugins**
2. Tab **Available**, tìm và cài đặt:
   - **Docker Pipeline** (để build Docker images)
   - **Docker** (để tích hợp Docker)
   - **OWASP Dependency-Check** (security scanning)
   - **SonarQube Scanner** (code quality)
   - **Credentials Binding** (quản lý credentials)
   - **Git** (nếu chưa có)

3. Click **Install without restart**

---

## 📦 PHẦN 4: CHUẨN BỊ DỰ ÁN

### Bước 4.1: Clone Dự Án

```bash
# Tạo thư mục làm việc
mkdir -p ~/projects
cd ~/projects

# Clone dự án (thay URL bằng URL thực tế của bạn)
git clone https://github.com/ChungCr7/Nhom_5_cafe-shop_DevOps.git cafe-shop
cd cafe-shop

# Hoặc nếu bạn đã có code, copy vào máy ảo
# Sử dụng SCP từ máy Windows:
# scp -r D:\cloudC\cafe-shop_DevOps-security username@IP:/home/username/projects/
```

### Bước 4.2: Tạo SSL Certificates

```bash
cd ~/projects/cafe-shop

# Cấp quyền thực thi cho script
chmod +x scripts/generate-ssl.sh

# Chạy script tạo SSL certificates
bash scripts/generate-ssl.sh

# Script sẽ tạo:
# - ssl/cert.pem và ssl/key.pem (cho Nginx)
# - backend-ssl/keystore.p12 (cho Spring Boot)
# - mysql-ssl/*.pem (cho MySQL)
```

### Bước 4.3: Tạo File Environment Variables

```bash
# Tạo file .env
nano .env
```

**Nội dung file .env**:
```env
# Database
MYSQL_ROOT_PASSWORD=YourStrongPassword123!
MYSQL_USER=cafeshop_user
MYSQL_PASSWORD=YourStrongPassword123!

# SSL
SSL_KEYSTORE_PASSWORD=YourKeystorePassword123!

# CORS (cho phép frontend kết nối)
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://localhost:5173,http://YOUR_IP:5173

# JWT
JWT_SECRET=YourSuperSecretJWTKeyChangeThisInProduction123456789
JWT_EXPIRATION=86400000
```

**Lưu file**: `Ctrl + O`, `Enter`, `Ctrl + X`

---

## 🔒 PHẦN 5: CẤU HÌNH BẢO MẬT

### Bước 5.1: Cấu Hình Firewall (CentOS dùng firewalld)

```bash
# CentOS Stream dùng firewalld, không phải ufw
# Cấu hình firewall cho các services cần thiết

# Cho phép SSH (22) - QUAN TRỌNG: Không tắt!
sudo firewall-cmd --permanent --add-service=ssh

# Cho phép HTTP (80)
sudo firewall-cmd --permanent --add-service=http

# Cho phép HTTPS (443)
sudo firewall-cmd --permanent --add-service=https

# Cho phép Jenkins (8080) chỉ từ localhost hoặc mạng nội bộ
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="127.0.0.1" port protocol="tcp" port="8080" accept'
# Hoặc cho phép từ mạng nội bộ (ví dụ: 192.168.1.0/24)
# sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.1.0/24" port protocol="tcp" port="8080" accept'

# Cho phép MySQL (3306) chỉ từ Docker network (172.28.0.0/16)
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="172.28.0.0/16" port protocol="tcp" port="3306" accept'

# Áp dụng thay đổi
sudo firewall-cmd --reload

# Kiểm tra cấu hình
sudo firewall-cmd --list-all

# Hoặc sử dụng script tự động (đã tạo sẵn):
# chmod +x scripts/firewall-setup-centos.sh
# sudo bash scripts/firewall-setup-centos.sh
```

### Bước 5.2: Hardening Jenkins

```bash
# Cấp quyền thực thi
chmod +x scripts/jenkins-hardening.sh

# Chạy script hardening Jenkins
sudo bash scripts/jenkins-hardening.sh

# Sau đó vào Jenkins UI và:
# 1. Manage Jenkins > Configure Global Security
# 2. Enable "Enable security"
# 3. Chọn "Matrix-based security" hoặc "Role-Based Strategy"
# 4. Enable "CSRF Protection"
```

---

## 🚀 PHẦN 6: TRIỂN KHAI ỨNG DỤNG

### Bước 6.1: Build và Deploy với Docker Compose

```bash
cd ~/projects/cafe-shop

# Development (với self-signed certificates)
docker-compose up -d

# Hoặc Production (với Let's Encrypt - cần domain)
# docker-compose -f docker-compose.prod.yml up -d

# Kiểm tra các containers đang chạy
docker-compose ps

# Xem logs
docker-compose logs -f
```

### Bước 6.2: Kiểm Tra Ứng Dụng

```bash
# Kiểm tra backend
curl http://localhost:8080/api/home/health

# Kiểm tra frontend
curl http://localhost:80

# Kiểm tra HTTPS
curl -k https://localhost:443
```

### Bước 6.3: Truy Cập Ứng Dụng

1. **Frontend**: Mở trình duyệt, truy cập `http://YOUR_IP` hoặc `https://YOUR_IP`
2. **Backend API**: `http://YOUR_IP:8080/api/...`
3. **Jenkins**: `http://YOUR_IP:8080` (hoặc localhost nếu đã cấu hình firewall)

---

## 🔄 PHẦN 7: CẤU HÌNH JENKINS CI/CD

### Bước 7.1: Tạo Jenkins Job

1. Vào Jenkins: **New Item**
2. Nhập tên: `cafe-shop-pipeline`
3. Chọn **Pipeline**
4. Click **OK**

### Bước 7.2: Cấu Hình Pipeline

1. Scroll xuống **Pipeline**
2. **Definition**: Chọn **Pipeline script from SCM**
3. **SCM**: Chọn **Git**
4. **Repository URL**: Nhập URL GitHub của bạn
   - Ví dụ: `https://github.com/ChungCr7/Nhom_5_cafe-shop_DevOps.git`
5. **Branch**: `*/main` hoặc `*/master`
6. **Script Path**: `Jenkinsfile`
7. Click **Save**

### Bước 7.3: Cấu Hình Credentials

1. **Docker Hub Credentials**:
   - Vào **Manage Jenkins** > **Manage Credentials**
   - Click **Add Credentials**
   - **Kind**: Username with password
   - **Username**: Docker Hub username
   - **Password**: Docker Hub password
   - **ID**: `dockerhub`
   - Click **OK**

2. **SonarQube Token** (nếu dùng SonarQube):
   - Tương tự, tạo credential với ID: `sonar-token`

### Bước 7.4: Chạy Pipeline

1. Vào job `cafe-shop-pipeline`
2. Click **Build Now**
3. Xem kết quả trong **Console Output**

---

## 📊 QUY TRÌNH HOẠT ĐỘNG

```
┌─────────────────────────────────────────────────────────────┐
│              QUY TRÌNH DEVOPS SECURITY HOẠT ĐỘNG            │
└─────────────────────────────────────────────────────────────┘

1. DEVELOPER PUSH CODE
   └──> Git Repository (GitHub/GitLab)

2. JENKINS TỰ ĐỘNG PHÁT HIỆN THAY ĐỔI
   └──> Webhook hoặc Polling

3. JENKINS PIPELINE CHẠY:
   ├── Checkout code
   ├── Security: Dependency Check
   │   ├── Backend: Maven Dependency Check
   │   └── Frontend: npm Audit
   ├── Build Backend (Maven)
   ├── Build Frontend (npm)
   ├── Security: Code Quality Check (SonarQube)
   ├── Docker Build
   │   ├── Build Backend Image
   │   └── Build Frontend Image
   ├── Security: Scan Docker Images (Trivy)
   ├── Docker Push (Docker Hub)
   └── Security: Cleanup

4. DEPLOYMENT (Manual hoặc tự động)
   └──> docker-compose up -d

5. MONITORING
   ├── Application Logs
   ├── Security Alerts
   └── Performance Metrics
```

---

## 🔍 KIỂM TRA VÀ TROUBLESHOOTING

### Kiểm Tra Services

```bash
# Kiểm tra Docker containers
docker ps

# Kiểm tra Jenkins
sudo systemctl status jenkins

# Kiểm tra firewall (CentOS dùng firewalld)
sudo firewall-cmd --list-all
sudo systemctl status firewalld

# Kiểm tra ports đang mở
sudo netstat -tulpn | grep LISTEN
# Hoặc dùng ss (nhanh hơn)
sudo ss -tulpn | grep LISTEN
```

### Xem Logs

```bash
# Docker logs
docker-compose logs -f

# Jenkins logs
sudo tail -f /var/log/jenkins/jenkins.log

# System logs
sudo journalctl -xe
```

### Sửa Lỗi Thường Gặp

#### Lỗi: Không kết nối được Jenkins
```bash
# Kiểm tra Jenkins đang chạy
sudo systemctl status jenkins

# Khởi động lại Jenkins
sudo systemctl restart jenkins

# Kiểm tra firewall (CentOS dùng firewalld)
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload

# Hoặc cho phép từ IP cụ thể
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="YOUR_IP" port protocol="tcp" port="8080" accept'
sudo firewall-cmd --reload
```

#### Lỗi: Docker permission denied
```bash
# Thêm user vào docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### Lỗi: SSL certificate không hoạt động
```bash
# Tạo lại certificates
bash scripts/generate-ssl.sh

# Kiểm tra permissions
ls -l ssl/
```

---

## 📝 CHECKLIST TRIỂN KHAI

### Trước Khi Bắt Đầu
- [ ] Máy ảo CentOS Stream 10 đã được cài đặt với VMware
- [ ] Có thể SSH vào máy ảo
- [ ] Đã cập nhật hệ thống (dnf update)
- [ ] Đã cài đặt các công cụ cần thiết

### Cài Đặt
- [ ] Docker đã được cài đặt và hoạt động
- [ ] Docker Compose đã được cài đặt
- [ ] Jenkins đã được cài đặt và truy cập được
- [ ] Java đã được cài đặt

### Cấu Hình
- [ ] SSL certificates đã được tạo
- [ ] File .env đã được tạo với passwords mạnh
- [ ] Firewall đã được cấu hình
- [ ] Jenkins plugins đã được cài đặt

### Triển Khai
- [ ] Docker containers đã chạy
- [ ] Ứng dụng có thể truy cập được
- [ ] HTTPS hoạt động
- [ ] Jenkins pipeline chạy thành công

---

## 🎓 TÓM TẮT CÁC FILE QUAN TRỌNG

| File | Mục Đích | Khi Nào Dùng |
|------|----------|--------------|
| `docker-compose.yml` | Deploy development | Khi test trên local |
| `docker-compose.prod.yml` | Deploy production | Khi deploy lên server |
| `Jenkinsfile` | CI/CD pipeline | Jenkins tự động chạy |
| `scripts/generate-ssl.sh` | Tạo SSL certificates | Lần đầu setup |
| `scripts/firewall-setup-centos.sh` | Cấu hình firewall (CentOS/firewalld) | Lần đầu setup trên CentOS |
| `scripts/jenkins-hardening.sh` | Bảo mật Jenkins | Sau khi cài Jenkins |
| `.env` | Environment variables | Trước khi deploy |
| `nginx.conf` | Cấu hình Nginx | Đã có sẵn, chỉnh nếu cần |
| `SecurityConfig.java` | Bảo mật Spring Boot | Đã có sẵn, chỉnh nếu cần |

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Kiểm tra logs: `docker-compose logs -f`
2. Kiểm tra status: `docker-compose ps`
3. Xem tài liệu chi tiết: `SECURITY_SETUP.md`
4. Tạo issue trên GitHub

---

**Chúc bạn thành công! 🎉**

