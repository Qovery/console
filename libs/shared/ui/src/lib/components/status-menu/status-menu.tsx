import { useEffect, useState } from 'react'
import Icon from '../icon/icon'
import Menu from '../menu/menu'
import { MenuItemProps } from '../menu/menu-item/menu-item'

export enum StatusMenuState {
  RUNNING = 'Running',
  STOPPED = 'Stopped',
  ERROR = 'Error',
  STARTING = 'Starting',
  STOPPING = 'Stopping',
}

export interface StatusMenuProps {
  status: StatusMenuState
  menus?: { items: MenuItemProps[] }[]
}

export function StatusMenu(props: StatusMenuProps) {
  const { status = StatusMenuState.RUNNING, menus = [] } = props
  const [containerClass, setContainerClass] = useState('')
  const [hoverClass, setHoverClass] = useState('')
  const [focusClass, setFocusClass] = useState('')

  useEffect(() => {
    containerClassName()
  }, [])

  const containerClassName = () => {
    switch (status) {
      case StatusMenuState.RUNNING:
        setContainerClass('bg-success-50 border-success-500 text-success-500')
        setHoverClass('hover:bg-success-100')
        break
      case StatusMenuState.STOPPED:
        setContainerClass('bg-element-light-lighter-300 border-element-light-lighter-700 text-text-400')
        setHoverClass('hover:bg-element-light-lighter-400')
        break
      case StatusMenuState.ERROR:
        setContainerClass('bg-error-50 border-error-400 text-error-500')
        setHoverClass('hover:bg-error-100')
        break
      case StatusMenuState.STARTING || StatusMenuState.STOPPING:
        setContainerClass('bg-progressing-50 border-progressing-400 text-progressing-500')
        setHoverClass('hover:bg-progressing-100')
        break
      default:
        setContainerClass('bg-success-50 border-success-500 text-success-500')
        setHoverClass('hover:bg-success-100')
    }
  }

  const focusStatus = (open: boolean) => {
    if (open) {
      switch (status) {
        case StatusMenuState.RUNNING:
          setFocusClass('bg-success-100')
          break
        case StatusMenuState.STOPPED:
          setFocusClass('bg-element-light-lighter-400')
          break
        case StatusMenuState.ERROR:
          setFocusClass('bg-error-100')
          break
        case StatusMenuState.STARTING || StatusMenuState.STOPPING:
          setFocusClass('bg-progressing-100')
          break
        default:
          setFocusClass('bg-success-100')
      }
    } else {
      setFocusClass('')
    }
  }

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

  return (
    <div className={`h-6 inline-flex items-center pl-2 border rounded ${containerClass}`}>
      <p className="text-xs font-semibold">{status}</p>
      <div
        className={`h-full inline-flex items-center border-l ml-2 hover:transition transition ease-in-out duration-300 ${containerClass} ${hoverClass} ${focusClass}`}
      >
        <Menu
          menus={menus}
          width={248}
          onOpen={focusStatus}
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
