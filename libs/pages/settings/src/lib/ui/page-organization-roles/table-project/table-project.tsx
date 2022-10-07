import { OrganizationCustomRoleProjectPermissions } from 'qovery-typescript-axios/api'
import Row from './row/row'

export interface TableProjectProps {
  projects: OrganizationCustomRoleProjectPermissions[]
}

export function TableProject(props: TableProjectProps) {
  const { projects } = props
  // const { control } = useFormContext()

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
        <Row key={project.project_id} project={project} />
      ))}
    </div>
  )
}

export default TableProject
