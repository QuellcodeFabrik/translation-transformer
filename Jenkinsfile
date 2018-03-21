node {
    def app

    stage("Stop existing container") {
        sh "echo 'Removing previous version(s) of application...'"

        sh "docker ps -f name=mbio-translation-transformer -q | xargs --no-run-if-empty docker container stop"
        sh "docker container ls -a -fname=mbio-translation-transformer -q | xargs --no-run-if-empty -r docker container rm"
    }

    stage("Delete existing images") {
        sh "echo 'Deleting stale images...'"

        // TODO fix the following line
        // sh "docker images 'mbio-translation-transformer' | xargs --no-run-if-empty docker rmi"
    }

    stage("Check out sources") {
        checkout scm
    }

    stage("Build new image") {
        app = docker.build("mbio-translation-transformer:${env.BUILD_ID}")
    }

    stage("Run tests") {
        app.inside {
            sh "npm test"
        }
    }

    stage("Deploy new container") {
        sh "echo 'Deploying application...'"

        sh "docker run -d --name mbio-translation-transformer -p 8000:8000 mbio-translation-transformer:${env.BUILD_ID}"
    }
}