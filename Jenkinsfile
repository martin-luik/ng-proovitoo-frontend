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

    stage('E2E: Deploy') {
      agent { docker { image 'host.docker.internal:5001/devops/kubectl-helm:3.19.0' } }
      environment {
        E2E_NS          = "e2e-ng-events"    
        REGISTRY_PULL   = "host.docker.internal:5001"
        CFG_SRC_NS      = "ng-events"                          
        CFG_SRC_NAME    = "pg-init-src"
        HELM_REPO_URL   = "http://host.docker.internal:8081/repository/helm-hosted/"
        HELM_REPO_NAME  = "company-helm"

        CHART_BE        = "ng-backend"
        CHART_FE        = "ng-frontend"
        PG_CHART_VER    = "18.0.8"                                 

        BE_IMAGE        = "ng-proovitoo-backend"
        FE_IMAGE        = "ng-proovitoo-frontend"
        BE_TAG          = "latest"                  
        FE_TAG          = "${env.BUILD_NUMBER}"                 

        DB_USER         = "admin"
        DB_PASS         = "admin"
        DB_NAME         = "events_db"

        LB_SCHEMA       = "liquibase"
        APP_SCHEMA      = "event_mgmt"
        E2E_HOST        = "ng-events-e2e.127.0.0.1.nip.io"
      }
      steps {
        withCredentials([
          file(credentialsId: 'kubeconfig-ng-events', variable: 'KCFG'),
          usernamePassword(credentialsId: 'nexus-helm',   usernameVariable: 'HUSER', passwordVariable: 'HPASS'),
          usernamePassword(credentialsId: 'nexus-docker', usernameVariable: 'DUSER', passwordVariable: 'DPASS')
        ]) {
          sh '''#!/usr/bin/env bash
            set -euxo pipefail

            cp "$KCFG" ./kubeconfig
            chmod 600 ./kubeconfig
            if grep -q "https://127.0.0.1:6443" ./kubeconfig; then
              sed -i 's#https://127.0.0.1:6443#https://kubernetes.docker.internal:6443#g' ./kubeconfig
            fi
            export KUBECONFIG="$PWD/kubeconfig"

            kubectl create ns "${E2E_NS}" --dry-run=client -o yaml | kubectl apply -f -

            kubectl -n "${CFG_SRC_NS}" get configmap "${CFG_SRC_NAME}" \
              -o go-template='{{ index .data "initdb.sql" }}' > /tmp/initdb.sql

            echo "Dumped init script size: $(wc -c </tmp/initdb.sql) bytes"
            test -s /tmp/initdb.sql || { echo "initdb.sql is empty – abort"; exit 1; }

            kubectl -n "${E2E_NS}" create configmap pg-init \
              --from-file=initdb.sql=/tmp/initdb.sql \
              --dry-run=client -o yaml | kubectl apply -f -

            PG_SUPER_PASS="postgres"
            helm upgrade --install pg oci://registry-1.docker.io/bitnamicharts/postgresql \
              --version "${PG_CHART_VER}" \
              -n "${E2E_NS}" \
              --set auth.username="${DB_USER}" \
              --set auth.password="${DB_PASS}" \
              --set auth.database="${DB_NAME}" \
              --set auth.postgresPassword="${PG_SUPER_PASS}" \
              --set primary.initdb.user=postgres \
              --set primary.initdb.password="${PG_SUPER_PASS}" \
              --set primary.initdb.scriptsConfigMap=pg-init \
              --set primary.persistence.enabled=false \
              --wait --timeout 5m

            kubectl -n "${E2E_NS}" rollout status sts/pg-postgresql --timeout=180s

            helm repo add "${HELM_REPO_NAME}" "${HELM_REPO_URL}" --username "${HUSER}" --password "${HPASS}" || true
            helm repo update

            kubectl -n "${E2E_NS}" create secret docker-registry nexus-regcred \
              --docker-server="${REGISTRY_PULL}" \
              --docker-username="${DUSER}" \
              --docker-password="${DPASS}" \
              --dry-run=client -o yaml | kubectl apply -f -

            helm upgrade --install ng-events-backend "${HELM_REPO_NAME}/${CHART_BE}" \
              -n "${E2E_NS}" \
              --set image.repository="${REGISTRY_PULL}/${BE_IMAGE}" \
              --set-string image.tag="${BE_TAG}" \
              --set-string config.SPRING_DATASOURCE_URL="jdbc:postgresql://pg-postgresql.${E2E_NS}.svc.cluster.local:5432/${DB_NAME}?currentSchema=${APP_SCHEMA}" \
              --wait --atomic --timeout 10m

            kubectl -n "${E2E_NS}" rollout status deploy -l app=ng-events-backend --timeout=180s
            kubectl -n "${E2E_NS}" run curl-be --rm -i --restart=Never --image=curlimages/curl:8.10.1 -- \
              sh -lc 'code=$(curl -s -o /dev/null -w "%{http_code}" http://events-backend-service:80/actuator/health); [ "$code" = "200" ]'

            helm upgrade --install ng-events-frontend "${HELM_REPO_NAME}/${CHART_FE}" \
              -n "${E2E_NS}" \
              --set image.repository="${REGISTRY_PULL}/${FE_IMAGE}" \
              --set-string image.tag="${FE_TAG}" \
              --wait --atomic --timeout 10m

            kubectl -n "${E2E_NS}" rollout status deploy -l app=ng-events-frontend --timeout=180s
          '''
        }
      }
    }

    stage('E2E: Playwright tests') {
      agent { docker { image 'mcr.microsoft.com/playwright:v1.47.2-jammy' } }
      environment {
        CI = 'true'
        NG_CLI_ANALYTICS = 'false'
        PW_USE_WEBSERVER = 'false'
        E2E_HOST = 'ng-events-e2e.127.0.0.1.nip.io'
        BASE_URL = 'http://ng-events-e2e.127.0.0.1.nip.io:8088/'
      }
      steps {
        withCredentials([file(credentialsId: 'kubeconfig-ng-events', variable: 'KCFG')]) {
          sh '''#!/usr/bin/env bash
            set -euxo pipefail
    
            apt-get update
            apt-get install -y --no-install-recommends curl ca-certificates
            curl -fsSL -o /usr/local/bin/kubectl https://storage.googleapis.com/kubernetes-release/release/$(curl -fsSL https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
            chmod +x /usr/local/bin/kubectl
    
            cp "$KCFG" ./kubeconfig
            chmod 600 ./kubeconfig
            export KUBECONFIG="$PWD/kubeconfig"
            grep -q "https://127.0.0.1:6443" ./kubeconfig && \
              sed -i 's#https://127.0.0.1:6443#https://kubernetes.docker.internal:6443#g' ./kubeconfig || true
    
            kubectl -n ingress-nginx port-forward svc/ingress-nginx-controller 8088:80 >/tmp/pf.log 2>&1 &
            echo $! > /tmp/pf.pid
            sleep 2
    
            for i in $(seq 1 60); do
              if curl -fsS -H "Host: ${E2E_HOST}" "http://127.0.0.1:8088/" >/dev/null; then
                break
              fi
              sleep 2
            done
    
            node -v; npm -v
            npm ci || npm install
            npx playwright install --with-deps
    
            PW_USE_WEBSERVER=false BASE_URL="${BASE_URL}" npx playwright test --reporter=junit,line --retries=1
          '''
        }
      }
      post {
        always {
          sh '''
            if [ -f /tmp/pf.pid ]; then kill $(cat /tmp/pf.pid) || true; fi
          '''
          junit allowEmptyResults: true, testResults: '**/test-results/*.xml,**/playwright-report/*.xml'
          archiveArtifacts artifacts: 'playwright-report/**,playwright-artifacts/**', allowEmptyArchive: true
        }
      }
    }

    stage('E2E: Cleanup') {
      agent { docker { image 'host.docker.internal:5001/devops/kubectl-helm:3.19.0' } }
      environment {
        E2E_NS = 'e2e-ng-events'
      }
      steps {
        withCredentials([file(credentialsId: 'kubeconfig-ng-events', variable: 'KCFG')]) {
          sh '''#!/usr/bin/env bash
            set -euxo pipefail
    
            cp "$KCFG" ./kubeconfig
            chmod 600 ./kubeconfig
            export KUBECONFIG="$PWD/kubeconfig"
    
            echo "Before patch:" ; grep -n 'server:' ./kubeconfig || true
    
            sed -i \
              -e 's#https://127\\.0\\.0\\.1:6443#https://kubernetes.docker.internal:6443#g' \
              -e 's#https://localhost:6443#https://kubernetes.docker.internal:6443#g' \
              ./kubeconfig || true
    
            if grep -q 'https://127.0.0.1:6443' ./kubeconfig || grep -q 'https://localhost:6443' ./kubeconfig; then
              CLUSTER_NAME="$(kubectl config view --kubeconfig ./kubeconfig -o jsonpath='{.clusters[0].name}')"
              kubectl config set-cluster "$CLUSTER_NAME" \
                --server="https://kubernetes.docker.internal:6443" \
                --kubeconfig ./kubeconfig
            fi
    
            echo "After patch:" ; grep -n 'server:' ./kubeconfig || true
    
            pkill -f 'kubectl .* port-forward' || true
    
            for i in $(seq 1 10); do
              if kubectl version --short >/dev/null 2>&1; then break; fi
              sleep 2
            done
    
            helm uninstall ng-events-frontend -n "${E2E_NS}" || true
            helm uninstall ng-events-backend  -n "${E2E_NS}" || true
            helm uninstall pg                 -n "${E2E_NS}" || true
    
            kubectl -n "${E2E_NS}" delete pvc -l app.kubernetes.io/instance=pg || true
    
            kubectl -n "${E2E_NS}" delete cm pg-init --ignore-not-found=true || true
          '''
        }
      }
    }

    stage('Deploy (Helm)') {
      agent {
        docker {
          image 'host.docker.internal:5001/devops/kubectl-helm:3.19.0'
        }
      }
      environment {
        HELM_REPO_NAME = "company-helm"
        HELM_REPO_URL  = "http://host.docker.internal:8081/repository/helm-hosted/"
        CHART_NAME     = "ng-frontend"
        CHART_VERSION  = "0.1.${env.BUILD_NUMBER}"
    
        REGISTRY_PULL  = "host.docker.internal:5001"
    
        RELEASE_NAME   = "ng-events-frontend"
        NAMESPACE      = "ng-events"

        HOST           = "web.127.0.0.1.nip.io"
      }
      steps {
        withCredentials([
          file(credentialsId: 'kubeconfig-ng-events', variable: 'KCFG'),
          usernamePassword(credentialsId: 'nexus-helm',   usernameVariable: 'HUSER', passwordVariable: 'HPASS'),
          usernamePassword(credentialsId: 'nexus-docker', usernameVariable: 'DUSER', passwordVariable: 'DPASS')
        ]) {
          sh '''
            set -euo pipefail
            set -x
    
            cp "$KCFG" ./kubeconfig
            chmod 600 ./kubeconfig
            if grep -q "https://127.0.0.1:6443" ./kubeconfig; then
              sed -i 's#https://127.0.0.1:6443#https://kubernetes.docker.internal:6443#g' ./kubeconfig
            fi
            export KUBECONFIG="$PWD/kubeconfig"
    
            kubectl config view --minify
            kubectl cluster-info || true
    
            kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f - || true
            kubectl -n "${NAMESPACE}" create secret docker-registry nexus-regcred \
              --docker-server="${REGISTRY_PULL}" \
              --docker-username="${DUSER}" \
              --docker-password="${DPASS}" \
              --dry-run=client -o yaml | kubectl apply -f -
            kubectl -n "${NAMESPACE}" patch serviceaccount default \
              -p '{"imagePullSecrets":[{"name":"nexus-regcred"}]}' || true
    
            helm repo add "${HELM_REPO_NAME}" "${HELM_REPO_URL}" --username "${HUSER}" --password "${HPASS}"
            helm repo update
    
            helm upgrade --install "${RELEASE_NAME}" "${HELM_REPO_NAME}/${CHART_NAME}" \
              --version "${CHART_VERSION}" \
              --namespace "${NAMESPACE}" --create-namespace \
              --set image.repository="${REGISTRY_PULL}/${IMAGE}" \
              --set-string image.tag="${VERSION}" \
              --set ingress.host="${HOST}" \
              --wait --atomic --timeout 10m --history-max 10
    
            kubectl -n "${NAMESPACE}" get deploy,po,svc
          '''
        }
      }
    }
    
  }

  post {
    always { cleanWs() }
  }
}