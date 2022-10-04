import {
  OrganizationCustomRoleProjectPermission,
  OrganizationCustomRoleUpdateRequestPermissions,
} from 'qovery-typescript-axios'
import { OrganizationCustomRoleProjectPermissions } from 'qovery-typescript-axios/api'
import { InputCheckbox } from '@qovery/shared/ui'

export interface TableProjectProps {
  projects: OrganizationCustomRoleProjectPermissions[]
}

export function TableProject(props: TableProjectProps) {
  const { projects } = props

  console.log(projects)

  return (
    <div className="border border-element-light-lighter-400 rounded text-xs text-text-600">
      <div className="flex h-10">
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
        <>
          <div className="flex items-center h-10 bg-element-light-lighter-300 border-element-light-lighter-400 border-b border-t">
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
            {project.permissions?.map((permission: OrganizationCustomRoleUpdateRequestPermissions) => (
              <div className="flex h-10 border-element-light-lighter-500 border-b last:border-0">
                <div className="flex-auto flex items-center h-full px-4 w-1/4 border-r border-element-light-lighter-500 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="7" height="8" fill="none" viewBox="0 0 7 8">
                    <path fill="#C6D3E7" fillRule="evenodd" d="M2 0H.5v8h6V6.5H2V0z" clipRule="evenodd" />
                  </svg>
                  <span className="inline-block ml-3">{permission.environment_type}</span>
                </div>
                <div className="flex-1 flex items-center justify-center h-full px-4 border-r border-element-light-lighter-500">
                  {permission.permission}
                  {/* <InputCheckbox name="no-access" value={OrganizationCustomRoleProjectPermission.NO_ACCESS} /> */}
                </div>
                <div className="flex-1 flex items-center justify-center h-full px-4 border-r border-element-light-lighter-500">
                  {permission.permission}
                </div>
                <div className="flex-1 flex items-center justify-center h-full px-4 border-r border-element-light-lighter-500">
                  {permission.permission}
                </div>
                <div className="flex-1 flex items-center justify-center h-full px-4 border-r border-element-light-lighter-500">
                  {permission.permission}
                </div>
                <div className="flex-1 flex items-center justify-center h-full px-4">{permission.permission}</div>
              </div>
            ))}
          </div>
        </>
      ))}
    </div>
  )
}

export default TableProject
