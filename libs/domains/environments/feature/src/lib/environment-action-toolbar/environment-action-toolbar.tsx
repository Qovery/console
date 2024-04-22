import { type Environment, OrganizationEventTargetType, StateEnum } from 'qovery-typescript-axios'
import { useLocation, useNavigate } from 'react-router-dom'
import { UpdateAllModal, useServices } from '@qovery/domains/services/feature'
import { AUDIT_LOGS_PARAMS_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { ActionToolbar, DropdownMenu, Icon, Skeleton, Tooltip, useModal, useModalConfirmation } from '@qovery/shared/ui'
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
import { useStopEnvironment } from '../hooks/use-stop-environment/use-stop-environment'
import { TerraformExportModal } from '../terraform-export-modal/terraform-export-modal'

function MenuManageDeployment({ environment, state }: { environment: Environment; state: StateEnum }) {
  const { openModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { mutate: deployEnvironment } = useDeployEnvironment({ projectId: environment.project.id })
  const { mutate: stopEnvironment } = useStopEnvironment({ projectId: environment.project.id })
  const { mutate: cancelDeploymentEnvironment } = useCancelDeploymentEnvironment({ projectId: environment.project.id })

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
        <ActionToolbar.Button aria-label="Manage Deployment">
          <Tooltip content="Manage Deployment">
            <div className="flex items-center justify-center w-full h-full">
              <Icon iconName="play" className="mr-4" />
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
        <DropdownMenu.Separator />
        <DropdownMenu.Item icon={<Icon iconName="rotate" />} onSelect={openUpdateAllModal}>
          Deploy latest version for..
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

function MenuOtherActions({ state, environment }: { state: StateEnum; environment: Environment }) {
  const navigate = useNavigate()
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
    })
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <ActionToolbar.Button aria-label="Other actions">
          <Tooltip content="Other actions">
            <div className="flex items-center justify-center w-full h-full">
              <Icon iconName="ellipsis-v" iconStyle="solid" />
            </div>
          </Tooltip>
        </ActionToolbar.Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          icon={<Icon iconName="scroll" />}
          onSelect={() =>
            navigate(ENVIRONMENT_LOGS_URL(environment.organization.id, environment.project.id, environment.id), {
              state: { prevUrl: pathname },
            })
          }
        >
          Logs
        </DropdownMenu.Item>
        <DropdownMenu.Item
          icon={<Icon iconName="clock-rotate-left" />}
          onSelect={() =>
            navigate(
              AUDIT_LOGS_PARAMS_URL(environment.organization.id, {
                targetType: OrganizationEventTargetType.ENVIRONMENT,
                projectId: environment.project.id,
                targetId: environment.id,
              })
            )
          }
        >
          See audit logs
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
}

export function EnvironmentActionToolbar({ environment }: EnvironmentActionToolbarProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { data: services } = useServices({ environmentId: environment.id })
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId: environment.id })
  const hasServices = Boolean(services?.length)

  if (!deploymentStatus) return <Skeleton height={32} width={115} />

  return (
    <ActionToolbar.Root>
      {hasServices && <MenuManageDeployment environment={environment} state={deploymentStatus.state} />}
      <Tooltip content="Logs">
        <ActionToolbar.Button
          onClick={() =>
            navigate(ENVIRONMENT_LOGS_URL(environment.organization.id, environment.project.id, environment.id), {
              state: { prevUrl: pathname },
            })
          }
        >
          <Icon iconName="scroll" />
        </ActionToolbar.Button>
      </Tooltip>
      <MenuOtherActions environment={environment} state={deploymentStatus.state} />
    </ActionToolbar.Root>
  )
}

export default EnvironmentActionToolbar
