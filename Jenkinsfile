pipeline {
  agent any
  environment {
    IMAGE = "osu-rep-frontend:latest"
  }
  stages {
    stage('Build') {
      steps {
        sh '''
          set -a
          . ./.env   # загрузили REACT_APP_API_BASE_URL из .env
          set +a
          docker build \
            --build-arg REACT_APP_API_BASE_URL="$REACT_APP_API_BASE_URL" \
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
