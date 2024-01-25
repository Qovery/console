import { type Environment, OrganizationEventTargetType, StateEnum } from 'qovery-typescript-axios'
import { useNavigate, useParams } from 'react-router-dom'
import { AUDIT_LOGS_PARAMS_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
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
  isStopAvailable,
} from '@qovery/shared/util-js'
import { CreateCloneEnvironmentModal } from '../create-clone-environment-modal/create-clone-environment-modal'
import { useCancelDeploymentEnvironment } from '../hooks/use-cancel-deployment-environment/use-cancel-deployment-environment'
import { useDeleteEnvironment } from '../hooks/use-delete-environment/use-delete-environment'
import { useDeployEnvironment } from '../hooks/use-deploy-environment/use-deploy-environment'
import { useDeploymentStatus } from '../hooks/use-deployment-status/use-deployment-status'
import { useStopEnvironment } from '../hooks/use-stop-environment/use-stop-environment'
import { TerraformExportModal } from '../terraform-export-modal/terraform-export-modal'
import { UpdateAllModal } from '../update-all-modal/update-all-modal'

function MenuManageDeployment({
  environment,
  state,
  organizationId,
}: {
  environment: Environment
  state: StateEnum
  organizationId: string
}) {
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
      content: (
        <UpdateAllModal
          organizationId={organizationId}
          environmentId={environment.id}
          projectId={environment.project.id}
        />
      ),
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
            <div className="flex items-center w-full h-full">
              <Icon name={IconAwesomeEnum.PLAY} className="mr-3" />
              <Icon name={IconAwesomeEnum.ANGLE_DOWN} />
            </div>
          </Tooltip>
        </ActionToolbar.Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {isCancelBuildAvailable(state) && (
          <DropdownMenu.Item icon={<Icon name={IconAwesomeEnum.XMARK} />} onClick={mutationCancelDeployment}>
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
        {isStopAvailable(state) && (
          <DropdownMenu.Item icon={<Icon name={IconAwesomeEnum.CIRCLE_STOP} />} onClick={mutationStop}>
            Stop
          </DropdownMenu.Item>
        )}
        <DropdownMenu.Separator />
        <DropdownMenu.Item icon={<Icon name={IconAwesomeEnum.ROTATE} />} onClick={openUpdateAllModal}>
          Deploy latest version for..
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

function MenuOtherActions({
  state,
  environment,
  organizationId,
}: {
  state: StateEnum
  environment: Environment
  organizationId: string
}) {
  const navigate = useNavigate()
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { mutate: deleteEnvironment } = useDeleteEnvironment({ projectId: environment.project.id })
  const [, copyToClipboard] = useCopyToClipboard()
  const copyContent = `Cluster ID: ${environment.cluster_id}\nOrganization ID: ${organizationId}\nProject ID: ${environment.project.id}\nEnvironment ID: ${environment.id}`

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
          organizationId={organizationId}
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
            <div className="flex items-center w-full h-full">
              <Icon name={IconAwesomeEnum.ELLIPSIS_V} />
            </div>
          </Tooltip>
        </ActionToolbar.Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          icon={<Icon name={IconAwesomeEnum.SCROLL} />}
          onClick={() => navigate(ENVIRONMENT_LOGS_URL(organizationId, environment.project.id, environment.id))}
        >
          Logs
        </DropdownMenu.Item>
        <DropdownMenu.Item
          icon={<Icon name={IconAwesomeEnum.CLOCK_ROTATE_LEFT} />}
          onClick={() =>
            navigate(
              AUDIT_LOGS_PARAMS_URL(organizationId, {
                targetType: OrganizationEventTargetType.ENVIRONMENT,
                projectId: environment.project.id,
                targetId: environment.id,
              })
            )
          }
        >
          See audit logs
        </DropdownMenu.Item>
        <DropdownMenu.Item icon={<Icon name={IconAwesomeEnum.COPY} />} onClick={() => copyToClipboard(copyContent)}>
          Copy identifier
        </DropdownMenu.Item>
        <DropdownMenu.Item icon={<Icon name={IconAwesomeEnum.FILE_EXPORT} />} onClick={openTerraformExportModal}>
          Export as Terraform
        </DropdownMenu.Item>
        <DropdownMenu.Item icon={<Icon name={IconAwesomeEnum.COPY} />} onClick={openCloneModal}>
          Clone
        </DropdownMenu.Item>
        {isDeleteAvailable(state) && (
          <>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              color="red"
              icon={<Icon name={IconAwesomeEnum.TRASH} />}
              onClick={mutationDeleteEnvironment}
            >
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
  hasServices?: boolean
}

export function EnvironmentActionToolbar({ environment, hasServices = false }: EnvironmentActionToolbarProps) {
  const navigate = useNavigate()
  const { organizationId = '' } = useParams()
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId: environment.id })

  if (!deploymentStatus) return <Skeleton height={32} width={115} />

  return (
    <ActionToolbar.Root>
      {hasServices && (
        <MenuManageDeployment
          environment={environment}
          state={deploymentStatus.state}
          organizationId={organizationId}
        />
      )}
      <Tooltip content="Logs">
        <ActionToolbar.Button
          onClick={() => navigate(ENVIRONMENT_LOGS_URL(organizationId, environment.project.id, environment.id))}
        >
          <Icon name={IconAwesomeEnum.SCROLL} />
        </ActionToolbar.Button>
      </Tooltip>
      <MenuOtherActions environment={environment} state={deploymentStatus.state} organizationId={organizationId} />
    </ActionToolbar.Root>
  )
}

export default EnvironmentActionToolbar
