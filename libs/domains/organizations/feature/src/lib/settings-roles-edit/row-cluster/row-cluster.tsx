import {
  OrganizationCustomRoleClusterPermission,
  type OrganizationCustomRoleClusterPermissionsInner,
} from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { Checkbox } from '@qovery/shared/ui'

export interface RowClusterProps {
  cluster: OrganizationCustomRoleClusterPermissionsInner
}

export function RowCluster(props: RowClusterProps) {
  const { cluster } = props

  const { control } = useFormContext()

  return (
    <div className="flex h-10 border-b border-neutral last:border-0">
      <div className="flex h-full w-1/4 flex-auto items-center border-r border-neutral px-4 font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" width="7" height="8" fill="none" viewBox="0 0 7 8">
          <path fill="var(--neutral-6)" fillRule="evenodd" d="M2 0H.5v8h6V6.5H2V0z" clipRule="evenodd" />
        </svg>
        <span className="ml-3 inline-block">{cluster.cluster_name}</span>
      </div>
      {Object.keys(OrganizationCustomRoleClusterPermission)
        .reverse()
        .map((permission: string) => (
          <div
            key={`${cluster.cluster_id}.${permission}`}
            className="flex h-full flex-1 items-center justify-center border-r border-neutral px-4 last:border-0"
          >
            <Controller
              name={`cluster_permissions.${cluster.cluster_id}`}
              control={control}
              render={({ field }) => (
                <Checkbox
                  data-testid={`radio-${cluster.permission}`}
                  name={field.name}
                  value={permission}
                  checked={field.value === permission}
                  onCheckedChange={(checked) => {
                    const value = checked ? permission : OrganizationCustomRoleClusterPermission.VIEWER
                    field.onChange(value)
                  }}
                />
              )}
            />
          </div>
        ))}
    </div>
  )
}

export default RowCluster
