pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "chungcr7"
        BACKEND_IMAGE = "${DOCKERHUB_USER}/coffee-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USER}/coffee-frontend"
    }

    stages {

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
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {

                    sh "docker build -t ${BACKEND_IMAGE}:latest ./baochung_st22a"
                    sh "docker build -t ${FRONTEND_IMAGE}:latest ./coffee-shop-master"

                    sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin"

                    sh "docker push ${BACKEND_IMAGE}:latest"
                    sh "docker push ${FRONTEND_IMAGE}:latest"
                }
            }
        }
    }
}
