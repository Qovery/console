import { ServicePort } from 'qovery-typescript-axios'
import { FlowCreatePort } from '@qovery/shared/console-shared'
import { LoadingStatus } from '@qovery/shared/interfaces'
import { HelpSection } from '@qovery/shared/ui'

export interface PageSettingsPortsProps {
  ports?: ServicePort[]
  onAddPort: () => void
  onEdit: (port: ServicePort) => void
  onDelete: (port: number | ServicePort) => void
  loading?: LoadingStatus
}

export function PageSettingsPorts({ ports, onAddPort, onEdit, onDelete, loading }: PageSettingsPortsProps) {
  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8  max-w-content-with-navigation-left">
        <FlowCreatePort isSetting ports={ports} onAddPort={onAddPort} onRemovePort={onDelete} />
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#ports',
            linkLabel: 'How to configure my application',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsPorts
