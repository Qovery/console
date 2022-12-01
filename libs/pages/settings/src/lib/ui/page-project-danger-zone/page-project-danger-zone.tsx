import { EnvironmentModeEnum, Project } from 'qovery-typescript-axios'
import { BlockContentDelete, HelpSection, IconAwesomeEnum } from '@qovery/shared/ui'

export interface PageProjectDangerZoneProps {
  deleteProject: () => void
  loading: boolean
  project?: Project
}

export function PageProjectDangerZone(props: PageProjectDangerZoneProps) {
  const { deleteProject, project, loading } = props
  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <BlockContentDelete
          title="Delete project"
          ctaLabel="Delete project"
          ctaLoading={loading}
          list={[
            {
              icon: IconAwesomeEnum.TRASH,
              text: 'Databases',
            },
            {
              icon: IconAwesomeEnum.TRASH,
              text: 'Applications',
            },
            {
              icon: IconAwesomeEnum.TRASH,
              text: 'Environments',
            },
          ]}
          callback={deleteProject}
          modalConfirmation={{
            mode: EnvironmentModeEnum.PRODUCTION,
            title: 'Delete project',
            description: 'To confirm the deletion of your project, please type the name of the organization:',
            name: project?.name,
          }}
        />
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/project/',
            linkLabel: 'How to delete my project',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageProjectDangerZone
