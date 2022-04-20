import { useState } from 'react'
import { ButtonIcon, ButtonIconSize, ButtonIconStyle, Icon, Menu, MenuAlign } from '@console/shared/ui'
import { Environment, Project, Application } from 'qovery-typescript-axios'
import { OVERVIEW_URL } from '@console/shared/utils'
import { useParams } from 'react-router'

export interface BreadcrumbProps {
  projects?: Project[]
  environments?: Environment[]
  applications?: Application[]
}

export function Breadcrumb(props: BreadcrumbProps) {
  const { projects, environments, applications } = props
  const [openProject, setOpenProject] = useState(false)

  const { projectId, environmentId, applicationId } = useParams()

  console.log(projectId)
  const currentProjectName = projects?.find((project) => projectId === project.id)?.name

  const projectMenu = [
    {
      title: 'Project',
      search: true,
      button: 'Change organization',
      buttonLink: '/',
      items: projects
        ? projects?.map((project: Project) => ({
            name: project.name,
            link: OVERVIEW_URL(project.organization?.id, project.id),
            contentLeft:
              projectId === project.id ? <Icon name="icon-solid-check" className="text-sm text-success-400" /> : '',
          }))
        : [],
    },
  ]

  return (
    <div className="flex h-full gap-2 items-center cursor-pointer" onClick={() => setOpenProject(true)}>
      <img
        src="https://console.qovery.com/assets/img/logos/logo.svg"
        className="w-4 h-auto"
        alt="Qovery Organization"
      />
      {projects && projects?.length > 0 && (
        <>
          <p className="text-sm text-text-500 font-medium -mr-3">{currentProjectName}</p>
          <Menu
            menus={projectMenu}
            open={openProject}
            arrowAlign={MenuAlign.START}
            onClose={() => setOpenProject(false)}
            trigger={
              <ButtonIcon
                className="no-active"
                icon="icon-solid-angle-down"
                style={ButtonIconStyle.FLAT}
                size={ButtonIconSize.BIG}
              />
            }
          />
        </>
      )}
    </div>
  )
}

export default Breadcrumb
