import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { type VariableData } from '@qovery/shared/interfaces'
import { type AgenticWorkflowFormData } from './agentic-workflow-context'

export interface AgenticWorkflowTemplate {
  // Matches the `?template=` search param used to enter the creation flow.
  id: string
  title: string
  description: string
  iconUri: string
  // Pre-fills part of the main creation form.
  seed: Partial<AgenticWorkflowFormData>
  // Pre-fills the separate variables form (secret/config placeholders).
  variables?: VariableData[]
}

const JIRA_TO_SPEC_PROMPT = `You turn a Jira ticket into a clear technical specification.

1. Read the Jira ticket referenced in the incoming request (use the JIRA_* credentials to fetch its summary, description, comments, and linked issues).
2. Produce a structured technical spec with these sections:
   - Context: the problem and why it matters.
   - Scope: what is and is not included.
   - Proposed approach: the implementation plan, key components, and data changes.
   - Risks & open questions.
   - Acceptance criteria: testable outcomes.
3. Keep it concise and actionable. Post the spec back as a comment on the ticket.`

export const AGENTIC_WORKFLOW_TEMPLATES: AgenticWorkflowTemplate[] = [
  {
    id: 'jira-to-spec',
    title: 'Jira to spec',
    description: 'Turn a Jira ticket into a technical specification.',
    iconUri: '/assets/ai-tools/jira.svg',
    seed: {
      name: 'Jira to spec',
      description: 'Turn a Jira ticket into a technical specification.',
      agentPrompt: JIRA_TO_SPEC_PROMPT,
      whitelistHosts: '*.atlassian.net',
    },
    variables: [
      {
        variable: 'JIRA_BASE_URL',
        value: '',
        isSecret: false,
        scope: APIVariableScopeEnum.AGENTIC_WORKFLOW,
        description: 'Your Jira instance URL, e.g. https://your-org.atlassian.net',
      },
      {
        variable: 'JIRA_EMAIL',
        value: '',
        isSecret: false,
        scope: APIVariableScopeEnum.AGENTIC_WORKFLOW,
        description: 'The account email used to authenticate against Jira.',
      },
      {
        variable: 'JIRA_API_TOKEN',
        value: '',
        isSecret: true,
        scope: APIVariableScopeEnum.AGENTIC_WORKFLOW,
        description: 'A Jira API token for the account above.',
      },
    ],
  },
]

export function getAgenticWorkflowTemplate(id?: string) {
  return AGENTIC_WORKFLOW_TEMPLATES.find((template) => template.id === id)
}
