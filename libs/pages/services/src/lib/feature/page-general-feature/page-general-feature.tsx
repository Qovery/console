import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { Environment } from 'qovery-typescript-axios'
import {
  applicationFactoryMock,
  fetchApplicationsStatus,
  selectApplicationsEntitiesByEnvId,
} from '@console/domains/application'
import { AppDispatch, RootState } from '@console/store/data'
import { BaseLink } from '@console/shared/ui'
import { selectEnvironmentById } from '@console/domains/environment'
import { fetchDatabasesStatus, selectDatabasesEntitiesByEnvId } from '@console/domains/database'
import { ApplicationEntity, DatabaseEntity } from '@console/shared/interfaces'
import { PageGeneral } from '../../ui/page-general/page-general'

export function PageGeneralFeature() {
  const { environmentId = '' } = useParams()

  const loadingServices = applicationFactoryMock(3)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const fetchServicesStatusByInterval = setInterval(() => {
      dispatch(fetchApplicationsStatus({ environmentId }))
      dispatch(fetchDatabasesStatus({ environmentId }))
    }, 3000)
    return () => clearInterval(fetchServicesStatusByInterval)
  }, [dispatch, environmentId])

  const applicationsByEnv = useSelector<RootState, ApplicationEntity[]>((state: RootState) =>
    selectApplicationsEntitiesByEnvId(state, environmentId)
  )

  const databasesByEnv = useSelector<RootState, DatabaseEntity[]>((state: RootState) =>
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

  function isLoading() {
    let isLoading = true

    if (applicationsByEnv.length > 0 && databasesByEnv.length > 0) {
      if (
        applicationsByEnv.filter((application) => application.status?.id).length > 0 &&
        databasesByEnv.filter((database) => database.status?.id).length > 0
      ) {
        isLoading = false
      }
      return isLoading
    }

    if (applicationsByEnv.length > 0) {
      if (applicationsByEnv.filter((application) => application.status?.id).length > 0) {
        isLoading = false
      }
    }

    if (databasesByEnv.length > 0) {
      if (databasesByEnv.filter((database) => database.status?.id).length > 0) {
        isLoading = false
      }
    }

    return isLoading
  }

  return (
    <PageGeneral
      services={isLoading() ? loadingServices : [...applicationsByEnv, ...databasesByEnv]}
      environmentMode={environment?.mode || ''}
      listHelpfulLinks={listHelpfulLinks}
    />
  )
}

export default PageGeneralFeature
