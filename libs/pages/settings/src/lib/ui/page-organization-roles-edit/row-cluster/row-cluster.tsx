import {
  OrganizationCustomRoleClusterPermission,
  type OrganizationCustomRoleClusterPermissionsInner,
} from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { InputCheckbox } from '@qovery/shared/ui'

export interface RowClusterProps {
  cluster: OrganizationCustomRoleClusterPermissionsInner
  setGlobalCheck?: (value: string) => void
}

const setGlobalCheckByValue = (
  values: { [key: string]: string },
  key: string,
  setGlobalCheck: (value: string) => void
) => {
  let length = 0

  const array = JSON.stringify(values).split(',')

  for (let index = 0; index < array.length; index++) {
    if (array[index].includes(key)) length += 1
  }

  if (length < Object.keys(OrganizationCustomRoleClusterPermission).length) {
    // reset global check
    setGlobalCheck('')
  } else {
    setGlobalCheck(key)
  }
}

export function RowCluster(props: RowClusterProps) {
  const { cluster, setGlobalCheck } = props

  const { control, getValues } = useFormContext()

  return (
    <div className="flex h-10 border-b border-neutral-250">
      <div className="flex h-full w-1/4 flex-auto items-center border-r border-neutral-250 px-4 font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" width="7" height="8" fill="none" viewBox="0 0 7 8">
          <path fill="#C6D3E7" fillRule="evenodd" d="M2 0H.5v8h6V6.5H2V0z" clipRule="evenodd" />
        </svg>
        <span className="ml-3 inline-block">{cluster.cluster_name}</span>
      </div>
      {Object.keys(OrganizationCustomRoleClusterPermission)
        .reverse()
        .map((permission: string) => (
          <div
            key={`${cluster.cluster_id}.${permission}`}
            className="flex h-full flex-1 items-center justify-center border-r border-neutral-250 px-4 last:border-0"
          >
            <Controller
              name={`cluster_permissions.${cluster.cluster_id}`}
              control={control}
              render={({ field }) => (
                <InputCheckbox
                  dataTestId={`radio-${cluster.permission}`}
                  type="radio"
                  name={field.name}
                  value={permission}
                  formValue={field.value}
                  onChange={(e) => {
                    field.onChange(e)

                    if (setGlobalCheck)
                      setGlobalCheckByValue(
                        getValues(`cluster_permissions.${cluster.cluster_id}`),
                        permission,
                        setGlobalCheck
                      )
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
