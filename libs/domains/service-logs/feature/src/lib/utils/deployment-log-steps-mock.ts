import { type PreCheckStepMetric, type ServiceStepMetric } from 'qovery-typescript-axios'
import { type EnvironmentLogIds } from '../hooks/use-deployment-logs/use-deployment-logs'

/**
 * Sample deployment shown by the grouped logs view while the API doesn't send the step of each log line yet.
 * TODO: remove once every environment runs an API version that sends `step_name` on log lines.
 */

const MOCK_DEPLOYMENT_START_MS = Date.parse('2026-10-26T08:36:00Z')

export const MOCK_PRE_CHECK_STEPS: PreCheckStepMetric[] = [
  { name: 'CLOUD_CREDENTIALS_CHECK', status: 'SUCCESS', duration_sec: 1 },
  { name: 'GIT_CHECK', status: 'SUCCESS', duration_sec: 2 },
]

export const MOCK_SERVICE_STEPS: ServiceStepMetric[] = [
  { step_name: 'BUILD_QUEUEING', status: 'SUCCESS', duration_sec: 0 },
  { step_name: 'GIT_CLONE', status: 'SUCCESS', duration_sec: 7 },
  {
    step_name: 'BUILD',
    status: 'SUCCESS',
    duration_sec: 150,
    sub_steps: [
      { name: 'PROVISION_BUILDER', status: 'SUCCESS', duration_sec: 0 },
      { name: 'IMAGE_PUSH', status: 'SUCCESS', duration_sec: 13 },
      { name: 'CACHE_EXPORT', status: 'SUCCESS', duration_sec: 9 },
    ],
  },
  { step_name: 'DEPLOYMENT_QUEUEING', status: 'SUCCESS', duration_sec: 0 },
  { step_name: 'DEPLOYMENT', status: 'SUCCESS', duration_sec: 71 },
  { step_name: 'ROUTER_DEPLOYMENT', status: 'SUCCESS', duration_sec: 5 },
]

type MockLine = [offsetSec: number, message: string]

