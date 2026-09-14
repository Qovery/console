import { type IconName } from '@fortawesome/fontawesome-common-types'
import { APIVariableScopeEnum, AgenticWorkflowExecutionMode } from 'qovery-typescript-axios'
import { type VariableData } from '@qovery/shared/interfaces'
import { type AgenticWorkflowFormData } from './agentic-workflow-context'

export interface AgenticWorkflowTemplate {
  id: string
  title: string
  description: string
  iconName?: IconName
  logoPath?: string
  darkLogoPath?: string
  seed: Partial<AgenticWorkflowFormData>
  variables?: VariableData[]
}

const INCIDENT_IO_PROMPT = `You are an on-call incident analyzer. When an incident.io incident fires, investigate it and give the human on-call a concise, evidence-based report.

Use INCIDENT_IO_API_KEY to fetch missing incident details. Correlate the incident with recent deployments, configuration changes, merged pull requests, logs, metrics, and runbooks for the affected services. Identify the most likely root cause and blast radius, state your confidence and any gaps, then recommend the safest next action. If a fix is small and well understood, open a pull request but never merge it.`

const HONEYBADGER_PROMPT = `You are an on-call incident analyzer. When a Honeybadger fault or incident fires, investigate it and give the human on-call a concise, evidence-based report.

Use HONEYBADGER_API_TOKEN to fetch the fault, occurrence, project, and environment details that are missing from the trigger. Correlate them with recent deployments, configuration changes, merged pull requests, logs, metrics, and runbooks for the affected services. Identify the most likely root cause and blast radius, state your confidence and any gaps, then recommend the safest next action. If a fix is small and well understood, open a pull request but never merge it.`

const JIRA_CODING_AGENT_PROMPT = `You are a coding agent working from a Jira issue. Use the issue supplied by the trigger and retrieve any missing context from JIRA_BASE_URL. Authenticate to Jira Cloud with HTTP Basic auth, using JIRA_EMAIL as the username and JIRA_API_TOKEN as the password.

Understand the acceptance criteria, inspect the relevant repository and existing conventions, implement the smallest complete change, and run focused tests and linting. Open a pull request that links the Jira issue and summarizes the change and verification. Never merge the pull request or deploy without human approval.`

const LINEAR_CODING_AGENT_PROMPT = `You are a coding agent working from a Linear issue. Use the issue supplied by the trigger and LINEAR_API_KEY to retrieve any missing context from Linear.

Understand the acceptance criteria, inspect the relevant repository and existing conventions, implement the smallest complete change, and run focused tests and linting. Open a pull request that links the Linear issue and summarizes the change and verification. Never merge the pull request or deploy without human approval.`

const BUILD_OPTIMIZER_PROMPT = `You are a build and deployment optimizer. Find concrete ways to make builds and deployments faster and cheaper, and propose them.

1. Inspect the service's build setup: Dockerfile, dependency installation, layer caching, image size, and the build/deploy configuration in Qovery.
2. Identify optimization levers (e.g. better layer ordering and caching, multi-stage builds, smaller base images, pruning unused dependencies, parallelisable steps).
3. For each lever, estimate the expected gain (build time, image size, or cost) and the risk.
4. Open a PR with the proposed changes to the build configuration, and/or update the build configuration in Qovery.
5. Summarise what you changed, the expected gain, and anything that needs a human decision. Never merge — leave the human as the gate.`

const webhookAutomation = (id: string) => [
  {
    id: `${id}-automation`,
    triggers: [{ id: `${id}-webhook`, type: 'webhook' as const }],
    outputs: [],
  },
]

const secretVariable = (variable: string, description: string): VariableData => ({
  variable,
  value: '',
  isSecret: true,
  scope: APIVariableScopeEnum.AGENTIC_WORKFLOW,
  description,
})

