import { type EnvironmentModeEnum } from 'qovery-typescript-axios'
import { BlockContentDelete, HelpSection } from '@qovery/shared/ui'

export interface PageSettingsDangerZoneProps {
  deleteService: () => void
  serviceName?: string
  environmentMode?: EnvironmentModeEnum
}

export function PageSettingsDangerZone(props: PageSettingsDangerZoneProps) {
  const { deleteService, serviceName, environmentMode } = props
  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <BlockContentDelete
          title="Delete service"
          ctaLabel="Delete service"
          callback={deleteService}
          modalConfirmation={{
            mode: environmentMode,
            title: 'Delete service',
            name: serviceName,
          }}
        />
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#delete-an-application',
            linkLabel: 'How to delete my service',
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsDangerZone
