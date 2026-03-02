import {
  EnvironmentModeEnum,
  OrganizationCustomRoleProjectPermission,
  type OrganizationCustomRoleProjectPermissionsInner,
  type OrganizationCustomRoleUpdateRequestProjectPermissionsInnerPermissionsInner,
} from 'qovery-typescript-axios'
import { useState } from 'react'
import { Controller, type FieldValues, type UseFormSetValue, useFormContext } from 'react-hook-form'
import { Checkbox } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { defaultProjectPermission } from '../utils/default-project-permission'

export interface RowProjectProps {
  project: OrganizationCustomRoleProjectPermissionsInner
}

enum ProjectPermissionAdmin {
  ADMIN = 'ADMIN',
}

export const OrganizationCustomRoleProjectPermissionAdmin = {
  ...OrganizationCustomRoleProjectPermission,
  ...ProjectPermissionAdmin,
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

  if (length < Object.keys(EnvironmentModeEnum).length) {
    // reset global check
    setGlobalCheck('')
  } else {
    setGlobalCheck(key)
  }
}

const onChangeHeadCheckbox = (
  project: OrganizationCustomRoleProjectPermissionsInner,
  currentPermission: string,
  globalCheck: string,
  setGlobalCheck: (value: string) => void,
  setValue: UseFormSetValue<FieldValues>
) => {
  // get new value if currentPermission is already checked
  const newValue =
    globalCheck !== currentPermission ? currentPermission : OrganizationCustomRoleProjectPermissionAdmin.NO_ACCESS

  setGlobalCheck(newValue)
  // set value for nextPermission if admin is uncheck
  Object.keys(EnvironmentModeEnum).forEach((currentMode) => {
    const key = `project_permissions.${project.project_id}.${currentMode}`
    setValue(key, newValue)
  })
}

export function RowProject(props: RowProjectProps) {
  const { project } = props

  const { control, watch, setValue, getValues } = useFormContext()

  const [globalCheck, setGlobalCheck] = useState(project.is_admin ? ProjectPermissionAdmin.ADMIN : '')

  return (
    <>
      <div>
        {(project.is_admin ? defaultProjectPermission('ADMIN') : project.permissions)?.map(
          (
            permission:
              | OrganizationCustomRoleUpdateRequestProjectPermissionsInnerPermissionsInner
              | { environment_type: EnvironmentModeEnum; permission: string }
          ) => (
            <div
              key={`${project.project_id}-${permission.environment_type}`}
              className="flex h-10 border-b border-neutral"
            >
              <div className="flex h-full w-1/4 flex-auto items-center border-r border-neutral px-4 font-medium last:border-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="7" height="8" fill="none" viewBox="0 0 7 8">
                  <path fill="var(--neutral-6)" fillRule="evenodd" d="M2 0H.5v8h6V6.5H2V0z" clipRule="evenodd" />
                </svg>
                <span className="ml-3 inline-block">{upperCaseFirstLetter(permission.environment_type)}</span>
              </div>
              <div className="flex h-full flex-1 items-center justify-center border-r border-neutral px-4">
                <Checkbox
                  data-testid="admin-checkbox"
                  name={`${project.project_id}.${permission.environment_type}`}
                  disabled
                  checked={watch(`project_permissions.${project.project_id}.is_admin`)}
                />
              </div>
              {Object.keys(OrganizationCustomRoleProjectPermission)
                .reverse()
                .map((currentPermission) => (
                  <div
                    key={currentPermission}
                    className="flex h-full flex-1 items-center justify-center border-r border-neutral px-4 last:border-0"
                  >
                    <Controller
                      name={`project_permissions.${project.project_id}.${permission.environment_type}`}
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          name={field.name}
                          value={currentPermission}
                          checked={field.value === currentPermission}
                          onCheckedChange={(checked) => {
                            if (!checked) {
                              return
                            }

                            field.onChange(currentPermission)

                            setGlobalCheckByValue(
                              getValues(`project_permissions.${project.project_id}`),
                              currentPermission,
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
        )}
      </div>
      <div
        data-testid="project-head"
        className="flex h-10 items-center border-b border-neutral bg-surface-neutral-subtle"
      >
        <div className="flex h-full w-1/4 flex-auto items-center border-r border-neutral px-4 font-medium">
          {project.project_name}
        </div>
        {Object.keys(OrganizationCustomRoleProjectPermissionAdmin)
          .reverse()
          .map((permission) => (
            <div
              key={permission}
              className="flex h-full flex-1 items-center justify-center border-r border-neutral px-4 last:border-0"
            >
              <Checkbox
                data-testid={`project.${permission}`}
                name={`project_permissions.${project.project_id}`}
                value={permission}
                checked={globalCheck === permission}
                onCheckedChange={() => {
                  onChangeHeadCheckbox(project, permission, globalCheck, setGlobalCheck, setValue)
                }}
              />
            </div>
          ))}
      </div>
    </>
  )
}

export default RowProject
