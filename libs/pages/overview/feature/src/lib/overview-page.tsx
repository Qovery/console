import { useOrganizations } from '@console/domains/organizations'
import { Overview } from '@console/pages/overview/ui'
import { useDocumentTitle } from '@console/shared/utils'

export function OverviewPage() {
  const { organizations } = useOrganizations()

  useDocumentTitle('Overview - Qovery')

  return <Overview organizations={organizations} />
}

export default OverviewPage
