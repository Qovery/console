import { useEffect } from 'react'
import { GeneralPage } from '@console/pages/environments/ui'
import { useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import {
  deleteEnvironmentActionsCancelDeployment,
  environmentsLoadingStatus,
  environmentFactoryMock,
  postEnvironmentActionsCancelDeployment,
  postEnvironmentActionsDeploy,
  postEnvironmentActionsRestart,
  postEnvironmentActionsStop,
  selectEnvironmentsEntitiesByProjectId,
  fetchEnvironmentsStatus,
} from '@console/domains/environment'
import { EnvironmentEntity } from '@console/shared/interfaces'
import { AppDispatch, RootState } from '@console/store/data'
import { BaseLink, StatusMenuActions } from '@console/shared/ui'

export function General() {
  const { projectId = '' } = useParams()
  const loadingEnvironments = environmentFactoryMock(3, true)

  const loadingStatus = useSelector(environmentsLoadingStatus)

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const fetchEnvironmentsStatusByInterval = setInterval(() => dispatch(fetchEnvironmentsStatus({ projectId })), 3000)
    return () => clearInterval(fetchEnvironmentsStatusByInterval)
  }, [dispatch, projectId])

  const environments = useSelector<RootState, EnvironmentEntity[]>((state) =>
    selectEnvironmentsEntitiesByProjectId(state, projectId)
  )

  const actions: StatusMenuActions[] = [
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

  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment',
      linkLabel: 'How to manage my environment',
      external: true,
    },
  ]

  return (
    <GeneralPage
      environments={loadingStatus !== 'loaded' ? loadingEnvironments : environments}
      buttonActions={actions}
      listHelpfulLinks={listHelpfulLinks}
    />
  )
}

export default General
