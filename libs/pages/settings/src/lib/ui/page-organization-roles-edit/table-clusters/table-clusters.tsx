import {
  OrganizationCustomRoleClusterPermission,
  OrganizationCustomRoleClusterPermissions,
} from 'qovery-typescript-axios'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { InputCheckbox } from '@qovery/shared/ui'
import RowCluster from '../row-cluster/row-cluster'
import Table from '../table/table'

export interface TableClustersProps {
  clusters: OrganizationCustomRoleClusterPermissions[]
}

export function TableClusters(props: TableClustersProps) {
  const { clusters } = props

  const { setValue } = useFormContext()
  const [globalCheck, setGlobalCheck] = useState('')

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
      <div className="flex items-center h-10 bg-element-light-lighter-300 border-element-light-lighter-400 border-b">
        <div className="flex-auto flex items-center h-full px-4 w-1/4 border-r border-element-light-lighter-500 font-medium">
          Clusters
        </div>
        {Object.keys(OrganizationCustomRoleClusterPermission)
          .reverse()
          .map((permission: string) => (
            <div
              key={permission}
              className="flex-1 flex items-center justify-center h-full px-4 border-r border-element-light-lighter-500 last:border-0"
            >
              <InputCheckbox
                dataTestId={`checkbox-${permission}`}
                name="cluster_permissions"
                value={globalCheck}
                formValue={permission}
                isChecked={globalCheck !== permission}
                onChange={() => {
                  // get new value if currentPermission is already checked
                  const newValue =
                    globalCheck !== permission ? permission : OrganizationCustomRoleClusterPermission.VIEWER
                  setGlobalCheck(newValue)
                  // set value for nextPermission if admin is uncheck
                  clusters.forEach((cluster: OrganizationCustomRoleClusterPermissions) => {
                    const key = `cluster_permissions.${cluster.cluster_id}`
                    setValue(key, newValue)
                  })
                }}
              />
            </div>
          ))}
      </div>
      <div>
        {clusters.map((cluster: OrganizationCustomRoleClusterPermissions) => (
          <RowCluster key={cluster.cluster_id} cluster={cluster} setGlobalCheck={setGlobalCheck} />
        ))}
      </div>
    </Table>
  )
}

export default TableClusters
