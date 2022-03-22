import { useEffect } from 'react'
import { useOrganization } from '@console/domains/organization'
import { Overview } from '@console/pages/overview/ui'
import { useDocumentTitle } from '@console/shared/utils'

export function OverviewPage() {
  useDocumentTitle('Overview - Qovery')
  const { organization, getOrganization } = useOrganization()

  useEffect(() => {
    getOrganization()
  }, [getOrganization])

  return <Overview organization={organization} />
}

export default OverviewPage
