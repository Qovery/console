import { useOrganizations } from '@console/domains/organizations'
import { Overview } from '@console/pages/overview/ui'

export function OverviewPage() {
  const { organizations } = useOrganizations()

  return <Overview organizations={organizations} />
}

export default OverviewPage
