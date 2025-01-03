import { type Environment, OrganizationEventTargetType, StateEnum } from 'qovery-typescript-axios'
import { useLocation } from 'react-router-dom'
import { match } from 'ts-pattern'
import { AUDIT_LOGS_PARAMS_URL, ENVIRONMENT_LOGS_URL, ENVIRONMENT_STAGES_URL } from '@qovery/shared/routes'
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
  isStopAvailable,
} from '@qovery/shared/util-js'
import { CreateCloneEnvironmentModal } from '../create-clone-environment-modal/create-clone-environment-modal'
import { useCancelDeploymentEnvironment } from '../hooks/use-cancel-deployment-environment/use-cancel-deployment-environment'
import { useDeleteEnvironment } from '../hooks/use-delete-environment/use-delete-environment'
import { useDeployEnvironment } from '../hooks/use-deploy-environment/use-deploy-environment'
import { useDeploymentStatus } from '../hooks/use-deployment-status/use-deployment-status'
import { useServiceCount } from '../hooks/use-service-count/use-service-count'
import { useStopEnvironment } from '../hooks/use-stop-environment/use-stop-environment'
import { TerraformExportModal } from '../terraform-export-modal/terraform-export-modal'
import { UpdateAllModal } from '../update-all-modal/update-all-modal'

type ActionToolbarVariant = 'default' | 'deployment'

function MenuManageDeployment({
  environment,
  state,
  variant,
}: {
  environment: Environment
  state: StateEnum
  variant: ActionToolbarVariant
}) {
  const { openModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const logsLink =
    ENVIRONMENT_LOGS_URL(environment.organization.id, environment.project.id, environment.id) + ENVIRONMENT_STAGES_URL()

  const { mutate: deployEnvironment } = useDeployEnvironment({
    projectId: environment.project.id,
    logsLink,
  })
  const { mutate: stopEnvironment } = useStopEnvironment({ projectId: environment.project.id, logsLink })
  const { mutate: cancelDeploymentEnvironment } = useCancelDeploymentEnvironment({
    projectId: environment.project.id,
    logsLink,
  })

  const mutationDeploy = () =>
    deployEnvironment({
      environmentId: environment.id,
    })

  const mutationRedeploy = () => {
    openModalConfirmation({
      mode: environment.mode,
      title: 'Confirm redeploy',
      description: 'To confirm the redeploy of your environment, please type the name:',
      name: environment.name,
      action: () => deployEnvironment({ environmentId: environment.id }),
    })
  }

  const mutationStop = () => {
    openModalConfirmation({
      mode: environment.mode,
      title: 'Confirm stop',
      description: 'To confirm the stopping of your environment, please type the name:',
      name: environment.name,
      action: () => stopEnvironment({ environmentId: environment.id }),
    })
  }

  const mutationCancelDeployment = () => {
    openModalConfirmation({
      mode: environment.mode,
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
        <ActionToolbar.Button
          aria-label="Manage Deployment"
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
          <DropdownMenu.Item icon={<Icon iconName="xmark" />} onSelect={mutationCancelDeployment}>
            {state === StateEnum.DELETE_QUEUED || state === StateEnum.DELETING ? 'Cancel delete' : 'Cancel deployment'}
          </DropdownMenu.Item>
        )}
        {isDeployAvailable(state) && (
          <DropdownMenu.Item icon={<Icon iconName="play" />} onSelect={mutationDeploy}>
            Deploy
          </DropdownMenu.Item>
        )}
        {isRedeployAvailable(state) && (
          <DropdownMenu.Item icon={<Icon iconName="rotate-right" />} onSelect={mutationRedeploy}>
            Redeploy
          </DropdownMenu.Item>
        )}
        {isStopAvailable(state) && (
          <DropdownMenu.Item icon={<Icon iconName="circle-stop" />} onSelect={mutationStop}>
            Stop
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

function MenuOtherActions({ state, environment }: { state: StateEnum; environment: Environment }) {
  const { pathname } = useLocation()
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { mutate: deleteEnvironment } = useDeleteEnvironment({ projectId: environment.project.id })
  const [, copyToClipboard] = useCopyToClipboard()
  const copyContent = `Cluster ID: ${environment.cluster_id}\nOrganization ID: ${environment.organization.id}\nProject ID: ${environment.project.id}\nEnvironment ID: ${environment.id}`

  const mutationDeleteEnvironment = () => {
    openModalConfirmation({
      title: 'Delete environment',
      name: environment.name,
      isDelete: true,
      action: () => deleteEnvironment({ environmentId: environment.id }),
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
        <ActionToolbar.Button aria-label="Other actions">
          <Tooltip content="Other actions">
            <div className="flex h-full w-full items-center justify-center">
              <Icon iconName="ellipsis-v" iconStyle="solid" />
            </div>
          </Tooltip>
        </ActionToolbar.Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item icon={<Icon iconName="timeline" />} asChild>
          <Link
            className="gap-0"
            to={ENVIRONMENT_LOGS_URL(environment.organization.id, environment.project.id, environment.id)}
            state={{ prevUrl: pathname }}
          >
            Logs
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item icon={<Icon iconName="clock-rotate-left" />} asChild>
          <Link
            className="gap-0"
            to={AUDIT_LOGS_PARAMS_URL(environment.organization.id, {
              targetType: OrganizationEventTargetType.ENVIRONMENT,
              projectId: environment.project.id,
              targetId: environment.id,
            })}
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
  const { pathname } = useLocation()
  const { data: countServices, isFetched: isFetchedServices } = useServiceCount({ environmentId: environment.id })

  const { data: deploymentStatus } = useDeploymentStatus({ environmentId: environment.id })
  const hasServices = Boolean(countServices)

  if (!deploymentStatus || !isFetchedServices)
    return <Skeleton height={variant === 'default' ? 36 : 28} width={variant === 'default' ? 144 : 67} />

  return (
    <ActionToolbar.Root>
      {hasServices && (
        <MenuManageDeployment environment={environment} state={deploymentStatus.state} variant={variant} />
      )}
      {variant === 'default' && (
        <>
          <Tooltip content="Logs">
            <ActionToolbar.Button asChild>
              <Link
                to={ENVIRONMENT_LOGS_URL(environment.organization.id, environment.project.id, environment.id)}
                state={{ prevUrl: pathname }}
              >
                <Icon iconName="timeline" />
              </Link>
            </ActionToolbar.Button>
          </Tooltip>
          <MenuOtherActions environment={environment} state={deploymentStatus.state} />
        </>
      )}
    </ActionToolbar.Root>
  )
}

export default EnvironmentActionToolbar
