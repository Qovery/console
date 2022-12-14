import { ClickEvent } from '@szhsin/react-menu'
import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { ClusterEntity } from '@qovery/shared/interfaces'
import { INFRA_LOGS_URL } from '@qovery/shared/router'
import {
  ButtonIconAction,
  ButtonIconActionElementProps,
  Icon,
  IconAwesomeEnum,
  MenuData,
  MenuItemProps,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { copyToClipboard, isDeployAvailable, isRestartAvailable, isStopAvailable } from '@qovery/shared/utils'
import { AppDispatch } from '@qovery/store'

export interface ClusterButtonsActionsProps {
  cluster: ClusterEntity
}

export function ClusterButtonsActions(props: ClusterButtonsActionsProps) {
  const { cluster } = props
  const { organizationId = '' } = useParams()
  const [, setButtonStatusActions] = useState<MenuData>([])
  const navigate = useNavigate()

  const { openModalConfirmation } = useModalConfirmation()

  const dispatch = useDispatch<AppDispatch>()

  // const removeCluster = (id: string, name?: string) => {
  //   openModalConfirmation({
  //     title: `Uninstall cluster`,
  //     description: `To confirm the deletion of your cluster, please type the name of the cluster:`,
  //     name: name,
  //     isDelete: true,
  //     action: () => {
  //       // dispatch(deleteDatabaseAction({ environmentId, databaseId: id }))
  //       navigate(SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_GENERAL_URL)
  //     },
  //   })
  // }

  useEffect(() => {
    const deployButton: MenuItemProps = {
      name: 'Deploy',
      contentLeft: <Icon name={IconAwesomeEnum.PLAY} className="text-sm text-brand-400" />,
      // onClick: () =>
      //   dispatch(
      //     postDatabaseActionsDeploy({
      //       environmentId,
      //       databaseId: cluster.id,
      //     })
      //   ),
    }

    const redeployButton: MenuItemProps = {
      name: 'Redeploy',
      contentLeft: <Icon name={IconAwesomeEnum.ROTATE_RIGHT} className="text-sm text-brand-400" />,
      onClick: (e: ClickEvent) => {
        e.syntheticEvent.preventDefault()

        openModalConfirmation({
          mode: EnvironmentModeEnum.PRODUCTION,
          title: 'Confirm redeploy',
          description: 'To confirm the redeploy of your cluster, please type the name:',
          name: cluster.name,
          action: () => {
            // dispatch(
            //   postDatabaseActionsRestart({
            //     environmentId,
            //     databaseId: cluster.id,
            //   })
            // )
          },
        })
      },
    }

    const stopButton: MenuItemProps = {
      name: 'Stop',
      onClick: (e: ClickEvent) => {
        e.syntheticEvent.preventDefault()

        openModalConfirmation({
          mode: EnvironmentModeEnum.PRODUCTION,
          title: 'Confirm redeploy',
          description: 'To confirm the redeploy of your cluster, please type the name:',
          name: cluster.name,
          action: () => {
            // dispatch(
            //   postDatabaseActionsRestart({
            //     environmentId,
            //     databaseId: cluster.id,
            //   })
            // )
          },
        })
      },
      contentLeft: <Icon name={IconAwesomeEnum.CIRCLE_STOP} className="text-sm text-brand-400" />,
    }

    const topItems: MenuItemProps[] = []
    const bottomItems: MenuItemProps[] = []

    if (cluster.status) {
      if (isDeployAvailable(cluster.status)) {
        topItems.push(deployButton)
      }
      if (isRestartAvailable(cluster.status)) {
        topItems.push(redeployButton)
      }
      if (isStopAvailable(cluster.status)) {
        topItems.push(stopButton)
      }
    }

    setButtonStatusActions([{ items: topItems }, { items: bottomItems }])
  }, [cluster, dispatch, openModalConfirmation])

  // const canDelete = cluster.status && isDeleteAvailable(cluster.status)

  const copyContent = cluster.id

  const buttonActionsDefault: ButtonIconActionElementProps[] = [
    // {
    //   triggerTooltip: 'Manage deployment',
    //   iconLeft: <Icon name={IconAwesomeEnum.PLAY} className="px-0.5" />,
    //   iconRight: <Icon name={IconAwesomeEnum.ANGLE_DOWN} className="px-0.5" />,
    //   menusClassName: 'border-r border-r-element-light-lighter-500',
    //   menus: buttonStatusActions,
    // },
    {
      triggerTooltip: 'Logs',
      iconLeft: <Icon name={IconAwesomeEnum.SCROLL} className="px-0.5" />,
      onClick: () => navigate(INFRA_LOGS_URL(organizationId, cluster.id)),
    },
    {
      triggerTooltip: 'Settings',
      iconLeft: <Icon name={IconAwesomeEnum.WHEEL} className="px-0.5" />,
      onClick: () =>
        window.open(`https://console.qovery.com/platform/organization/${organizationId}/settings/clusters`),
    },
    {
      triggerTooltip: 'Other actions',
      iconLeft: <Icon name={IconAwesomeEnum.ELLIPSIS_V} className="px-0.5" />,
      menus: [
        {
          items: [
            {
              name: 'Copy identifier',
              contentLeft: <Icon name={IconAwesomeEnum.COPY} className="text-sm text-brand-400" />,
              onClick: () => copyToClipboard(copyContent),
            },
          ],
        },
        // ...(canDelete
        //   ? [
        //       {
        //         items: [
        //           {
        //             name: 'Delete cluster',
        //             containerClassName: 'text-error-600',
        //             contentLeft: <Icon name={IconAwesomeEnum.TRASH} className="text-sm" />,
        //             onClick: () => removeCluster(cluster.id, cluster.name),
        //           },
        //         ],
        //       },
        //     ]
        //   : []),
      ],
    },
  ]

  return <ButtonIconAction className="!h-8" actions={buttonActionsDefault} />
}

export default ClusterButtonsActions
