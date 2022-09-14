import { StateEnum } from 'qovery-typescript-axios'
import { useState } from 'react'
import { RunningStatus } from '@qovery/shared/enums'
import { StatusMenuAction, StatusMenuActions, StatusMenuInformation } from '@qovery/shared/ui'
import { isRunning, isStop, isWarning, upperCaseFirstLetter } from '@qovery/shared/utils'
import Icon from '../icon/icon'

export enum StatusMenuType {
  AVAILABLE = 'available',
  STOP = 'stop',
  WARNING = 'warning',
  RUNNING = 'running',
}
export interface StatusMenuProps {
  statusActions: {
    status: StateEnum
    running_status: RunningStatus
    actions: StatusMenuActions[]
    information: StatusMenuInformation
  }
}

export function StatusMenu(props: StatusMenuProps) {
  const { statusActions } = props

  const [open, setOpen] = useState(false)

  const statusInfos = (status: StateEnum) => {
    if (isStop(status)) {
      return {
        name: StatusMenuType.STOP,
        icon: <Icon name="icon-solid-circle-stop" className="text-xs" />,
      }
    } else if (isWarning(status)) {
      return {
        name: StatusMenuType.WARNING,
        icon: <Icon name="icon-solid-circle-exclamation" className="text-xs" />,
      }
    } else if (isRunning(status)) {
      return {
        name: StatusMenuType.RUNNING,
        icon: <Icon name="icon-solid-play" className="text-xs" />,
      }
    } else {
      return {
        name: StatusMenuType.AVAILABLE,
        icon: <Icon name="icon-solid-play" className="text-xs" />,
      }
    }
  }

  const statusClassName = `status-menu status-menu--${open ? 'open' : 'closed'} status-menu--${
    statusInfos(statusActions.status).name
  } h-6 inline-flex items-center pl-2 border rounded overflow-hidden`

  return (
    <div className={statusClassName} data-testid="statusmenu">
      <p className="text-xs font-semibold">
        {upperCaseFirstLetter(statusActions.running_status?.replace('_', ' ').toLowerCase())}
      </p>
      <div className="status-menu__trigger h-full inline-flex items-center border-l ml-2 hover:transition transition ease-in-out duration-300">
        <StatusMenuAction
          trigger={
            <div className="h-full flex items-center gap-1.5 px-2 cursor-pointer">
              {statusInfos(statusActions.status).icon} <Icon name="icon-solid-angle-down" className="text-xs" />
            </div>
          }
          statusActions={statusActions}
          setOpen={(isOpen) => setOpen(isOpen)}
          width={248}
        />
      </div>
    </div>
  )
}

export default StatusMenu
