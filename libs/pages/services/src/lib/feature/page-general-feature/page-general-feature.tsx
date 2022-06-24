import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { Application, Database, Environment } from 'qovery-typescript-axios'
import {
  applicationFactoryMock,
  applicationsLoadingStatus,
  fetchApplicationsStatus,
  selectApplicationsEntitiesByEnvId,
} from '@console/domains/application'
import { AppDispatch, RootState } from '@console/store/data'
import { BaseLink } from '@console/shared/ui'
import { selectEnvironmentById } from '@console/domains/environment'
import { databasesLoadingStatus, fetchDatabasesStatus, selectDatabasesEntitiesByEnvId } from '@console/domains/database'
import { PageGeneral } from '../../ui/page-general/page-general'

export function PageGeneralFeature() {
  const { environmentId = '' } = useParams()

  const loadingServices = applicationFactoryMock(3)
  const loadingApplicationsStatus = useSelector<RootState>((state) => applicationsLoadingStatus(state))
  const loadingDatabasesStatus = useSelector<RootState>((state) => databasesLoadingStatus(state))

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const fetchServicesStatusByInterval = setInterval(() => {
      dispatch(fetchApplicationsStatus({ environmentId }))
      dispatch(fetchDatabasesStatus({ environmentId }))
    }, 3000)
    return () => clearInterval(fetchServicesStatusByInterval)
  }, [dispatch, environmentId])

  const applicationsByEnv = useSelector<RootState, Application[]>((state: RootState) =>
    selectApplicationsEntitiesByEnvId(state, environmentId)
  )

  const databasesByEnv = useSelector<RootState, Database[]>((state: RootState) =>
    selectDatabasesEntitiesByEnvId(state, environmentId)
  )

  const environment = useSelector<RootState, Environment | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )

  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment/',
      linkLabel: 'How to manage my environment',
      external: true,
    },
  ]

  const isLoading =
    loadingApplicationsStatus !== 'loaded' &&
    applicationsByEnv.length === 0 &&
    loadingDatabasesStatus !== 'loaded' &&
    databasesByEnv.length === 0

  return (
    <PageGeneral
      services={isLoading ? loadingServices : [...applicationsByEnv, ...databasesByEnv]}
      environmentMode={environment?.mode || ''}
      listHelpfulLinks={listHelpfulLinks}
    />
  )
}

export default PageGeneralFeature
