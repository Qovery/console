import { Environment } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import {
  applicationFactoryMock,
  fetchApplicationsStatus,
  selectApplicationsEntitiesByEnvId,
} from '@qovery/domains/application'
import { fetchDatabasesStatus, selectDatabasesEntitiesByEnvId } from '@qovery/domains/database'
import { selectEnvironmentById } from '@qovery/domains/environment'
import { ApplicationEntity, DatabaseEntity } from '@qovery/shared/interfaces'
import { BaseLink } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/store/data'
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
