import { type ClickEvent } from '@szhsin/react-menu'
import { useQueryClient } from '@tanstack/react-query'
import { DatabaseModeEnum, OrganizationEventTargetType, StateEnum } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  deleteDatabaseAction,
  postDatabaseActionsDeploy,
  postDatabaseActionsReboot,
  postDatabaseActionsRedeploy,
  postDatabaseActionsStop,
} from '@qovery/domains/database'
import { useActionCancelEnvironment } from '@qovery/domains/environment'
import { useDeploymentStatus, useRunningStatus } from '@qovery/domains/services/feature'
import { type DatabaseEntity } from '@qovery/shared/interfaces'
import {
  AUDIT_LOGS_PARAMS_URL,
  ENVIRONMENT_LOGS_URL,
  SERVICES_DEPLOYMENTS_URL,
  SERVICES_GENERAL_URL,
  SERVICES_URL,
  SERVICE_LOGS_URL,
} from '@qovery/shared/routes'
import {
  ButtonIconAction,
  type ButtonIconActionElementProps,
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
  isRestartAvailable,
  isStopAvailable,
} from '@qovery/shared/util-js'
import { type AppDispatch } from '@qovery/state/store'
import CloneServiceModalFeature from '../../../clone-service-modal/feature/clone-service-modal-feature'

export interface DatabaseButtonsActionsProps {
  database: DatabaseEntity
  environmentMode: string
  clusterId: string
}

