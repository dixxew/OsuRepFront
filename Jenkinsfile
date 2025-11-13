pipeline {
  agent any
  environment {
    IMAGE = "osu-rep-frontend:latest"
  }
  stages {
    stage('Build') {
      steps {
        sh ''' 
          docker build \
            -t $IMAGE .
        '''
      }
    }
    stage('Run') {
      steps {
        sh '''
          docker rm -f osu-rep-frontend || true
          docker run -d --name osu-rep-frontend --restart unless-stopped \
            --network osu-russian-rep \
            -p 5100:80 $IMAGE
        '''
      }
    }
  }
}
