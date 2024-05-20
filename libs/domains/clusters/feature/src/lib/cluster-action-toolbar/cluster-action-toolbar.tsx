import {
  type Cluster,
  type ClusterStatusGet,
  EnvironmentModeEnum,
  OrganizationEventTargetType,
} from 'qovery-typescript-axios'
import { type ReactNode, useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { P, match } from 'ts-pattern'
import { AUDIT_LOGS_PARAMS_URL, CLUSTER_SETTINGS_URL, CLUSTER_URL, INFRA_LOGS_URL } from '@qovery/shared/routes'
import { ActionToolbar, DropdownMenu, Icon, Tooltip, useModal, useModalConfirmation } from '@qovery/shared/ui'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import {
  isDeleteAvailable,
  isDeployAvailable,
  isRedeployAvailable,
  isStopAvailable,
  isUpdateAvailable,
} from '@qovery/shared/util-js'
import { ClusterDeleteModal } from '../cluster-delete-modal/cluster-delete-modal'
import { ClusterInstallationGuideModal } from '../cluster-installation-guide-modal/cluster-installation-guide-modal'
import { useDeployCluster } from '../hooks/use-deploy-cluster/use-deploy-cluster'
import { useDownloadKubeconfig } from '../hooks/use-download-kubeconfig/use-download-kubeconfig'
import { useStopCluster } from '../hooks/use-stop-cluster/use-stop-cluster'

function MenuManageDeployment({ cluster, clusterStatus }: { cluster: Cluster; clusterStatus: ClusterStatusGet }) {
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

  const clusterNeedUpdate = cluster.deployment_status !== 'UP_TO_DATE'
  const displayYellowColor = clusterNeedUpdate && clusterStatus.status !== 'STOPPED'

  const tooltipClusterNeedUpdate = displayYellowColor && (
    <Tooltip side="bottom" content="Configuration has changed and needs to be applied">
      <div className="absolute right-2">
        <Icon iconName="circle-exclamation" />
      </div>
    </Tooltip>
  )

  const mutationDeploy = () =>
    deployCluster({
      organizationId: cluster.organization.id,
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
          organizationId: cluster.organization.id,
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
          organizationId: cluster.organization.id,
          clusterId: cluster.id,
        }),
    })

  const entries: ReactNode[] = [
    isDeployAvailable(clusterStatus.status) && (
      <DropdownMenu.Item
        key="0"
        icon={<Icon iconName="play" />}
        onSelect={mutationDeploy}
        className="relative"
        color={displayYellowColor ? 'yellow' : 'brand'}
      >
        {clusterStatus.is_deployed ? 'Deploy' : 'Install'}
        {tooltipClusterNeedUpdate}
      </DropdownMenu.Item>
    ),
    isRedeployAvailable(clusterStatus.status) && (
      <DropdownMenu.Item
        key="1"
        icon={<Icon iconName="rotate-right" />}
        onSelect={mutationUpdate}
        className="relative"
        color={displayYellowColor ? 'yellow' : 'brand'}
      >
        Update
        {tooltipClusterNeedUpdate}
      </DropdownMenu.Item>
    ),
    cluster.cloud_provider !== 'GCP' && isStopAvailable(clusterStatus.status) && (
      <DropdownMenu.Item key="2" icon={<Icon iconName="circle-stop" />} onSelect={mutationStop}>
        Stop
      </DropdownMenu.Item>
    ),
  ].filter((e) => !!e)

  return entries.length > 0 ? (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <ActionToolbar.Button aria-label="Manage Deployment" color={displayYellowColor ? 'yellow' : 'neutral'}>
          <Tooltip content="Manage Deployment">
            <div className="flex items-center justify-center w-full h-full">
              <Icon iconName="play" className="mr-4" />
              <Icon iconName="chevron-down" />
            </div>
          </Tooltip>
        </ActionToolbar.Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>{entries.map((c) => c)}</DropdownMenu.Content>
    </DropdownMenu.Root>
  ) : null
}

