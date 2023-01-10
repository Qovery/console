import { ClickEvent } from '@szhsin/react-menu'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  deleteEnvironmentAction,
  fetchEnvironments,
  postEnvironmentActionsCancelDeployment,
  postEnvironmentActionsDeploy,
  postEnvironmentActionsRestart,
  postEnvironmentActionsStop,
} from '@qovery/domains/environment'
import { EnvironmentEntity } from '@qovery/shared/interfaces'
import {
  DEPLOYMENT_LOGS_URL,
  ENVIRONMENTS_GENERAL_URL,
  ENVIRONMENTS_URL,
  SERVICES_DEPLOYMENTS_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import {
  ButtonIconAction,
  Icon,
  IconAwesomeEnum,
  MenuData,
  MenuItemProps,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import {
  copyToClipboard,
  isCancelBuildAvailable,
  isDeleteAvailable,
  isDeployAvailable,
  isRestartAvailable,
  isStopAvailable,
} from '@qovery/shared/utils'
import { AppDispatch } from '@qovery/store'
import CreateCloneEnvironmentModalFeature from '../../create-clone-environment-modal/feature/create-clone-environment-modal-feature'

export interface EnvironmentButtonsActionsProps {
  environment: EnvironmentEntity
  hasServices?: boolean
}

export function EnvironmentButtonsActions(props: EnvironmentButtonsActionsProps) {
  const { environment, hasServices = false } = props
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { openModal, closeModal } = useModal()
  const [buttonStatusActions, setButtonStatusActions] = useState<MenuData>([])

  const { openModalConfirmation } = useModalConfirmation()

  const dispatch = useDispatch<AppDispatch>()

  const copyContent = `Organization ID: ${organizationId}\nProject ID: ${projectId}\nEnvironment ID: ${environment.id}`

  useEffect(() => {
    const deployButton: MenuItemProps = {
      name: 'Deploy',
      contentLeft: <Icon name={IconAwesomeEnum.PLAY} className="text-sm text-brand-400" />,

      onClick: () =>
        dispatch(
          postEnvironmentActionsDeploy({
            projectId,
            environmentId: environment.id,
            withDeployments:
              location.pathname === SERVICES_URL(organizationId, projectId, environment.id) + SERVICES_DEPLOYMENTS_URL,
          })
        ),
    }

    const redeployButton: MenuItemProps = {
      name: 'Redeploy',
      contentLeft: <Icon name={IconAwesomeEnum.ROTATE_RIGHT} className="text-sm text-brand-400" />,
      onClick: (e: ClickEvent) => {
        e.syntheticEvent.preventDefault()

        openModalConfirmation({
          mode: environment.mode,
          title: 'Confirm redeploy',
          description: 'To confirm the redeploy of your environment, please type the name:',
          name: environment.name,
          action: () =>
            dispatch(
              postEnvironmentActionsRestart({
                projectId,
                environmentId: environment.id,
                withDeployments:
                  location.pathname ===
                  SERVICES_URL(organizationId, projectId, environment.id) + SERVICES_DEPLOYMENTS_URL,
              })
            ),
        })
      },
    }

    const stopButton: MenuItemProps = {
      name: 'Stop',
      contentLeft: <Icon name={IconAwesomeEnum.CIRCLE_STOP} className="text-sm text-brand-400" />,
      onClick: (e: ClickEvent) => {
        e.syntheticEvent.preventDefault()

        openModalConfirmation({
          mode: environment.mode,
          title: 'Confirm stop',
          description: 'To confirm the stopping of your environment, please type the name:',
          name: environment.name,
          action: () =>
            dispatch(
              postEnvironmentActionsStop({
                projectId,
                environmentId: environment.id,
                withDeployments:
                  location.pathname ===
                  SERVICES_URL(organizationId, projectId, environment.id) + SERVICES_DEPLOYMENTS_URL,
              })
            ),
        })
      },
    }

    const cancelDeploymentButton = {
      name: 'Cancel Deployment',
      onClick: (e: ClickEvent) => {
        e.syntheticEvent.preventDefault()

        openModalConfirmation({
          mode: environment.mode,
          title: 'Confirm cancel',
          description:
            'Stopping a deployment may take a while, as a safe point needs to be reached. Some operations cannot be stopped (i.e: terraform actions) and need to be completed before stopping the deployment. Any action performed before won’t be rolled back. To confirm the cancellation of your deployment, please type the name of the environment:',
          name: environment.name,
          action: () =>
            dispatch(
              postEnvironmentActionsCancelDeployment({
                projectId,
                environmentId: environment.id,
                withDeployments:
                  location.pathname ===
                  SERVICES_URL(organizationId, projectId, environment.id) + SERVICES_DEPLOYMENTS_URL,
              })
            ),
        })
      },
      contentLeft: <Icon name={IconAwesomeEnum.XMARK} className="text-sm text-brand-400" />,
    }

    const state = environment.status?.state
    const topItems: MenuItemProps[] = []
    const bottomItems: MenuItemProps[] = []

    if (state) {
      if (isCancelBuildAvailable(state)) {
        topItems.push(cancelDeploymentButton)
      }
      if (isDeployAvailable(state)) {
        topItems.push(deployButton)
      }
      if (isRestartAvailable(state)) {
        topItems.push(redeployButton)
      }
      if (isStopAvailable(state)) {
        topItems.push(stopButton)
      }

      // todo: not implemented yet on v3
      //   const updateAllButton = {
      //     name: 'Update all services',
      //     contentLeft: <Icon name={IconAwesomeEnum.ROTATE} className="text-sm text-brand-400" />,
      //     onClick: (e: ClickEvent) => {
      //       e.syntheticEvent.preventDefault()
      //
      //       openModalConfirmation({
      //         mode: environment.mode,
      //         title: 'Confirm update all',
      //         description: 'To confirm the update of all the services of your environment, please type the name:',
      //         name: environment.name,
      //         action: () => console.log('todo: update all'),
      //       })
      //     },
      //   }
      // bottomItems.push(updateAllButton)
    }

    setButtonStatusActions([{ items: topItems }, { items: bottomItems }])
  }, [environment, environmentId, dispatch, openModalConfirmation, organizationId, projectId, location.pathname])

  const removeEnvironment = async () => {
    openModalConfirmation({
      title: 'Delete environment',
      description: 'To confirm the deletion of your environment, please type the name of the environment:',
      name: environment?.name,
      isDelete: true,
      action: async () => {
        await dispatch(
          deleteEnvironmentAction({
            projectId,
            environmentId: environment.id,
          })
        )
        await dispatch(fetchEnvironments({ projectId: projectId }))
        await navigate(ENVIRONMENTS_URL(organizationId, projectId) + ENVIRONMENTS_GENERAL_URL)
      },
    })
  }

  const canDelete = environment?.status && isDeleteAvailable(environment.status.state)

  const buttonActionsDefault = [
    ...(hasServices
      ? [
          {
            triggerTooltip: 'Manage deployment',
            iconLeft: <Icon name={IconAwesomeEnum.PLAY} className="px-0.5" />,
            iconRight: <Icon name={IconAwesomeEnum.ANGLE_DOWN} className="px-0.5" />,
            menusClassName: 'border-r border-r-element-light-lighter-500',
            menus: buttonStatusActions,
          },
        ]
      : []),
    {
      triggerTooltip: 'Logs',
      iconLeft: <Icon name={IconAwesomeEnum.SCROLL} className="px-0.5" />,
      onClick: () => navigate(DEPLOYMENT_LOGS_URL(organizationId, projectId, environment.id)),
    },
    {
      triggerTooltip: 'Other actions',
      iconLeft: <Icon name="icon-solid-ellipsis-vertical" />,
      menus: [
        {
          items: [
            {
              name: 'Logs',
              contentLeft: <Icon name={IconAwesomeEnum.SCROLL} className="text-sm text-brand-400" />,
              onClick: () => navigate(DEPLOYMENT_LOGS_URL(organizationId, projectId, environment.id)),
            },
            {
              name: 'Copy identifiers',
              contentLeft: <Icon name={IconAwesomeEnum.COPY} className="text-sm text-brand-400" />,
              onClick: () => copyToClipboard(copyContent),
            },
            {
              name: 'Clone',
              contentLeft: <Icon name={IconAwesomeEnum.COPY} className="text-sm text-brand-400" />,
              onClick: () =>
                openModal({
                  content: (
                    <CreateCloneEnvironmentModalFeature
                      onClose={closeModal}
                      projectId={projectId}
                      organizationId={organizationId}
                      environmentToClone={environment}
                    />
                  ),
                }),
            },
          ],
        },
        ...(canDelete
          ? [
              {
                items: [
                  {
                    name: 'Delete environment',
                    containerClassName: 'text-error-600',
                    contentLeft: <Icon name={IconAwesomeEnum.TRASH} className="text-sm text-error-600" />,
                    onClick: () => removeEnvironment(),
                  },
                ],
              },
            ]
          : []),
      ],
    },
  ]

  return <ButtonIconAction className="!h-8" actions={buttonActionsDefault} />
}

export default EnvironmentButtonsActions
