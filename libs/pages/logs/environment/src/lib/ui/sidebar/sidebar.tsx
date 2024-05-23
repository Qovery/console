import {
  type DeploymentHistoryEnvironment,
  type DeploymentStageWithServicesStatuses,
  type EnvironmentStatus,
  type StateEnum,
} from 'qovery-typescript-axios'
import { useState } from 'react'
import { type AnyService } from '@qovery/domains/services/data-access'
import { Icon } from '@qovery/shared/ui'
import SidebarHistoryFeature from '../../feature/sidebar-history-feature/sidebar-history-feature'
import SidebarPipeline from '../sidebar-pipeline/sidebar-pipeline'
import SidebarStatus from '../sidebar-status/sidebar-status'

export interface SidebarProps {
  services: AnyService[]
  statusStages?: DeploymentStageWithServicesStatuses[]
  environmentStatus?: EnvironmentStatus
  currentEnvironmentState?: StateEnum
  environmentDeploymentHistory?: DeploymentHistoryEnvironment
  versionId?: string
  serviceId?: string
}

export function Sidebar({ services, statusStages, environmentStatus, versionId, serviceId }: SidebarProps) {
  const [openSidebar, setOpenSidebar] = useState(true)

  return (
    <div
      className={`flex h-[calc(100vh-4rem)] shrink-0 border-x border-neutral-500 bg-neutral-650 ${
        openSidebar ? 'w-[340px]' : 'w-5'
      }`}
    >
      <div data-testid="sidebar" className={`h-full w-full overflow-x-scroll ${!openSidebar ? 'hidden' : ''}`}>
        <SidebarHistoryFeature serviceId={serviceId} versionId={versionId} />
        <SidebarStatus environmentStatus={environmentStatus} />
        <SidebarPipeline services={services} versionId={versionId} serviceId={serviceId} statusStages={statusStages} />
      </div>
      <div
        data-testid="sidebar-resize-button"
        onClick={() => setOpenSidebar(!openSidebar)}
        className={`flex w-5 cursor-pointer items-center justify-center border-neutral-500 text-neutral-350 transition-all duration-150 ease-in-out hover:bg-neutral-600 ${
          openSidebar ? 'border-l' : ''
        } `}
      >
        <Icon iconName="angle-down" className={`text-sm ${openSidebar ? 'rotate-90' : '-rotate-90'}`} />
      </div>
    </div>
  )
}

export default Sidebar