function MenuOtherActions({ cluster, clusterStatus }: { cluster: Cluster; clusterStatus: ClusterStatusGet }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { openModal } = useModal()
  const [, copyToClipboard] = useCopyToClipboard()
  const { mutate: downloadKubeconfig } = useDownloadKubeconfig()

  const removeCluster = (cluster: Cluster) => {
    openModal({
      content: <ClusterDeleteModal cluster={cluster} />,
    })
  }

  const canDelete = clusterStatus.status && isDeleteAvailable(clusterStatus.status)

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <ActionToolbar.Button aria-label="Other actions">
          <Tooltip content="Other actions">
            <div className="flex items-center justify-center w-full h-full">
              <Icon width={20} iconName="ellipsis-v" />
            </div>
          </Tooltip>
        </ActionToolbar.Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          icon={<Icon iconName="clock-rotate-left" />}
          onSelect={() =>
            navigate(
              AUDIT_LOGS_PARAMS_URL(cluster.organization.id, {
                targetType: OrganizationEventTargetType.CLUSTER,
                targetId: cluster.id,
              }),
              {
                state: { prevUrl: pathname },
              }
            )
          }
        >
          See audit logs
        </DropdownMenu.Item>
        <DropdownMenu.Item icon={<Icon iconName="copy" />} onSelect={() => copyToClipboard(cluster.id)}>
          Copy identifier
        </DropdownMenu.Item>
        {cluster.cloud_provider !== 'ON_PREMISE' && (
          <DropdownMenu.Item
            icon={<Icon iconName="download" />}
            onSelect={() => downloadKubeconfig({ organizationId: cluster.organization.id, clusterId: cluster.id })}
          >
            Get Kubeconfig
          </DropdownMenu.Item>
        )}
        {canDelete && (
          <>
            <DropdownMenu.Separator />
            <DropdownMenu.Item color="red" icon={<Icon iconName="trash" />} onSelect={() => removeCluster(cluster)}>
              Delete cluster
            </DropdownMenu.Item>
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export interface ClusterActionToolbarProps {
  cluster: Cluster
  clusterStatus: ClusterStatusGet
  noSettings?: boolean
}

export function ClusterActionToolbar({ cluster, clusterStatus, noSettings }: ClusterActionToolbarProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const showSelfManagedGuideKey = 'show-self-managed-guide'
  const [searchParams, setSearchParams] = useSearchParams()
  const { openModal, closeModal } = useModal()

  const openInstallationGuideModal = ({ type = 'MANAGED' }: { type?: 'MANAGED' | 'ON_PREMISE' } = {}) =>
    openModal({
      options: {
        width: type === 'MANAGED' ? 488 : 500,
      },
      content: (
        <ClusterInstallationGuideModal
          type={type}
          organizationId={cluster.organization.id}
          clusterId={cluster.id}
          onClose={() => {
            searchParams.delete(showSelfManagedGuideKey)
            setSearchParams(searchParams)
            closeModal()
          }}
        />
      ),
    })

  useEffect(() => {
    const bool = searchParams.has(showSelfManagedGuideKey) && cluster.kubernetes === 'SELF_MANAGED'
    if (bool) {
      searchParams.delete(showSelfManagedGuideKey)
      setSearchParams(searchParams)
      openInstallationGuideModal()
    }
    return () => (bool ? closeModal() : undefined)
  }, [searchParams, setSearchParams, cluster.kubernetes, closeModal])

  const actionToolbarButtons = match(cluster)
    .with({ cloud_provider: P.not('ON_PREMISE'), kubernetes: 'SELF_MANAGED' }, () => (
      <Tooltip content="Installation guide">
        <ActionToolbar.Button onClick={() => openInstallationGuideModal()}>
          <Icon iconName="circle-info" />
        </ActionToolbar.Button>
      </Tooltip>
    ))
    .with({ cloud_provider: 'ON_PREMISE', kubernetes: 'SELF_MANAGED' }, () => (
      <Tooltip content="Installation guide">
        <ActionToolbar.Button onClick={() => openInstallationGuideModal({ type: 'ON_PREMISE' })}>
          <Icon iconName="circle-info" />
        </ActionToolbar.Button>
      </Tooltip>
    ))
    .otherwise(() => (
      <>
        <MenuManageDeployment cluster={cluster} clusterStatus={clusterStatus} />
        <Tooltip content="Logs">
          <ActionToolbar.Button
            onClick={() =>
              navigate(INFRA_LOGS_URL(cluster.organization.id, cluster.id), {
                state: { prevUrl: pathname },
              })
            }
          >
            <Icon iconName="scroll" />
          </ActionToolbar.Button>
        </Tooltip>
      </>
    ))

  return (
    <ActionToolbar.Root>
      {actionToolbarButtons}
      {!noSettings && (
        <Tooltip content="Settings">
          <ActionToolbar.Button
            onClick={() => navigate(CLUSTER_URL(cluster.organization.id, cluster.id) + CLUSTER_SETTINGS_URL)}
          >
            <Icon iconName="gear" />
          </ActionToolbar.Button>
        </Tooltip>
      )}
      <MenuOtherActions cluster={cluster} clusterStatus={clusterStatus} />
    </ActionToolbar.Root>
  )
}

export default ClusterActionToolbar
