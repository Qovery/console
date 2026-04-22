import { useNavigate } from '@tanstack/react-router'
import {
  type Environment,
  EnvironmentDeploymentStatusEnum,
  type EnvironmentStatus,
  OrganizationEventTargetType,
  StateEnum,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useServices } from '@qovery/domains/services/feature'
import { ENVIRONMENT_LOGS_URL, ENVIRONMENT_STAGES_URL, OVERVIEW_URL } from '@qovery/shared/routes'
import { Button, DropdownMenu, Icon, Link, Skeleton, Tooltip, useModal, useModalConfirmation } from '@qovery/shared/ui'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import {
  isCancelBuildAvailable,
  isDeleteAvailable,
  isDeployAvailable,
  isRedeployAvailable,
  isStopAvailable,
} from '@qovery/shared/util-js'
import { CreateCloneEnvironmentModal } from '../create-clone-environment-modal/create-clone-environment-modal'
import { useCancelDeploymentEnvironment } from '../hooks/use-cancel-deployment-environment/use-cancel-deployment-environment'
import { useDeleteEnvironment } from '../hooks/use-delete-environment/use-delete-environment'
import { useDeployEnvironment } from '../hooks/use-deploy-environment/use-deploy-environment'
import { useDeploymentStatus } from '../hooks/use-deployment-status/use-deployment-status'
import { useServiceCount } from '../hooks/use-service-count/use-service-count'
import { useStopEnvironment } from '../hooks/use-stop-environment/use-stop-environment'
import useUninstallEnvironment from '../hooks/use-uninstall-environment/use-uninstall-environment'
import { TerraformExportModal } from '../terraform-export-modal/terraform-export-modal'
import { UpdateAllModal } from '../update-all-modal/update-all-modal'

type ActionToolbarVariant = 'default' | 'header'

