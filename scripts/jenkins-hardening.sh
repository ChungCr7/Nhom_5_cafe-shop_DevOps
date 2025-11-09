#!/bin/bash

# ============================================
# Jenkins Hardening Script
# ============================================
# Script này cấu hình bảo mật cho Jenkins
# Chạy với quyền root: sudo ./jenkins-hardening.sh

set -e

echo "🔒 Đang cấu hình bảo mật Jenkins..."

# Kiểm tra quyền root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Vui lòng chạy script này với quyền root (sudo)"
    exit 1
fi

JENKINS_HOME=${JENKINS_HOME:-/var/lib/jenkins}
JENKINS_CONFIG="${JENKINS_HOME}/config.xml"

if [ ! -f "$JENKINS_CONFIG" ]; then
    echo "⚠️  Không tìm thấy Jenkins config tại ${JENKINS_CONFIG}"
    echo "   Vui lòng chỉ định JENKINS_HOME đúng"
    exit 1
fi

echo "✅ Tìm thấy Jenkins tại: ${JENKINS_HOME}"

# ============================================
# 1. Cấu hình Jenkins Security
# ============================================
echo "📋 Đang cấu hình Jenkins Security..."

# Backup config
cp "${JENKINS_CONFIG}" "${JENKINS_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"

# Tạo script Groovy để cấu hình bảo mật
cat > /tmp/jenkins-security.groovy << 'EOF'
import jenkins.model.Jenkins
import hudson.security.*

def instance = Jenkins.getInstance()

// Enable Security
if (!instance.isUseSecurity()) {
    println "Enabling Jenkins security..."
    
    // Tạo Realm (có thể dùng Matrix Authorization Strategy)
    def strategy = new FullControlOnceLoggedInAuthorizationStrategy()
    strategy.setAllowAnonymousRead(false)
    
    instance.setAuthorizationStrategy(strategy)
    instance.setSecurityRealm(new hudson.security.HudsonPrivateSecurityRealm(false))
    instance.setUseSecurity(true)
    
    instance.save()
    println "✅ Jenkins security enabled"
} else {
    println "✅ Jenkins security already enabled"
}

// Disable CLI over remoting
instance.getDescriptor("jenkins.CLI").get().setEnabled(false)

// Set agent port (nếu cần)
// instance.setSlaveAgentPort(50000)

instance.save()
println "✅ Jenkins security configuration completed"
EOF

# Chạy script Groovy
java -jar /usr/share/jenkins/jenkins.war -s "${JENKINS_HOME}" -httpPort=8080 -executorScript /tmp/jenkins-security.groovy || echo "⚠️  Cần chạy script này từ Jenkins Script Console"

# ============================================
# 2. Cấu hình Firewall cho Jenkins
# ============================================
echo "📋 Đang cấu hình Firewall cho Jenkins..."

# Chỉ cho phép truy cập Jenkins từ localhost và IP cụ thể
if command -v ufw &> /dev/null; then
    # Cho phép từ localhost
    ufw allow from 127.0.0.1 to any port 8080 comment 'Jenkins Local'
    # Cho phép từ IP cụ thể (thay YOUR_IP bằng IP của bạn)
    # ufw allow from YOUR_IP to any port 8080 comment 'Jenkins Admin'
    echo "✅ UFW rules added for Jenkins"
fi

# ============================================
# 3. Cấu hình Jenkins Plugins Security
# ============================================
echo "📋 Đang kiểm tra Jenkins plugins security..."

# Tạo script để cài đặt security plugins
cat > /tmp/install-security-plugins.txt << 'EOF'
credentials-binding
ssh-credentials
plain-credentials
workflow-step-api
pipeline-stage-step
pipeline-build-step
pipeline-input-step
pipeline-graph-analysis
pipeline-rest-api
pipeline-stage-view
pipeline-milestone-step
pipeline-model-api
pipeline-model-definition
pipeline-model-extensions
pipeline-stage-tags-metadata
pipeline-utility-steps
sonar
dependency-check-jenkins-plugin
trivy
EOF

echo "✅ Security plugins list created"
echo "   Cài đặt plugins từ Jenkins UI: Manage Jenkins > Manage Plugins"

# ============================================
# 4. Cấu hình Jenkins User Permissions
# ============================================
echo "📋 Đang tạo Jenkins admin user..."

# Tạo script để tạo admin user
cat > /tmp/create-admin-user.groovy << 'EOF'
import jenkins.model.*
import hudson.security.*
import hudson.util.*

def instance = Jenkins.getInstance()

// Tạo admin user
def hudsonRealm = new HudsonPrivateSecurityRealm(false)
hudsonRealm.createAccount("admin", "changeme123!") // ⚠️ Thay đổi password
instance.setSecurityRealm(hudsonRealm)

// Cấu hình authorization
def strategy = new FullControlOnceLoggedInAuthorizationStrategy()
strategy.setAllowAnonymousRead(false)
instance.setAuthorizationStrategy(strategy)

instance.save()
println "✅ Admin user created. Please change the password!"
EOF

echo "✅ Admin user creation script created"
echo "   Chạy script từ Jenkins Script Console: Manage Jenkins > Script Console"

# ============================================
# 5. Cấu hình Jenkins Logs
# ============================================
echo "📋 Đang cấu hình Jenkins logs..."

# Tạo log rotation
cat > /etc/logrotate.d/jenkins << 'EOF'
/var/log/jenkins/jenkins.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 jenkins jenkins
    postrotate
        systemctl reload jenkins > /dev/null 2>&1 || true
    endscript
}
EOF

echo "✅ Jenkins log rotation configured"

# ============================================
# 6. Cấu hình Jenkins Environment Variables
# ============================================
echo "📋 Đang cấu hình Jenkins environment variables..."

# Tạo file environment variables
cat > /etc/default/jenkins << 'EOF'
# Jenkins security settings
JENKINS_OPTS="--httpPort=8080 --httpsPort=-1"
JENKINS_JAVA_OPTIONS="-Djava.awt.headless=true -Djenkins.install.runSetupWizard=false -Xmx2048m -Xms512m"
JENKINS_USER=jenkins
JENKINS_GROUP=jenkins
JENKINS_HOME=/var/lib/jenkins
JENKINS_LOG=/var/log/jenkins
EOF

echo "✅ Jenkins environment variables configured"

# ============================================
# 7. Set Permissions
# ============================================
echo "📋 Đang thiết lập permissions..."

chown -R jenkins:jenkins "${JENKINS_HOME}"
chmod 755 "${JENKINS_HOME}"
chmod 600 "${JENKINS_HOME}/config.xml"

echo "✅ Permissions set"

# ============================================
# 8. Summary
# ============================================
echo ""
echo "✅ Jenkins hardening completed!"
echo ""
echo "📝 Các bước tiếp theo:"
echo "   1. Đăng nhập Jenkins và thay đổi password admin"
echo "   2. Cài đặt security plugins từ Manage Plugins"
echo "   3. Cấu hình Matrix Authorization Strategy"
echo "   4. Enable CSRF Protection"
echo "   5. Cấu hình SSL/HTTPS cho Jenkins"
echo "   6. Thường xuyên cập nhật Jenkins và plugins"
echo ""
echo "⚠️  LƯU Ý:"
echo "   - Đảm bảo firewall chỉ cho phép truy cập từ IP tin cậy"
echo "   - Sử dụng strong passwords cho tất cả users"
echo "   - Enable 2FA nếu có thể"
echo "   - Thường xuyên kiểm tra security advisories"
echo "   - Backup Jenkins config thường xuyên"
echo ""