const MOCK_LINES: { stepName: string; stageStep: string; lines: MockLine[] }[] = [
  {
    stepName: 'CLOUD_CREDENTIALS_CHECK',
    stageStep: 'PreCheck',
    lines: [[0, 'Cloud provider credentials are valid']],
  },
  {
    stepName: 'GIT_CHECK',
    stageStep: 'PreCheck',
    lines: [[2, 'Git repository https://github.com/acme/web-app.git is reachable on branch main']],
  },
  {
    stepName: 'GIT_CLONE',
    stageStep: 'Build',
    lines: [[143, 'Cloning repository https://github.com/acme/web-app.git at commit 0518c3e']],
  },
  {
    stepName: 'BUILD',
    stageStep: 'Build',
    lines: [
      [150, '#0 building with "qovery-358c043f-c912-44c1-9b81-0782e50845e4" instance using kubernetes driver'],
      [150, '#1 [internal] load build definition from Dockerfile'],
      [150, '#1 transferring dockerfile: 3.30kB done'],
      [151, '#5 [internal] load metadata for docker.io/library/node:22-alpine'],
      [151, '#9 [internal] load .dockerignore'],
      [151, '#10 importing cache manifest from 283389881690.dkr.ecr.us-east-2.amazonaws.com/web-app:cache'],
      [153, '#11 transferring context: 268.56MB 1.2s done'],
      [153, '#16 [builder 3/6] COPY package.json package-lock.json ./'],
      [153, '#16 CACHED'],
      [153, '#17 [builder 4/6] RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund --prefer-offline'],
      [160, '#17 DONE 6.9s'],
      [160, '#18 [builder 5/6] COPY . .'],
      [170, '#18 DONE 10.4s'],
      [171, '#19 1.286 > tsc -b && vite build'],
      [184, '#19 14.09 vite v8.0.10 building client environment for production...'],
      [191, '\u001b[32m✓\u001b[39m 6227 modules transformed.'],
      [193, '#19 22.89 (!) Some chunks are larger than 500 kB after minification.'],
      [193, '\u001b[32m#19 22.90 ✓ built in 8.80s\u001b[39m'],
      [200, '#19 30.23 [prerender] Prerendering pages...'],
      [235, '#19 65.63 [prerender] Prerendered 1164 pages'],
      [271, '#19 DONE 100.2s'],
    ],
  },
  {
    stepName: 'IMAGE_PUSH',
    stageStep: 'Build',
    lines: [
      [278, '#20 exporting to image'],
      [278, '#20 exporting layers'],
      [280, '#20 exporting layers 2.1s done'],
      [280, '#20 writing image sha256:9f2c1e5b7a0d4c3e8b6f1a2d5c7e9b0a1f3d5c7e9b1a3c5e7f9d1b3a5c7e9f1b done'],
      [280, '#20 naming to 283389881690.dkr.ecr.us-east-2.amazonaws.com/web-app:0518c3e done'],
      [281, '#20 pushing layers'],
      [284, '#20 pushing layer sha256:1a2b3c4d 12.4MB / 48.2MB'],
      [287, '#20 pushing layer sha256:1a2b3c4d 48.2MB / 48.2MB done'],
      [288, '#20 pushing layer sha256:5e6f7a8b 3.1MB / 3.1MB done'],
      [289, '#20 pushing manifest for 283389881690.dkr.ecr.us-east-2.amazonaws.com/web-app:0518c3e'],
      [290, '#20 pushing manifest done'],
      [291, '#20 DONE 13.0s'],
    ],
  },
  {
    stepName: 'CACHE_EXPORT',
    stageStep: 'Build',
    lines: [
      [291, '#21 exporting cache to registry'],
      [292, '#21 preparing build cache for export'],
      [296, '#21 writing layer sha256:7c8d9e0f 35.6MB done'],
      [298, '#21 writing cache manifest done'],
      [300, '#21 DONE 9.0s'],
    ],
  },
  {
    stepName: 'DEPLOYMENT',
    stageStep: 'Deploy',
    lines: [
      [301, '🚀 Deploying application web-app'],
      [302, 'Applying Kubernetes resources: Deployment, Service, HorizontalPodAutoscaler'],
      [305, 'Waiting for 2 pods to be ready'],
      [318, 'Pod web-app-7d9f8c6b5-x2k4p: pulling image'],
      [331, 'Pod web-app-7d9f8c6b5-x2k4p: container started'],
      [347, 'Pod web-app-7d9f8c6b5-x2k4p: readiness probe succeeded'],
      [352, 'Pod web-app-7d9f8c6b5-m8n3q: container started'],
      [367, 'Pod web-app-7d9f8c6b5-m8n3q: readiness probe succeeded'],
      [370, '2 of 2 pods are ready'],
      [372, '✅ Application web-app is deployed'],
    ],
  },
  {
    stepName: 'ROUTER_DEPLOYMENT',
    stageStep: 'Deploy',
    lines: [
      [372, 'Exposing web-app on port 3000'],
      [373, 'Updating ingress for web-app.acme.com'],
      [376, 'TLS certificate for web-app.acme.com is valid'],
      [377, 'web-app is reachable at https://web-app.acme.com'],
    ],
  },
]

export const MOCK_DEPLOYMENT_LOGS: EnvironmentLogIds[] = MOCK_LINES.flatMap(({ stepName, stageStep, lines }) =>
  lines.map(([offsetSec, message]) => ({ stepName, stageStep, offsetSec, message }))
).map(({ stepName, stageStep, offsetSec, message }, index) => ({
  id: index + 1,
  type: 'info',
  timestamp: new Date(MOCK_DEPLOYMENT_START_MS + offsetSec * 1000).toISOString(),
  details: {
    step_name: stepName,
    stage: { step: stageStep },
    transmitter: { type: 'Environment' },
  },
  message: { safe_message: message },
}))
