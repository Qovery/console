import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  fetchApplicationsStatus,
  getApplicationsState,
  selectApplicationsEntitiesByEnvId,
} from '@qovery/domains/application'
import { fetchDatabasesStatus, getDatabasesState, selectDatabasesEntitiesByEnvId } from '@qovery/domains/database'
import { useFetchEnvironment } from '@qovery/domains/environment'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { ApplicationEntity, DatabaseEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { BaseLink } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/store'
import { PageGeneral } from '../../ui/page-general/page-general'

export function PageGeneralFeature() {
  const { projectId = '', environmentId = '' } = useParams()

  const loadingServices = applicationFactoryMock(3)
  const dispatch: AppDispatch = useDispatch<AppDispatch>()

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

  useEffect(() => {
    const fetchServicesStatusByInterval = setInterval(() => {
      if (applicationsByEnv.length > 0) dispatch(fetchApplicationsStatus({ environmentId }))
      if (databasesByEnv.length > 0) dispatch(fetchDatabasesStatus({ environmentId }))
    }, 3000)
    return () => clearInterval(fetchServicesStatusByInterval)
  }, [dispatch, environmentId, applicationsByEnv.length, databasesByEnv.length])

  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment/',
      linkLabel: 'How to manage my environment',
      external: true,
    },
  ]

  function isLoading() {
    // if the two collections are loaded, we remove the loading state
    return !(applicationsLoadingStatus === 'loaded' && databasesLoadingStatus === 'loaded')
  }

  return (
    <PageGeneral
      services={isLoading() ? loadingServices : [...applicationsByEnv, ...databasesByEnv]}
      environmentMode={environment?.mode || ''}
      listHelpfulLinks={listHelpfulLinks}
      isLoading={isLoading()}
      clusterId={environment?.cluster_id || ''}
    />
  )
}

export default PageGeneralFeature
