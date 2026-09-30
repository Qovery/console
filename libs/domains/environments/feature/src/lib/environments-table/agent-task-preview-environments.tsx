import { useParams } from '@tanstack/react-router'
import { useEnvironmentsOverview } from '@qovery/domains/projects/feature'
import { isAgentTaskPreviewOf } from '../utils/agent-task-preview'
import { EnvironmentSection } from './environment-section/environment-section'

export function AgentTaskPreviewEnvironments({ sourceEnvironmentName }: { sourceEnvironmentName: string }) {
  const { projectId = '' } = useParams({ strict: false })
  const { data: environments = [] } = useEnvironmentsOverview({ projectId, suspense: true })
  const previews = environments.filter((environment) => isAgentTaskPreviewOf(environment, sourceEnvironmentName))
  if (previews.length === 0) return null
  return <EnvironmentSection selectable={false} type="PREVIEW" title="Clone environment tasks" items={previews} />
}
