import { useParams } from 'react-router-dom'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import PageOrganizationAICopilot from '../../ui/page-organization-ai-copilot/page-organization-ai-copilot'

export function PageOrganizationAICopilotFeature() {
  const { organizationId = '' } = useParams()
  useDocumentTitle('AI Copilot - Organization settings')

  const { data: organization } = useOrganization({ organizationId })

  return <PageOrganizationAICopilot organization={organization} />
}

export default PageOrganizationAICopilotFeature
