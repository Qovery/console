import { EnvironmentModeEnum, type Organization } from 'qovery-typescript-axios'
import { BlockContentDelete, IconAwesomeEnum } from '@qovery/shared/ui'

export interface PageOrganizationDangerZoneProps {
  deleteOrganization: () => void
  loading: boolean
  organization?: Organization
}

export function PageOrganizationDangerZone(props: PageOrganizationDangerZoneProps) {
  const { deleteOrganization, organization, loading } = props
  return (
    <div className="flex w-full flex-col justify-between">
      <div className="max-w-content-with-navigation-left p-8">
        <BlockContentDelete
          title="Delete organization"
          ctaLabel="Delete organization"
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
              text: 'Github connection',
            },
            {
              icon: IconAwesomeEnum.TRASH,
              text: 'Link cloud providers',
            },
          ]}
          callback={deleteOrganization}
          modalConfirmation={{
            mode: EnvironmentModeEnum.PRODUCTION,
            title: 'Delete organization',
            name: organization?.name,
          }}
        />
      </div>
    </div>
  )
}

export default PageOrganizationDangerZone
