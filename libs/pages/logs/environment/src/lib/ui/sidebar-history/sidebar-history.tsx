import { DeploymentHistoryEnvironment } from 'qovery-typescript-axios'
import { useState } from 'react'
import { DEPLOYMENT_LOGS_VERSION_URL } from '@qovery/shared/routes'
import { Icon, IconAwesomeEnum, Menu, MenuAlign, MenuData, StatusChip, Tooltip } from '@qovery/shared/ui'
import { dateFullFormat, trimId } from '@qovery/shared/utils'

export interface SidebarHistoryProps {
  data: DeploymentHistoryEnvironment[]
  pathLogs: string
  serviceId: string
  versionId?: string
}

export function SidebarHistory({ data, serviceId, versionId, pathLogs }: SidebarHistoryProps) {
  const [open, setOpen] = useState(false)

  const menuHistory: MenuData = [
    {
      items:
        data?.map((item, index) => ({
          name: item.id,
          itemContentCustom: (
            <div
              className={`flex justify-between w-full py-2 text-xs ${
                item.id === versionId || (!versionId && index === 0) ? 'text-brand-400' : 'text-text-300'
              }`}
            >
              <div className="flex">
                <StatusChip className="mr-3" status={item.status} />
                <Tooltip content={item.id}>
                  <p className="font-medium text-brand-300">{trimId(item.id)}</p>
                </Tooltip>
              </div>
              <div>{dateFullFormat(item.created_at)}</div>
            </div>
          ),
          link: {
            url: pathLogs + DEPLOYMENT_LOGS_VERSION_URL(serviceId, item.id),
          },
        })) || [],
    },
  ]

  const currentIndex = data?.findIndex((item) => item.id === versionId)

  return (
    <div className="flex justify-center border-b border-element-light-darker-100 px-4 py-3">
      <div>
        <Menu
          width={300}
          menus={menuHistory}
          arrowAlign={MenuAlign.CENTER}
          onOpen={(isOpen) => setOpen(isOpen)}
          trigger={
            <div
              role="button"
              className={`text-xs font-medium hover:text-brand-400 transition ${
                open ? 'text-brand-400' : 'text-zinc-50'
              }`}
            >
              <span className="inline-block mr-1">
                Deployment - {dateFullFormat(data?.[currentIndex === -1 ? 0 : currentIndex]?.created_at)}
              </span>
              <Icon name={IconAwesomeEnum.ANGLE_DOWN} />
            </div>
          }
        />
      </div>
    </div>
  )
}

export default SidebarHistory
