node {
    def app

    stage('Check out sources') {
        checkout scm
    }

    stage('Build image') {
        app = docker.build("quellcodefabrik-test:${env.BUILD_ID}")
    }

    stage('Run tests') {
        app.inside {
            sh 'npm test'
        }
    }

    stage('Deploy application') {
        sh "echo 'Deploy application'"
        sh "docker run -d --name mbio-translation-transformer -p 8000:8000 quellcodefabrik-test:${env.BUILD_ID}"
    }
}