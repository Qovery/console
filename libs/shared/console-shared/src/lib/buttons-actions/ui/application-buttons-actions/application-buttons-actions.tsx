import { ClickEvent } from '@szhsin/react-menu'
import { OrganizationEventTargetType, StateEnum } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  deleteApplicationAction,
  postApplicationActionsDeploy,
  postApplicationActionsReboot,
  postApplicationActionsRedeploy,
  postApplicationActionsStop,
} from '@qovery/domains/application'
import { useActionCancelEnvironment } from '@qovery/domains/environment'
import {
  ServiceTypeEnum,
  getServiceType,
  isApplication,
  isContainer,
  isContainerJob,
  isGitJob,
  isJob,
} from '@qovery/shared/enums'
import { ApplicationEntity, GitApplicationEntity, JobApplicationEntity } from '@qovery/shared/interfaces'
import {
  APPLICATION_SETTINGS_GENERAL_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_URL,
  AUDIT_LOGS_PARAMS_URL,
  ENVIRONMENT_LOGS_URL,
  SERVICES_DEPLOYMENTS_URL,
  SERVICES_GENERAL_URL,
  SERVICES_URL,
  SERVICE_LOGS_URL,
} from '@qovery/shared/routes'
import {
  ButtonIconAction,
  ButtonIconActionElementProps,
  Icon,
  IconAwesomeEnum,
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
  isRestartAvailable,
  isStopAvailable,
  urlCodeEditor,
} from '@qovery/shared/utils'
import { AppDispatch } from '@qovery/store'
import CloneServiceModalFeature from '../../../clone-service-modal/feature/clone-service-modal-feature'
import DeployOtherCommitModalFeature from '../../../deploy-other-commit-modal/feature/deploy-other-commit-modal-feature'
import DeployOtherTagModalFeature from '../../../deploy-other-tag-modal/feature/deploy-other-tag-modal-feature'
import ForceRunModalFeature from '../../../force-run-modal/feature/force-run-modal-feature'

export interface ApplicationButtonsActionsProps {
  application: ApplicationEntity
  environmentMode: string
  clusterId: string
}

