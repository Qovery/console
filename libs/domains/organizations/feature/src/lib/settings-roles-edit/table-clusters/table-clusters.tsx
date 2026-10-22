import { type OrganizationCustomRoleClusterPermissionsInner } from 'qovery-typescript-axios'
import RowCluster from '../row-cluster/row-cluster'
import Table from '../table/table'

export interface TableClustersProps {
  clusters: OrganizationCustomRoleClusterPermissionsInner[]
}

export function TableClusters(props: TableClustersProps) {
  const { clusters } = props

  return (
    <Table
      className="mb-5"
      title="Cluster level permissions"
      headArray={[
        {
          label: 'Full-Access',
          tooltip:
            'The user can create create environments on this cluster and as well manage its settings (start/stop, change number and type of nodes etc..)',
        },
        {
          label: 'Create Environment',
          tooltip: 'The user will be able to create environments on this cluster.',
        },
        {
          label: 'Read-Only',
          tooltip: 'The user will just be able to access the cluster information.',
        },
      ]}
    >
      <div>
        {clusters.map((cluster: OrganizationCustomRoleClusterPermissionsInner) => (
          <RowCluster key={cluster.cluster_id} cluster={cluster} />
        ))}
      </div>
    </Table>
  )
}

export default TableClusters
