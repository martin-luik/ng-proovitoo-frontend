pipeline {
  agent any
  options { timestamps() }

  environment {
    REGISTRY = "localhost:5001"
    IMAGE    = "ng-proovitoo-frontend"
    VERSION  = "${env.BUILD_NUMBER}"
  }

  stages {
    stage('Build & Test') {
      agent {
        docker {
          image 'node:24-bookworm'
          args  '-u root:root'
          reuseNode true
        }
      }
      environment {
        CI = 'true'
        CHROME_BIN = '/usr/bin/chromium'
        npm_config_cache = "${WORKSPACE}/.npm"
        NG_CLI_ANALYTICS = 'false'
      }
      steps {
        sh '''#!/usr/bin/env bash
    set -Eeuo pipefail

    apt-get update
    apt-get install -y --no-install-recommends \
      chromium ca-certificates git \
      libnss3 libxss1 libasound2 libatk-bridge2.0-0 libgtk-3-0 fonts-liberation
    rm -rf /var/lib/apt/lists/*

    node -v
    npm -v

    npm ci || npm install
    npm run lint --if-present || true

    chown -R node:node .
    su -s /bin/bash -c "npm test -- --watch=false --browsers=ChromeHeadlessNoSandbox --no-progress" node
    '''
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'test-results/*.xml'
        }
      }
    }

    stage('Docker build & push (host)') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'nexus-docker', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
          sh '''
            docker build -t ${IMAGE}:${VERSION} .
            docker tag ${IMAGE}:${VERSION} ${REGISTRY}/${IMAGE}:${VERSION}
            docker tag ${IMAGE}:${VERSION} ${REGISTRY}/${IMAGE}:latest
            echo "$PASS" | docker login ${REGISTRY} -u "$USER" --password-stdin
            docker push ${REGISTRY}/${IMAGE}:${VERSION}
            docker push ${REGISTRY}/${IMAGE}:latest
          '''
        }
      }
      post {
        always { sh 'docker logout ${REGISTRY} || true' }
      }
    }
  }

  post {
    always { cleanWs() }
  }
}