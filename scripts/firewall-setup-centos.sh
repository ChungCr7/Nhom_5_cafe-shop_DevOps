#!/bin/bash

# ============================================
# Firewall Setup Script cho CentOS Stream 10
# ============================================
# Script này cấu hình firewalld cho CentOS Stream
# Chạy với quyền root: sudo ./firewall-setup-centos.sh

set -e

echo "🔒 Đang cấu hình Firewall (firewalld) cho CentOS Stream..."

# Kiểm tra quyền root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Vui lòng chạy script này với quyền root (sudo)"
    exit 1
fi

# Kiểm tra firewalld đã được cài đặt
if ! command -v firewall-cmd &> /dev/null; then
    echo "📦 Đang cài đặt firewalld..."
    dnf install -y firewalld
fi

# Khởi động firewalld
echo "🚀 Đang khởi động firewalld..."
systemctl start firewalld
systemctl enable firewalld

echo "✅ firewalld đã được khởi động"

# ============================================
# Cấu hình Firewall Rules
# ============================================

echo "📋 Đang cấu hình firewall rules..."

# Cho phép SSH (22) - QUAN TRỌNG: Không tắt!
echo "✅ Cho phép SSH (22)..."
firewall-cmd --permanent --add-service=ssh

# Cho phép HTTP (80)
echo "✅ Cho phép HTTP (80)..."
firewall-cmd --permanent --add-service=http

# Cho phép HTTPS (443)
echo "✅ Cho phép HTTPS (443)..."
firewall-cmd --permanent --add-service=https

# Cho phép Jenkins (8080) - Chỉ từ localhost (an toàn nhất)
echo "✅ Cho phép Jenkins (8080) từ localhost..."
firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="127.0.0.1" port protocol="tcp" port="8080" accept'

# Hoặc nếu muốn cho phép từ mạng nội bộ, uncomment dòng sau:
# echo "✅ Cho phép Jenkins (8080) từ mạng nội bộ..."
# firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.1.0/24" port protocol="tcp" port="8080" accept'

# Cho phép MySQL (3306) - Chỉ từ Docker network
echo "✅ Cho phép MySQL (3306) từ Docker network..."
firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="172.28.0.0/16" port protocol="tcp" port="3306" accept'

# Cho phép Docker network communication
echo "✅ Cho phép Docker network..."
firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="172.28.0.0/16" accept'

# Áp dụng thay đổi
echo "🔄 Đang áp dụng thay đổi..."
firewall-cmd --reload

# ============================================
# Hiển thị kết quả
# ============================================

echo ""
echo "✅ Firewall đã được cấu hình thành công!"
echo ""
echo "📝 Các rules đã được thêm:"
echo "   - SSH (22) - Cho phép từ mọi nguồn"
echo "   - HTTP (80) - Cho phép từ mọi nguồn"
echo "   - HTTPS (443) - Cho phép từ mọi nguồn"
echo "   - Jenkins (8080) - Chỉ từ localhost (127.0.0.1)"
echo "   - MySQL (3306) - Chỉ từ Docker network (172.28.0.0/16)"
echo "   - Docker network (172.28.0.0/16) - Cho phép"
echo ""
echo "📊 Xem cấu hình hiện tại:"
firewall-cmd --list-all
echo ""
echo "⚠️  LƯU Ý:"
echo "   - SSH (22) đã được mở - Đảm bảo bạn có thể truy cập!"
echo "   - Jenkins (8080) chỉ cho phép từ localhost"
echo "   - Nếu muốn truy cập Jenkins từ máy khác, sửa script và thêm IP của bạn"
echo "   - Để xem logs firewall: sudo journalctl -u firewalld"
echo ""

