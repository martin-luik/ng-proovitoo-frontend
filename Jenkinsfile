pipeline {
  agent any
  options { timestamps() }

  parameters {
    booleanParam(name: 'RUN_E2E', defaultValue: true, description: 'Run ephemeral E2E after deploy')
    choice(name: 'E2E_SUITE', choices: ['smoke','regression'], description: 'Playwright test suite')
    string(name: 'BACKEND_TAG', defaultValue: 'latest', description: 'Backend image tag to use in E2E (e.g. commit SHA or latest)')
    booleanParam(name: 'KEEP_ON_FAILURE', defaultValue: false, description: 'Keep E2E namespace on failure (for debugging)')
  }

  environment {
    REGISTRY        = "localhost:5001"
    IMAGE           = "ng-proovitoo-frontend"
    VERSION         = "${env.BUILD_NUMBER}"

    HELM_REPO_NAME  = "company-helm"
    HELM_REPO_URL   = "http://host.docker.internal:8081/repository/helm-hosted/"

    CHART_NAME      = "ng-frontend"
    CHART_DIR       = "helm"
    CHART_VERSION   = "0.1.${env.BUILD_NUMBER}"
    APP_VERSION     = "${env.VERSION}"
    REGISTRY_PULL   = "host.docker.internal:5001"

    RELEASE_NAME    = "ng-events-frontend"
    NAMESPACE       = "ng-events"

    E2E_NS          = "e2e-${env.BUILD_NUMBER}"
    E2E_RELEASE     = "ng-events-e2e-${env.BUILD_NUMBER}"
    E2E_HOST        = "e2e-${env.BUILD_NUMBER}.sslip.io"   // toimib ilma DNSita
    HELM_BACKEND    = "ng-backend"                         // backend charti nimi Nexus Helm repos
  }

  stages {

    stage('Build & Unit Test (Node)') {
      when { branch 'release' }
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
          su -s /bin/bash -c "npm test -- --watch=false --browsers=ChromeHeadlessNoSandbox --no-progress" node || true
        '''
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'test-results/*.xml'
        }
      }
    }

    stage('Docker build & push (host)') {
      when { branch 'release' }
      steps {
        withCredentials([usernamePassword(credentialsId: 'nexus-docker', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
          sh '''
            set -euxo pipefail
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
      when { branch 'release' }
      agent { docker { image 'host.docker.internal:5001/devops/kubectl-helm:3.19.0' } }
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

    stage('Deploy FE (Helm → ng-events)') {
      when { branch 'release' }
      agent { docker { image 'host.docker.internal:5001/devops/kubectl-helm:3.19.0' } }
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
            # Docker Desktopi kubeconfig "127.0.0.1" -> "kubernetes.docker.internal"
            if grep -q "https://127.0.0.1:6443" ./kubeconfig; then
              sed -i 's#https://127.0.0.1:6443#https://kubernetes.docker.internal:6443#g' ./kubeconfig
            fi
            export KUBECONFIG="$PWD/kubeconfig"

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
              --wait --atomic --timeout 10m --history-max 10

            kubectl -n "${NAMESPACE}" get deploy,po,svc
          '''
        }
      }
    }

    stage('E2E: Ephemeral env UP (PG + BE + FE)') {
      when { allOf { branch 'release'; expression { params.RUN_E2E } } }
      agent { docker { image 'host.docker.internal:5001/devops/kubectl-helm:3.19.0' } }
      steps {
        withCredentials([
          file(credentialsId: 'kubeconfig-ng-events', variable: 'KCFG'),
          usernamePassword(credentialsId: 'nexus-docker', usernameVariable: 'DU', passwordVariable: 'DP'),
          usernamePassword(credentialsId: 'nexus-helm',   usernameVariable: 'HU', passwordVariable: 'HP')
        ]) {
          sh '''#!/usr/bin/env bash
            set -euxo pipefail
            export KUBECONFIG="$KCFG"

            # Namespace
            kubectl create ns "${E2E_NS}"

            # Pull secret
            kubectl -n "${E2E_NS}" create secret docker-registry nexus-regcred \
              --docker-server="${REGISTRY_PULL}" \
              --docker-username="${DU}" \
              --docker-password="${DP}"
            kubectl -n "${E2E_NS}" patch serviceaccount default \
              -p '{"imagePullSecrets":[{"name":"nexus-regcred"}]}' || true

            # Helm repo (Nexus)
            helm repo add "${HELM_REPO_NAME}" "${HELM_REPO_URL}" --username "${HU}" --password "${HP}"
            helm repo update

            # Postgres (Bitnami OCI) – pin versioon
            CHART_VER="18.0.8"
            helm upgrade --install pg oci://registry-1.docker.io/bitnamicharts/postgresql \
              --version "${CHART_VER}" \
              -n "${E2E_NS}" \
              --set auth.username=app,auth.password=app,auth.database=app \
              --wait --timeout 5m

            # Backend (kasutab sinu registry pilti ja viitab eespool tõstetud Postgres’ele)
            helm upgrade --install "${E2E_RELEASE}-be" "${HELM_REPO_NAME}/${HELM_BACKEND}" \
              -n "${E2E_NS}" \
              --set image.repository="${REGISTRY_PULL}/ng-proovitoo-backend" \
              --set-string image.tag="${BACKEND_TAG}" \
              --set ingress.enabled=true \
              --set ingress.host="${E2E_HOST}" \
              --set-string extraEnv.SPRING_DATASOURCE_URL="jdbc:postgresql://pg-postgresql.${E2E_NS}.svc.cluster.local:5432/app" \
              --set extraEnv.SPRING_DATASOURCE_USERNAME=app \
              --set extraEnv.SPRING_DATASOURCE_PASSWORD=app \
              --wait --atomic --timeout 10m

            # Frontend – kasutab just ehitatud pilti
            helm upgrade --install "${E2E_RELEASE}-fe" "${HELM_REPO_NAME}/${CHART_NAME}" \
              -n "${E2E_NS}" \
              --set image.repository="${REGISTRY_PULL}/${IMAGE}" \
              --set-string image.tag="${VERSION}" \
              --set ingress.enabled=true \
              --set ingress.host="${E2E_HOST}" \
              --wait --atomic --timeout 10m

            # Oota kuni FE vastab
            for i in $(seq 1 60); do
              curl -fsS "http://${E2E_HOST}" && break
              sleep 2
            done
          '''
        }
      }
    }

    stage('E2E: Run Playwright') {
      when { allOf { branch 'release'; expression { params.RUN_E2E } } }
      agent { docker { image 'mcr.microsoft.com/playwright:v1.47.2-jammy'; args '--ipc=host' } }
      environment { BASE_URL = "http://${E2E_HOST}" }
      steps {
        dir('frontend') { // muuda kui FE kood on mujal
          sh '''#!/usr/bin/env bash
            set -euxo pipefail
            npm ci || npm install
            npx playwright install --with-deps

            for i in $(seq 1 60); do curl -fsS "${BASE_URL}" && break; sleep 2; done

            if [ "${E2E_SUITE}" = "smoke" ]; then
              npx playwright test -g "@smoke" --retries=1
            else
              npx playwright test --retries=1
            fi
          '''
        }
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'frontend/playwright-results.xml'
          archiveArtifacts artifacts: 'frontend/playwright-report/**,frontend/playwright-artifacts/**', allowEmptyArchive: true, fingerprint: true
        }
      }
    }

    stage('E2E: Teardown') {
      when { allOf { branch 'release'; expression { params.RUN_E2E && !params.KEEP_ON_FAILURE } } }
      agent { docker { image 'host.docker.internal:5001/devops/kubectl-helm:3.19.0' } }
      steps {
        withCredentials([file(credentialsId: 'kubeconfig-ng-events', variable: 'KCFG')]) {
          sh '''#!/usr/bin/env bash
            set -euxo pipefail
            export KUBECONFIG="$KCFG"
            helm uninstall "${E2E_RELEASE}-fe" -n "${E2E_NS}" || true
            helm uninstall "${E2E_RELEASE}-be" -n "${E2E_NS}" || true
            helm uninstall pg -n "${E2E_NS}" || true
            kubectl delete ns "${E2E_NS}" --ignore-not-found=true
          '''
        }
      }
    }
  }

  post {
    failure {
      script {
        if (params.RUN_E2E && params.KEEP_ON_FAILURE) {
          echo "E2E keskkond jäeti alles: namespace=${env.E2E_NS}, host=http://${env.E2E_HOST}"
        }
      }
    }
    always {
      // väikene cleanup hosti poolel
      sh 'docker image prune -f || true'
      cleanWs()
    }
  }
}