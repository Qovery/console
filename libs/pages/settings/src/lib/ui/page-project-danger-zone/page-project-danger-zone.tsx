import { EnvironmentModeEnum, type Project } from 'qovery-typescript-axios'
import { BlockContentDelete } from '@qovery/shared/ui'

export interface PageProjectDangerZoneProps {
  deleteProject: () => void
  loading: boolean
  project?: Project
}

export function PageProjectDangerZone(props: PageProjectDangerZoneProps) {
  const { deleteProject, project, loading } = props
  return (
    <div className="flex w-full flex-col justify-between">
      <div className="max-w-content-with-navigation-left p-8">
        <BlockContentDelete
          title="Delete project"
          ctaLabel="Delete project"
          ctaLoading={loading}
          list={[
            {
              iconName: 'trash',
              iconStyle: 'solid',
              text: 'Databases',
            },
            {
              iconName: 'trash',
              iconStyle: 'solid',
              text: 'Applications',
            },
            {
              iconName: 'trash',
              iconStyle: 'solid',
              text: 'Environments',
            },
          ]}
          callback={deleteProject}
          modalConfirmation={{
            mode: EnvironmentModeEnum.PRODUCTION,
            title: 'Delete project',
            name: project?.name,
          }}
        />
      </div>
    </div>
  )
}

export default PageProjectDangerZone
