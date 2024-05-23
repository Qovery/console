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
    <div className="flex w-full flex-col justify-between">
      <div className="max-w-content-with-navigation-left  p-8">
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
