import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { BlockContentDelete, HelpSection } from '@qovery/shared/ui'

export interface PageSettingsDangerZoneProps {
  deleteApplication: () => void
  application?: ApplicationEntity
  environmentMode?: EnvironmentModeEnum
}

export function PageSettingsDangerZone(props: PageSettingsDangerZoneProps) {
  const { deleteApplication, application, environmentMode } = props
  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <BlockContentDelete
          title="Delete application"
          ctaLabel="Delete application"
          callback={deleteApplication}
          modalConfirmation={{
            mode: environmentMode,
            title: 'Delete application',
            description: 'To confirm the deletion of your application, please type the name of the application:',
            name: application?.name,
          }}
        />
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#delete-an-application',
            linkLabel: 'How to delete my application',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsDangerZone
