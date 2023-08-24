import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { getApplicationsState, selectApplicationsEntitiesByEnvId } from '@qovery/domains/application'
import { getDatabasesState, selectDatabasesEntitiesByEnvId } from '@qovery/domains/database'
import { useFetchEnvironment } from '@qovery/domains/environment'
import { useListStatuses } from '@qovery/domains/services/feature'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { type ApplicationEntity, type DatabaseEntity, type LoadingStatus } from '@qovery/shared/interfaces'
import { type BaseLink } from '@qovery/shared/ui'
import { type RootState } from '@qovery/state/store'
import { PageGeneral } from '../../ui/page-general/page-general'

export function PageGeneralFeature() {
  const { projectId = '', environmentId = '' } = useParams()

  const loadingServices = applicationFactoryMock(3)

  const applicationsByEnv = useSelector<RootState, ApplicationEntity[]>((state: RootState) =>
    selectApplicationsEntitiesByEnvId(state, environmentId)
  )

  const databasesByEnv = useSelector<RootState, DatabaseEntity[]>((state: RootState) =>
    selectDatabasesEntitiesByEnvId(state, environmentId)
  )

  const { data: environment } = useFetchEnvironment(projectId, environmentId)

  const applicationsLoadingStatus = useSelector<RootState, LoadingStatus>(
    (state) => getApplicationsState(state).loadingStatus
  )
  const databasesLoadingStatus = useSelector<RootState, LoadingStatus>(
    (state) => getDatabasesState(state).loadingStatus
  )

  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment/',
      linkLabel: 'How to manage my environment',
      external: true,
    },
  ]

  let services = [...applicationsByEnv, ...databasesByEnv]

  const { data: statuses } = useListStatuses({ environmentId })
  const servicesStatuses = [
    ...(statuses?.applications ?? []),
    ...(statuses?.containers ?? []),
    ...(statuses?.databases ?? []),
    ...(statuses?.jobs ?? []),
  ]
  services = services.map((service) => ({
    ...service,
    status: servicesStatuses.find((status) => status.id === service.id),
  })) as (ApplicationEntity | DatabaseEntity)[]

  function isLoading() {
    // if the two collections are loaded, we remove the loading state
    return !(applicationsLoadingStatus === 'loaded' && databasesLoadingStatus === 'loaded')
  }

  return (
    <PageGeneral
      services={isLoading() ? loadingServices : services}
      environmentMode={environment?.mode || ''}
      listHelpfulLinks={listHelpfulLinks}
      isLoading={isLoading()}
      clusterId={environment?.cluster_id || ''}
    />
  )
}

export default PageGeneralFeature
