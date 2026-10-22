import {
  EnvironmentModeEnum,
  OrganizationCustomRoleProjectPermission,
  type OrganizationCustomRoleProjectPermissionsInner,
  type OrganizationCustomRoleUpdateRequestProjectPermissionsInnerPermissionsInner,
} from 'qovery-typescript-axios'
import { useState } from 'react'
import {
  Controller,
  type FieldValues,
  type UseFormGetValues,
  type UseFormSetValue,
  useFormContext,
} from 'react-hook-form'
import { Checkbox } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { defaultProjectPermission } from '../utils/default-project-permission'
import {
  REMOTE_ACCESS_COLUMN_CLASS_NAME,
  REMOTE_ACCESS_FLAGS,
  type RemoteAccessFlag,
  canGrantRemoteAccess,
  remoteAccessAfterLevelChange,
  remoteAccessFormKey,
} from '../utils/remote-access'

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

const updateRemoteAccess = (
  projectId: string | undefined,
  environmentType: string | undefined,
  previousLevel: string | undefined,
  nextLevel: string,
  getValues: UseFormGetValues<FieldValues>,
  setValue: UseFormSetValue<FieldValues>
) => {
  REMOTE_ACCESS_FLAGS.forEach((flag) => {
    const key = `${remoteAccessFormKey(flag)}.${projectId}.${environmentType}`
    setValue(key, remoteAccessAfterLevelChange(previousLevel, nextLevel, Boolean(getValues(key))))
  })
}

const remoteAccessLabels: Record<RemoteAccessFlag, string> = {
  shell: 'Shell',
  port_forward: 'Port-forward',
}

const onChangeHeadCheckbox = (
  project: OrganizationCustomRoleProjectPermissionsInner,
  currentPermission: string,
  globalCheck: string,
  setGlobalCheck: (value: string) => void,
  getValues: UseFormGetValues<FieldValues>,
  setValue: UseFormSetValue<FieldValues>
) => {
  // get new value if currentPermission is already checked
  const newValue =
    globalCheck !== currentPermission ? currentPermission : OrganizationCustomRoleProjectPermissionAdmin.NO_ACCESS

  setGlobalCheck(newValue)
  // set value for nextPermission if admin is uncheck
  Object.keys(EnvironmentModeEnum).forEach((currentMode) => {
    const key = `project_permissions.${project.project_id}.${currentMode}`
    const previousValue = getValues(key)
    setValue(key, newValue)
    updateRemoteAccess(project.project_id, currentMode, previousValue, newValue, getValues, setValue)
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
                            const value = checked
                              ? currentPermission
                              : OrganizationCustomRoleProjectPermission.NO_ACCESS
                            const previousValue = field.value
                            field.onChange(value)
                            updateRemoteAccess(
                              project.project_id,
                              permission.environment_type,
                              previousValue,
                              value,
                              getValues,
                              setValue
                            )
                            setGlobalCheckByValue(
                              getValues(`project_permissions.${project.project_id}`),
                              value,
                              setGlobalCheck
                            )
                          }}
                        />
                      )}
                    />
                  </div>
                ))}
              {REMOTE_ACCESS_FLAGS.map((flag) => {
                const level = watch(`project_permissions.${project.project_id}.${permission.environment_type}`)
                const isAdmin = level === ProjectPermissionAdmin.ADMIN
                return (
                  <div
                    key={flag}
                    className={`flex h-full items-center justify-center border-r border-neutral bg-surface-neutral-subtle px-4 last:border-0 ${REMOTE_ACCESS_COLUMN_CLASS_NAME}`}
                  >
                    <Controller
                      name={`${remoteAccessFormKey(flag)}.${project.project_id}.${permission.environment_type}`}
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          data-testid={`${flag}-checkbox`}
                          aria-label={`${remoteAccessLabels[flag]} on ${permission.environment_type}`}
                          name={field.name}
                          disabled={isAdmin || !canGrantRemoteAccess(level)}
                          checked={isAdmin || Boolean(field.value)}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                        />
                      )}
                    />
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
      <div
        data-testid="project-head"
        className="flex h-10 items-center border-b border-neutral bg-surface-neutral-component"
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
                  onChangeHeadCheckbox(project, permission, globalCheck, setGlobalCheck, getValues, setValue)
                }}
              />
            </div>
          ))}
        {REMOTE_ACCESS_FLAGS.map((flag) => (
          <div
            key={flag}
            className={`flex h-full items-center justify-center border-r border-neutral px-4 last:border-0 ${REMOTE_ACCESS_COLUMN_CLASS_NAME}`}
          />
        ))}
      </div>
    </>
  )
}

export default RowProject
