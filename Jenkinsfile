pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "YOUR_DOCKERHUB_USERNAME"
        BACKEND_IMAGE = "${DOCKERHUB_USER}/coffee-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USER}/coffee-frontend"
    }

    stages {

        stage('Checkout') {
            steps {
                git 'https://github.com/ChungCr7/Nhom_5_cafe-shop_DevOps.git'
            }
        }

        stage('Build backend') {
            steps {
                dir('baochung_st22a') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build frontend') {
            steps {
                dir('coffee-shop-master') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Docker build & push') {
            steps {
                sh "docker build -t ${BACKEND_IMAGE}:latest ./baochung_st22a"
                sh "docker build -t ${FRONTEND_IMAGE}:latest ./coffee-shop-master"

                sh "echo $DOCKERHUB_PASSWORD | docker login -u $DOCKERHUB_USER --password-stdin"
                sh "docker push ${BACKEND_IMAGE}:latest"
                sh "docker push ${FRONTEND_IMAGE}:latest"
            }
        }
    }
}
