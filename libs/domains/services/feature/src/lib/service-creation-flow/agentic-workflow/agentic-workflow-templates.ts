import { type IconName } from '@fortawesome/fontawesome-common-types'
import { APIVariableScopeEnum, AgenticWorkflowExecutionMode } from 'qovery-typescript-axios'
import { IconEnum } from '@qovery/shared/enums'
import { type VariableData } from '@qovery/shared/interfaces'
import { type AgenticWorkflowFormData } from './agentic-workflow-context'
import { AGENTIC_WORKFLOW_MIN_CPU_MILLI, AGENTIC_WORKFLOW_MIN_RAM_MIB } from './agentic-workflow-resources'

// Fallback documentation shown when the flow is not seeded from a specific
// template (e.g. "Start from scratch").
export const AGENT_TASKS_DOC_LINK = 'https://www.qovery.com/docs/configuration/agent-tasks/overview'

export const AGENT_TEMPLATE_CATEGORIES = ['Incident Analyzer', 'Coding Agent', 'Optimization'] as const
export type AgentTemplateCategory = (typeof AGENT_TEMPLATE_CATEGORIES)[number]

export interface AgenticWorkflowTemplate {
  id: string
  category: AgentTemplateCategory
  title: string
  description: string
  iconName?: IconName
  logoIcon?: IconEnum
  logoPath?: string
  darkLogoPath?: string
  docLink?: string
  requiresQoveryMcp?: boolean
  seed: Partial<AgenticWorkflowFormData>
  variables?: VariableData[]
}

const INCIDENT_IO_PROMPT = `You are an on-call incident analyzer. When an incident.io incident fires, investigate it and give the human on-call a concise, evidence-based report.

Use INCIDENT_IO_API_KEY to fetch missing incident details. Correlate the incident with recent deployments, configuration changes, merged pull requests, logs, metrics, and runbooks for the affected services. Identify the most likely root cause and blast radius, state your confidence and any gaps, then recommend the safest next action. If a fix is small and well understood, open a pull request but never merge it.`

const HONEYBADGER_PROMPT = `You are an on-call incident analyzer. When a Honeybadger fault or incident fires, investigate it and give the human on-call a concise, evidence-based report.

Use HONEYBADGER_API_TOKEN to fetch the fault, occurrence, project, and environment details that are missing from the trigger. Correlate them with recent deployments, configuration changes, merged pull requests, logs, metrics, and runbooks for the affected services. Identify the most likely root cause and blast radius, state your confidence and any gaps, then recommend the safest next action. If a fix is small and well understood, open a pull request but never merge it.`

const JIRA_CODING_AGENT_PROMPT = `You are a coding agent working from a Jira issue. Use the issue supplied by the trigger and retrieve any missing context from JIRA_BASE_URL. Authenticate to Jira Cloud with HTTP Basic auth, using JIRA_EMAIL as the username and JIRA_API_TOKEN as the password.

When receiving a Jira webhook, first check the current issue status and whether it has already been processed. Do not perform the same job twice.

Understand the acceptance criteria, inspect the relevant repository and existing conventions, implement the smallest complete change, and run focused tests and linting. Open a pull request that links the Jira issue and summarizes the change and verification. Never merge the pull request or deploy without human approval.`

const LINEAR_CODING_AGENT_PROMPT = `You are a coding agent working from a Linear issue. Use the issue supplied by the trigger and LINEAR_API_KEY to retrieve any missing context from Linear.

When receiving a Linear webhook, first check the current issue status and whether it has already been processed. Do not perform the same job twice.

Understand the acceptance criteria, inspect the relevant repository and existing conventions, implement the smallest complete change, and run focused tests and linting. Open a pull request that links the Linear issue and summarizes the change and verification. Never merge the pull request or deploy without human approval.`