export function MenuManageDeployment({
  environment,
  deploymentStatus,
  variant = 'default',
}: {
  environment: Environment
  deploymentStatus: EnvironmentStatus
  variant?: ActionToolbarVariant
}) {
  const state = deploymentStatus.state
  const environmentNeedUpdate = deploymentStatus?.deployment_status !== EnvironmentDeploymentStatusEnum.UP_TO_DATE
  const displayYellowColor = environmentNeedUpdate && state !== 'STOPPED'

  const tooltipService = (content: string) => (
    <Tooltip side="bottom" content={content}>
      <Icon iconName="circle-exclamation" iconStyle="regular" />
    </Tooltip>
  )

  const tooltipEnvironmentNeedUpdate =
    displayYellowColor && tooltipService('Environment has changed and needs to be applied')

  const { openModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const logsLink =
    ENVIRONMENT_LOGS_URL(environment.organization.id, environment.project.id, environment.id) + ENVIRONMENT_STAGES_URL()

  const { mutate: deployEnvironment } = useDeployEnvironment({
    projectId: environment.project.id,
    logsLink,
  })
  const { mutate: stopEnvironment } = useStopEnvironment({ projectId: environment.project.id, logsLink })
  const { mutate: uninstallEnvironment } = useUninstallEnvironment({ projectId: environment.project.id, logsLink })
  const { mutate: cancelDeploymentEnvironment } = useCancelDeploymentEnvironment({
    projectId: environment.project.id,
    logsLink,
  })
  // XXX: Required to display a warning for managed Database
  // https://qovery.atlassian.net/jira/software/projects/FRT/boards/23?selectedIssue=FRT-1416
  const { data: services = [] } = useServices({ environmentId: environment.id })

  const mutationDeploy = () =>
    deployEnvironment({
      environmentId: environment.id,
    })

  const mutationRedeploy = () => {
    deployEnvironment({ environmentId: environment.id })
  }

  const mutationStop = () => {
    const hasDatabase = services.some(
      (service) =>
        service.serviceType === 'DATABASE' &&
        service.mode === 'MANAGED' &&
        (service.type === 'POSTGRESQL' || service.type === 'MYSQL')
    )

    openModalConfirmation({
      title: 'Confirm stop',
      description: 'To confirm the stopping of your environment, please type the name:',
      warning: hasDatabase
        ? "RDS instances are automatically restarted by AWS after 7 days. After 7 days, Qovery won't pause it again for you."
        : null,
      name: environment.name,
      action: () => stopEnvironment({ environmentId: environment.id }),
    })
  }

  const mutationUninstall = () => {
    openModalConfirmation({
      title: 'Confirm uninstall',
      description: 'To confirm the uninstall of your environment, please type the name:',
      warning: 'Uninstall delete all compute and data of your service',
      name: environment.name,
      action: () => uninstallEnvironment({ environmentId: environment.id }),
    })
  }

  const mutationCancelDeployment = () => {
    openModalConfirmation({
      title: 'Confirm cancel',
      description:
        'Stopping a deployment may take a while, as a safe point needs to be reached. Some operations cannot be stopped (i.e: terraform actions) and need to be completed before stopping the deployment. Any action performed before won’t be rolled back. To confirm the cancellation of your deployment, please type the name of the environment:',
      name: environment.name,
      action: () => cancelDeploymentEnvironment({ environmentId: environment.id }),
    })
  }

  const openUpdateAllModal = () => {
    openModal({
      content: <UpdateAllModal environment={environment} />,
      options: {
        width: 676,
      },
    })
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          aria-label="Manage Deployment"
          color={displayYellowColor ? 'yellow' : variant === 'header' ? 'brand' : 'neutral'}
          variant={variant === 'header' ? 'solid' : 'outline'}
          size={variant === 'header' ? 'md' : 'sm'}
          iconOnly={variant === 'default'}
        >
          <Tooltip content="Manage Deployment">
            <div className="flex h-full w-full items-center justify-center gap-1.5">
              {match(state)
                .with('DEPLOYING', 'RESTARTING', 'BUILDING', 'DELETING', 'CANCELING', 'STOPPING', () => (
                  <Icon iconName="loader" className="animate-spin" />
                ))
                .with('DEPLOYMENT_QUEUED', 'DELETE_QUEUED', 'STOP_QUEUED', 'RESTART_QUEUED', () => (
                  <Icon iconName="clock" iconStyle="regular" />
                ))
                .otherwise(() => (
                  <Icon iconName="rocket" />
                ))}
              {variant === 'header' && (
                <>
                  Deploy
                  <Icon iconName="chevron-down" />
                </>
              )}
            </div>
          </Tooltip>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        {isCancelBuildAvailable(state) && (
          <DropdownMenu.Item icon={<Icon iconName="xmark" />} onSelect={mutationCancelDeployment}>
            {state === StateEnum.DELETE_QUEUED || state === StateEnum.DELETING ? 'Cancel delete' : 'Cancel deployment'}
          </DropdownMenu.Item>
        )}
        {isDeployAvailable(state) && (
          <DropdownMenu.Item
            icon={<Icon iconName="play" />}
            onSelect={mutationDeploy}
            color={displayYellowColor ? 'yellow' : 'brand'}
          >
            <div className="flex w-full items-center justify-between">
              Deploy
              {tooltipEnvironmentNeedUpdate}
            </div>
          </DropdownMenu.Item>
        )}
        {isRedeployAvailable(state) && (
          <DropdownMenu.Item
            icon={<Icon iconName="rotate-right" />}
            onSelect={mutationRedeploy}
            color={displayYellowColor ? 'yellow' : 'brand'}
          >
            <div className="flex w-full items-center justify-between">
              Redeploy
              {tooltipEnvironmentNeedUpdate}
            </div>
          </DropdownMenu.Item>
        )}
        {isStopAvailable(state) && (
          <DropdownMenu.Item icon={<Icon iconName="circle-stop" />} onSelect={mutationStop}>
            <div className="flex w-full items-center justify-between">
              Stop
              {tooltipService('Stop compute resources *but* keep the data')}
            </div>
          </DropdownMenu.Item>
        )}
        {isDeleteAvailable(state) && (
          <DropdownMenu.Item icon={<Icon iconName="inbox-out" />} color="red" onSelect={mutationUninstall}>
            <div className="flex w-full items-center justify-between">
              Uninstall
              {tooltipService('Delete all resources and associated data *but* keep the services configuration')}
            </div>
          </DropdownMenu.Item>
        )}
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
            () => null
          )
          .otherwise(() => (
            <>
              <DropdownMenu.Separator />
              <DropdownMenu.Item icon={<Icon iconName="rotate" />} onSelect={openUpdateAllModal}>
                Deploy latest version for..
              </DropdownMenu.Item>
            </>
          ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export function MenuOtherActions({
  state,
  environment,
  variant = 'default',
}: {
  state: StateEnum
  environment: Environment
  variant?: ActionToolbarVariant
}) {
  const navigate = useNavigate()
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { mutate: deleteEnvironment } = useDeleteEnvironment({ projectId: environment.project.id })
  const [, copyToClipboard] = useCopyToClipboard()
  const copyContent = `Cluster ID: ${environment.cluster_id}\nOrganization ID: ${environment.organization.id}\nProject ID: ${environment.project.id}\nEnvironment ID: ${environment.id}`

  const mutationDeleteEnvironment = () => {
    openModalConfirmation({
      title: 'Delete environment',
      name: environment.name,
      confirmationMethod: 'action',
      action: () =>
        deleteEnvironment(
          { environmentId: environment.id },
          {
            onSuccess: () => {
              navigate({ to: OVERVIEW_URL(environment.organization.id, environment.project.id) })
            },
          }
        ),
    })
  }

  const openTerraformExportModal = () => {
    openModal({
      content: <TerraformExportModal environmentId={environment.id} />,
    })
  }

  const openCloneModal = () => {
    openModal({
      content: (
        <CreateCloneEnvironmentModal
          onClose={closeModal}
          projectId={environment.project.id}
          organizationId={environment.organization.id}
          environmentToClone={environment}
        />
      ),
      options: {
        fakeModal: true,
      },
    })
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          aria-label="Other actions"
          color="neutral"
          size={variant === 'header' ? 'md' : 'sm'}
          iconOnly
          variant="outline"
        >
          <Tooltip content="Other actions">
            <div className="flex h-full w-full items-center justify-center">
              <Icon iconName="ellipsis-v" iconStyle="solid" />
            </div>
          </Tooltip>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item icon={<Icon iconName="clock-rotate-left" />} asChild>
          <Link
            className="gap-0"
            to="/organization/$organizationId/audit-logs"
            params={{
              organizationId: environment.organization.id,
            }}
            search={{
              targetType: OrganizationEventTargetType.ENVIRONMENT,
              projectId: environment.project.id,
              targetId: environment.id,
            }}
          >
            See audit logs
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item icon={<Icon iconName="copy" />} onSelect={() => copyToClipboard(copyContent)}>
          Copy identifier
        </DropdownMenu.Item>
        <DropdownMenu.Item icon={<Icon iconName="file-export" />} onSelect={openTerraformExportModal}>
          Export as Terraform
        </DropdownMenu.Item>
        <DropdownMenu.Item icon={<Icon iconName="copy" />} onSelect={openCloneModal}>
          Clone
        </DropdownMenu.Item>
        {isDeleteAvailable(state) && (
          <>
            <DropdownMenu.Separator />
            <DropdownMenu.Item color="red" icon={<Icon iconName="trash" />} onSelect={mutationDeleteEnvironment}>
              Delete environment
            </DropdownMenu.Item>
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export interface EnvironmentActionToolbarProps {
  environment: Environment
  variant?: ActionToolbarVariant
}

export function EnvironmentActionToolbar({ environment, variant = 'default' }: EnvironmentActionToolbarProps) {
  const { data: countServices, isFetched: isFetchedServices } = useServiceCount({ environmentId: environment.id })

  const { data: deploymentStatus } = useDeploymentStatus({ environmentId: environment.id })
  const hasServices = Boolean(countServices)

  if (!deploymentStatus || !isFetchedServices)
    return <Skeleton height={variant === 'default' ? 36 : 28} width={variant === 'default' ? 144 : 67} />

  return (
    <div className="flex items-center gap-2">
      {hasServices && (
        <MenuManageDeployment environment={environment} deploymentStatus={deploymentStatus} variant={variant} />
      )}
      {variant === 'default' && (
        <>
          <Tooltip content="Pipeline">
            <Link
              as="button"
              to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments"
              params={{
                organizationId: environment.organization.id,
                projectId: environment.project.id,
                environmentId: environment.id,
              }}
              className="w-7"
              size="xs"
              color="neutral"
              variant="outline"
            >
              <Icon iconName="timeline" />
            </Link>
          </Tooltip>
          <MenuOtherActions environment={environment} state={deploymentStatus.state} />
        </>
      )}
    </div>
  )
}

export default EnvironmentActionToolbar
