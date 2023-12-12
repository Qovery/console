import { type ClickEvent } from '@szhsin/react-menu'
import { type Cluster, EnvironmentModeEnum, OrganizationEventTargetType } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ClusterDeleteModal,
  useClusterStatus,
  useDeployCluster,
  useDownloadKubeconfig,
  useStopCluster,
} from '@qovery/domains/clusters/feature'
import { AUDIT_LOGS_PARAMS_URL, CLUSTER_SETTINGS_URL, CLUSTER_URL, INFRA_LOGS_URL } from '@qovery/shared/routes'
import {
  ButtonIconAction,
  type ButtonIconActionElementProps,
  Icon,
  IconAwesomeEnum,
  type MenuItemProps,
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

export interface ClusterButtonsActionsProps {
  cluster: Cluster
  noSettings?: boolean
}

export function ClusterButtonsActions(props: ClusterButtonsActionsProps) {
  const { cluster, noSettings } = props
  const { organizationId = '' } = useParams()
  const navigate = useNavigate()
  const [, copyToClipboard] = useCopyToClipboard()

  const { openModalConfirmation } = useModalConfirmation()
  const { openModal } = useModal()
  const { data: clusterStatus } = useClusterStatus({ organizationId, clusterId: cluster.id, refetchInterval: 3000 })
  const { mutate: stopCluster } = useStopCluster()
  const { mutate: deployCluster } = useDeployCluster()
  const { mutate: downloadKubeconfig } = useDownloadKubeconfig()

  const removeCluster = (id: string, name: string) => {
    openModal({
      content: <ClusterDeleteModal organizationId={organizationId} clusterId={id} name={name} />,
    })
  }

  const buttonStatusActions = useMemo(() => {
    const deployButton: MenuItemProps = {
      name: `${!clusterStatus?.is_deployed ? 'Install' : 'Deploy'}`,
      contentLeft: <Icon name={IconAwesomeEnum.PLAY} className="text-sm text-brand-400" />,
      onClick: () =>
        deployCluster({
          organizationId,
          clusterId: cluster.id,
        }),
    }

    const updateButton: MenuItemProps = {
      name: 'Update',
      contentLeft: <Icon name={IconAwesomeEnum.ROTATE_RIGHT} className="text-sm text-brand-400" />,
      onClick: (e: ClickEvent) => {
        e.syntheticEvent.preventDefault()

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
      },
    }

    const stopButton: MenuItemProps = {
      name: 'Stop',
      onClick: (e: ClickEvent) => {
        e.syntheticEvent.preventDefault()

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
      },
      contentLeft: <Icon name={IconAwesomeEnum.CIRCLE_STOP} className="text-sm text-brand-400" />,
    }

    const topItems: MenuItemProps[] = []
    const bottomItems: MenuItemProps[] = []

    if (clusterStatus?.status) {
      if (isDeployAvailable(clusterStatus?.status)) {
        topItems.push(deployButton)
      }
      if (isRedeployAvailable(clusterStatus?.status)) {
        topItems.push(updateButton)
      }
      if (isStopAvailable(clusterStatus?.status)) {
        topItems.push(stopButton)
      }
    }

    return [{ items: topItems }, { items: bottomItems }]
  }, [cluster, openModalConfirmation, organizationId])

  const canDelete = clusterStatus?.status && isDeleteAvailable(clusterStatus?.status)

  const copyContent = cluster.id

  const deploymentActions =
    clusterStatus?.status &&
    (isDeployAvailable(clusterStatus?.status) ||
      isDeleteAvailable(clusterStatus?.status) ||
      isUpdateAvailable(clusterStatus?.status))

  const buttonActionsDefault: ButtonIconActionElementProps[] = [
    deploymentActions
      ? {
          triggerTooltip: 'Manage deployment',
          iconLeft: <Icon name={IconAwesomeEnum.PLAY} className="px-0.5" />,
          iconRight: <Icon name={IconAwesomeEnum.ANGLE_DOWN} className="px-0.5" />,
          menusClassName: 'border-r border-r-neutral-250',
          menus: buttonStatusActions,
        }
      : {},
    {
      triggerTooltip: 'Logs',
      iconLeft: <Icon name={IconAwesomeEnum.SCROLL} className="px-0.5" />,
      onClick: () => navigate(INFRA_LOGS_URL(organizationId, cluster.id)),
    },
    {
      ...(!noSettings && {
        triggerTooltip: 'Settings',
        iconLeft: <Icon name={IconAwesomeEnum.WHEEL} className="px-0.5" />,
        onClick: () => navigate(CLUSTER_URL(organizationId, cluster.id) + CLUSTER_SETTINGS_URL),
      }),
    },
    {
      triggerTooltip: 'Other actions',
      iconLeft: <Icon name={IconAwesomeEnum.ELLIPSIS_V} className="px-0.5" />,
      menus: [
        {
          items: [
            {
              name: 'See audit logs',
              contentLeft: <Icon name={IconAwesomeEnum.CLOCK_ROTATE_LEFT} className="text-sm text-brand-400" />,
              onClick: () =>
                navigate(
                  AUDIT_LOGS_PARAMS_URL(organizationId, {
                    targetType: OrganizationEventTargetType.CLUSTER,
                    targetId: cluster.id,
                  })
                ),
            },
            {
              name: 'Copy identifier',
              contentLeft: <Icon name={IconAwesomeEnum.COPY} className="text-sm text-brand-400" />,
              onClick: () => copyToClipboard(copyContent),
            },
            {
              name: 'Get Kubeconfig',
              contentLeft: <Icon name={IconAwesomeEnum.DOWNLOAD} className="text-sm text-brand-400" />,
              onClick: () => downloadKubeconfig({ organizationId, clusterId: cluster.id }),
            },
          ],
        },
        ...(canDelete
          ? [
              {
                items: [
                  {
                    name: 'Delete cluster',
                    containerClassName: 'text-red-600',
                    contentLeft: <Icon name={IconAwesomeEnum.TRASH} className="text-sm" />,
                    onClick: () => removeCluster(cluster.id, cluster.name),
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

export default ClusterButtonsActions
