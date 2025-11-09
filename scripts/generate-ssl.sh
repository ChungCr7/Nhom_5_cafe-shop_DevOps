#!/bin/bash

# ============================================
# Script Tạo SSL Certificates
# ============================================
# Script này tạo SSL certificates cho development và production

set -e

echo "🔐 Đang tạo SSL Certificates..."

# Tạo thư mục
mkdir -p ssl backend-ssl mysql-ssl

# ============================================
# 1. SSL Certificate cho Nginx (Frontend)
# ============================================
echo "📋 Tạo SSL certificate cho Nginx..."

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=VN/ST=HoChiMinh/L=HoChiMinh/O=CafeShop/CN=localhost"

echo "✅ Nginx SSL certificate đã được tạo tại ssl/cert.pem và ssl/key.pem"

# ============================================
# 2. Keystore cho Spring Boot (Backend)
# ============================================
echo "📋 Tạo keystore cho Spring Boot..."

read -sp "Nhập password cho keystore (hoặc Enter để dùng mặc định 'changeme123'): " KEYSTORE_PASSWORD
KEYSTORE_PASSWORD=${KEYSTORE_PASSWORD:-changeme123}

keytool -genkeypair -alias cafe-shop -keyalg RSA -keysize 2048 \
  -storetype PKCS12 -keystore backend-ssl/keystore.p12 \
  -validity 365 -storepass "$KEYSTORE_PASSWORD" \
  -dname "CN=localhost, OU=CafeShop, O=CafeShop, L=HoChiMinh, ST=HoChiMinh, C=VN"

echo "✅ Spring Boot keystore đã được tạo tại backend-ssl/keystore.p12"
echo "   Password: $KEYSTORE_PASSWORD"

# ============================================
# 3. SSL Certificate cho MySQL
# ============================================
echo "📋 Tạo SSL certificates cho MySQL..."

# Tạo CA certificate
openssl genrsa -out mysql-ssl/ca-key.pem 2048
openssl req -new -x509 -nodes -days 365 -key mysql-ssl/ca-key.pem \
  -out mysql-ssl/ca.pem \
  -subj "/C=VN/ST=HoChiMinh/L=HoChiMinh/O=CafeShop/CN=MySQL-CA"

# Tạo server certificate
openssl req -newkey rsa:2048 -nodes -keyout mysql-ssl/server-key.pem \
  -out mysql-ssl/server-req.pem \
  -subj "/C=VN/ST=HoChiMinh/L=HoChiMinh/O=CafeShop/CN=mysql"

openssl x509 -req -in mysql-ssl/server-req.pem -days 365 -CA mysql-ssl/ca.pem \
  -CAkey mysql-ssl/ca-key.pem -CAcreateserial -out mysql-ssl/server-cert.pem

echo "✅ MySQL SSL certificates đã được tạo trong thư mục mysql-ssl/"

# ============================================
# 4. Set Permissions
# ============================================
chmod 600 ssl/*.pem
chmod 600 backend-ssl/*.p12
chmod 600 mysql-ssl/*.pem

echo ""
echo "✅ Tất cả SSL certificates đã được tạo thành công!"
echo ""
echo "📝 Thông tin:"
echo "   - Nginx SSL: ssl/cert.pem, ssl/key.pem"
echo "   - Spring Boot Keystore: backend-ssl/keystore.p12 (Password: $KEYSTORE_PASSWORD)"
echo "   - MySQL SSL: mysql-ssl/ca.pem, mysql-ssl/server-cert.pem, mysql-ssl/server-key.pem"
echo ""
echo "⚠️  LƯU Ý:"
echo "   - Đây là self-signed certificates, chỉ dùng cho development"
echo "   - Cho production, sử dụng Let's Encrypt hoặc CA chính thức"
echo "   - Đảm bảo các file này không được commit lên Git"
echo ""

