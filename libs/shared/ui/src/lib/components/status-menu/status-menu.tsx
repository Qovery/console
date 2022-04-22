import { useState } from 'react'
import Icon from '../icon/icon'
import Menu from '../menu/menu'
import { MenuItemProps } from '../menu/menu-item/menu-item'

export enum StatusMenuState {
  RUNNING = 'running',
  STOPPED = 'stopped',
  ERROR = 'error',
  STARTING = 'starting',
  STOPPING = 'stopping',
}

export interface StatusMenuProps {
  status: StatusMenuState
  menus?: { items: MenuItemProps[] }[]
}

export function StatusMenu(props: StatusMenuProps) {
  const { status = StatusMenuState.RUNNING, menus = [] } = props

  const [open, setOpen] = useState(false)

  const iconStatus = () => {
    switch (status) {
      case StatusMenuState.RUNNING:
        return <Icon name="icon-solid-play" className="text-xs" />
      case StatusMenuState.STOPPED:
        return <Icon name="icon-solid-circle-stop" className="text-xs" />
      case StatusMenuState.ERROR:
        return <Icon name="icon-solid-circle-exclamation" className="text-xs" />
      case StatusMenuState.STARTING || StatusMenuState.STOPPING:
        return <Icon name="icon-solid-play" className="text-xs" />
      default:
        return <Icon name="icon-solid-play" className="text-xs" />
    }
  }

  const statusClassName = `status-menu status-menu--${
    open ? 'open' : 'closed'
  } status-menu--${status} h-6 inline-flex items-center pl-2 border rounded overflow-hidden`

  return (
    <div className={statusClassName} data-testid="statusmenu">
      <p className="text-xs font-semibold capitalize">{status}</p>
      <div className="status-menu__trigger h-full inline-flex items-center border-l ml-2 hover:transition transition ease-in-out duration-300">
        <Menu
          menus={menus}
          width={248}
          onOpen={(e) => setOpen(e)}
          trigger={
            <div className="flex items-center gap-1.5 px-2 cursor-pointer">
              {iconStatus()} <Icon name="icon-solid-angle-down" className="text-xs" />
            </div>
          }
        />
      </div>
    </div>
  )
}

export default StatusMenu
