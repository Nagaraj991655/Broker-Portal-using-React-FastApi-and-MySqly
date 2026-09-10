pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                git(
                    branch: 'main',
                    credentialsId: 'github-ssh',
                    url: 'git@github.com:Nagaraj991655/Broker-Portal-using-React-FastApi-and-MySqly.git'
                )
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                git config --global --add safe.directory /opt/Broker-Portal-using-React-FastApi-and-MySqly || true

                cd /opt/Broker-Portal-using-React-FastApi-and-MySqly

                docker compose down || true

                docker compose up -d --build
                '''
            }
        }

        stage('Verify') {
            steps {
                sh '''
                docker ps
                '''
            }
        }
    }
}
`
