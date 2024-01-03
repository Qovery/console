import { type Environment, StateEnum } from 'qovery-typescript-axios'
import { useNavigate, useParams } from 'react-router-dom'
import { P, match } from 'ts-pattern'
import { useActionCancelEnvironment } from '@qovery/domains/environment'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { type AnyService } from '@qovery/domains/services/data-access'
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  DeployOtherCommitModalFeature,
  DeployOtherTagModalFeature,
  ForceRunModalFeature,
} from '@qovery/shared/console-shared'
import { isHelmGitSource, isJobContainerSource, isJobGitSource } from '@qovery/shared/enums'
import {
  APPLICATION_SETTINGS_GENERAL_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_URL,
  AUDIT_LOGS_PARAMS_URL,
  DEPLOYMENT_LOGS_URL,
  ENVIRONMENT_LOGS_URL,
  SERVICES_GENERAL_URL,
  SERVICES_URL,
  SERVICE_LOGS_URL,
} from '@qovery/shared/routes'
import {
  ActionToolbar,
  DropdownMenu,
  Icon,
  IconAwesomeEnum,
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
import { useDeleteService } from '../hooks/use-delete-service/use-delete-service'
import { useDeployService } from '../hooks/use-deploy-service/use-deploy-service'
import { useDeploymentStatus } from '../hooks/use-deployment-status/use-deployment-status'
import { useRedeployService } from '../hooks/use-redeploy-service/use-redeploy-service'
import { useRestartService } from '../hooks/use-restart-service/use-restart-service'
import { useRunningStatus } from '../hooks/use-running-status/use-running-status'
import { useService } from '../hooks/use-service/use-service'
import { useStopService } from '../hooks/use-stop-service/use-stop-service'
import ServiceCloneModal from '../service-clone-modal/service-clone-modal'

function MenuManageDeployment({
  state,
  environment,
  service,
  environmentLogsLink,
  organizationId,
  projectId,
}: {
  state: StateEnum
  environment: Environment
  service: AnyService
  environmentLogsLink: string
  organizationId: string
  projectId: string
}) {
  const navigate = useNavigate()
  const { openModalConfirmation } = useModalConfirmation()
  const { openModal } = useModal()

  const { data: runningState } = useRunningStatus({ environmentId: environment.id, serviceId: service.id })
  const { mutate: deployService } = useDeployService({ environmentId: environment.id })
  const { mutate: redeployService } = useRedeployService({ environmentId: environment.id })
  const { mutate: restartService } = useRestartService({ environmentId: environment.id })
  const { mutate: stopService } = useStopService({ environmentId: environment.id })
  const { mutate: cancelBuild } = useActionCancelEnvironment(
    environment.project.id,
    environment.id,
    true,
    undefined,
    () => navigate(environmentLogsLink + DEPLOYMENT_LOGS_URL(service.id))
  )

  const mutationDeploy = () => deployService({ serviceId: service.id, serviceType: service.serviceType })

  const mutationRedeploy = () => {
    openModalConfirmation({
      mode: environment?.mode,
      title: 'Confirm redeploy',
      description: 'To confirm the redeploy of your service, please type the name:',
      name: service.name,
      action: () => redeployService({ serviceId: service.id, serviceType: service.serviceType }),
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
    openModalConfirmation({
      mode: environment.mode,
      title: 'Cancel deployment',
      description:
        'Stopping a deployment for your service will stop the deployment of the whole environment. It may take a while, as a safe point needs to be reached. Some operations cannot be stopped (i.e: terraform actions) and need to be completed before stopping the deployment. Any action performed before won’t be rolled back. To confirm the cancellation of your deployment, please type the name of the application:',
      name: service.name,
      action: () => cancelBuild(),
    })
  }

  const deployOtherCommitModal = () => {
    openModal({
      content: (
        <DeployOtherCommitModalFeature
          organizationId={organizationId}
          projectId={projectId}
          environmentId={service.environment.id}
          applicationId={service.id}
        />
      ),
      options: { width: 596 },
    })
  }

  const deployOtherTagModal = () => {
    openModal({
      content: (
        <DeployOtherTagModalFeature
          organizationId={organizationId}
          projectId={projectId}
          environmentId={service.environment.id}
          applicationId={service.id}
        />
      ),
      options: { width: 596 },
    })
  }

  const forceRunModal = () => {
    openModal({
      content: (
        <ForceRunModalFeature
          organizationId={organizationId}
          projectId={projectId}
          environmentId={service.environment.id}
          applicationId={service.id}
        />
      ),
    })
  }

  const displayOtherCommitItem = match(service)
    .with(
      { serviceType: 'APPLICATION' },
      {
        serviceType: 'JOB',
        source: P.when(isJobGitSource),
      },
      () => true
    )
    .otherwise(() => false)

  const displayOtherTagItem = match(service)
    .with(
      {
        serviceType: 'CONTAINER',
      },
      {
        serviceType: 'JOB',
        source: P.when(isJobContainerSource),
      },
      () => true
    )
    .otherwise(() => false)

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <ActionToolbar.Button aria-label="Manage Deployment">
          <Tooltip content="Manage Deployment">
            <div className="flex items-center w-full h-full">
              <Icon name={IconAwesomeEnum.PLAY} className="mr-3" />
              <Icon name={IconAwesomeEnum.ANGLE_DOWN} />
            </div>
          </Tooltip>
        </ActionToolbar.Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {isCancelBuildAvailable(state) && (
          <DropdownMenu.Item icon={<Icon name={IconAwesomeEnum.XMARK} />} onClick={mutationCancelBuild}>
            {state === StateEnum.DELETE_QUEUED || state === StateEnum.DELETING ? 'Cancel delete' : 'Cancel deployment'}
          </DropdownMenu.Item>
        )}
        {isDeployAvailable(state) && (
          <DropdownMenu.Item icon={<Icon name={IconAwesomeEnum.PLAY} />} onClick={mutationDeploy}>
            Deploy
          </DropdownMenu.Item>
        )}
        {isRedeployAvailable(state) && (
          <DropdownMenu.Item icon={<Icon name={IconAwesomeEnum.ROTATE_RIGHT} />} onClick={mutationRedeploy}>
            Redeploy
          </DropdownMenu.Item>
        )}
        {runningState && service.serviceType !== 'JOB' && isRestartAvailable(runningState.state, state) && (
          <DropdownMenu.Item
            icon={<Icon name={IconAwesomeEnum.ROTATE_RIGHT} />}
            onClick={() => restartService({ serviceId: service.id, serviceType: service.serviceType })}
          >
            Restart Service
          </DropdownMenu.Item>
        )}
        {service.serviceType === 'JOB' && (
          <DropdownMenu.Item icon={<Icon name={IconAwesomeEnum.PLAY} />} onClick={forceRunModal}>
            Force Run
          </DropdownMenu.Item>
        )}
        {isStopAvailable(state) && (
          <DropdownMenu.Item icon={<Icon name={IconAwesomeEnum.CIRCLE_STOP} />} onClick={mutationStop}>
            Stop
          </DropdownMenu.Item>
        )}
        {displayOtherCommitItem && (
          <>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              icon={<Icon name={IconAwesomeEnum.CLOCK_ROTATE_LEFT} />}
              onClick={() => deployOtherCommitModal()}
            >
              Deploy other version
            </DropdownMenu.Item>
          </>
        )}
        {displayOtherTagItem && (
          <>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              icon={<Icon name={IconAwesomeEnum.CLOCK_ROTATE_LEFT} />}
              onClick={() => deployOtherTagModal()}
            >
              Deploy other version
            </DropdownMenu.Item>
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

function MenuOtherActions({
  state,
  organizationId,
  projectId,
  environmentId,
  service,
  environmentLogsLink,
}: {
  state: StateEnum
  organizationId: string
  projectId: string
  environmentId: string
  service: AnyService
  environmentLogsLink: string
}) {
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const navigate = useNavigate()
  const { mutateAsync: deleteService } = useDeleteService({ environmentId })

  const [, copyToClipboard] = useCopyToClipboard()
  const copyContent = `Organization ID: ${organizationId}\nProject ID: ${projectId}\nEnvironment ID: ${environmentId}\nService ID: ${service.id}`

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
            <div className="flex items-center w-full h-full">
              <Icon name={IconAwesomeEnum.ELLIPSIS_V} />
            </div>
          </Tooltip>
        </ActionToolbar.Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          icon={<Icon name={IconAwesomeEnum.SCROLL} />}
          onClick={() => navigate(environmentLogsLink + SERVICE_LOGS_URL(service.id))}
        >
          Logs
        </DropdownMenu.Item>
        {editCodeUrl && (
          <a href={editCodeUrl} target="_blank" rel="noreferrer">
            <DropdownMenu.Item icon={<Icon name={IconAwesomeEnum.CODE} />}>Edit code</DropdownMenu.Item>
          </a>
        )}
        <DropdownMenu.Item
          icon={<Icon name={IconAwesomeEnum.COPY} />}
          onClick={() =>
            navigate(
              AUDIT_LOGS_PARAMS_URL(organizationId, {
                targetId: service.id,
                targetType: service.serviceType,
                projectId,
                environmentId,
              })
            )
          }
        >
          See audit logs
        </DropdownMenu.Item>
        <DropdownMenu.Item
          icon={<Icon name={IconAwesomeEnum.CLOCK_ROTATE_LEFT} />}
          onClick={() => copyToClipboard(copyContent)}
        >
          Copy identifiers
        </DropdownMenu.Item>
        <DropdownMenu.Item
          icon={<Icon name={IconAwesomeEnum.WHEEL} />}
          onClick={() =>
            navigate(
              `${APPLICATION_URL(organizationId, projectId, environmentId, service.id)}${APPLICATION_SETTINGS_URL}`
            ) + APPLICATION_SETTINGS_GENERAL_URL
          }
        >
          Open settings
        </DropdownMenu.Item>
        <DropdownMenu.Item icon={<Icon name={IconAwesomeEnum.COPY} />} onClick={() => openServiceCloneModal()}>
          Clone
        </DropdownMenu.Item>
        {isDeleteAvailable(state) && (
          <>
            <DropdownMenu.Separator />
            <DropdownMenu.Item color="red" icon={<Icon name={IconAwesomeEnum.TRASH} />} onClick={mutationDelete}>
              Delete service
            </DropdownMenu.Item>
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export function ServiceActionToolbar({ serviceId }: { serviceId: string }) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()
  const { data: environment } = useEnvironment({ environmentId })
  const { data: service } = useService({ environmentId, serviceId })
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId, serviceId })

  if (!service || !deploymentStatus || !environment) return <Skeleton height={32} width={115} />

  const environmentLogsLink = ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId)

  return (
    <ActionToolbar.Root>
      <MenuManageDeployment
        state={deploymentStatus.state}
        environment={environment}
        service={service}
        environmentLogsLink={environmentLogsLink}
        organizationId={organizationId}
        projectId={projectId}
      />
      <Tooltip content="Logs">
        <ActionToolbar.Button onClick={() => navigate(environmentLogsLink + SERVICE_LOGS_URL(service.id))}>
          <Icon name={IconAwesomeEnum.SCROLL} />
        </ActionToolbar.Button>
      </Tooltip>
      <MenuOtherActions
        state={deploymentStatus.state}
        organizationId={organizationId}
        projectId={projectId}
        environmentId={environmentId}
        service={service}
        environmentLogsLink={environmentLogsLink}
      />
    </ActionToolbar.Root>
  )
}

export default ServiceActionToolbar
