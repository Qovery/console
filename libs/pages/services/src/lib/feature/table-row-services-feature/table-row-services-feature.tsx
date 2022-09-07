import { useDispatch } from 'react-redux'
import { useParams } from 'react-router'
import {
  deleteApplicationAction,
  deleteContainerAction,
  postApplicationActionsDeploy,
  postApplicationActionsRestart,
  postApplicationActionsStop,
  postContainerActionsDeploy,
  postContainerActionsRestart,
  postContainerActionsStop,
} from '@console/domains/application'
import {
  deleteDatabaseAction,
  postDatabaseActionsDeploy,
  postDatabaseActionsRestart,
  postDatabaseActionsStop,
} from '@console/domains/database'
import { ServicesEnum, getServiceType } from '@console/shared/enums'
import { ApplicationEntity, DatabaseEntity } from '@console/shared/interfaces'
import { APPLICATION_URL, DATABASE_URL, SERVICES_GENERAL_URL } from '@console/shared/router'
import { StatusMenuActions, TableHeadProps, useModalConfirmation } from '@console/shared/ui'
import { isDeleteAvailable } from '@console/shared/utils'
import { AppDispatch } from '@console/store/data'
import TableRowServices from '../../ui/table-row-services/table-row-services'

export interface TableRowServicesFeatureProps {
  data: ApplicationEntity | DatabaseEntity
  environmentMode: string
  dataHead: TableHeadProps[]
  link: string
}

export function TableRowServicesFeature(props: TableRowServicesFeatureProps) {
  const { data, environmentMode, dataHead } = props
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  const { openModalConfirmation } = useModalConfirmation()

  const type = getServiceType(data)

  const link =
    type === ServicesEnum.DATABASE
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

  const containerActions: StatusMenuActions[] = [
    {
      name: 'redeploy',
      action: (applicationId: string) => dispatch(postContainerActionsRestart({ environmentId, applicationId })),
    },
    {
      name: 'deploy',
      action: (applicationId: string) => dispatch(postContainerActionsDeploy({ environmentId, applicationId })),
    },
    {
      name: 'stop',
      action: (applicationId: string) => dispatch(postContainerActionsStop({ environmentId, applicationId })),
    },
  ]

  const removeService = (id: string, type: ServicesEnum, name?: string) => {
    const currentType = type.toLocaleLowerCase()
    openModalConfirmation({
      title: `Delete ${currentType}`,
      description: `To confirm the deletion of your ${currentType}, please type the name of the ${currentType}:`,
      name: name,
      isDelete: true,
      action: () => {
        if (type === ServicesEnum.APPLICATION) dispatch(deleteApplicationAction({ environmentId, applicationId: id }))
        if (type === ServicesEnum.CONTAINER) dispatch(deleteContainerAction({ environmentId, applicationId: id }))
        if (type === ServicesEnum.DATABASE) dispatch(deleteDatabaseAction({ environmentId, databaseId: id }))
      },
    })
  }

  const actions =
    type === ServicesEnum.DATABASE
      ? databaseActions
      : type === ServicesEnum.APPLICATION
      ? applicationActions
      : containerActions

  return (
    <TableRowServices
      data={data}
      type={type}
      environmentMode={environmentMode}
      dataHead={dataHead}
      link={link}
      buttonActions={actions}
      columnsWidth="25% 25% 25% 10% 10%"
      removeService={data.status && isDeleteAvailable(data.status.state) ? removeService : undefined}
    />
  )
}

export default TableRowServicesFeature
