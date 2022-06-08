import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { Application, Database, Environment } from 'qovery-typescript-axios'
import {
  applicationFactoryMock,
  applicationsLoadingStatus,
  deleteApplicationActionsStop,
  postApplicationActionsDeploy,
  postApplicationActionsRestart,
  postApplicationActionsStop,
  selectApplicationsEntitiesByEnvId,
} from '@console/domains/application'
import { AppDispatch, RootState } from '@console/store/data'
import { GeneralPage } from '@console/pages/services/ui'
import { BaseLink, StatusMenuActions } from '@console/shared/ui'
import { selectEnvironmentById } from '@console/domains/environment'
import { databasesLoadingStatus, selectDatabasesEntitiesByEnvId } from '@console/domains/database'

export function General() {
  const { environmentId = '' } = useParams()

  const loadingServices = applicationFactoryMock(3)
  const loadingApplicationsStatus = useSelector<RootState>((state) => applicationsLoadingStatus(state))
  const loadingDatabasesStatus = useSelector<RootState>((state) => databasesLoadingStatus(state))

  const applicationsByEnv = useSelector<RootState, Application[]>((state: RootState) =>
    selectApplicationsEntitiesByEnvId(state, environmentId)
  )

  const databasesByEnv = useSelector<RootState, Database[]>((state: RootState) =>
    selectDatabasesEntitiesByEnvId(state, environmentId)
  )

  const environment = useSelector<RootState, Environment | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )

  const dispatch = useDispatch<AppDispatch>()

  const actions: StatusMenuActions[] = [
    {
      name: 'redeploy',
      action: (applicationId: string) => dispatch(postApplicationActionsRestart({ environmentId, applicationId })),
    },
    {
      name: 'deploy',
      action: (applicationId: string) => dispatch(postApplicationActionsDeploy({ environmentId, applicationId })),
    },
    {
      name: 'stop',
      action: (applicationId: string) => dispatch(postApplicationActionsStop({ environmentId, applicationId })),
    },
    {
      name: 'delete',
      action: (applicationId: string) => dispatch(deleteApplicationActionsStop({ environmentId, applicationId })),
    },
  ]

  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/application',
      linkLabel: 'How to configure my application',
      external: true,
    },
  ]

  const isLoading =
    loadingApplicationsStatus !== 'loaded' &&
    applicationsByEnv.length === 0 &&
    loadingDatabasesStatus !== 'loaded' &&
    databasesByEnv.length === 0

  return (
    <GeneralPage
      services={isLoading ? loadingServices : [...applicationsByEnv, ...databasesByEnv]}
      buttonActions={actions}
      environmentMode={environment?.mode || ''}
      listHelpfulLinks={listHelpfulLinks}
    />
  )
}

export default General
