import {
  type ApplicationGitRepository,
  type ContainerSource,
  type Environment,
  type HelmSourceRepositoryResponse,
  ServiceDeploymentStatusEnum,
  StateEnum,
  type Status,
} from 'qovery-typescript-axios'
import { useLocation, useNavigate } from 'react-router-dom'
import { P, match } from 'ts-pattern'
import {
  type AnyService,
  type Application,
  type Container,
  type Helm,
  type Job,
} from '@qovery/domains/services/data-access'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ForceRunModalFeature } from '@qovery/shared/console-shared'
import {
  isHelmGitSource,
  isHelmGitValuesOverride,
  isHelmRepositorySource,
  isJobContainerSource,
  isJobGitSource,
} from '@qovery/shared/enums'
import {
  APPLICATION_SETTINGS_GENERAL_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_URL,
  AUDIT_LOGS_PARAMS_URL,
  DATABASE_SETTINGS_GENERAL_URL,
  DATABASE_SETTINGS_URL,
  DATABASE_URL,
  DEPLOYMENT_LOGS_VERSION_URL,
  ENVIRONMENT_LOGS_URL,
  SERVICES_GENERAL_URL,
  SERVICES_URL,
  SERVICE_LOGS_URL,
} from '@qovery/shared/routes'
import {
  ActionToolbar,
  DropdownMenu,
  Icon,
  Link,
  Skeleton,
  Tooltip,
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
  urlCodeEditor,
} from '@qovery/shared/util-js'
import { ConfirmationCancelLifecycleModal } from '../confirmation-cancel-lifecycle-modal/confirmation-cancel-lifecycle-modal'
import { useCancelDeploymentService } from '../hooks/use-cancel-deployment-service/use-cancel-deployment-service'
import { useDeleteService } from '../hooks/use-delete-service/use-delete-service'
import { useDeployService } from '../hooks/use-deploy-service/use-deploy-service'
import { useDeploymentStatus } from '../hooks/use-deployment-status/use-deployment-status'
import { useRestartService } from '../hooks/use-restart-service/use-restart-service'
import { useRunningStatus } from '../hooks/use-running-status/use-running-status'
import { useService } from '../hooks/use-service/use-service'
import { useStopService } from '../hooks/use-stop-service/use-stop-service'
import { RedeployModal } from '../redeploy-modal/redeploy-modal'
import { SelectCommitModal } from '../select-commit-modal/select-commit-modal'
import { SelectVersionModal } from '../select-version-modal/select-version-modal'
import { ServiceCloneModal } from '../service-clone-modal/service-clone-modal'

type ActionToolbarVariant = 'default' | 'deployment'