export const AGENTIC_WORKFLOW_TEMPLATES: AgenticWorkflowTemplate[] = [
  {
    id: 'incident-io-analyzer',
    title: 'Incident Analyzer with incident.io',
    description: 'Analyze incident.io incidents with deployment, code, logs, and metrics context.',
    logoPath: '/assets/agent-templates/incident-io.svg',
    seed: {
      name: 'Incident Analyzer with incident.io',
      description: 'Analyze incident.io incidents with deployment, code, logs, and metrics context.',
      agentPrompt: INCIDENT_IO_PROMPT,
      cpu: '200',
      memory: '256',
      executionMode: AgenticWorkflowExecutionMode.CLONE_ENVIRONMENT,
      whitelistHosts: 'api.incident.io',
      automations: webhookAutomation('incident-io'),
    },
    variables: [secretVariable('INCIDENT_IO_API_KEY', 'API key used to read incident details from incident.io.')],
  },
  {
    id: 'honeybadger-incident-analyzer',
    title: 'Incident Analyzer with Honeybadger',
    description: 'Analyze Honeybadger incidents with deployment, code, logs, and metrics context.',
    logoPath: '/assets/agent-templates/honeybadger.svg',
    seed: {
      name: 'Incident Analyzer with Honeybadger',
      description: 'Analyze Honeybadger incidents with deployment, code, logs, and metrics context.',
      agentPrompt: HONEYBADGER_PROMPT,
      cpu: '200',
      memory: '256',
      executionMode: AgenticWorkflowExecutionMode.CLONE_ENVIRONMENT,
      whitelistHosts: 'app.honeybadger.io,api.honeybadger.io',
      automations: webhookAutomation('honeybadger'),
    },
    variables: [secretVariable('HONEYBADGER_API_TOKEN', 'API token used to read incidents from Honeybadger.')],
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
      whitelistHosts: 'github.com,api.github.com,gitlab.com,bitbucket.org,api.bitbucket.org',
    },
  },
  {
    id: 'jira-coding-agent',
    title: 'Jira Coding Agent',
    description: 'Turn a Jira issue into an implementation and a ready-to-review pull request.',
    logoPath: '/assets/agent-templates/jira.svg',
    seed: {
      name: 'Jira Coding Agent',
      description: 'Turn a Jira issue into an implementation and a ready-to-review pull request.',
      agentPrompt: JIRA_CODING_AGENT_PROMPT,
      cpu: '200',
      memory: '256',
      whitelistHosts:
        'api.atlassian.com,*.atlassian.net,github.com,api.github.com,gitlab.com,bitbucket.org,api.bitbucket.org',
    },
    variables: [
      {
        variable: 'JIRA_BASE_URL',
        value: '',
        isSecret: false,
        scope: APIVariableScopeEnum.AGENTIC_WORKFLOW,
        description: 'Base URL of the Jira site, for example https://company.atlassian.net.',
      },
      {
        variable: 'JIRA_EMAIL',
        value: '',
        isSecret: false,
        scope: APIVariableScopeEnum.AGENTIC_WORKFLOW,
        description: 'Atlassian account email used with the Jira API token for Basic authentication.',
      },
      secretVariable('JIRA_API_TOKEN', 'API token used to read the Jira issue.'),
    ],
  },
  {
    id: 'linear-coding-agent',
    title: 'Linear Coding Agent',
    description: 'Turn a Linear issue into an implementation and a ready-to-review pull request.',
    logoPath: '/assets/agent-templates/linear-dark.svg',
    darkLogoPath: '/assets/agent-templates/linear-light.svg',
    seed: {
      name: 'Linear Coding Agent',
      description: 'Turn a Linear issue into an implementation and a ready-to-review pull request.',
      agentPrompt: LINEAR_CODING_AGENT_PROMPT,
      cpu: '200',
      memory: '256',
      whitelistHosts: 'api.linear.app,github.com,api.github.com,gitlab.com,bitbucket.org,api.bitbucket.org',
    },
    variables: [secretVariable('LINEAR_API_KEY', 'API key used to read the Linear issue.')],
  },
]

export function getAgenticWorkflowTemplate(id?: string) {
  return AGENTIC_WORKFLOW_TEMPLATES.find((template) => template.id === id)
}
