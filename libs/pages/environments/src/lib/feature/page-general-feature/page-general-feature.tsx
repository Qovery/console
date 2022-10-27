import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  deleteEnvironmentAction,
  environmentFactoryMock,
  environmentsLoadingStatus,
  fetchEnvironments,
  fetchEnvironmentsStatus,
  postEnvironmentActionsCancelDeployment,
  postEnvironmentActionsDeploy,
  postEnvironmentActionsRestart,
  postEnvironmentActionsStop,
  selectEnvironmentsEntitiesByProjectId,
} from '@qovery/domains/environment'
import { EnvironmentEntity } from '@qovery/shared/interfaces'
import { BaseLink, StatusMenuActions, useModalConfirmation } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import { PageGeneral } from '../../ui/page-general/page-general'

export function PageGeneralFeature() {
  useDocumentTitle('Environments - Qovery')
  const { projectId = '' } = useParams()
  const loadingEnvironments = environmentFactoryMock(3, true)
  const { openModalConfirmation } = useModalConfirmation()

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
  ]

  const removeEnvironment = async (environmentId: string, name: string) => {
    openModalConfirmation({
      title: 'Delete environment',
      description: 'To confirm the deletion of your environment, please type the name of the environment:',
      name: name,
      isDelete: true,
      action: async () => {
        await dispatch(
          deleteEnvironmentAction({
            projectId,
            environmentId,
          })
        )
        await dispatch(fetchEnvironments({ projectId: projectId }))
      },
    })
  }

  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment',
      linkLabel: 'How to manage my environment',
      external: true,
    },
  ]

  return (
    <PageGeneral
      isLoading={loadingStatus === 'loading'}
      environments={loadingStatus !== 'loaded' ? loadingEnvironments : environments}
      buttonActions={actions}
      listHelpfulLinks={listHelpfulLinks}
      removeEnvironment={removeEnvironment}
    />
  )
}

export default PageGeneralFeature
