import { ClickEvent } from '@szhsin/react-menu'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteDatabaseAction, postDatabaseActionsDeploy, postDatabaseActionsRestart } from '@qovery/domains/database'
import { DatabaseEntity } from '@qovery/shared/interfaces'
import { SERVICES_GENERAL_URL, SERVICES_URL } from '@qovery/shared/routes'
import {
  ButtonIconAction,
  ButtonIconActionElementProps,
  Icon,
  IconAwesomeEnum,
  MenuData,
  MenuItemProps,
  useModalConfirmation,
} from '@qovery/shared/ui'
import {
  copyToClipboard,
  isDeleteAvailable,
  isDeployAvailable,
  isRestartAvailable,
  isStopAvailable,
} from '@qovery/shared/utils'
import { AppDispatch } from '@qovery/store'

export interface DatabaseButtonsActionsProps {
  database: DatabaseEntity
  environmentMode: string
}

export function DatabaseButtonsActions(props: DatabaseButtonsActionsProps) {
  const { database, environmentMode } = props
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const [buttonStatusActions, setButtonStatusActions] = useState<MenuData>([])
  const navigate = useNavigate()

  const { openModalConfirmation } = useModalConfirmation()

  const dispatch = useDispatch<AppDispatch>()

  const removeDatabase = (id: string, name?: string) => {
    openModalConfirmation({
      title: `Delete database`,
      description: `To confirm the deletion of your database, please type the name of the database:`,
      name: name,
      isDelete: true,
      action: () => {
        dispatch(deleteDatabaseAction({ environmentId, databaseId: id }))
        navigate(SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_GENERAL_URL)
      },
    })
  }

  useEffect(() => {
    const deployButton: MenuItemProps = {
      name: 'Deploy',
      contentLeft: <Icon name={IconAwesomeEnum.PLAY} className="text-sm text-brand-400" />,
      onClick: () =>
        dispatch(
          postDatabaseActionsDeploy({
            environmentId,
            databaseId: database.id,
          })
        ),
    }

    const redeployButton: MenuItemProps = {
      name: 'Redeploy',
      contentLeft: <Icon name={IconAwesomeEnum.ROTATE_RIGHT} className="text-sm text-brand-400" />,
      onClick: (e: ClickEvent) => {
        e.syntheticEvent.preventDefault()

        openModalConfirmation({
          mode: environmentMode,
          title: 'Confirm redeploy',
          description: 'To confirm the redeploy of your database, please type the name:',
          name: database.name,
          action: () => {
            dispatch(
              postDatabaseActionsRestart({
                environmentId,
                databaseId: database.id,
              })
            )
          },
        })
      },
    }

    const stopButton: MenuItemProps = {
      name: 'Stop',
      onClick: (e: ClickEvent) => {
        e.syntheticEvent.preventDefault()

        openModalConfirmation({
          mode: environmentMode,
          title: 'Confirm redeploy',
          description: 'To confirm the redeploy of your database, please type the name:',
          name: database.name,
          action: () => {
            dispatch(
              postDatabaseActionsRestart({
                environmentId,
                databaseId: database.id,
              })
            )
          },
        })
      },
      contentLeft: <Icon name={IconAwesomeEnum.CIRCLE_STOP} className="text-sm text-brand-400" />,
    }

    const state = database.status?.state
    const topItems: MenuItemProps[] = []
    const bottomItems: MenuItemProps[] = []

    if (state) {
      if (isDeployAvailable(state)) {
        topItems.push(deployButton)
      }
      if (isRestartAvailable(state)) {
        topItems.push(redeployButton)
      }
      if (isStopAvailable(state)) {
        topItems.push(stopButton)
      }
    }

    setButtonStatusActions([{ items: topItems }, { items: bottomItems }])
  }, [database, environmentMode, environmentId, dispatch, openModalConfirmation])

  const canDelete = database.status && isDeleteAvailable(database.status.state)

  const copyContent = `Organization ID: ${organizationId}\nProject ID: ${projectId}\nEnvironment ID: ${environmentId}\nService ID: ${database.id}`

  const buttonActionsDefault: ButtonIconActionElementProps[] = [
    {
      triggerTooltip: 'Manage deployment',
      iconLeft: <Icon name={IconAwesomeEnum.PLAY} className="px-0.5" />,
      iconRight: <Icon name={IconAwesomeEnum.ANGLE_DOWN} className="px-0.5" />,
      menusClassName: 'border-r border-r-element-light-lighter-500',
      menus: buttonStatusActions,
    },
    {
      triggerTooltip: 'Other actions',
      iconLeft: <Icon name={IconAwesomeEnum.ELLIPSIS_V} className="px-0.5" />,
      menus: [
        {
          items: [
            {
              name: 'Copy identifiers',
              contentLeft: <Icon name="icon-solid-copy" className="text-sm text-brand-400" />,
              onClick: () => copyToClipboard(copyContent),
            },
          ],
        },
        ...(canDelete
          ? [
              {
                items: [
                  {
                    name: 'Delete database',
                    containerClassName: 'text-error-600',
                    contentLeft: <Icon name={IconAwesomeEnum.TRASH} className="text-sm" />,
                    onClick: () => removeDatabase(database.id, database.name),
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

export default DatabaseButtonsActions