const BUILD_OPTIMIZER_PROMPT = `Use the qovery-speedup skill to analyze build/deployment speed for the current service/environment.

The skill lives at: https://github.com/Qovery/qovery-skills/tree/main/qovery-speedup
Start from SKILL.md and follow its reference/ files as needed.

Execution context — read-only + propose, nothing applied live:
- Do NOT apply any change directly — not even the ones the skill marks as "auto-fix allowed" (health check timing, deployment stage, resource requests, etc.). Treat every finding as a proposal only.
- Inspect, identify the bottlenecks, and diagnose root causes (including whether a slow build is actually an avoidable image-mirroring miss).
- For every proposed change to a file (Dockerfile, build config, IaC/Terraform config, etc.), open a PR on the relevant repo: branch, commit, push, PR description with before/after and expected gain. Never merge it yourself.
- For anything that can only be changed via the Qovery Console/API directly (no corresponding file in a repo), do not call the mutating endpoint — just document it clearly as a recommendation in the summary, with the exact change needed and expected gain.
- Finish with a summary: what was found, what's proposed in which PR(s), and what needs a human decision (including any config-only change with no PR).`

const webhookAutomation = (id: string) => [
  {
    id: `${id}-automation`,
    triggers: [{ id: `${id}-webhook`, type: 'webhook' as const }],
    outputs: [],
  },
]

