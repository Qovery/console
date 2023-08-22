import { ClickEvent } from '@szhsin/react-menu'
import { EnvironmentModeEnum, OrganizationEventTargetType } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteClusterAction, postClusterActionsDeploy, postClusterActionsStop } from '@qovery/domains/organization'
import { ClusterEntity } from '@qovery/shared/interfaces'
import { AUDIT_LOGS_PARAMS_URL, CLUSTER_SETTINGS_URL, CLUSTER_URL, INFRA_LOGS_URL } from '@qovery/shared/routes'
import {
  ButtonIconAction,
  ButtonIconActionElementProps,
  Icon,
  IconAwesomeEnum,
  MenuItemProps,
  useModalConfirmation,
} from '@qovery/shared/ui'
import {
  copyToClipboard,
  isDeleteAvailable,
  isDeployAvailable,
  isRedeployAvailable,
  isStopAvailable,
  isUpdateAvailable,
} from '@qovery/shared/utils'
import { AppDispatch } from '@qovery/state/store'

export interface ClusterButtonsActionsProps {
  cluster: ClusterEntity
  noSettings?: boolean
}

export function ClusterButtonsActions(props: ClusterButtonsActionsProps) {
  const { cluster, noSettings } = props
  const { organizationId = '' } = useParams()
  const navigate = useNavigate()

  const { openModalConfirmation } = useModalConfirmation()

  const dispatch = useDispatch<AppDispatch>()

  const removeCluster = (id: string, name?: string) => {
    openModalConfirmation({
      title: `Uninstall cluster`,
      name: name,
      isDelete: true,
      action: () => dispatch(deleteClusterAction({ organizationId, clusterId: id })),
    })
  }

  const buttonStatusActions = useMemo(() => {
    const deployButton: MenuItemProps = {
      name: `${!cluster.extendedStatus?.status?.is_deployed ? 'Install' : 'Deploy'}`,
      contentLeft: <Icon name={IconAwesomeEnum.PLAY} className="text-sm text-brand-400" />,
      onClick: () =>
        dispatch(
          postClusterActionsDeploy({
            organizationId,
            clusterId: cluster.id,
          })
        ),
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
            dispatch(
              postClusterActionsDeploy({
                organizationId,
                clusterId: cluster.id,
              })
            ),
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
            dispatch(
              postClusterActionsStop({
                organizationId,
                clusterId: cluster.id,
              })
            ),
        })
      },
      contentLeft: <Icon name={IconAwesomeEnum.CIRCLE_STOP} className="text-sm text-brand-400" />,
    }

    const topItems: MenuItemProps[] = []
    const bottomItems: MenuItemProps[] = []

    if (cluster.extendedStatus?.status?.status) {
      if (isDeployAvailable(cluster.extendedStatus?.status?.status)) {
        topItems.push(deployButton)
      }
      if (isRedeployAvailable(cluster.extendedStatus?.status?.status)) {
        topItems.push(updateButton)
      }
      if (isStopAvailable(cluster.extendedStatus?.status?.status)) {
        topItems.push(stopButton)
      }
    }

    return [{ items: topItems }, { items: bottomItems }]
  }, [cluster, dispatch, openModalConfirmation, organizationId])

  const canDelete = cluster.extendedStatus?.status?.status && isDeleteAvailable(cluster.extendedStatus?.status?.status)

  const copyContent = cluster.id

  const deploymentActions =
    cluster.extendedStatus?.status?.status &&
    (isDeployAvailable(cluster.extendedStatus?.status?.status) ||
      isDeleteAvailable(cluster.extendedStatus?.status?.status) ||
      isUpdateAvailable(cluster.extendedStatus?.status?.status))

  const buttonActionsDefault: ButtonIconActionElementProps[] = [
    deploymentActions
      ? {
          triggerTooltip: 'Manage deployment',
          iconLeft: <Icon name={IconAwesomeEnum.PLAY} className="px-0.5" />,
          iconRight: <Icon name={IconAwesomeEnum.ANGLE_DOWN} className="px-0.5" />,
          menusClassName: 'border-r border-r-zinc-250',
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
