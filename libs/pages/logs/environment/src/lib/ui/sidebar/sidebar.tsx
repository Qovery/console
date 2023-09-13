import {
  type DeploymentHistoryEnvironment,
  type DeploymentStageWithServicesStatuses,
  type EnvironmentStatus,
  type StateEnum,
} from 'qovery-typescript-axios'
import { useState } from 'react'
import { type ApplicationEntity, type DatabaseEntity } from '@qovery/shared/interfaces'
import { Icon, IconAwesomeEnum } from '@qovery/shared/ui'
import SidebarHistoryFeature from '../../feature/sidebar-history-feature/sidebar-history-feature'
import SidebarPipeline from '../sidebar-pipeline/sidebar-pipeline'
import SidebarStatus from '../sidebar-status/sidebar-status'

export interface SidebarProps {
  services: Array<ApplicationEntity | DatabaseEntity>
  statusStages?: DeploymentStageWithServicesStatuses[]
  environmentStatus?: EnvironmentStatus
  currentEnvironmentState?: StateEnum
  environmentDeploymentHistory?: DeploymentHistoryEnvironment
  versionId?: string
  serviceId?: string
}

export function Sidebar({
  services,
  statusStages,
  environmentStatus,
  currentEnvironmentState,
  versionId,
  serviceId,
}: SidebarProps) {
  const [openSidebar, setOpenSidebar] = useState(true)

  return (
    <div
      className={`flex shrink-0 border-x border-neutral-500 bg-neutral-650 h-[calc(100vh-4rem)] ${
        openSidebar ? 'w-[340px]' : 'w-5'
      }`}
    >
      <div data-testid="sidebar" className={`w-full h-full overflow-x-scroll ${!openSidebar ? 'hidden' : ''}`}>
        <SidebarHistoryFeature environmentState={currentEnvironmentState} serviceId={serviceId} versionId={versionId} />
        <SidebarStatus environmentStatus={environmentStatus} />
        <SidebarPipeline services={services} versionId={versionId} serviceId={serviceId} statusStages={statusStages} />
      </div>
      <div
        data-testid="sidebar-resize-button"
        onClick={() => setOpenSidebar(!openSidebar)}
        className={`border-neutral-500 flex justify-center items-center w-5 text-neutral-350 hover:bg-neutral-600 cursor-pointer transition-all ease-in-out duration-150 ${
          openSidebar ? 'border-l' : ''
        } `}
      >
        <Icon name={IconAwesomeEnum.ANGLE_DOWN} className={`text-sm ${openSidebar ? 'rotate-90' : '-rotate-90'}`} />
      </div>
    </div>
  )
}

export default Sidebar
