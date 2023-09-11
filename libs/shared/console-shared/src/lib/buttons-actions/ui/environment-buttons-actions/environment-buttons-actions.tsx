import { type ClickEvent } from '@szhsin/react-menu'
import { type Environment, OrganizationEventTargetType, StateEnum } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  useActionCancelEnvironment,
  useActionDeployEnvironment,
  useActionRedeployEnvironment,
  useActionStopEnvironment,
  useDeleteEnvironment,
} from '@qovery/domains/environment'
import { useDeploymentStatus } from '@qovery/domains/environments/feature'
import {
  AUDIT_LOGS_PARAMS_URL,
  ENVIRONMENTS_GENERAL_URL,
  ENVIRONMENTS_URL,
  ENVIRONMENT_LOGS_URL,
  SERVICES_DEPLOYMENTS_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import {
  ButtonIconAction,
  Icon,
  IconAwesomeEnum,
  type MenuItemProps,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import {
  isCancelBuildAvailable,
  isDeleteAvailable,
  isDeployAvailable,
  isRedeployAvailable,
  isStopAvailable,
} from '@qovery/shared/util-js'
import CreateCloneEnvironmentModalFeature from '../../../create-clone-environment-modal/feature/create-clone-environment-modal-feature'
import { TerraformExportModalFeature } from '../../../terraform-export-modal/feature/terraform-export-modal-feature'
import UpdateAllModalFeature from '../../../update-all-modal/feature/update-all-modal-feature'

export interface EnvironmentButtonsActionsProps {
  environment: Environment
  hasServices?: boolean
}

export function EnvironmentButtonsActions(props: EnvironmentButtonsActionsProps) {
  const { environment, hasServices = false } = props
  const { organizationId = '', projectId = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { openModal, closeModal } = useModal()
  const [, copyToClipboard] = useCopyToClipboard()

  const { openModalConfirmation } = useModalConfirmation()

  const { data: deploymentStatus } = useDeploymentStatus({ environmentId: environment.id })
  const copyContent = `Cluster ID: ${environment.cluster_id}\nOrganization ID: ${organizationId}\nProject ID: ${projectId}\nEnvironment ID: ${environment.id}`

  const { mutate: actionRedeployEnvironmentMutate } = useActionRedeployEnvironment(
    projectId,
    environment.id,
    location.pathname === SERVICES_URL(organizationId, projectId, environment.id) + SERVICES_DEPLOYMENTS_URL,
    undefined,
    () => navigate(ENVIRONMENT_LOGS_URL(organizationId, projectId, environment.id))
  )

  const { mutate: actionDeployEnvironmentMutate } = useActionDeployEnvironment(
    projectId,
    environment.id,
    location.pathname === SERVICES_URL(organizationId, projectId, environment.id) + SERVICES_DEPLOYMENTS_URL,
    undefined,
    () => navigate(ENVIRONMENT_LOGS_URL(organizationId, projectId, environment.id))
  )

  const { mutate: actionStopEnvironmentMutate } = useActionStopEnvironment(
    projectId,
    environment.id,
    location.pathname === SERVICES_URL(organizationId, projectId, environment.id) + SERVICES_DEPLOYMENTS_URL,
    undefined,
    () => navigate(ENVIRONMENT_LOGS_URL(organizationId, projectId, environment.id))
  )

  const { mutate: actionCancelEnvironmentMutate } = useActionCancelEnvironment(
    projectId,
    environment.id,
    location.pathname === SERVICES_URL(organizationId, projectId, environment.id) + SERVICES_DEPLOYMENTS_URL,
    undefined,
    () => navigate(ENVIRONMENT_LOGS_URL(organizationId, projectId, environment.id))
  )

  const buttonStatusActions = useMemo(() => {
    const deployButton: MenuItemProps = {
      name: 'Deploy',
      contentLeft: <Icon name={IconAwesomeEnum.PLAY} className="text-sm text-brand-400" />,
      onClick: () => actionDeployEnvironmentMutate(),
    }

    const state = deploymentStatus?.state
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
          action: () => actionRedeployEnvironmentMutate(),
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
            content: (
              <UpdateAllModalFeature
                organizationId={organizationId}
                environmentId={environment.id}
                projectId={projectId}
              />
            ),
            options: {
              width: 676,
            },
          })
        },
      }
      bottomItems.push(updateAllButton)
    }

    return [{ items: topItems }, { items: bottomItems }]
  }, [
    environment,
    openModalConfirmation,
    organizationId,
    projectId,
    openModal,
    deploymentStatus?.state,
    actionCancelEnvironmentMutate,
    actionDeployEnvironmentMutate,
    actionRedeployEnvironmentMutate,
    actionStopEnvironmentMutate,
  ])

  const deleteEnvironment = useDeleteEnvironment(
    projectId,
    environment.id,
    () => navigate(ENVIRONMENTS_URL(organizationId, projectId) + ENVIRONMENTS_GENERAL_URL),
    deploymentStatus?.state === StateEnum.READY,
    () => navigate(ENVIRONMENT_LOGS_URL(organizationId, projectId, environment.id))
  )

  const removeEnvironment = async () => {
    openModalConfirmation({
      title: `Delete environment`,
      name: environment?.name,
      isDelete: true,
      action: () => deleteEnvironment.mutate(),
    })
  }

  const canDelete = deploymentStatus?.state && isDeleteAvailable(deploymentStatus.state)

  const buttonActionsDefault = [
    ...(hasServices
      ? [
          {
            triggerTooltip: 'Manage deployment',
            iconLeft: <Icon name={IconAwesomeEnum.PLAY} className="px-0.5" />,
            iconRight: <Icon name={IconAwesomeEnum.ANGLE_DOWN} className="px-0.5" />,
            menusClassName: 'border-r border-r-neutral-250',
            menus: buttonStatusActions,
          },
        ]
      : []),
    {
      triggerTooltip: 'Logs',
      iconLeft: <Icon name={IconAwesomeEnum.SCROLL} className="px-0.5" />,
      onClick: () => navigate(ENVIRONMENT_LOGS_URL(organizationId, projectId, environment.id)),
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
              onClick: () => navigate(ENVIRONMENT_LOGS_URL(organizationId, projectId, environment.id)),
            },
            {
              name: 'See audit logs',
              contentLeft: <Icon name={IconAwesomeEnum.CLOCK_ROTATE_LEFT} className="text-sm text-brand-400" />,
              onClick: () =>
                navigate(
                  AUDIT_LOGS_PARAMS_URL(organizationId, {
                    targetType: OrganizationEventTargetType.ENVIRONMENT,
                    projectId,
                    targetId: environment.id,
                  })
                ),
            },
            {
              name: 'Copy identifiers',
              contentLeft: <Icon name={IconAwesomeEnum.COPY} className="text-sm text-brand-400" />,
              onClick: () => copyToClipboard(copyContent),
            },
            {
              name: 'Export as Terraform',
              contentLeft: <Icon name={IconAwesomeEnum.FILE_EXPORT} className="text-sm text-brand-400" />,
              onClick: () => {
                openModal({
                  content: <TerraformExportModalFeature closeModal={closeModal} environmentId={environment.id} />,
                })
              },
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
                    containerClassName: 'text-red-600',
                    contentLeft: <Icon name={IconAwesomeEnum.TRASH} className="text-sm text-red-600" />,
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
