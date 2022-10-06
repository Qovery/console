import {
  OrganizationCustomRoleProjectPermission,
  OrganizationCustomRoleUpdateRequestPermissions,
} from 'qovery-typescript-axios'
import { OrganizationCustomRoleProjectPermissions } from 'qovery-typescript-axios/api'
import { Controller, useFormContext } from 'react-hook-form'
import { InputCheckbox } from '@qovery/shared/ui'

export interface TableProjectProps {
  projects: OrganizationCustomRoleProjectPermissions[]
}

export function TableProject(props: TableProjectProps) {
  const { projects } = props
  const { control } = useFormContext()

  // console.log(projects[4])

  return (
    <div className="border border-element-light-lighter-400 border-b-0 rounded text-xs text-text-600">
      <div className="flex h-10 sticky bg-white top-0 z-10 rounded border-element-light-lighter-400 border-b">
        <div className="flex items-center w-1/4 h-full flex-auto px-4 font-medium border-r border-element-light-lighter-400">
          Project level permissions
        </div>
        <div className="flex items-center justify-center h-full flex-1 px-4 font-medium border-r border-element-light-lighter-400">
          Admin
        </div>
        <div className="flex items-center justify-center h-full flex-1 px-4 font-medium border-r border-element-light-lighter-400">
          Manager
        </div>
        <div className="flex items-center justify-center h-full flex-1 px-4 font-medium border-r border-element-light-lighter-400">
          Deployer
        </div>
        <div className="flex items-center justify-center h-full flex-1 px-4 font-medium border-r border-element-light-lighter-400">
          Viewer
        </div>
        <div className="flex items-center justify-center h-full flex-1 px-4 font-medium">No Access</div>
      </div>
      {projects.map((project: OrganizationCustomRoleProjectPermissions) => (
        <div key={project.project_id}>
          <div className="flex items-center h-10 bg-element-light-lighter-300 border-element-light-lighter-400 border-b">
            <div className="flex-auto flex items-center h-full px-4 w-1/4 border-r border-element-light-lighter-500 font-medium">
              {project.project_name}
            </div>
            <div className="flex-1 flex items-center justify-center h-full px-4 border-r border-element-light-lighter-500">
              <InputCheckbox name="admin" value="ADMIN" />
            </div>
            <div className="flex-1 flex items-center justify-center h-full px-4 border-r border-element-light-lighter-500">
              <InputCheckbox name="viewer" value={OrganizationCustomRoleProjectPermission.VIEWER} />
            </div>
            <div className="flex-1 flex items-center justify-center h-full px-4 border-r border-element-light-lighter-500">
              <InputCheckbox name="deployer" value={OrganizationCustomRoleProjectPermission.DEPLOYER} />
            </div>
            <div className="flex-1 flex items-center justify-center h-full px-4 border-r border-element-light-lighter-500">
              <InputCheckbox name="viewer" value={OrganizationCustomRoleProjectPermission.VIEWER} />
            </div>
            <div className="flex-1 flex items-center justify-center h-full px-4">
              <InputCheckbox name="no-access" value={OrganizationCustomRoleProjectPermission.NO_ACCESS} />
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
                  <span className="inline-block ml-3">{permission.environment_type}</span>
                </div>
                <div className="flex-1 flex items-center justify-center h-full px-4 border-r border-element-light-lighter-500">
                  <Controller
                    name={`project_permissions.${project.project_id}.${permission.environment_type}`}
                    control={control}
                    render={({ field }) => (
                      <InputCheckbox
                        type="radio"
                        name={field.name}
                        onChange={field.onChange}
                        value="ADMIN"
                        formValue={field.value}
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
                        onChange={field.onChange}
                        value={OrganizationCustomRoleProjectPermission.MANAGER}
                        formValue={field.value}
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
                        onChange={field.onChange}
                        value={OrganizationCustomRoleProjectPermission.DEPLOYER}
                        formValue={field.value}
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
                        onChange={field.onChange}
                        value={OrganizationCustomRoleProjectPermission.VIEWER}
                        formValue={field.value}
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
                        onChange={field.onChange}
                        value={OrganizationCustomRoleProjectPermission.NO_ACCESS}
                        formValue={field.value}
                      />
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TableProject
