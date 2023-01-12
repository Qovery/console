import { Environment } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  fetchApplicationsStatus,
  getApplicationsState,
  selectApplicationsEntitiesByEnvId,
} from '@qovery/domains/application'
import { fetchDatabasesStatus, getDatabasesState, selectDatabasesEntitiesByEnvId } from '@qovery/domains/database'
import { selectEnvironmentById } from '@qovery/domains/environment'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { ApplicationEntity, DatabaseEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { BaseLink } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/store'
import { PageGeneral } from '../../ui/page-general/page-general'

export function PageGeneralFeature() {
  const { environmentId = '' } = useParams()

  const loadingServices = applicationFactoryMock(3)
  const dispatch = useDispatch<AppDispatch>()

  const applicationsByEnv = useSelector<RootState, ApplicationEntity[]>((state: RootState) =>
    selectApplicationsEntitiesByEnvId(state, environmentId)
  )

  const databasesByEnv = useSelector<RootState, DatabaseEntity[]>((state: RootState) =>
    selectDatabasesEntitiesByEnvId(state, environmentId)
  )

  const environment = useSelector<RootState, Environment | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )

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
    // if at least one collection has value to display, we remove the loading state
    if (applicationsByEnv.length || databasesByEnv.length) {
      return false
    }

    // if the two collections are loaded, we remove the loading state
    if (applicationsLoadingStatus === 'loaded' && databasesLoadingStatus === 'loaded') {
      return false
    }

    return true
  }

  return (
    <PageGeneral
      services={isLoading() ? loadingServices : [...applicationsByEnv, ...databasesByEnv]}
      environmentMode={environment?.mode || ''}
      listHelpfulLinks={listHelpfulLinks}
      isLoading={isLoading()}
    />
  )
}

export default PageGeneralFeature
