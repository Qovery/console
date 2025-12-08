import { useParams } from 'react-router-dom'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { AICopilotSettings } from '@qovery/shared/devops-copilot/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export function PageOrganizationAICopilotFeature() {
  const { organizationId = '' } = useParams()
  useDocumentTitle('AI Copilot - Organization settings')

  const { data: organization } = useOrganization({ organizationId })

  return <AICopilotSettings organization={organization} />
}

export default PageOrganizationAICopilotFeature
