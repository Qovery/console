import { useEffect } from 'react'
import { useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import {
  deleteEnvironmentActions,
  environmentFactoryMock,
  environmentsLoadingStatus,
  fetchEnvironmentsStatus,
  postEnvironmentActionsCancelDeployment,
  postEnvironmentActionsDeploy,
  postEnvironmentActionsRestart,
  postEnvironmentActionsStop,
  selectEnvironmentsEntitiesByProjectId,
} from '@console/domains/environment'
import { EnvironmentEntity } from '@console/shared/interfaces'
import { AppDispatch, RootState } from '@console/store/data'
import { BaseLink, StatusMenuActions } from '@console/shared/ui'
import { PageGeneral } from '../../ui/page-general/page-general'
import { useDocumentTitle } from '@console/shared/utils'

export function PageGeneralFeature() {
  useDocumentTitle('Environments - Qovery')
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
      action: (environmentId: string) => dispatch(deleteEnvironmentActions({ projectId, environmentId })),
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
    <PageGeneral
      environments={loadingStatus !== 'loaded' ? loadingEnvironments : environments}
      buttonActions={actions}
      listHelpfulLinks={listHelpfulLinks}
    />
  )
}

export default PageGeneralFeature
