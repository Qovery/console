import { createFileRoute, useParams } from '@tanstack/react-router'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { AICopilotSettings } from '@qovery/shared/devops-copilot/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/ai-copilot')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '' } = useParams({ strict: false })
  useDocumentTitle('AI Copilot - Organization settings')
  const { data: organization } = useOrganization({ organizationId })

  if (!organization) {
    return null
  }

  return <AICopilotSettings organization={organization} />
}
