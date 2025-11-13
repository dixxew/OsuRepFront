pipeline {
  agent any
  environment {
    IMAGE = "osu-rep-frontend:latest"
    REACT_APP_API_BASE_URL = credentials('russian-rep-front-base-api-url')
  }
  stages {    
    stage('Prepare .env') {
      steps {
        sh '''
          echo "Создаю .env из Jenkins env vars..."
          echo "REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL" > .env

          echo "Содержимое .env:"
          cat .env
        '''
      }
    }

    stage('Build') {
      steps {
        sh ''' 
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
