import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import { BlockContentDelete, HelpSection, IconAwesomeEnum } from '@qovery/shared/ui'

export interface PageOrganizationDangerZoneProps {
  deleteOrganization: () => void
  loading: boolean
  organization?: OrganizationEntity
}

export function PageOrganizationDangerZone(props: PageOrganizationDangerZoneProps) {
  const { deleteOrganization, organization, loading } = props
  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
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
            description: 'To confirm the deletion of your organization, please type the name of the organization:',
            name: organization?.name,
          }}
        />
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/#delete-an-organization',
            linkLabel: 'How to delete my organization',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageOrganizationDangerZone
