pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "chungcr7"
        BACKEND_IMAGE = "${DOCKERHUB_USER}/coffee-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USER}/coffee-frontend"
        API_BASE = "http://54.252.74.134:9000"
    }

    stages {

        stage('Checkout Source') {
            steps {
                git branch: 'feature/ci-cd-jenkins',
                    url: 'https://github.com/ChungCr7/Nhom_5_cafe-shop_DevOps.git',
                    credentialsId: 'github_pat'
            }
        }

        stage('Build Backend') {
            steps {
                dir('baochung_st22a') {
                    sh './mvnw clean package -DskipTests'
                }
            }
        }

        stage('Docker Build & Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {

                    sh "docker build -t ${BACKEND_IMAGE}:latest ./baochung_st22a"

                    sh \"docker build --build-arg VITE_API_BASE=${API_BASE}/api -t ${FRONTEND_IMAGE}:latest ./coffee-shop-master\"

                    sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin"

                    sh "docker push ${BACKEND_IMAGE}:latest"
                    sh "docker push ${FRONTEND_IMAGE}:latest"
                }
            }
        }
    }
}
