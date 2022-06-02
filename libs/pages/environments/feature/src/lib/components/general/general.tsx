import { GeneralPage } from '@console/pages/environments/ui'
import { useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import {
  deleteEnvironmentActionsCancelDeployment,
  environmentFactoryMock,
  environmentsLoadingStatus,
  postEnvironmentActionsCancelDeployment,
  postEnvironmentActionsDeploy,
  postEnvironmentActionsRestart,
  postEnvironmentActionsStop,
  selectEnvironmentsEntitiesByProjectId,
} from '@console/domains/environment'
import { EnvironmentEntity } from '@console/shared/interfaces'
import { AppDispatch, RootState } from '@console/store/data'

export function General() {
  const { projectId = '' } = useParams()
  const loadingEnvironments = environmentFactoryMock(3, true)

  const loadingStatus = useSelector(environmentsLoadingStatus)
  const environments = useSelector<RootState, EnvironmentEntity[]>((state) =>
    selectEnvironmentsEntitiesByProjectId(state, projectId)
  )

  const dispatch = useDispatch<AppDispatch>()

  const actions = [
    {
      name: 'redeploy',
      action: (environmentId: string) => dispatch(postEnvironmentActionsRestart({ projectId, environmentId })),
    },
    {
      name: 'deploy',
      action: (environmentId: string) => dispatch(postEnvironmentActionsDeploy({ projectId, environmentId })),
    },
    {
      name: 'stop',
      action: (environmentId: string) => dispatch(postEnvironmentActionsStop({ projectId, environmentId })),
    },
    {
      name: 'cancel-deployment',
      action: (environmentId: string) => dispatch(postEnvironmentActionsCancelDeployment({ projectId, environmentId })),
    },
    {
      name: 'delete',
      action: (environmentId: string) =>
        dispatch(deleteEnvironmentActionsCancelDeployment({ projectId, environmentId })),
    },
  ]

  return (
    <GeneralPage
      key={environments[0] ? environments[0].status?.id : ''}
      environments={loadingStatus !== 'loaded' ? loadingEnvironments : environments}
      buttonActions={actions}
    />
  )
}

export default General
