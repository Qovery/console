import {
  OrganizationCustomRoleClusterPermission,
  OrganizationCustomRoleClusterPermissions,
} from 'qovery-typescript-axios'
import { ReactElement, cloneElement, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { InputCheckbox } from '@qovery/shared/ui'
import Table from '../table/table'

export interface TableClustersProps {
  clusters: OrganizationCustomRoleClusterPermissions[]
  children: ReactElement
}

export function TableClusters(props: TableClustersProps) {
  const { clusters, children } = props

  const { setValue } = useFormContext()
  const [globalCheck, setGlobalCheck] = useState('')

  return (
    <Table className="mb-5" title="Cluster level permissions" headArray={['Admin', 'Deployer', 'Viewer']}>
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
      {cloneElement(children, { setGlobalCheck: setGlobalCheck })}
    </Table>
  )
}

export default TableClusters