function MenuManageDeployment({
  deploymentStatus,
  environment,
  service,
  environmentLogsLink,
  variant,
}: {
  deploymentStatus: Status
  environment: Environment
  service: AnyService
  environmentLogsLink: string
  variant: ActionToolbarVariant
}) {
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const logsLink = environmentLogsLink + DEPLOYMENT_LOGS_VERSION_URL(service.id, deploymentStatus.execution_id)

  const { data: runningState } = useRunningStatus({ environmentId: environment.id, serviceId: service.id })
  const { mutate: deployService } = useDeployService({
    environmentId: environment.id,
    logsLink,
  })

  const { mutate: restartService } = useRestartService({ environmentId: environment.id, logsLink })
  const { mutate: stopService } = useStopService({ environmentId: environment.id, logsLink })
  const { mutateAsync: cancelBuild } = useCancelDeploymentService({
    projectId: environment.project.id,
    logsLink,
  })

  const { state, service_deployment_status } = deploymentStatus
  const serviceNeedUpdate = service_deployment_status !== ServiceDeploymentStatusEnum.UP_TO_DATE
  const displayYellowColor = serviceNeedUpdate && state !== 'STOPPED'

  const tooltipServiceNeedUpdate = displayYellowColor && (
    <Tooltip side="bottom" content="Configuration has changed and needs to be applied">
      <div className="absolute right-2">
        <Icon iconName="circle-exclamation" iconStyle="regular" />
      </div>
    </Tooltip>
  )

  const mutationDeploy = () => deployService({ serviceId: service.id, serviceType: service.serviceType })

  const mutationRedeploy = () => {
    openModalConfirmation({
      mode: environment?.mode,
      title: 'Confirm redeploy',
      description: 'To confirm the redeploy of your service, please type the name:',
      name: service.name,
      action: () => deployService({ serviceId: service.id, serviceType: service.serviceType }),
    })
  }

  const mutationStop = () => {
    openModalConfirmation({
      mode: environment?.mode,
      title: 'Confirm stop',
      description: 'To confirm the stopping of your service, please type the name:',
      name: service.name,
      action: () => stopService({ serviceId: service.id, serviceType: service.serviceType }),
    })
  }

  const mutationCancelBuild = () => {
    match(service)
      .with({ serviceType: 'JOB', job_type: 'LIFECYCLE' }, (s) => {
        openModal({
          content: (
            <ConfirmationCancelLifecycleModal
              organizationId={environment.organization.id}
              projectId={environment.project.id}
              serviceId={s.id}
              environmentId={s.environment.id}
              onClose={closeModal}
            />
          ),
        })
      })
      .otherwise(() =>
        openModalConfirmation({
          mode: environment.mode,
          title: 'Cancel deployment',
          description:
            'Stopping a deployment for your service will stop the deployment of the whole environment. It may take a while, as a safe point needs to be reached. Some operations cannot be stopped (i.e: terraform actions) and need to be completed before stopping the deployment. Any action performed before won’t be rolled back. To confirm the cancellation of your deployment, please type the name of the application:',
          name: service.name,
          action: () => cancelBuild({ environmentId: environment.id }),
        })
      )
  }

  const deployCommitVersion = (
    service: Application | Job | Helm,
    gitRepository: ApplicationGitRepository,
    title: string
  ) => {
    openModal({
      content: (
        <SelectCommitModal
          title={title}
          description="Select the commit id you want to deploy."
          submitLabel="Deploy"
          serviceId={service.id}
          serviceType={service.serviceType}
          gitRepository={gitRepository}
          onCancel={closeModal}
          onSubmit={(git_commit_id) => {
            deployService({
              serviceId: service.id,
              serviceType: service.serviceType,
              request: {
                git_commit_id,
              },
            })
            closeModal()
          }}
        >
          <p>
            For <strong className="font-medium text-neutral-400 dark:text-neutral-50">{service.name}</strong>
          </p>
        </SelectCommitModal>
      ),
      options: { width: 596 },
    })
  }

  const deployTagVersion = (service: Container | Job, containerSource: ContainerSource) => {
    openModal({
      content: (
        <SelectVersionModal
          title="Deploy another version"
          description="Select the version you want to deploy."
          submitLabel="Deploy"
          organizationId={environment.organization.id}
          currentVersion={containerSource.tag}
          containerSource={containerSource}
          onCancel={closeModal}
          onSubmit={(image_tag) => {
            deployService({
              serviceId: service.id,
              serviceType: service.serviceType,
              request: {
                image_tag,
              },
            })
            closeModal()
          }}
        >
          <p>
            For <strong className="font-medium text-neutral-400 dark:text-neutral-50">{service.name}</strong>
          </p>
        </SelectVersionModal>
      ),
      options: {
        fakeModal: true,
      },
    })
  }
  const deployHelmChartVersion = (service: Helm, repository: HelmSourceRepositoryResponse, version: string) => {
    openModal({
      content: (
        <SelectVersionModal
          title="Deploy another version"
          description="Select the chart version that you want to deploy."
          submitLabel="Deploy"
          currentVersion={version}
          repository={repository}
          organizationId={environment.organization.id}
          onCancel={closeModal}
          onSubmit={(chart_version) => {
            deployService({
              serviceId: service.id,
              serviceType: service.serviceType,
              request: {
                chart_version,
              },
            })
            closeModal()
          }}
        >
          <p>
            For <strong className="font-medium text-neutral-400 dark:text-neutral-50">{service.name}</strong>
          </p>
        </SelectVersionModal>
      ),
      options: {
        fakeModal: true,
      },
    })
  }
  const deployHelmOverrideVersion = (service: Helm, gitRepository: ApplicationGitRepository) => {
    openModal({
      content: (
        <SelectCommitModal
          title="Deploy another override version"
          description="Select the commit id you want to deploy."
          submitLabel="Deploy"
          serviceId={service.id}
          serviceType={service.serviceType}
          gitRepository={gitRepository}
          of="values"
          onCancel={closeModal}
          onSubmit={(values_override_git_commit_id) => {
            deployService({
              serviceId: service.id,
              serviceType: service.serviceType,
              request: {
                values_override_git_commit_id,
              },
            })
            closeModal()
          }}
        >
          <p>
            For <strong className="font-medium text-neutral-400 dark:text-neutral-50">{service.name}</strong>
          </p>
        </SelectCommitModal>
      ),
      options: { width: 596 },
    })
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <ActionToolbar.Button
          aria-label="Manage Deployment"
          color={displayYellowColor ? 'yellow' : 'neutral'}
          size={variant === 'default' ? 'md' : 'sm'}
          variant={variant === 'default' ? 'outline' : 'surface'}
          radius={variant === 'deployment' ? 'rounded' : 'none'}
        >
          <Tooltip content="Manage Deployment">
            <div className="flex h-full w-full items-center justify-center">
              {match(state)
                .with(
                  'DEPLOYING',
                  'RESTARTING',
                  'BUILDING',
                  'DELETING',
                  'CANCELING',
                  'STOPPING',
                  'DEPLOYMENT_QUEUED',
                  'DELETE_QUEUED',
                  'STOP_QUEUED',
                  'RESTART_QUEUED',
                  () => <Icon iconName="loader" className="mr-3 animate-spin" />
                )
                .otherwise(() => (
                  <Icon iconName="play" className="mr-4" />
                ))}
              <Icon iconName="chevron-down" />
            </div>
          </Tooltip>
        </ActionToolbar.Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {isCancelBuildAvailable(state) && (
          <DropdownMenu.Item icon={<Icon iconName="xmark" />} onSelect={mutationCancelBuild}>
            {state === StateEnum.DELETE_QUEUED || state === StateEnum.DELETING ? 'Cancel delete' : 'Cancel deployment'}
          </DropdownMenu.Item>
        )}
        {isDeployAvailable(state) && (
          <DropdownMenu.Item
            icon={<Icon iconName="play" />}
            onSelect={mutationDeploy}
            className="relative"
            color={displayYellowColor ? 'yellow' : 'brand'}
          >
            Deploy
            {tooltipServiceNeedUpdate}
          </DropdownMenu.Item>
        )}
        {isRedeployAvailable(state) && (
          <DropdownMenu.Item
            icon={<Icon iconName="rotate-right" />}
            onSelect={
              // Don't display modal only if:
              // - Service needs to be updated
              // - Service don't have a runningState RUNNING or ERROR
              serviceNeedUpdate ||
              !runningState ||
              !(runningState.state === 'RUNNING' || runningState.state === 'ERROR')
                ? mutationRedeploy
                : () =>
                    openModal({
                      content: (
                        <RedeployModal
                          organizationId={environment.organization.id}
                          projectId={environment.project.id}
                          service={service}
                        />
                      ),
                    })
            }
            className="relative"
            color={displayYellowColor ? 'yellow' : 'brand'}
          >
            Redeploy
            {tooltipServiceNeedUpdate}
          </DropdownMenu.Item>
        )}
        {runningState && service.serviceType !== 'JOB' && isRestartAvailable(runningState.state, state) && (
          <DropdownMenu.Item
            icon={<Icon iconName="rotate-right" />}
            onSelect={() => restartService({ serviceId: service.id, serviceType: service.serviceType })}
          >
            Restart Service
          </DropdownMenu.Item>
        )}
        {service.serviceType === 'JOB' &&
          match(state)
            .with(
              'DEPLOYING',
              'RESTARTING',
              'BUILDING',
              'DELETING',
              'CANCELING',
              'STOPPING',
              'DEPLOYMENT_QUEUED',
              'DELETE_QUEUED',
              'STOP_QUEUED',
              'RESTART_QUEUED',
              () => null
            )
            .otherwise(() => (
              <DropdownMenu.Item
                icon={<Icon iconName="play" />}
                onSelect={() =>
                  openModal({
                    content: (
                      <ForceRunModalFeature
                        organizationId={environment.organization.id}
                        projectId={environment.project.id}
                        service={service}
                      />
                    ),
                  })
                }
              >
                Force Run
              </DropdownMenu.Item>
            ))}
        {isStopAvailable(state) && (
          <DropdownMenu.Item icon={<Icon iconName="circle-stop" />} onSelect={mutationStop}>
            Stop
          </DropdownMenu.Item>
        )}
        {match({ service })
          .with(
            { service: { serviceType: 'APPLICATION' } },
            { service: P.intersection({ serviceType: 'JOB' }, { source: P.when(isJobGitSource) }) },
            ({ service }) => {
              const gitRepository = match(service)
                .with({ serviceType: 'APPLICATION' }, ({ git_repository }) => git_repository)
                .with({ serviceType: 'JOB' }, ({ source }) => source.docker?.git_repository)
                .exhaustive()

              return match(state)
                .with(
                  'DEPLOYING',
                  'RESTARTING',
                  'BUILDING',
                  'DELETING',
                  'CANCELING',
                  'STOPPING',
                  'DEPLOYMENT_QUEUED',
                  'DELETE_QUEUED',
                  'STOP_QUEUED',
                  'RESTART_QUEUED',
                  () => null
                )
                .otherwise(
                  () =>
                    gitRepository && (
                      <>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item
                          icon={<Icon iconName="clock-rotate-left" />}
                          onSelect={() => deployCommitVersion(service, gitRepository, 'Deploy another version')}
                        >
                          Deploy another version
                        </DropdownMenu.Item>
                      </>
                    )
                )
            }
          )
          .with(
            { service: { serviceType: 'CONTAINER' } },
            { service: P.intersection({ serviceType: 'JOB' }, { source: P.when(isJobContainerSource) }) },
            ({ service }) => {
              const containerSource = match(service)
                .returnType<ContainerSource>()
                .with({ serviceType: 'CONTAINER' }, (source) => source)
                .with({ serviceType: 'JOB' }, ({ source: { image } }) => image)
                .exhaustive()

              return match(state)
                .with(
                  'DEPLOYING',
                  'RESTARTING',
                  'BUILDING',
                  'DELETING',
                  'CANCELING',
                  'STOPPING',
                  'DEPLOYMENT_QUEUED',
                  'DELETE_QUEUED',
                  'STOP_QUEUED',
                  'RESTART_QUEUED',
                  () => null
                )
                .otherwise(
                  () =>
                    containerSource.tag && (
                      <>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item
                          icon={<Icon iconName="clock-rotate-left" />}
                          onSelect={() => deployTagVersion(service, containerSource)}
                        >
                          Deploy another version
                        </DropdownMenu.Item>
                      </>
                    )
                )
            }
          )
          .with(
            { service: P.intersection({ serviceType: 'HELM' }, { source: P.when(isHelmGitSource) }) },
            ({ service }) => {
              const gitRepository = service.source.git?.git_repository
              return (
                <>
                  <DropdownMenu.Separator />
                  {gitRepository && (
                    <DropdownMenu.Item
                      icon={<Icon iconName="clock-rotate-left" />}
                      onSelect={() => deployCommitVersion(service, gitRepository, 'Deploy another chart version')}
                    >
                      Deploy another chart version
                    </DropdownMenu.Item>
                  )}
                </>
              )
            }
          )
          .with(
            { service: P.intersection({ serviceType: 'HELM' }, { source: P.when(isHelmRepositorySource) }) },
            ({ service }) => {
              const repository = service.source.repository
              const version = repository?.chart_version
              return (
                version && (
                  <>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item
                      icon={<Icon iconName="clock-rotate-left" />}
                      onSelect={() => deployHelmChartVersion(service, repository, version)}
                    >
                      Deploy another chart version
                    </DropdownMenu.Item>
                  </>
                )
              )
            }
          )
          .with({ service: { serviceType: 'DATABASE' } }, () => null)
          .exhaustive()}
        {match(service)
          .with({ serviceType: 'HELM', values_override: P.when(isHelmGitValuesOverride) }, (service) => {
            const gitRepository = service.values_override.file.git.git_repository
            return (
              gitRepository && (
                <DropdownMenu.Item
                  icon={<Icon iconName="clock-rotate-left" />}
                  onSelect={() => deployHelmOverrideVersion(service, gitRepository)}
                >
                  Deploy another override version
                </DropdownMenu.Item>
              )
            )
          })
          .otherwise(() => null)}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

function MenuOtherActions({
  state,
  environment,
  service,
  environmentLogsLink,
}: {
  state: StateEnum
  environment: Environment
  service: AnyService
  environmentLogsLink: string
}) {
  const {
    id: environmentId,
    project: { id: projectId },
    organization: { id: organizationId },
  } = environment
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { mutateAsync: deleteService } = useDeleteService({ organizationId, environmentId })

  const [, copyToClipboard] = useCopyToClipboard()
  const copyContent = `Cluster ID: ${environment?.cluster_id}\nOrganization ID: ${organizationId}\nProject ID: ${projectId}\nEnvironment ID: ${environmentId}\nService ID: ${service.id}`

  const mutationDelete = async () => {
    openModalConfirmation({
      title: 'Delete service',
      name: service.name,
      isDelete: true,
      action: async () => {
        try {
          await deleteService({ serviceId: service.id, serviceType: service.serviceType })
          navigate(SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_GENERAL_URL)
        } catch (error) {
          console.error(error)
        }
      },
    })
  }

  const openServiceCloneModal = () => {
    openModal({
      content: (
        <ServiceCloneModal
          onClose={closeModal}
          organizationId={organizationId}
          projectId={projectId}
          serviceId={service.id}
        />
      ),
      options: {
        fakeModal: true,
      },
    })
  }

  const editCodeUrl = match(service)
    .with(
      { serviceType: 'APPLICATION' },
      {
        serviceType: 'JOB',
        source: P.when(isJobGitSource),
      },
      {
        serviceType: 'HELM',
        source: P.when(isHelmGitSource),
      },
      (service) => {
        const gitRepository = match(service)
          .with({ serviceType: 'APPLICATION' }, ({ git_repository }) => git_repository)
          .with({ serviceType: 'JOB' }, ({ source }) => source.docker?.git_repository)
          .with({ serviceType: 'HELM' }, ({ source }) => source.git?.git_repository)
          .exhaustive()

        return urlCodeEditor(gitRepository)
      }
    )
    .otherwise(() => null)

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <ActionToolbar.Button aria-label="Other actions">
          <Tooltip content="Other actions">
            <div className="flex h-full w-full items-center justify-center">
              <Icon iconName="ellipsis-v" />
            </div>
          </Tooltip>
        </ActionToolbar.Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item icon={<Icon iconName="scroll" />} asChild>
          <Link className="gap-0" to={environmentLogsLink + SERVICE_LOGS_URL(service.id)} state={{ prevUrl: pathname }}>
            Logs
          </Link>
        </DropdownMenu.Item>
        {editCodeUrl && (
          <a href={editCodeUrl} target="_blank" rel="noreferrer">
            <DropdownMenu.Item icon={<Icon iconName="code" />}>Edit code</DropdownMenu.Item>
          </a>
        )}
        <DropdownMenu.Item icon={<Icon iconName="clock-rotate-left" />} asChild>
          <Link
            className="gap-0"
            to={AUDIT_LOGS_PARAMS_URL(organizationId, {
              targetId: service.id,
              targetType: service.serviceType,
              projectId,
              environmentId,
            })}
          >
            See audit logs
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item icon={<Icon iconName="copy" />} onSelect={() => copyToClipboard(copyContent)}>
          Copy identifiers
        </DropdownMenu.Item>
        <DropdownMenu.Item icon={<Icon iconName="gear" />} asChild>
          <Link
            className="gap-0"
            to={match(service?.serviceType)
              .with(
                'DATABASE',
                () =>
                  `${DATABASE_URL(
                    organizationId,
                    projectId,
                    environmentId,
                    service.id
                  )}${DATABASE_SETTINGS_URL}${DATABASE_SETTINGS_GENERAL_URL}`
              )
              .otherwise(
                () =>
                  `${APPLICATION_URL(
                    organizationId,
                    projectId,
                    environmentId,
                    service.id
                  )}${APPLICATION_SETTINGS_URL}${APPLICATION_SETTINGS_GENERAL_URL}`
              )}
          >
            Open settings
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item icon={<Icon iconName="copy" />} onSelect={() => openServiceCloneModal()}>
          Clone
        </DropdownMenu.Item>
        {isDeleteAvailable(state) && (
          <>
            <DropdownMenu.Separator />
            <DropdownMenu.Item color="red" icon={<Icon iconName="trash" />} onSelect={mutationDelete}>
              Delete service
            </DropdownMenu.Item>
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export function ServiceActionToolbar({
  environment,
  serviceId,
  shellAction,
  variant = 'default',
}: {
  environment: Environment
  serviceId: string
  variant?: ActionToolbarVariant
  shellAction?: () => void
}) {
  const { pathname } = useLocation()
  const { data: service } = useService({ environmentId: environment.id, serviceId })
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId: environment.id, serviceId })

  if (!service || !deploymentStatus)
    return <Skeleton height={variant === 'default' ? 36 : 28} width={variant === 'default' ? 184 : 67} />

  const environmentLogsLink = ENVIRONMENT_LOGS_URL(environment.organization.id, environment.project.id, environment.id)

  return (
    <ActionToolbar.Root>
      <MenuManageDeployment
        deploymentStatus={deploymentStatus}
        environment={environment}
        service={service}
        environmentLogsLink={environmentLogsLink}
        variant={variant}
      />
      {variant === 'default' && (
        <>
          <Tooltip content="Logs">
            <ActionToolbar.Button asChild>
              <Link to={environmentLogsLink + SERVICE_LOGS_URL(service.id)} state={{ prevUrl: pathname }}>
                <Icon iconName="scroll" />
              </Link>
            </ActionToolbar.Button>
          </Tooltip>
          {shellAction && (
            <Tooltip content="Qovery cloud shell">
              <ActionToolbar.Button onClick={shellAction}>
                <Icon iconName="terminal" />
              </ActionToolbar.Button>
            </Tooltip>
          )}
          <MenuOtherActions
            state={deploymentStatus.state}
            environment={environment}
            service={service}
            environmentLogsLink={environmentLogsLink}
          />
        </>
      )}
    </ActionToolbar.Root>
  )
}

export default ServiceActionToolbar