export function ApplicationButtonsActions(props: ApplicationButtonsActionsProps) {
  const { application, environmentMode, clusterId } = props
  const { environmentId = '', projectId = '', organizationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const location = useLocation()

  const serviceType = getServiceType(application)

  const getTargetType = (serviceType: ServiceTypeEnum): OrganizationEventTargetType => {
    switch (serviceType) {
      case ServiceTypeEnum.APPLICATION:
        return OrganizationEventTargetType.APPLICATION
      case ServiceTypeEnum.DATABASE:
        return OrganizationEventTargetType.DATABASE
      case ServiceTypeEnum.CRON_JOB:
        return OrganizationEventTargetType.JOB
      case ServiceTypeEnum.LIFECYCLE_JOB:
        return OrganizationEventTargetType.JOB
      case ServiceTypeEnum.CONTAINER:
        return OrganizationEventTargetType.CONTAINER
      default:
        return OrganizationEventTargetType.APPLICATION
    }
  }

  const actionCancelEnvironment = useActionCancelEnvironment(
    projectId,
    environmentId,
    location.pathname === SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_DEPLOYMENTS_URL
  )

  const removeService = (id: string, name?: string, force = false) => {
    openModalConfirmation({
      title: `Delete application`,
      name: name,
      isDelete: true,
      action: () => {
        dispatch(deleteApplicationAction({ environmentId, applicationId: id, serviceType: serviceType, force }))
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
          postApplicationActionsDeploy({
            environmentId,
            applicationId: application.id,
            serviceType: serviceType,
          })
        ),
    }

    const state = application.status?.state
    const runningState = application.running_status?.state
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
          description: 'To confirm the redeploy of your service, please type the name:',
          name: application.name,
          action: () => {
            dispatch(
              postApplicationActionsRedeploy({
                environmentId,
                applicationId: application.id,
                serviceType: serviceType,
              })
            )
          },
        })
      },
    }

    const restartButton: MenuItemProps = {
      name: 'Restart Service',
      contentLeft: <Icon name={IconAwesomeEnum.ROTATE_RIGHT} className="text-sm text-brand-400" />,
      onClick: (e: ClickEvent) => {
        e.syntheticEvent.preventDefault()

        dispatch(
          postApplicationActionsReboot({
            environmentId,
            applicationId: application.id,
            serviceType: serviceType,
          })
        )
      },
    }

    const forceRunButton: MenuItemProps = {
      name: 'Force Run',
      contentLeft: <Icon name={IconAwesomeEnum.PLAY} className="text-sm text-brand-400" />,
      onClick: (e: ClickEvent) => {
        e.syntheticEvent.preventDefault()

        openModal({ content: <ForceRunModalFeature applicationId={application.id} /> })
      },
    }

    const stopButton: MenuItemProps = {
      name: 'Stop',
      onClick: () => {
        openModalConfirmation({
          mode: environmentMode,
          title: 'Confirm stop',
          description: 'To confirm the stopping of your service, please type the name:',
          name: application.name,
          action: () => {
            dispatch(
              postApplicationActionsStop({
                environmentId,
                applicationId: application.id,
                serviceType: serviceType,
              })
            )
          },
        })
      },
      contentLeft: <Icon name={IconAwesomeEnum.CIRCLE_STOP} className="text-sm text-brand-400" />,
    }

    const cancelBuildButton: MenuItemProps = {
      name: state === StateEnum.DELETE_QUEUED || state === StateEnum.DELETING ? 'Cancel delete' : 'Cancel deployment',
      onClick: (e: ClickEvent) => {
        e.syntheticEvent.preventDefault()
        openModalConfirmation({
          mode: environmentMode,
          title: 'Confirm cancel',
          description:
            'Stopping a deployment for your service will stop the deployment of the whole environment. It may take a while, as a safe point needs to be reached. Some operations cannot be stopped (i.e: terraform actions) and need to be completed before stopping the deployment. Any action performed before won’t be rolled back. To confirm the cancellation of your deployment, please type the name of the application:',
          name: application.name,
          action: () => actionCancelEnvironment.mutate(),
        })
      },
      contentLeft: <Icon name={IconAwesomeEnum.XMARK} className="text-sm text-brand-400" />,
    }

    if (state) {
      if (isCancelBuildAvailable(state)) {
        topItems.push(cancelBuildButton)
      }
      if (isDeployAvailable(state)) {
        topItems.push(deployButton)
      }
      if (isRedeployAvailable(state)) {
        topItems.push(redeployButton)
      }
      if (!isJob(application) && runningState && isRestartAvailable(runningState, state)) {
        topItems.push(restartButton)
      }
      if (isJob(application)) {
        topItems.push(forceRunButton)
      }
      if (isStopAvailable(state)) {
        topItems.push(stopButton)
      }

      if (isApplication(application) || (isJob(application) && isGitJob(application))) {
        const deployAnotherButton = {
          name: 'Deploy other version',
          contentLeft: <Icon name={IconAwesomeEnum.CLOCK_ROTATE_LEFT} className="text-sm text-brand-400" />,
          onClick: () => {
            openModal({
              content: (
                <DeployOtherCommitModalFeature applicationId={application.id} environmentId={environmentId || ''} />
              ),
              options: { width: 596 },
            })
          },
        }
        bottomItems.push(deployAnotherButton)
      }

      if (isContainer(application) || isContainerJob(application)) {
        const deployAnotherButton = {
          name: 'Deploy other version',
          contentLeft: <Icon name={IconAwesomeEnum.CLOCK_ROTATE_LEFT} className="text-sm text-brand-400" />,
          onClick: () => {
            openModal({
              content: (
                <DeployOtherTagModalFeature applicationId={application.id} environmentId={environmentId || ''} />
              ),
              options: { width: 596 },
            })
          },
        }
        bottomItems.push(deployAnotherButton)
      }
    }

    return [{ items: topItems }, { items: bottomItems }]
  }, [
    application,
    actionCancelEnvironment,
    environmentMode,
    environmentId,
    dispatch,
    openModal,
    openModalConfirmation,
    location.pathname,
    organizationId,
    projectId,
    serviceType,
  ])

  const canDelete = application.status && isDeleteAvailable(application.status.state)
  const copyContent = `Cluster ID: ${clusterId}\nOrganization ID: ${organizationId}\nProject ID: ${projectId}\nEnvironment ID: ${environmentId}\nService ID: ${application.id}`

  const buttonActionsDefault: ButtonIconActionElementProps[] = [
    {
      triggerTooltip: 'Manage deployment',
      iconLeft: <Icon name={IconAwesomeEnum.PLAY} className="px-0.5" />,
      iconRight: <Icon name={IconAwesomeEnum.ANGLE_DOWN} className="px-0.5" />,
      menusClassName: 'border-r border-r-element-light-lighter-500',
      menus: buttonStatusActions,
    },
    {
      triggerTooltip: 'Logs',
      iconLeft: <Icon name={IconAwesomeEnum.SCROLL} className="px-0.5" />,
      onClick: () =>
        navigate(ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + SERVICE_LOGS_URL(application.id)),
    },
    {
      triggerTooltip: 'Other actions',
      iconLeft: <Icon name={IconAwesomeEnum.ELLIPSIS_V} className="px-0.5" />,
      menus: [
        {
          items: [
            {
              name: 'Logs',
              contentLeft: <Icon name={IconAwesomeEnum.SCROLL} className="text-sm text-brand-400" />,
              onClick: () =>
                navigate(
                  ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + SERVICE_LOGS_URL(application.id)
                ),
            },
            {
              ...(!isContainer(application) && {
                name: 'Edit code',
                contentLeft: <Icon name={IconAwesomeEnum.CODE} className="text-sm text-brand-400" />,
                link: {
                  url:
                    urlCodeEditor(
                      (application as GitApplicationEntity)?.git_repository ||
                        (application as JobApplicationEntity).source?.docker?.git_repository
                    ) || '',
                  external: true,
                },
              }),
            },
            {
              name: 'See audit logs',
              contentLeft: <Icon name={IconAwesomeEnum.CLOCK_ROTATE_LEFT} className="text-sm text-brand-400" />,
              onClick: () =>
                navigate(
                  AUDIT_LOGS_PARAMS_URL(organizationId, {
                    targetType: getTargetType(serviceType),
                    projectId,
                    environmentId,
                    targetId: application.id,
                  })
                ),
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
                    <CloneServiceModalFeature
                      onClose={closeModal}
                      organizationId={organizationId}
                      projectId={projectId}
                      serviceToClone={application}
                    />
                  ),
                }),
            },
            {
              name: 'Open settings',
              contentLeft: <Icon name={IconAwesomeEnum.WHEEL} className="text-sm text-brand-400" />,
              onClick: () =>
                navigate(
                  `${APPLICATION_URL(
                    organizationId,
                    projectId,
                    environmentId,
                    application.id
                  )}${APPLICATION_SETTINGS_URL}`
                ) + APPLICATION_SETTINGS_GENERAL_URL,
            },
          ],
        },
        ...(canDelete
          ? [
              {
                items: [
                  {
                    name: 'Delete service',
                    containerClassName: 'text-error-600',
                    contentLeft: <Icon name={IconAwesomeEnum.TRASH} className="text-sm text-error-600" />,
                    onClick: () =>
                      removeService(
                        application.id,
                        application.name,
                        application.status?.state && application.status.state === StateEnum.READY
                      ),
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

export default ApplicationButtonsActions