export function DatabaseButtonsActions(props: DatabaseButtonsActionsProps) {
  const { database, environmentMode, clusterId } = props
  const { openModal, closeModal } = useModal()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [, copyToClipboard] = useCopyToClipboard()

  const { openModalConfirmation } = useModalConfirmation()
  const dispatch = useDispatch<AppDispatch>()
  const location = useLocation()

  const actionCancelEnvironment = useActionCancelEnvironment(
    projectId,
    environmentId,
    location.pathname === SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_DEPLOYMENTS_URL,
    undefined,
    () => navigate(ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId))
  )

  const { data: runningSatus } = useRunningStatus({ environmentId, serviceId: database.id })
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId, serviceId: database.id })

  const removeDatabase = (id: string, name?: string, force = false) => {
    openModalConfirmation({
      title: `Delete database`,
      name: name,
      isDelete: true,
      action: () => {
        dispatch(deleteDatabaseAction({ environmentId, databaseId: id, force, queryClient }))
        navigate(SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_GENERAL_URL)
      },
    })
  }

  const buttonStatusActions = useMemo(() => {
    const deployButton: MenuItemProps = {
      name: 'Deploy',
      contentLeft: <Icon name={IconAwesomeEnum.PLAY} className="text-sm text-brand-400" />,
      onClick: () =>
        dispatch(
          postDatabaseActionsDeploy({
            environmentId,
            databaseId: database.id,
            queryClient,
          })
        ),
    }

    const state = deploymentStatus?.state
    const runningState = runningSatus?.state
    const topItems: MenuItemProps[] = []
    const bottomItems: MenuItemProps[] = []

    const redeployButton: MenuItemProps = {
      name: 'Redeploy',
      contentLeft: <Icon name={IconAwesomeEnum.ROTATE_RIGHT} className="text-sm text-brand-400" />,
      onClick: (e: ClickEvent) => {
        e.syntheticEvent.preventDefault()

        openModalConfirmation({
          mode: environmentMode,
          title: 'Confirm redeploy',
          description: 'To confirm the redeploy of your database, please type the name:',
          name: database.name,
          action: () => {
            dispatch(
              postDatabaseActionsRedeploy({
                environmentId,
                databaseId: database.id,
                queryClient,
              })
            )
          },
        })
      },
    }

    const restartButton: MenuItemProps = {
      name: 'Restart Database',
      contentLeft: <Icon name={IconAwesomeEnum.ROTATE_RIGHT} className="text-sm text-brand-400" />,
      onClick: (e: ClickEvent) => {
        e.syntheticEvent.preventDefault()

        dispatch(postDatabaseActionsReboot({ environmentId, databaseId: database.id, queryClient }))
      },
    }

    const stopButton: MenuItemProps = {
      name: 'Stop',
      onClick: (e: ClickEvent) => {
        e.syntheticEvent.preventDefault()

        openModalConfirmation({
          mode: environmentMode,
          title: 'Confirm action',
          description: 'To confirm the stopping of your database, please type the name:',
          name: database.name,
          action: () => {
            dispatch(
              postDatabaseActionsStop({
                environmentId,
                databaseId: database.id,
                queryClient,
              })
            )
          },
        })
      },
      contentLeft: <Icon name={IconAwesomeEnum.CIRCLE_STOP} className="text-sm text-brand-400" />,
    }

    const cancelDeploymentButton = {
      name: state === StateEnum.DELETE_QUEUED || state === StateEnum.DELETING ? 'Cancel delete' : 'Cancel deployment',
      onClick: (e: ClickEvent) => {
        e.syntheticEvent.preventDefault()

        openModalConfirmation({
          mode: database.mode,
          title: 'Confirm cancel',
          description:
            'Stopping a deployment may take a while, as a safe point needs to be reached. Some operations cannot be stopped (i.e: terraform actions) and need to be completed before stopping the deployment. Any action performed before won’t be rolled back. To confirm the cancellation of your deployment, please type the name of the database:',
          name: database.name,
          action: () => actionCancelEnvironment.mutate(),
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
      if (runningState && isRestartAvailable(runningState, state) && database.mode !== DatabaseModeEnum.MANAGED) {
        topItems.push(restartButton)
      }
      if (isStopAvailable(state)) {
        topItems.push(stopButton)
      }
    }

    return [{ items: topItems }, { items: bottomItems }]
  }, [
    actionCancelEnvironment,
    database,
    environmentMode,
    environmentId,
    dispatch,
    openModalConfirmation,
    runningSatus?.state,
    deploymentStatus?.state,
  ])

  const canDelete = deploymentStatus && isDeleteAvailable(deploymentStatus.state)

  const copyContent = `Cluster ID: ${clusterId}\nOrganization ID: ${organizationId}\nProject ID: ${projectId}\nEnvironment ID: ${environmentId}\nService ID: ${database.id}`

  const buttonActionsDefault: ButtonIconActionElementProps[] = [
    {
      triggerTooltip: 'Manage deployment',
      iconLeft: <Icon name={IconAwesomeEnum.PLAY} className="px-0.5" />,
      iconRight: <Icon name={IconAwesomeEnum.ANGLE_DOWN} className="px-0.5" />,
      menusClassName: 'border-r border-r-neutral-250',
      menus: buttonStatusActions,
    },
  ]

  if (database.mode === DatabaseModeEnum.CONTAINER) {
    buttonActionsDefault.push({
      triggerTooltip: 'Logs',
      iconLeft: <Icon name={IconAwesomeEnum.SCROLL} className="px-0.5" />,
      onClick: () =>
        navigate(ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + SERVICE_LOGS_URL(database.id)),
    })
  }

  buttonActionsDefault.push({
    triggerTooltip: 'Other actions',
    iconLeft: <Icon name={IconAwesomeEnum.ELLIPSIS_V} className="px-0.5" />,
    menus: [
      {
        items: [
          {
            name: 'See audit logs',
            contentLeft: <Icon name={IconAwesomeEnum.CLOCK_ROTATE_LEFT} className="text-sm text-brand-400" />,
            onClick: () =>
              navigate(
                AUDIT_LOGS_PARAMS_URL(organizationId, {
                  targetType: OrganizationEventTargetType.DATABASE,
                  projectId,
                  environmentId,
                  targetId: database.id,
                })
              ),
          },
          {
            name: 'Copy identifiers',
            contentLeft: <Icon name="icon-solid-copy" className="text-sm text-brand-400" />,
            onClick: () => copyToClipboard(copyContent),
          },
          {
            name: 'Clone',
            contentLeft: <Icon name={IconAwesomeEnum.COPY} className="text-sm text-brand-400" />,
            onClick: () =>
              openModal({
                content: (
                  <CloneServiceModalFeature
                    onClose={closeModal}
                    organizationId={organizationId}
                    projectId={projectId}
                    serviceToClone={database}
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
                  name: 'Delete database',
                  containerClassName: 'text-red-600',
                  contentLeft: <Icon name={IconAwesomeEnum.TRASH} className="text-sm" />,
                  onClick: () =>
                    removeDatabase(
                      database.id,
                      database.name,
                      deploymentStatus?.state && deploymentStatus?.state === StateEnum.READY
                    ),
                },
              ],
            },
          ]
        : []),
    ],
  })

  return <ButtonIconAction className="!h-8" actions={buttonActionsDefault} />
}

export default DatabaseButtonsActions
