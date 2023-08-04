import { DeploymentHistoryEnvironment } from 'qovery-typescript-axios'
import { useState } from 'react'
import { DEPLOYMENT_LOGS_VERSION_URL } from '@qovery/shared/routes'
import { Icon, IconAwesomeEnum, Menu, MenuData, StatusChip } from '@qovery/shared/ui'

export interface SidebarHistoryProps {
  data: DeploymentHistoryEnvironment[]
  pathLogs: string
  serviceId: string
  versionId: string
}

export function SidebarHistory({ data, serviceId, versionId, pathLogs }: SidebarHistoryProps) {
  const [open, setOpen] = useState(false)

  const menuHistory: MenuData = [
    {
      items:
        data?.map((item) => ({
          name: item.id,
          itemContentCustom: (
            <div
              className={`flex justify-between w-full py-2 text-xs ${
                item.id === versionId ? 'text-brand-400' : 'text-text-100'
              }`}
            >
              <StatusChip status={item.status} />
              {item.id}
            </div>
          ),
          link: {
            url: pathLogs + DEPLOYMENT_LOGS_VERSION_URL(serviceId, item.id),
          },
        })) || [],
    },
  ]

  const currentIndex = (data?.findIndex((item) => item.id === versionId) || 0) + 1

  return (
    <div className="flex justify-center border-b border-element-light-darker-100 px-4 py-3">
      <div>
        <Menu
          menus={menuHistory}
          onOpen={(isOpen) => setOpen(isOpen)}
          trigger={
            <div
              role="button"
              className={`text-xs font-medium hover:text-brand-400 transition ${
                open ? 'text-brand-400' : 'text-text-100'
              }`}
            >
              <span className="inline-block mr-1">
                Deployment - {currentIndex}/{data.length}
              </span>{' '}
              <Icon name={IconAwesomeEnum.ANGLE_DOWN} />
            </div>
          }
        />
      </div>
    </div>
  )
}

export default SidebarHistory