const weeklyScheduleAutomation = (id: string) => [
  {
    id: `${id}-automation`,
    triggers: [
      {
        id: `${id}-schedule`,
        type: 'schedule' as const,
        cronExpression: '0 8 * * 1',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    ],
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
    category: 'Incident Analyzer',
    title: 'Incident Analyzer with incident.io',
    description: 'Analyze incident.io incidents with deployment, code, logs, and metrics context.',
    logoPath: '/assets/agent-templates/incident-io.svg',
    docLink: 'https://www.qovery.com/docs/configuration/agent-tasks/incident-analyser',
    requiresQoveryMcp: true,
    seed: {
      name: 'Incident Analyzer with incident.io',
      description: 'Analyze incident.io incidents with deployment, code, logs, and metrics context.',
      agentPrompt: INCIDENT_IO_PROMPT,
      cpu: String(AGENTIC_WORKFLOW_MIN_CPU_MILLI),
      memory: String(AGENTIC_WORKFLOW_MIN_RAM_MIB),
      executionMode: AgenticWorkflowExecutionMode.CLONE_ENVIRONMENT,
      whitelistHosts: 'api.incident.io',
      automations: webhookAutomation('incident-io'),
    },
    variables: [secretVariable('INCIDENT_IO_API_KEY', 'API key used to read incident details from incident.io.')],
  },
  {
    id: 'honeybadger-incident-analyzer',
    category: 'Incident Analyzer',
    title: 'Incident Analyzer with Honeybadger',
    description: 'Analyze Honeybadger incidents with deployment, code, logs, and metrics context.',
    logoPath: '/assets/agent-templates/honeybadger.svg',
    docLink: 'https://www.qovery.com/docs/configuration/agent-tasks/incident-analyser-honeybadger',
    requiresQoveryMcp: true,
    seed: {
      name: 'Incident Analyzer with Honeybadger',
      description: 'Analyze Honeybadger incidents with deployment, code, logs, and metrics context.',
      agentPrompt: HONEYBADGER_PROMPT,
      cpu: String(AGENTIC_WORKFLOW_MIN_CPU_MILLI),
      memory: String(AGENTIC_WORKFLOW_MIN_RAM_MIB),
      executionMode: AgenticWorkflowExecutionMode.CLONE_ENVIRONMENT,
      whitelistHosts: 'app.honeybadger.io,api.honeybadger.io',
      automations: webhookAutomation('honeybadger'),
    },
    variables: [secretVariable('HONEYBADGER_API_TOKEN', 'API token used to read incidents from Honeybadger.')],
  },
  {
    id: 'build-optimizer',
    category: 'Optimization',
    title: 'Build & deployment optimizer',
    description: 'Analyse build and deployment times, identify optimization levers, and open a PR with the changes.',
    iconName: 'gauge-high',
    docLink: 'https://www.qovery.com/docs/configuration/agent-tasks/build-deployment-optimizer',
    requiresQoveryMcp: true,
    seed: {
      name: 'Build & deployment optimizer',
      description: 'Analyse build and deployment times, identify optimization levers, and open a PR with the changes.',
      agentPrompt: BUILD_OPTIMIZER_PROMPT,
      cpu: String(AGENTIC_WORKFLOW_MIN_CPU_MILLI),
      memory: String(AGENTIC_WORKFLOW_MIN_RAM_MIB),
      automations: weeklyScheduleAutomation('build-optimizer'),
      whitelistHosts: 'github.com,api.github.com,raw.githubusercontent.com,gitlab.com,bitbucket.org,api.bitbucket.org',
    },
  },
  {
    id: 'jira-coding-agent',
    category: 'Coding Agent',
    title: 'Jira Coding Agent',
    description: 'Turn a Jira issue into an implementation and a ready-to-review pull request.',
    logoPath: '/assets/agent-templates/jira.svg',
    docLink: 'https://www.qovery.com/docs/configuration/agent-tasks/jira-coding-agent',
    seed: {
      name: 'Jira Coding Agent',
      description: 'Turn a Jira issue into an implementation and a ready-to-review pull request.',
      agentPrompt: JIRA_CODING_AGENT_PROMPT,
      cpu: String(AGENTIC_WORKFLOW_MIN_CPU_MILLI),
      memory: String(AGENTIC_WORKFLOW_MIN_RAM_MIB),
      executionMode: AgenticWorkflowExecutionMode.CLONE_ENVIRONMENT,
      automations: webhookAutomation('jira'),
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
    category: 'Coding Agent',
    title: 'Linear Coding Agent',
    description: 'Turn a Linear issue into an implementation and a ready-to-review pull request.',
    logoPath: '/assets/agent-templates/linear-dark.svg',
    darkLogoPath: '/assets/agent-templates/linear-light.svg',
    docLink: 'https://www.qovery.com/docs/configuration/agent-tasks/linear-coding-agent',
    seed: {
      name: 'Linear Coding Agent',
      description: 'Turn a Linear issue into an implementation and a ready-to-review pull request.',
      agentPrompt: LINEAR_CODING_AGENT_PROMPT,
      cpu: String(AGENTIC_WORKFLOW_MIN_CPU_MILLI),
      memory: String(AGENTIC_WORKFLOW_MIN_RAM_MIB),
      executionMode: AgenticWorkflowExecutionMode.CLONE_ENVIRONMENT,
      automations: webhookAutomation('linear'),
      whitelistHosts: 'api.linear.app,github.com,api.github.com,gitlab.com,bitbucket.org,api.bitbucket.org',
    },
    variables: [secretVariable('LINEAR_API_KEY', 'API key used to read the Linear issue.')],
  },
  {
    id: 'slack-coding-agent',
    category: 'Coding Agent',
    title: 'Slack Coding Agent',
    logoIcon: IconEnum.SLACK,
    description: 'Turn a Slack request into an implementation and a ready-to-review pull request.',
    iconName: 'comments',
    requiresQoveryMcp: true,
    seed: {
      name: 'Slack Coding Agent',
      description: 'Turn a Slack request into an implementation and a ready-to-review pull request.',
      agentPrompt:
        'Use the Slack thread supplied by the webhook and SLACK_BOT_TOKEN to retrieve missing context. Check whether this request has already been processed. Inspect the repository, implement the smallest complete change, run focused tests, and open a pull request linking the thread. Never merge or deploy without human approval.',
      cpu: String(AGENTIC_WORKFLOW_MIN_CPU_MILLI),
      memory: String(AGENTIC_WORKFLOW_MIN_RAM_MIB),
      executionMode: AgenticWorkflowExecutionMode.CLONE_ENVIRONMENT,
      whitelistHosts: 'slack.com,github.com,api.github.com,gitlab.com,bitbucket.org,api.bitbucket.org',
      automations: webhookAutomation('slack-coding-agent'),
    },
    variables: [secretVariable('SLACK_BOT_TOKEN', 'Token used to retrieve missing context.')],
  },
  {
    id: 'coding-agent',
    category: 'Coding Agent',
    title: 'Coding Agent',
    description: 'Turn a coding request into an implementation and a ready-to-review pull request.',
    iconName: 'code',
    requiresQoveryMcp: true,
    seed: {
      name: 'Coding Agent',
      description: 'Turn a coding request into an implementation and a ready-to-review pull request.',
      agentPrompt:
        'Use the coding request supplied by the webhook. Inspect the repository and its conventions, implement the smallest complete change, run focused tests, and open a pull request explaining the change and verification. Never merge or deploy without human approval.',
      cpu: String(AGENTIC_WORKFLOW_MIN_CPU_MILLI),
      memory: String(AGENTIC_WORKFLOW_MIN_RAM_MIB),
      executionMode: AgenticWorkflowExecutionMode.CLONE_ENVIRONMENT,
      whitelistHosts: 'github.com,api.github.com,gitlab.com,bitbucket.org,api.bitbucket.org',
      automations: webhookAutomation('coding-agent'),
    },
  },
  {
    id: 'sentry-incident-analyzer',
    category: 'Incident Analyzer',
    title: 'Sentry Incident Analyzer',
    logoIcon: IconEnum.SENTRY,
    description: 'Investigate Sentry errors with deployment, code, logs, and metrics context.',
    iconName: 'bug',
    requiresQoveryMcp: true,
    seed: {
      name: 'Sentry Incident Analyzer',
      description: 'Investigate Sentry errors with deployment, code, logs, and metrics context.',
      agentPrompt:
        'Use the Sentry event supplied by the webhook and SENTRY_AUTH_TOKEN to retrieve missing issue and event details from Sentry. Correlate errors with deployments, code, logs and metrics. Report the likely root cause, blast radius, confidence and safest next action. Open a pull request for a small well-understood fix, but never merge it.',
      cpu: String(AGENTIC_WORKFLOW_MIN_CPU_MILLI),
      memory: String(AGENTIC_WORKFLOW_MIN_RAM_MIB),
      executionMode: AgenticWorkflowExecutionMode.CLONE_ENVIRONMENT,
      whitelistHosts: 'sentry.io,*.sentry.io,github.com,api.github.com,gitlab.com,bitbucket.org,api.bitbucket.org',
      automations: webhookAutomation('sentry-incident-analyzer'),
    },
    variables: [secretVariable('SENTRY_AUTH_TOKEN', 'Token used to retrieve missing context.')],
  },
  {
    id: 'incident-analyzer',
    category: 'Incident Analyzer',
    title: 'Incident Analyzer',
    description: 'Investigate incidents with deployment, code, logs, and metrics context.',
    iconName: 'magnifying-glass',
    requiresQoveryMcp: true,
    seed: {
      name: 'Incident Analyzer',
      description: 'Investigate incidents with deployment, code, logs, and metrics context.',
      agentPrompt:
        'Investigate the incident supplied by the webhook. Correlate it with recent deployments, configuration changes, code, logs, metrics and runbooks. Report the likely root cause, blast radius, confidence, missing evidence and safest next action. Open a pull request for a small well-understood fix, but never merge it.',
      cpu: String(AGENTIC_WORKFLOW_MIN_CPU_MILLI),
      memory: String(AGENTIC_WORKFLOW_MIN_RAM_MIB),
      executionMode: AgenticWorkflowExecutionMode.CLONE_ENVIRONMENT,
      whitelistHosts: 'github.com,api.github.com,gitlab.com,bitbucket.org,api.bitbucket.org',
      automations: webhookAutomation('incident-analyzer'),
    },
  },
]

export function getAgenticWorkflowTemplate(id?: string) {
  return AGENTIC_WORKFLOW_TEMPLATES.find((template) => template.id === id)
}
