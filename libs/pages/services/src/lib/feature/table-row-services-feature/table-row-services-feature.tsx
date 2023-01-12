import { useParams } from 'react-router-dom'
import { getServiceType, isDatabase } from '@qovery/shared/enums'
import { ApplicationEntity, DatabaseEntity } from '@qovery/shared/interfaces'
import { APPLICATION_URL, DATABASE_URL, SERVICES_GENERAL_URL } from '@qovery/shared/routes'
import { TableFilterProps, TableHeadProps } from '@qovery/shared/ui'
import TableRowServices from '../../ui/table-row-services/table-row-services'

export interface TableRowServicesFeatureProps {
  data: ApplicationEntity | DatabaseEntity
  filter: TableFilterProps
  environmentMode: string
  dataHead: TableHeadProps[]
  link: string
  isLoading?: boolean
}

export function TableRowServicesFeature(props: TableRowServicesFeatureProps) {
  const { data, filter, environmentMode, dataHead } = props
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  const type = getServiceType(data)

  const link = isDatabase(type)
    ? DATABASE_URL(organizationId, projectId, environmentId, data.id) + SERVICES_GENERAL_URL
    : APPLICATION_URL(organizationId, projectId, environmentId, data.id) + SERVICES_GENERAL_URL

  return (
    <TableRowServices
      data={data}
      filter={filter}
      type={type}
      environmentMode={environmentMode}
      dataHead={dataHead}
      link={link}
      columnsWidth="25% 25% 25% 20%"
      isLoading={props.isLoading}
    />
  )
}

export default TableRowServicesFeature
