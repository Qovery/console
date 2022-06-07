import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { Application, Environment } from 'qovery-typescript-axios'
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

export function General() {
  const { environmentId = '' } = useParams()

  const loadingApplications = applicationFactoryMock(3)
  const loadingStatus = useSelector<RootState>((state) => applicationsLoadingStatus(state))

  const applicationsByEnv = useSelector<RootState, Application[]>((state: RootState) =>
    selectApplicationsEntitiesByEnvId(state, environmentId)
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

  return (
    <GeneralPage
      applications={
        loadingStatus !== 'loaded' && applicationsByEnv.length === 0 ? loadingApplications : applicationsByEnv
      }
      buttonActions={actions}
      environmentMode={environment?.mode || ''}
      listHelpfulLinks={listHelpfulLinks}
    />
  )
}

export default General
