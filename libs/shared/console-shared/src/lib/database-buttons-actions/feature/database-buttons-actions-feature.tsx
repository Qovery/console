import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  deleteDatabaseAction,
  postDatabaseActionsDeploy,
  postDatabaseActionsRestart,
  postDatabaseActionsStop,
} from '@qovery/domains/database'
import { DatabaseEntity } from '@qovery/shared/interfaces'
import { Icon, StatusMenuActions, useModalConfirmation } from '@qovery/shared/ui'
import { copyToClipboard, isDeleteAvailable } from '@qovery/shared/utils'
import { AppDispatch } from '@qovery/store'
import DatabaseButtonsActions from '../ui/database-buttons-actions'

export interface DatabaseButtonsActionsFeatureProps {
  database: DatabaseEntity
  environmentMode: string
  inHeader?: boolean
}

export function DatabaseButtonsActionsFeature(props: DatabaseButtonsActionsFeatureProps) {
  const { database, environmentMode, inHeader = false } = props
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  const { openModalConfirmation } = useModalConfirmation()

  const dispatch = useDispatch<AppDispatch>()

  const databaseActions: StatusMenuActions[] = [
    {
      name: 'redeploy',
      action: (databaseId: string) => dispatch(postDatabaseActionsRestart({ environmentId, databaseId })),
    },
    {
      name: 'deploy',
      action: (databaseId: string) => dispatch(postDatabaseActionsDeploy({ environmentId, databaseId })),
    },
    {
      name: 'stop',
      action: (databaseId: string) => dispatch(postDatabaseActionsStop({ environmentId, databaseId })),
    },
  ]

  const removeDatabase = (id: string, name?: string) => {
    openModalConfirmation({
      title: `Delete database`,
      description: `To confirm the deletion of your database, please type the name of the database:`,
      name: name,
      isDelete: true,
      action: () => {
        dispatch(deleteDatabaseAction({ environmentId, databaseId: id }))
      },
    })
  }

  const canDelete = database.status && isDeleteAvailable(database.status.state)

  const copyContent = `Organization ID: ${organizationId}\nProject ID: ${projectId}\nEnvironment ID: ${environmentId}\nService ID: ${database.id}`

  const buttonActionsDefault = [
    {
      iconLeft: <Icon name="icon-solid-play" className="px-0.5" />,
      iconRight: <Icon name="icon-solid-angle-down" className="px-0.5" />,
      menusClassName: canDelete ? 'border-r border-r-element-light-lighter-500' : '',
      statusActions: {
        status: database?.status && database?.status.state,
        actions: databaseActions,
      },
    },
    {
      ...(removeDatabase && {
        iconLeft: <Icon name="icon-solid-ellipsis-v" className="px-0.5" />,
        menus: [
          {
            items: [
              {
                name: 'Copy identifiers',
                contentLeft: <Icon name="icon-solid-copy" className="text-sm text-brand-400" />,
                onClick: () => copyToClipboard(copyContent),
              },
              {
                name: 'Remove',
                contentLeft: <Icon name="icon-solid-trash" className="text-sm text-brand-400" />,
                onClick: () => removeDatabase(database.id, database.name),
              },
            ],
          },
        ],
      }),
    },
  ]

  return (
    <DatabaseButtonsActions
      database={database}
      buttonActionsDefault={buttonActionsDefault}
      environmentMode={environmentMode}
      inHeader={inHeader}
    />
  )
}

export default DatabaseButtonsActionsFeature
