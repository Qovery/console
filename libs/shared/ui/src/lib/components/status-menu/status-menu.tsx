import { StatusMenuAction, StatusMenuActions } from '@console/shared/ui'
import { upperCaseFirstLetter } from '@console/shared/utils'
import { StateEnum } from 'qovery-typescript-axios'
import { useState } from 'react'
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
    // @todo remove "any" after connected all status update
    actions: StatusMenuActions | any
  }
}

export function StatusMenu(props: StatusMenuProps) {
  const { statusActions } = props

  const [open, setOpen] = useState(false)

  const getType = (currentStatus: StateEnum) => {
    switch (currentStatus) {
      case StateEnum.RUNNING || StateEnum.READY || StateEnum.QUEUED || StateEnum.BUILDING || StateEnum.DEPLOYED:
        return StatusMenuType.AVAILABLE
      case StateEnum.STOPPED || StateEnum.STOP_QUEUED:
        return StatusMenuType.STOP
      case StateEnum.DEPLOYMENT_ERROR ||
        StateEnum.DELETE_QUEUED ||
        StateEnum.STOP_ERROR ||
        StateEnum.DELETING ||
        StateEnum.DELETE_ERROR ||
        StateEnum.DELETED ||
        StateEnum.DEPLOYMENT_QUEUED:
        return StatusMenuType.WARNING
      case StateEnum.DEPLOYING || StateEnum.STOPPING:
        return StatusMenuType.RUNNING
      default:
        return StatusMenuType.AVAILABLE
    }
  }

  const iconStatus = () => {
    switch (getType(statusActions.status)) {
      case StatusMenuType.AVAILABLE:
        return <Icon name="icon-solid-play" className="text-xs" />
      case StatusMenuType.STOP:
        return <Icon name="icon-solid-circle-stop" className="text-xs" />
      case StatusMenuType.WARNING:
        return <Icon name="icon-solid-circle-exclamation" className="text-xs" />
      case StatusMenuType.RUNNING:
        return <Icon name="icon-solid-play" className="text-xs" />
      default:
        return <Icon name="icon-solid-play" className="text-xs" />
    }
  }

  const statusClassName = `status-menu status-menu--${open ? 'open' : 'closed'} status-menu--${getType(
    statusActions.status
  )} h-6 inline-flex items-center pl-2 border rounded overflow-hidden`

  return (
    <div className={statusClassName} data-testid="statusmenu">
      <p className="text-xs font-semibold">
        {upperCaseFirstLetter(statusActions.status?.replace('_', ' ').toLowerCase())}
      </p>
      <div className="status-menu__trigger h-full inline-flex items-center border-l ml-2 hover:transition transition ease-in-out duration-300">
        <StatusMenuAction
          trigger={
            <div className="h-full flex items-center gap-1.5 px-2 cursor-pointer">
              {iconStatus()} <Icon name="icon-solid-angle-down" className="text-xs" />
            </div>
          }
          statusInformation={{
            id: '232',
            name: 'hello',
            mode: 't',
          }}
          statusActions={statusActions}
          setOpen={(isOpen) => setOpen(isOpen)}
          width={248}
        />
      </div>
    </div>
  )
}

export default StatusMenu
