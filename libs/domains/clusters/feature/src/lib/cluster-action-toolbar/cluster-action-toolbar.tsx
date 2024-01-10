import {
  type Cluster,
  type ClusterStatusGet,
  EnvironmentModeEnum,
  OrganizationEventTargetType,
} from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AUDIT_LOGS_PARAMS_URL, CLUSTER_SETTINGS_URL, CLUSTER_URL, INFRA_LOGS_URL } from '@qovery/shared/routes'
import {
  ActionToolbar,
  DropdownMenu,
  Icon,
  IconAwesomeEnum,
  Tooltip,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import {
  isDeleteAvailable,
  isDeployAvailable,
  isRedeployAvailable,
  isStopAvailable,
  isUpdateAvailable,
} from '@qovery/shared/util-js'
import { ClusterDeleteModal } from '../cluster-delete-modal/cluster-delete-modal'
import { useDeployCluster } from '../hooks/use-deploy-cluster/use-deploy-cluster'
import { useDownloadKubeconfig } from '../hooks/use-download-kubeconfig/use-download-kubeconfig'
import { useStopCluster } from '../hooks/use-stop-cluster/use-stop-cluster'

function MenuManageDeployment({
  cluster,
  clusterStatus,
  organizationId,
}: {
  cluster: Cluster
  clusterStatus: ClusterStatusGet
  organizationId: string
}) {
  const { openModalConfirmation } = useModalConfirmation()
  const { mutate: deployCluster } = useDeployCluster()
  const { mutate: stopCluster } = useStopCluster()

  if (
    !clusterStatus.status ||
    (!isDeployAvailable(clusterStatus?.status) &&
      !isDeleteAvailable(clusterStatus?.status) &&
      !isUpdateAvailable(clusterStatus?.status))
  ) {
    return null
  }

  const mutationDeploy = () =>
    deployCluster({
      organizationId,
      clusterId: cluster.id,
    })
  const mutationUpdate = () =>
    openModalConfirmation({
      mode: EnvironmentModeEnum.PRODUCTION,
      title: 'Confirm update',
      description: 'To confirm the update of your cluster, please type the name:',
      name: cluster.name,
      action: () =>
        deployCluster({
          organizationId,
          clusterId: cluster.id,
        }),
    })
  const mutationStop = () =>
    openModalConfirmation({
      mode: EnvironmentModeEnum.PRODUCTION,
      title: 'Confirm stop',
      description: 'To confirm the stop of your cluster, please type the name:',
      warning:
        'Please note that by stopping your cluster, some resources will still be used on your cloud provider account and still be added to your bill. To completely remove them, please use the “Remove” feature.',
      name: cluster.name,
      action: () =>
        stopCluster({
          organizationId,
          clusterId: cluster.id,
        }),
    })

  const entries: ReactNode[] = [
    isDeployAvailable(clusterStatus.status) && (
      <DropdownMenu.Item key="0" icon={<Icon name={IconAwesomeEnum.PLAY} />} onClick={mutationDeploy}>
        {clusterStatus.is_deployed ? 'Deploy' : 'Install'}
      </DropdownMenu.Item>
    ),
    isRedeployAvailable(clusterStatus.status) && (
      <DropdownMenu.Item key="1" icon={<Icon name={IconAwesomeEnum.ROTATE_RIGHT} />} onClick={mutationUpdate}>
        Update
      </DropdownMenu.Item>
    ),
    cluster.cloud_provider !== 'GCP' && isStopAvailable(clusterStatus.status) && (
      <DropdownMenu.Item key="2" icon={<Icon name={IconAwesomeEnum.CIRCLE_STOP} />} onClick={mutationStop}>
        Stop
      </DropdownMenu.Item>
    ),
  ].filter((e) => !!e)

  return entries.length > 0 ? (
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
      <DropdownMenu.Content>{entries.map((c) => c)}</DropdownMenu.Content>
    </DropdownMenu.Root>
  ) : null
}

function MenuOtherActions({
  cluster,
  clusterStatus,
  organizationId,
}: {
  cluster: Cluster
  clusterStatus: ClusterStatusGet
  organizationId: string
}) {
  const navigate = useNavigate()
  const { openModal } = useModal()
  const [, copyToClipboard] = useCopyToClipboard()
  const { mutate: downloadKubeconfig } = useDownloadKubeconfig()

  const removeCluster = (id: string, name: string) => {
    openModal({
      content: <ClusterDeleteModal organizationId={organizationId} clusterId={id} name={name} />,
    })
  }

  const canDelete = clusterStatus.status && isDeleteAvailable(clusterStatus.status)

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
          icon={<Icon name={IconAwesomeEnum.CLOCK_ROTATE_LEFT} />}
          onClick={() =>
            navigate(
              AUDIT_LOGS_PARAMS_URL(organizationId, {
                targetType: OrganizationEventTargetType.CLUSTER,
                targetId: cluster.id,
              })
            )
          }
        >
          See audit logs
        </DropdownMenu.Item>
        <DropdownMenu.Item icon={<Icon name={IconAwesomeEnum.COPY} />} onClick={() => copyToClipboard(cluster.id)}>
          Copy identifier
        </DropdownMenu.Item>
        <DropdownMenu.Item
          icon={<Icon name={IconAwesomeEnum.DOWNLOAD} />}
          onClick={() => downloadKubeconfig({ organizationId, clusterId: cluster.id })}
        >
          Get Kubeconfig
        </DropdownMenu.Item>
        {canDelete && (
          <>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              color="red"
              icon={<Icon name={IconAwesomeEnum.TRASH} />}
              onClick={() => removeCluster(cluster.id, cluster.name)}
            >
              Delete cluster
            </DropdownMenu.Item>
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export interface ClusterActionToolbarProps {
  organizationId: string
  cluster: Cluster
  clusterStatus: ClusterStatusGet
  noSettings?: boolean
}

export function ClusterActionToolbar({
  organizationId,
  cluster,
  clusterStatus,
  noSettings,
}: ClusterActionToolbarProps) {
  const navigate = useNavigate()

  return (
    <ActionToolbar.Root>
      <MenuManageDeployment clusterStatus={clusterStatus} cluster={cluster} organizationId={organizationId} />
      <Tooltip content="Logs">
        <ActionToolbar.Button onClick={() => navigate(INFRA_LOGS_URL(organizationId, cluster.id))}>
          <Icon name={IconAwesomeEnum.SCROLL} />
        </ActionToolbar.Button>
      </Tooltip>
      {!noSettings && (
        <Tooltip content="Settings">
          <ActionToolbar.Button
            onClick={() => navigate(CLUSTER_URL(organizationId, cluster.id) + CLUSTER_SETTINGS_URL)}
          >
            <Icon name={IconAwesomeEnum.WHEEL} />
          </ActionToolbar.Button>
        </Tooltip>
      )}
      <MenuOtherActions organizationId={organizationId} cluster={cluster} clusterStatus={clusterStatus} />
    </ActionToolbar.Root>
  )
}

export default ClusterActionToolbar
