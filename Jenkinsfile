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

    stage('Helm package & upload (hosted)') {
      agent { docker { image 'host.docker.internal:5001/devops/kubectl-helm:3.19.0' } }
      environment {
        CHART_DIR     = 'helm'
        CHART_VERSION = "0.1.${env.BUILD_NUMBER}"
        APP_VERSION   = "${env.VERSION}"
        HELM_REPO_URL = "http://host.docker.internal:8081/repository/helm-hosted/"
      }
      steps {
        withCredentials([usernamePassword(credentialsId: 'nexus-helm', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
          sh '''
            set -euo pipefail
            set -x

            rm -f ./*.tgz || true

            sed -i "s/^version:.*/version: ${CHART_VERSION}/" ${CHART_DIR}/Chart.yaml || true
            sed -i "s/^appVersion:.*/appVersion: \\"${APP_VERSION}\\"/" ${CHART_DIR}/Chart.yaml || true

            if grep -q "^dependencies:" ${CHART_DIR}/Chart.yaml; then
              helm dependency build ${CHART_DIR}
            fi

            helm package ${CHART_DIR} --version ${CHART_VERSION} --app-version ${APP_VERSION}

            TGZ=$(ls -1 *.tgz)
            BASENAME=$(basename "$TGZ")

            curl -f -L -u "${USER}:${PASS}" \
              --upload-file "${TGZ}" \
              "${HELM_REPO_URL}${BASENAME}"
          '''
        }
      }
    }
  }

  post {
    always { cleanWs() }
  }
}