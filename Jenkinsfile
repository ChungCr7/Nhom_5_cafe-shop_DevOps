pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "chungcr7"
        BACKEND_IMAGE = "${DOCKERHUB_USER}/coffee-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USER}/coffee-frontend"
        // Security scanning tools
        TRIVY_VERSION = "latest"
        SONAR_TOKEN = credentials('sonar-token')
    }

    options {
        // Build timeout
        timeout(time: 30, unit: 'MINUTES')
        // Retry on failure
        retry(2)
        // Timestamp in logs
        timestamps()
        // AnsiColor for better log output
        ansiColor('xterm')
        // Disable concurrent builds
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "🔍 Checking out code from repository..."
                    git branch: 'main', url: 'https://github.com/ChungCr7/Nhom_5_cafe-shop_DevOps.git'
                    sh 'git log -1 --pretty=format:"%h - %an, %ar : %s"'
                }
            }
        }

        stage('Security: Dependency Check') {
            parallel {
                stage('Backend: Maven Dependency Check') {
                    steps {
                        dir('baochung_st22a') {
                            script {
                                echo "🔒 Scanning backend dependencies for vulnerabilities..."
                                sh '''
                                    mvn dependency-check:check -DskipTests || true
                                    mvn org.owasp:dependency-check-maven:check -DskipTests || true
                                '''
                                // Archive dependency check reports
                                archiveArtifacts artifacts: '**/dependency-check-report.html', allowEmptyArchive: true
                            }
                        }
                    }
                }
                stage('Frontend: npm Audit') {
                    steps {
                        dir('coffee-shop-master') {
                            script {
                                echo "🔒 Scanning frontend dependencies for vulnerabilities..."
                                sh '''
                                    npm audit --audit-level=moderate || true
                                    npm audit --json > npm-audit-report.json || true
                                '''
                                // Archive npm audit reports
                                archiveArtifacts artifacts: 'npm-audit-report.json', allowEmptyArchive: true
                            }
                        }
                    }
                }
            }
        }

        stage('Build backend') {
            steps {
                dir('baochung_st22a') {
                    script {
                        echo "🔨 Building backend application..."
                        sh 'mvn clean package -DskipTests'
                        // Archive JAR file
                        archiveArtifacts artifacts: 'target/*.jar', allowEmptyArchive: false
                    }
                }
            }
            post {
                success {
                    echo "✅ Backend build successful"
                }
                failure {
                    echo "❌ Backend build failed"
                    emailext (
                        subject: "Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                        body: "Backend build failed. Please check the logs.",
                        to: "${env.CHANGE_AUTHOR_EMAIL}"
                    )
                }
            }
        }

        stage('Build frontend') {
            steps {
                dir('coffee-shop-master') {
                    script {
                        echo "🔨 Building frontend application..."
                        sh 'npm ci'
                        sh 'npm run build'
                        // Archive build artifacts
                        archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: false
                    }
                }
            }
            post {
                success {
                    echo "✅ Frontend build successful"
                }
                failure {
                    echo "❌ Frontend build failed"
                }
            }
        }

        stage('Security: Code Quality Check') {
            steps {
                script {
                    echo "🔍 Running code quality checks..."
                    dir('baochung_st22a') {
                        sh '''
                            mvn sonar:sonar -Dsonar.login=${SONAR_TOKEN} || true
                            mvn checkstyle:check || true
                        '''
                    }
                }
            }
        }

        stage('Security: Container Image Scanning') {
            steps {
                script {
                    echo "🔒 Scanning Docker images for vulnerabilities..."
                    sh '''
                        # Install Trivy if not present
                        if ! command -v trivy &> /dev/null; then
                            echo "Installing Trivy..."
                            wget -qO- https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
                            echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
                            sudo apt-get update
                            sudo apt-get install -y trivy
                        fi
                    '''
                }
            }
        }

        stage('Docker build') {
            steps {
                script {
                    echo "🐳 Building Docker images..."
                    sh """
                        docker build -t ${BACKEND_IMAGE}:latest -t ${BACKEND_IMAGE}:${env.BUILD_NUMBER} ./baochung_st22a
                        docker build -t ${FRONTEND_IMAGE}:latest -t ${FRONTEND_IMAGE}:${env.BUILD_NUMBER} ./coffee-shop-master
                    """
                }
            }
        }

        stage('Security: Scan Docker Images') {
            steps {
                script {
                    echo "🔒 Scanning Docker images with Trivy..."
                    sh """
                        trivy image --exit-code 0 --severity HIGH,CRITICAL --format json -o backend-scan.json ${BACKEND_IMAGE}:latest || true
                        trivy image --exit-code 0 --severity HIGH,CRITICAL --format json -o frontend-scan.json ${FRONTEND_IMAGE}:latest || true
                        trivy image --exit-code 1 --severity CRITICAL ${BACKEND_IMAGE}:latest || echo "⚠️ Critical vulnerabilities found in backend"
                        trivy image --exit-code 1 --severity CRITICAL ${FRONTEND_IMAGE}:latest || echo "⚠️ Critical vulnerabilities found in frontend"
                    """
                    // Archive scan reports
                    archiveArtifacts artifacts: '*-scan.json', allowEmptyArchive: true
                }
            }
        }

        stage('Docker push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    script {
                        echo "🚀 Pushing Docker images to registry..."
                        sh """
                            echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin
                            docker push ${BACKEND_IMAGE}:latest
                            docker push ${BACKEND_IMAGE}:${env.BUILD_NUMBER}
                            docker push ${FRONTEND_IMAGE}:latest
                            docker push ${FRONTEND_IMAGE}:${env.BUILD_NUMBER}
                        """
                    }
                }
            }
        }

        stage('Security: Cleanup') {
            steps {
                script {
                    echo "🧹 Cleaning up sensitive data and temporary files..."
                    sh """
                        # Remove Docker images to save space
                        docker rmi ${BACKEND_IMAGE}:latest ${BACKEND_IMAGE}:${env.BUILD_NUMBER} || true
                        docker rmi ${FRONTEND_IMAGE}:latest ${FRONTEND_IMAGE}:${env.BUILD_NUMBER} || true
                        # Clean up Docker system
                        docker system prune -f || true
                    """
                }
            }
        }
    }

    post {
        always {
            script {
                echo "📊 Build completed. Cleaning up..."
                // Clean workspace
                cleanWs()
            }
        }
        success {
            echo "✅ Pipeline completed successfully!"
            // Send success notification
            emailext (
                subject: "Build Success: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "Build completed successfully. Images pushed to Docker Hub.",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
        failure {
            echo "❌ Pipeline failed!"
            // Send failure notification
            emailext (
                subject: "Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "Build failed. Please check the logs for details.",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
        unstable {
            echo "⚠️ Pipeline unstable (warnings found)"
        }
    }
}
