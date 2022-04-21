import { Overview } from '@console/pages/overview/ui'
import { useDocumentTitle } from '@console/shared/utils'

export function OverviewPage() {
  useDocumentTitle('Overview - Qovery')

  return <Overview />
}

export default OverviewPage
