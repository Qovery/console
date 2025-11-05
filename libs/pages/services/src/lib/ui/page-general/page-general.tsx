import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { ActivationToast as ActivationToastObservability } from '@qovery/domains/observability/feature'
import { ServiceList } from '@qovery/domains/services/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export function PageGeneral() {
  useDocumentTitle('Services - General')

  const { environmentId = '' } = useParams()
  const { data: environment } = useEnvironment({ environmentId })
  const { data: cluster } = useCluster({
    organizationId: environment?.organization.id ?? '',
    clusterId: environment?.cluster_id ?? '',
  })

  const hasMetrics = useMemo(() => {
    if (
      cluster?.cloud_provider === 'AWS' ||
      cluster?.cloud_provider === 'SCW' ||
      cluster?.cloud_provider === 'GCP' ||
      cluster?.cloud_provider === 'AZURE'
    ) {
      return cluster?.metrics_parameters?.enabled
    }
    return false
  }, [cluster?.metrics_parameters?.enabled, cluster?.cloud_provider])

  return (
    environment && (
      <>
        <ServiceList className="border-b border-b-neutral-200" environment={environment} />
        {!hasMetrics && <ActivationToastObservability />}
      </>
    )
  )
}

export default PageGeneral
