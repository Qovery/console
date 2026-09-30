import { type EnvironmentOverviewResponse } from 'qovery-typescript-axios'

const AGENT_TASK_PREVIEW_SUFFIX =
  / - agentic-workflow-run-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isAgentTaskPreview(environment: Pick<EnvironmentOverviewResponse, 'name' | 'mode'>) {
  return environment.mode === 'PREVIEW' && AGENT_TASK_PREVIEW_SUFFIX.test(environment.name)
}
