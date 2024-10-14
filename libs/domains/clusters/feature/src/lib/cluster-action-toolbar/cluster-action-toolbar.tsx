import {
  type Cluster,
  type ClusterStatus,
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
import { ClusterAccessModal } from '../cluster-access-modal/cluster-access-modal'
import { ClusterDeleteModal } from '../cluster-delete-modal/cluster-delete-modal'
import { ClusterInstallationGuideModal } from '../cluster-installation-guide-modal/cluster-installation-guide-modal'
import { useDeployCluster } from '../hooks/use-deploy-cluster/use-deploy-cluster'
import { useDownloadKubeconfig } from '../hooks/use-download-kubeconfig/use-download-kubeconfig'
import { useStopCluster } from '../hooks/use-stop-cluster/use-stop-cluster'
import { useUpgradeCluster } from '../hooks/use-upgrade-cluster/use-upgrade-cluster'

function MenuManageDeployment({ cluster, clusterStatus }: { cluster: Cluster; clusterStatus: ClusterStatus }) {
  const { openModalConfirmation } = useModalConfirmation()
  const { mutate: deployCluster } = useDeployCluster()
  const { mutate: stopCluster } = useStopCluster()
  const { mutate: upgradeCluster } = useUpgradeCluster({ organizationId: cluster.organization.id })

  if (
    !clusterStatus.status ||
    (!isDeployAvailable(clusterStatus?.status) &&
      !isDeleteAvailable(clusterStatus?.status) &&
      !isUpdateAvailable(clusterStatus?.status))
  ) {
    return null
  }

  const k8sUpdateAvailable =
    clusterStatus.next_k8s_available_version &&
    clusterStatus.next_k8s_available_version !== null &&
    clusterStatus.status === 'DEPLOYED'
  const clusterNeedUpdate = cluster.deployment_status !== 'UP_TO_DATE' && clusterStatus.status !== 'STOPPED'

  const tooltipClusterNeedUpdate = clusterNeedUpdate && (
    <Tooltip side="bottom" content="Configuration has changed and needs to be applied">
      <div className="absolute right-2">
        <Icon iconName="circle-exclamation" iconStyle="regular" />
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
  const mutationUpgrade = () =>
    openModalConfirmation({
      mode: EnvironmentModeEnum.PRODUCTION,
      title: 'Confirm upgrade',
      description: 'To confirm the upgrade of your cluster, please type the name:',
      name: cluster.name,
      action: () =>
        upgradeCluster({
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
        color={clusterNeedUpdate ? 'yellow' : 'brand'}
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
        color={clusterNeedUpdate ? 'yellow' : 'brand'}
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
    k8sUpdateAvailable && (
      <DropdownMenu.Item
        key="3"
        icon={<Icon iconName="rotate-left" />}
        onSelect={mutationUpgrade}
        className="relative"
        color="yellow"
      >
        Upgrade K8s to {clusterStatus.next_k8s_available_version}
        <Tooltip
          side="bottom"
          content="A new Kubernetes version is available. Click here to upgrade your cluster now or wait for the upgrade to be performed automatically by Qovery after a certain period."
        >
          <div className="absolute right-2">
            <Icon iconName="circle-exclamation" iconStyle="regular" />
          </div>
        </Tooltip>
      </DropdownMenu.Item>
    ),
  ].filter((e) => !!e)

  return entries.length > 0 ? (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <ActionToolbar.Button
          aria-label="Manage Deployment"
          color={clusterNeedUpdate || k8sUpdateAvailable ? 'yellow' : 'neutral'}
        >
          <Tooltip content="Manage Deployment">
            <div className="flex h-full w-full items-center justify-center">
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

function MenuOtherActions({ cluster, clusterStatus }: { cluster: Cluster; clusterStatus: ClusterStatus }) {
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

  const openAccessModal = () => {
    openModal({
      content: <ClusterAccessModal clusterId={cluster.id} />,
      options: {
        width: 680,
      },
    })
  }

  const canDelete = clusterStatus.status && isDeleteAvailable(clusterStatus.status)

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <ActionToolbar.Button aria-label="Other actions">
          <Tooltip content="Other actions">
            <div className="flex h-full w-full items-center justify-center">
              <Icon width={20} iconName="ellipsis-v" />
            </div>
          </Tooltip>
        </ActionToolbar.Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {cluster.kubernetes !== 'SELF_MANAGED' && (
          <DropdownMenu.Item icon={<Icon iconName="circle-info" />} onSelect={() => openAccessModal()}>
            Access info
          </DropdownMenu.Item>
        )}
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
        {cluster.kubernetes !== 'SELF_MANAGED' && (
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
  clusterStatus: ClusterStatus
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
          mode="EDIT"
          cluster={cluster}
          type={type}
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
