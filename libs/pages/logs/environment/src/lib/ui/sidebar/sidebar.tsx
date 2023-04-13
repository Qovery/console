import {
  DeploymentHistoryEnvironment,
  DeploymentStageWithServicesStatuses,
  EnvironmentStatus,
} from 'qovery-typescript-axios'
import { useState } from 'react'
import { ApplicationEntity, DatabaseEntity } from '@qovery/shared/interfaces'
import { Icon, IconAwesomeEnum } from '@qovery/shared/ui'
import SidebarPipeline from '../sidebar-pipeline/sidebar-pipeline'
import SidebarStatus from '../sidebar-status/sidebar-status'

export interface SidebarProps {
  services: Array<ApplicationEntity | DatabaseEntity>
  serviceId: string
  statusStages?: DeploymentStageWithServicesStatuses[]
  environmentStatus?: EnvironmentStatus
  environmentDeploymentHistory?: DeploymentHistoryEnvironment
  clusterBanner?: boolean
}

export function Sidebar(props: SidebarProps) {
  const { services, environmentDeploymentHistory, serviceId, statusStages, environmentStatus, clusterBanner } = props

  const [openSidebar, setOpenSidebar] = useState(true)

  return (
    <div
      className={`flex shrink-0 border-x border-element-light-darker-100 bg-element-light-darker-400 
      ${clusterBanner ? 'h-[calc(100vh-8rem)]' : 'h-[calc(100vh-4rem)]'} ${openSidebar ? 'w-[340px]' : 'w-5'}`}
    >
      <div data-testid="sidebar" className={`w-full h-full overflow-x-scroll ${!openSidebar ? 'hidden' : ''}`}>
        <SidebarStatus
          environmentDeploymentHistory={environmentDeploymentHistory}
          environmentStatus={environmentStatus}
        />
        <SidebarPipeline services={services} serviceId={serviceId} statusStages={statusStages} />
      </div>
      <div
        data-testid="sidebar-resize-button"
        onClick={() => setOpenSidebar(!openSidebar)}
        className={`border-element-light-darker-100 flex justify-center items-center w-5 text-text-400 hover:bg-element-light-darker-300 cursor-pointer transition-all ease-in-out duration-150 ${
          openSidebar ? 'border-l' : ''
        } `}
      >
        <Icon name={IconAwesomeEnum.ANGLE_DOWN} className={`text-sm ${openSidebar ? 'rotate-90' : '-rotate-90'}`} />
      </div>
    </div>
  )
}

export default Sidebar
