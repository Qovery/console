import { TableHeadProps } from '@console/shared/ui'
import { APPLICATION_GENERAL_URL, APPLICATION_URL } from '@console/shared/utils'
import { useParams } from 'react-router'
import TableRowDeployments, { DeploymentService } from '../table-row-deployments/table-row-deployments'

export interface TableGroupDeploymentsProps {
  data: any
  tableHead: TableHeadProps[]
  isLoading?: boolean
}

export function TableGroupDeployments(props: TableGroupDeploymentsProps) {
  const { data, tableHead, isLoading } = props

  const { organizationId, projectId, environmentId } = useParams()

  return (
    <div className="mb-2 bg-white">
      {data?.merged?.map((app: any, index: number) => (
        <TableRowDeployments
          key={index}
          data={app as DeploymentService}
          dataHead={tableHead}
          link={APPLICATION_URL(organizationId, projectId, environmentId, app.id) + APPLICATION_GENERAL_URL}
          id={data.id}
          type="APPLICATION"
          isLoading={isLoading}
        />
      ))}
    </div>
  )
}

export default TableGroupDeployments
