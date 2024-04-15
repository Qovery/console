import { type Healthcheck, type ServicePort } from 'qovery-typescript-axios'
import { FlowCreatePort } from '@qovery/shared/console-shared'
import { type PortData } from '@qovery/shared/interfaces'

export interface PageSettingsPortsProps {
  onAddPort: () => void
  onEdit: (port: PortData | ServicePort) => void
  onDelete: (port: PortData | ServicePort, warning?: string) => void
  ports?: ServicePort[]
  healthchecks?: Healthcheck
}

export function PageSettingsPorts({ healthchecks, ports, onAddPort, onEdit, onDelete }: PageSettingsPortsProps) {
  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8  max-w-content-with-navigation-left">
        <FlowCreatePort
          isSetting
          healthchecks={healthchecks}
          ports={ports}
          onAddPort={onAddPort}
          onRemovePort={onDelete}
          onEdit={onEdit}
        />
      </div>
    </div>
  )
}

export default PageSettingsPorts
