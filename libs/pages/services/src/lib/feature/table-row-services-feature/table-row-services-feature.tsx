import { useDispatch } from 'react-redux'
import { useParams } from 'react-router'
import {
  deleteApplicationAction,
  postApplicationActionsDeploy,
  postApplicationActionsRestart,
  postApplicationActionsStop,
} from '@qovery/domains/application'
import {
  deleteDatabaseAction,
  postDatabaseActionsDeploy,
  postDatabaseActionsRestart,
  postDatabaseActionsStop,
} from '@qovery/domains/database'
import { ServiceTypeEnum, getServiceType } from '@qovery/shared/enums'
import { ApplicationEntity, DatabaseEntity } from '@qovery/shared/interfaces'
import { APPLICATION_URL, DATABASE_URL, SERVICES_GENERAL_URL } from '@qovery/shared/router'
import { StatusMenuActions, TableHeadProps, useModalConfirmation } from '@qovery/shared/ui'
import { isDeleteAvailable } from '@qovery/shared/utils'
import { AppDispatch } from '@qovery/store'
import TableRowServices from '../../ui/table-row-services/table-row-services'

export interface TableRowServicesFeatureProps {
  data: ApplicationEntity | DatabaseEntity
  environmentMode: string
  dataHead: TableHeadProps[]
  link: string
  isLoading?: boolean
}

export function TableRowServicesFeature(props: TableRowServicesFeatureProps) {
  const { data, environmentMode, dataHead } = props
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  const { openModalConfirmation } = useModalConfirmation()

  const type = getServiceType(data)

  const link =
    type === ServiceTypeEnum.DATABASE
      ? DATABASE_URL(organizationId, projectId, environmentId, data.id) + SERVICES_GENERAL_URL
      : APPLICATION_URL(organizationId, projectId, environmentId, data.id) + SERVICES_GENERAL_URL

  const dispatch = useDispatch<AppDispatch>()

  const applicationActions: StatusMenuActions[] = [
    {
      name: 'redeploy',
      action: (applicationId: string) =>
        dispatch(postApplicationActionsRestart({ environmentId, applicationId, serviceType: getServiceType(data) })),
    },
    {
      name: 'deploy',
      action: (applicationId: string) =>
        dispatch(postApplicationActionsDeploy({ environmentId, applicationId, serviceType: getServiceType(data) })),
    },
    {
      name: 'stop',
      action: (applicationId: string) =>
        dispatch(postApplicationActionsStop({ environmentId, applicationId, serviceType: getServiceType(data) })),
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

  const removeService = (id: string, type: ServiceTypeEnum, name?: string) => {
    const currentType = type.toLocaleLowerCase()
    openModalConfirmation({
      title: `Delete ${currentType}`,
      description: `To confirm the deletion of your ${currentType}, please type the name of the ${currentType}:`,
      name: name,
      isDelete: true,
      action: () => {
        if (type === ServiceTypeEnum.DATABASE) {
          dispatch(deleteDatabaseAction({ environmentId, databaseId: id }))
        } else {
          dispatch(deleteApplicationAction({ environmentId, applicationId: id, serviceType: getServiceType(data) }))
        }
      },
    })
  }

  const actions = type === ServiceTypeEnum.DATABASE ? databaseActions : applicationActions

  return (
    <TableRowServices
      data={data}
      type={type}
      environmentMode={environmentMode}
      dataHead={dataHead}
      link={link}
      buttonActions={actions}
      columnsWidth="25% 25% 25% 20%"
      removeService={data.status && isDeleteAvailable(data.status.state) ? removeService : undefined}
      isLoading={props.isLoading}
    />
  )
}

export default TableRowServicesFeature
