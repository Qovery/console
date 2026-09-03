import { type IconName } from '@fortawesome/fontawesome-common-types'
import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { type VariableData } from '@qovery/shared/interfaces'
import { type AgenticWorkflowFormData } from './agentic-workflow-context'

export interface AgenticWorkflowTemplate {
  // Matches the `?template=` search param used to enter the creation flow.
  id: string
  title: string
  description: string
  // Font Awesome icon name rendered through the shared <Icon iconName />.
  iconName: IconName
  // Pre-fills part of the main creation form.
  seed: Partial<AgenticWorkflowFormData>
  // Pre-fills the separate variables form (secret/config placeholders).
  variables?: VariableData[]
}

// DRAFT — first-pass prompt, to be refined with product before release.
const INCIDENT_ANALYSER_PROMPT = `You are an on-call incident analyser. When an incident fires, investigate it and hand a clear summary back to the human on-call.

1. Read the incident payload (id, title, severity, affected services) from the trigger.
2. Correlate with recent change context: the latest deployments, config changes, and merged PRs for the affected services around the incident start time.
3. Pull the relevant signals: application logs, metrics, and any runbooks for the affected services.
4. Determine the most likely root cause and the blast radius. Be explicit about your confidence and what you could not verify.
5. Post your findings to Slack for the on-call human: a short summary, the suspected root cause, and a recommended next step.
6. If the fix is small and well-understood, open a PR with the proposed change and link it in the Slack message. Never merge — always leave the human as the gate.`

// DRAFT — first-pass prompt, to be refined with product before release.
const BUILD_OPTIMIZER_PROMPT = `You are a build and deployment optimizer. Find concrete ways to make builds and deployments faster and cheaper, and propose them.

1. Inspect the service's build setup: Dockerfile, dependency installation, layer caching, image size, and the build/deploy configuration in Qovery.
2. Identify optimization levers (e.g. better layer ordering and caching, multi-stage builds, smaller base images, pruning unused dependencies, parallelisable steps).
3. For each lever, estimate the expected gain (build time, image size, or cost) and the risk.
4. Open a PR with the proposed changes to the build configuration, and/or update the build configuration in Qovery.
5. Summarise what you changed, the expected gain, and anything that needs a human decision. Never merge — leave the human as the gate.`

export const AGENTIC_WORKFLOW_TEMPLATES: AgenticWorkflowTemplate[] = [
  {
    id: 'incident-analyser',
    title: 'Incident Analyser',
    description: 'Correlate a firing incident with recent changes, logs and metrics, then report and open a PR.',
    iconName: 'triangle-exclamation',
    seed: {
      name: 'Incident Analyser',
      description: 'Correlate a firing incident with recent changes, logs and metrics, then report and open a PR.',
      agentPrompt: INCIDENT_ANALYSER_PROMPT,
      cpu: '200',
      memory: '256',
      whitelistHosts: 'api.incident.io,hooks.slack.com',
    },
    variables: [
      {
        variable: 'INCIDENT_IO_API_KEY',
        value: '',
        isSecret: true,
        scope: APIVariableScopeEnum.AGENTIC_WORKFLOW,
        description: 'API key used to read incident details from incident.io.',
      },
      {
        variable: 'SLACK_WEBHOOK_URL',
        value: '',
        isSecret: true,
        scope: APIVariableScopeEnum.AGENTIC_WORKFLOW,
        description: 'Slack incoming webhook the agent posts its findings to.',
      },
    ],
  },
  {
    id: 'build-optimizer',
    title: 'Build & deployment optimizer',
    description: 'Analyse build and deployment times, identify optimization levers, and open a PR with the changes.',
    iconName: 'gauge-high',
    seed: {
      name: 'Build & deployment optimizer',
      description: 'Analyse build and deployment times, identify optimization levers, and open a PR with the changes.',
      agentPrompt: BUILD_OPTIMIZER_PROMPT,
      cpu: '200',
      memory: '256',
    },
    variables: [
      {
        variable: 'QOVERY_API_TOKEN',
        value: '',
        isSecret: true,
        scope: APIVariableScopeEnum.AGENTIC_WORKFLOW,
        description: 'Qovery API token used to read and update the build configuration.',
      },
    ],
  },
]

export function getAgenticWorkflowTemplate(id?: string) {
  return AGENTIC_WORKFLOW_TEMPLATES.find((template) => template.id === id)
}
