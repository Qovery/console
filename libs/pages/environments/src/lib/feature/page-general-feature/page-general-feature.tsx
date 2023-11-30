import { type Environment } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { useClusters } from '@qovery/domains/clusters/feature'
import { useFetchEnvironments } from '@qovery/domains/environment'
import { useListStatuses } from '@qovery/domains/environments/feature'
import { environmentFactoryMock } from '@qovery/shared/factories'
import { type BaseLink } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { PageGeneral } from '../../ui/page-general/page-general'

export function PageGeneralFeature() {
  useDocumentTitle('Environments - Qovery')
  const { organizationId = '', projectId = '' } = useParams()
  const loadingEnvironments = environmentFactoryMock(3, true)

  const { data: clusters = [] } = useClusters({ organizationId })

  const res = useFetchEnvironments(projectId)
  let { data: environments = [] } = res
  const { isLoading } = res

  // XXX: This is needed for the table status filter
  // We need to consolidate data ahead
  const { data: statuses = [] } = useListStatuses({ projectId })
  environments = environments.map((environment) => ({
    ...environment,
    status: statuses.find((status) => status.id === environment.id),
  })) as Environment[]

  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment',
      linkLabel: 'How to manage my environment',
    },
  ]

  return (
    <PageGeneral
      isLoading={isLoading}
      environments={isLoading ? loadingEnvironments : environments}
      listHelpfulLinks={listHelpfulLinks}
      clusterAvailable={clusters.length > 0}
    />
  )
}

export default PageGeneralFeature
