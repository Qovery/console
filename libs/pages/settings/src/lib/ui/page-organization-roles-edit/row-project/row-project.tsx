import {
  EnvironmentModeEnum,
  OrganizationCustomRoleProjectPermission,
  OrganizationCustomRoleProjectPermissions,
  OrganizationCustomRoleUpdateRequestPermissions,
} from 'qovery-typescript-axios'
import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { InputCheckbox } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/utils'
import { defaultProjectPermission } from '../../../feature/page-organization-roles-edit-feature/page-organization-roles-edit-feature'

export interface RowProjectProps {
  project: OrganizationCustomRoleProjectPermissions
}

enum ProjectPermissionAdmin {
  ADMIN = 'ADMIN',
}

type OrganizationCustomRoleProjectPermissionAdmin = OrganizationCustomRoleProjectPermission | ProjectPermissionAdmin
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
  project: OrganizationCustomRoleProjectPermissions,
  currentPermission: string,
  globalCheck: string,
  setGlobalCheck: (value: string) => void,
  setValue: (key: string, value: string) => void
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
      <div
        data-testid="project-head"
        className="flex items-center h-10 bg-element-light-lighter-300 border-element-light-lighter-400 border-b"
      >
        <div className="flex-auto flex items-center h-full px-4 w-1/4 border-r border-element-light-lighter-500 font-medium">
          {project.project_name}
        </div>
        {Object.keys(OrganizationCustomRoleProjectPermissionAdmin)
          .reverse()
          .map((permission) => (
            <div
              key={permission}
              className="flex-1 flex items-center justify-center h-full px-4 border-r border-element-light-lighter-500 last:border-0"
            >
              <Controller
                name={`project_permissions.${project.project_id}`}
                control={control}
                render={({ field }) => (
                  <InputCheckbox
                    dataTestId={`project.${permission}`}
                    name={field.name}
                    value={globalCheck}
                    formValue={permission}
                    onChange={(e) => {
                      onChangeHeadCheckbox(project, permission, globalCheck, setGlobalCheck, setValue)
                      // set change for react-hook-form
                      field.onChange(e)
                    }}
                  />
                )}
              />
            </div>
          ))}
      </div>
      <div>
        {(project.is_admin ? defaultProjectPermission('ADMIN') : project.permissions)?.map(
          (
            permission:
              | OrganizationCustomRoleUpdateRequestPermissions
              | { environment_type: EnvironmentModeEnum; permission: string }
          ) => (
            <div
              key={`${project.project_id}-${permission.environment_type}`}
              className="flex h-10 border-element-light-lighter-500 border-b"
            >
              <div className="flex-auto flex items-center h-full px-4 w-1/4 border-r border-element-light-lighter-500 font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="7" height="8" fill="none" viewBox="0 0 7 8">
                  <path fill="#C6D3E7" fillRule="evenodd" d="M2 0H.5v8h6V6.5H2V0z" clipRule="evenodd" />
                </svg>
                <span className="inline-block ml-3">{upperCaseFirstLetter(permission.environment_type)}</span>
              </div>
              <div className="flex-1 flex items-center justify-center h-full px-4 border-r border-element-light-lighter-500">
                <InputCheckbox
                  dataTestId="admin-checkbox"
                  name={`${project.project_id}.${permission.environment_type}`}
                  disabled
                  type="radio"
                  isChecked={watch(`project_permissions.${project.project_id}.is_admin`)}
                  value={globalCheck}
                  formValue="ADMIN"
                />
              </div>
              {Object.keys(OrganizationCustomRoleProjectPermission)
                .reverse()
                .map((currentPermission) => (
                  <div
                    key={currentPermission}
                    className="flex-1 flex items-center justify-center h-full px-4 border-r border-element-light-lighter-500 last:border-0"
                  >
                    <Controller
                      name={`project_permissions.${project.project_id}.${permission.environment_type}`}
                      control={control}
                      render={({ field }) => (
                        <InputCheckbox
                          type="radio"
                          name={field.name}
                          value={currentPermission}
                          formValue={field.value}
                          onChange={(e) => {
                            field.onChange(e)

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
    </>
  )
}

export default RowProject
