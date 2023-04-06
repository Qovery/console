import { ClickEvent } from '@szhsin/react-menu'
import { Environment, StateEnum, Status } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  useActionCancelEnvironment,
  useActionDeployEnvironment,
  useActionRestartEnvironment,
  useActionStopEnvironment,
  useDeleteEnvironment,
} from '@qovery/domains/environment'
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
  isRedeployAvailable,
  isStopAvailable,
} from '@qovery/shared/utils'
import { AppDispatch } from '@qovery/store'
import CreateCloneEnvironmentModalFeature from '../../create-clone-environment-modal/feature/create-clone-environment-modal-feature'
import UpdateAllModalFeature from '../../update-all-modal/feature/update-all-modal-feature'

export interface EnvironmentButtonsActionsProps {
  environment: Environment
  status?: Status
  hasServices?: boolean
}

export function EnvironmentButtonsActions(props: EnvironmentButtonsActionsProps) {
  const { environment, status, hasServices = false } = props
  const { organizationId = '', projectId = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { openModal, closeModal } = useModal()
  const [buttonStatusActions, setButtonStatusActions] = useState<MenuData>([])

  const { openModalConfirmation } = useModalConfirmation()

  const dispatch = useDispatch<AppDispatch>()

  const copyContent = `Organization ID: ${organizationId}\nProject ID: ${projectId}\nEnvironment ID: ${environment.id}`

  const { mutate: actionRestartEnvironmentMutate } = useActionRestartEnvironment(
    projectId,
    environment.id,
    location.pathname === SERVICES_URL(organizationId, projectId, environment.id) + SERVICES_DEPLOYMENTS_URL
  )

  const { mutate: actionDeployEnvironmentMutate } = useActionDeployEnvironment(
    projectId,
    environment.id,
    location.pathname === SERVICES_URL(organizationId, projectId, environment.id) + SERVICES_DEPLOYMENTS_URL
  )

  const { mutate: actionStopEnvironmentMutate } = useActionStopEnvironment(
    projectId,
    environment.id,
    location.pathname === SERVICES_URL(organizationId, projectId, environment.id) + SERVICES_DEPLOYMENTS_URL
  )

  const { mutate: actionCancelEnvironmentMutate } = useActionCancelEnvironment(
    projectId,
    environment.id,
    location.pathname === SERVICES_URL(organizationId, projectId, environment.id) + SERVICES_DEPLOYMENTS_URL
  )

  useEffect(() => {
    const deployButton: MenuItemProps = {
      name: 'Deploy',
      contentLeft: <Icon name={IconAwesomeEnum.PLAY} className="text-sm text-brand-400" />,
      onClick: () => actionDeployEnvironmentMutate(),
    }

    const state = status?.state
    const topItems: MenuItemProps[] = []
    const bottomItems: MenuItemProps[] = []

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
          action: () => actionRestartEnvironmentMutate(),
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
          action: () => actionStopEnvironmentMutate(),
        })
      },
    }

    const cancelDeploymentButton = {
      name: state === StateEnum.DELETE_QUEUED || state === StateEnum.DELETING ? 'Cancel delete' : 'Cancel deployment',
      onClick: (e: ClickEvent) => {
        e.syntheticEvent.preventDefault()

        openModalConfirmation({
          mode: environment.mode,
          title: 'Confirm cancel',
          description:
            'Stopping a deployment may take a while, as a safe point needs to be reached. Some operations cannot be stopped (i.e: terraform actions) and need to be completed before stopping the deployment. Any action performed before won’t be rolled back. To confirm the cancellation of your deployment, please type the name of the environment:',
          name: environment.name,
          action: () => actionCancelEnvironmentMutate(),
        })
      },
      contentLeft: <Icon name={IconAwesomeEnum.XMARK} className="text-sm text-brand-400" />,
    }

    if (state) {
      if (isCancelBuildAvailable(state)) {
        topItems.push(cancelDeploymentButton)
      }
      if (isDeployAvailable(state)) {
        topItems.push(deployButton)
      }
      if (isRedeployAvailable(state)) {
        topItems.push(redeployButton)
      }
      if (isStopAvailable(state)) {
        topItems.push(stopButton)
      }

      const updateAllButton = {
        name: 'Deploy latest version for..',
        contentLeft: <Icon name={IconAwesomeEnum.ROTATE} className="text-sm text-brand-400" />,
        onClick: (e: ClickEvent) => {
          e.syntheticEvent.preventDefault()

          openModal({
            content: <UpdateAllModalFeature environmentId={environment.id} projectId={projectId} />,
            options: {
              width: 676,
            },
          })
        },
      }
      bottomItems.push(updateAllButton)
    }

    setButtonStatusActions([{ items: topItems }, { items: bottomItems }])
  }, [
    environment,
    dispatch,
    openModalConfirmation,
    organizationId,
    projectId,
    location.pathname,
    openModal,
    status?.state,
    actionCancelEnvironmentMutate,
    actionDeployEnvironmentMutate,
    actionRestartEnvironmentMutate,
    actionStopEnvironmentMutate,
  ])

  const deleteEnvironment = useDeleteEnvironment(
    projectId,
    environment.id,
    () => navigate(ENVIRONMENTS_URL(organizationId, projectId) + ENVIRONMENTS_GENERAL_URL),
    status?.state && status.state === StateEnum.READY
  )

  const removeEnvironment = async () => {
    openModalConfirmation({
      title: 'Delete environment',
      description: 'To confirm the deletion of your environment, please type the name of the environment:',
      name: environment?.name,
      isDelete: true,
      action: () => deleteEnvironment.mutate(),
    })
  }

  const canDelete = status?.state && isDeleteAvailable(status.state)

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
