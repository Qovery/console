import { ApplicationEntity, DatabaseEntity } from '@console/shared/interfaces'
import { ServicesEnum } from '@console/shared/enums'
import { StatusMenuActions, TableHeadProps, useModalConfirmation } from '@console/shared/ui'
import TableRowServices from '../../ui/table-row-services/table-row-services'
import { APPLICATION_URL, DATABASE_URL, SERVICES_GENERAL_URL } from '@console/shared/router'
import { useParams } from 'react-router'
import {
  deleteApplicationAction,
  postApplicationActionsDeploy,
  postApplicationActionsRestart,
  postApplicationActionsStop,
} from '@console/domains/application'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@console/store/data'
import {
  deleteDatabaseAction,
  postDatabaseActionsDeploy,
  postDatabaseActionsRestart,
  postDatabaseActionsStop,
} from '@console/domains/database'
import { isDeleteAvailable } from '@console/shared/utils'

export interface TableRowServicesFeatureProps {
  data: ApplicationEntity | DatabaseEntity
  environmentMode: string
  dataHead: TableHeadProps[]
  link: string
}

export function TableRowServicesFeature(props: TableRowServicesFeatureProps) {
  const { data, environmentMode, dataHead } = props
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  const { setModalConfirmation } = useModalConfirmation()

  const isDatabase = !(data as ApplicationEntity).build_mode
  const type = isDatabase ? ServicesEnum.DATABASE : ServicesEnum.APPLICATION
  const link = isDatabase
    ? DATABASE_URL(organizationId, projectId, environmentId, data.id) + SERVICES_GENERAL_URL
    : APPLICATION_URL(organizationId, projectId, environmentId, data.id) + SERVICES_GENERAL_URL

  const dispatch = useDispatch<AppDispatch>()

  const applicationActions: StatusMenuActions[] = [
    {
      name: 'redeploy',
      action: (applicationId: string) => dispatch(postApplicationActionsRestart({ environmentId, applicationId })),
    },
    {
      name: 'deploy',
      action: (applicationId: string) => dispatch(postApplicationActionsDeploy({ environmentId, applicationId })),
    },
    {
      name: 'stop',
      action: (applicationId: string) => dispatch(postApplicationActionsStop({ environmentId, applicationId })),
    },
  ]

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

  const removeApplication = (applicationId: string, name?: string) => {
    setModalConfirmation({
      title: 'Delete application',
      description: 'To confirm the deletion of your application, please type the name of the application:',
      name: name,
      isDelete: true,
      action: () => {
        dispatch(deleteApplicationAction({ environmentId, applicationId }))
      },
    })
  }

  const removeDatabase = (databaseId: string, name?: string) => {
    setModalConfirmation({
      title: 'Delete database',
      description: 'To confirm the deletion of your database, please type the name of the database:',
      name: name,
      isDelete: true,
      action: () => {
        dispatch(deleteDatabaseAction({ environmentId, databaseId }))
      },
    })
  }

  const actions = isDatabase ? databaseActions : applicationActions

  return (
    <TableRowServices
      data={data}
      type={type}
      environmentMode={environmentMode}
      dataHead={dataHead}
      link={link}
      buttonActions={actions}
      columnsWidth="25% 25% 25% 10% 10%"
      removeApplication={
        !isDatabase && data.status && isDeleteAvailable(data.status.state) ? removeApplication : undefined
      }
      removeDatabase={isDatabase && data.status && isDeleteAvailable(data.status.state) ? removeDatabase : undefined}
    />
  )
}

export default TableRowServicesFeature
