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

export interface RowProps {
  project: OrganizationCustomRoleProjectPermissions
}

const setGlobalCheckByValue = (
  values: any,
  key: OrganizationCustomRoleProjectPermission,
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
  currentPermission: OrganizationCustomRoleProjectPermission | 'ADMIN',
  nextPermission: OrganizationCustomRoleProjectPermission,
  globalCheck: string,
  setGlobalCheck: (value: string) => void,
  setValue: (key: string, value: string) => void
) => {
  // get new value if currentPermission is already checked
  const newValue = globalCheck !== currentPermission ? currentPermission : nextPermission
  setGlobalCheck(newValue)
  // set value for nextPermission if admin is uncheck
  project.permissions?.forEach((currentPermission) => {
    const key = `project_permissions.${project.project_id}.${currentPermission.environment_type}`
    setValue(key, newValue)
  })
}

export function Row(props: RowProps) {
  const { project } = props

  const { control, watch, setValue, getValues } = useFormContext()

  const [globalCheck, setGlobalCheck] = useState(project.is_admin ? 'ADMIN' : '')

  return (
    <div key={project.project_id}>
      <div className="flex items-center h-10 bg-element-light-lighter-300 border-element-light-lighter-400 border-b">
        <div className="flex-auto flex items-center h-full px-4 w-1/4 border-r border-element-light-lighter-500 font-medium">
          {project.project_name}
        </div>
        <div className="flex-1 flex items-center justify-center h-full px-4 border-r border-element-light-lighter-500">
          <Controller
            name={`project_permissions.${project.project_id}`}
            control={control}
            render={({ field }) => (
              <InputCheckbox
                name={field.name}
                value={globalCheck}
                formValue="ADMIN"
                onChange={(e) => {
                  onChangeHeadCheckbox(
                    project,
                    'ADMIN',
                    OrganizationCustomRoleProjectPermission.MANAGER,
                    globalCheck,
                    setGlobalCheck,
                    setValue
                  )
                  // set change for react-hook-form
                  field.onChange(e)
                }}
              />
            )}
          />
        </div>
        <div className="flex-1 flex items-center justify-center h-full px-4 border-r border-element-light-lighter-500">
          <InputCheckbox
            name={`project_permissions.${project.project_id}`}
            value={globalCheck}
            formValue={OrganizationCustomRoleProjectPermission.MANAGER}
            isChecked={globalCheck !== OrganizationCustomRoleProjectPermission.MANAGER}
            onChange={() => {
              onChangeHeadCheckbox(
                project,
                OrganizationCustomRoleProjectPermission.MANAGER,
                OrganizationCustomRoleProjectPermission.DEPLOYER,
                globalCheck,
                setGlobalCheck,
                setValue
              )
            }}
          />
        </div>
        <div className="flex-1 flex items-center justify-center h-full px-4 border-r border-element-light-lighter-500">
          <InputCheckbox
            name={`project_permissions.${project.project_id}`}
            value={globalCheck}
            formValue={OrganizationCustomRoleProjectPermission.DEPLOYER}
            isChecked={globalCheck !== OrganizationCustomRoleProjectPermission.DEPLOYER}
            onChange={() => {
              onChangeHeadCheckbox(
                project,
                OrganizationCustomRoleProjectPermission.DEPLOYER,
                OrganizationCustomRoleProjectPermission.VIEWER,
                globalCheck,
                setGlobalCheck,
                setValue
              )
            }}
          />
        </div>
        <div className="flex-1 flex items-center justify-center h-full px-4 border-r border-element-light-lighter-500">
          <InputCheckbox
            name={`project_permissions.${project.project_id}`}
            value={globalCheck}
            formValue={OrganizationCustomRoleProjectPermission.VIEWER}
            isChecked={globalCheck !== OrganizationCustomRoleProjectPermission.VIEWER}
            onChange={() => {
              onChangeHeadCheckbox(
                project,
                OrganizationCustomRoleProjectPermission.VIEWER,
                OrganizationCustomRoleProjectPermission.NO_ACCESS,
                globalCheck,
                setGlobalCheck,
                setValue
              )
            }}
          />
        </div>
        <div className="flex-1 flex items-center justify-center h-full px-4">
          <InputCheckbox
            name={`project_permissions.${project.project_id}`}
            value={globalCheck}
            formValue={OrganizationCustomRoleProjectPermission.NO_ACCESS}
            isChecked={globalCheck !== OrganizationCustomRoleProjectPermission.NO_ACCESS}
            onChange={() => {
              onChangeHeadCheckbox(
                project,
                OrganizationCustomRoleProjectPermission.NO_ACCESS,
                OrganizationCustomRoleProjectPermission.VIEWER,
                globalCheck,
                setGlobalCheck,
                setValue
              )
            }}
          />
        </div>
      </div>
      <div>
        {project.permissions?.map((permission: OrganizationCustomRoleUpdateRequestPermissions, index) => (
          <div
            key={`${project.project_id}-${permission.environment_type}-${index}`}
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
                name={`${project.project_id}.${permission.environment_type}`}
                disabled
                type="radio"
                isChecked={watch(`project_permissions.${project.project_id}.is_admin`)}
                value={globalCheck}
                formValue="ADMIN"
              />
            </div>
            <div className="flex-1 flex items-center justify-center h-full px-4 border-r border-element-light-lighter-500">
              <Controller
                name={`project_permissions.${project.project_id}.${permission.environment_type}`}
                control={control}
                render={({ field }) => (
                  <InputCheckbox
                    type="radio"
                    name={field.name}
                    value={OrganizationCustomRoleProjectPermission.MANAGER}
                    formValue={field.value}
                    onChange={(e) => {
                      field.onChange(e)

                      setGlobalCheckByValue(
                        getValues(`project_permissions.${project.project_id}`),
                        OrganizationCustomRoleProjectPermission.MANAGER,
                        setGlobalCheck
                      )
                    }}
                  />
                )}
              />
            </div>
            <div className="flex-1 flex items-center justify-center h-full px-4 border-r border-element-light-lighter-500">
              <Controller
                name={`project_permissions.${project.project_id}.${permission.environment_type}`}
                control={control}
                render={({ field }) => (
                  <InputCheckbox
                    type="radio"
                    name={field.name}
                    value={OrganizationCustomRoleProjectPermission.DEPLOYER}
                    formValue={field.value}
                    onChange={(e) => {
                      field.onChange(e)

                      setGlobalCheckByValue(
                        getValues(`project_permissions.${project.project_id}`),
                        OrganizationCustomRoleProjectPermission.DEPLOYER,
                        setGlobalCheck
                      )
                    }}
                  />
                )}
              />
            </div>
            <div className="flex-1 flex items-center justify-center h-full px-4 border-r border-element-light-lighter-500">
              <Controller
                name={`project_permissions.${project.project_id}.${permission.environment_type}`}
                control={control}
                render={({ field }) => (
                  <InputCheckbox
                    type="radio"
                    name={field.name}
                    value={OrganizationCustomRoleProjectPermission.VIEWER}
                    formValue={field.value}
                    onChange={(e) => {
                      field.onChange(e)

                      setGlobalCheckByValue(
                        getValues(`project_permissions.${project.project_id}`),
                        OrganizationCustomRoleProjectPermission.VIEWER,
                        setGlobalCheck
                      )
                    }}
                  />
                )}
              />
            </div>
            <div className="flex-1 flex items-center justify-center h-full px-4">
              <Controller
                name={`project_permissions.${project.project_id}.${permission.environment_type}`}
                control={control}
                render={({ field }) => (
                  <InputCheckbox
                    type="radio"
                    name={field.name}
                    value={OrganizationCustomRoleProjectPermission.NO_ACCESS}
                    formValue={field.value}
                    onChange={(e) => {
                      field.onChange(e)

                      setGlobalCheckByValue(
                        getValues(`project_permissions.${project.project_id}`),
                        OrganizationCustomRoleProjectPermission.NO_ACCESS,
                        setGlobalCheck
                      )
                    }}
                  />
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Row
