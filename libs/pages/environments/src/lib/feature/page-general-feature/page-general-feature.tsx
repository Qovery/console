import { Cluster } from 'qovery-typescript-axios'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useFetchEnvironments } from '@qovery/domains/environment'
import { selectClustersEntitiesByOrganizationId } from '@qovery/domains/organization'
import { environmentFactoryMock } from '@qovery/shared/factories'
import { BaseLink } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { RootState } from '@qovery/state/store'
import { PageGeneral } from '../../ui/page-general/page-general'

export function PageGeneralFeature() {
  useDocumentTitle('Environments - Qovery')
  const { organizationId = '', projectId = '' } = useParams()
  const loadingEnvironments = environmentFactoryMock(3, true)

  const clusters = useSelector<RootState, Cluster[]>((state) =>
    selectClustersEntitiesByOrganizationId(state, organizationId)
  )

  const { isLoading, data: environments = [] } = useFetchEnvironments(projectId)

  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment',
      linkLabel: 'How to manage my environment',
      external: true,
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
