import { useState } from 'react'
import { StateEnum } from 'qovery-typescript-axios'
import { Menu, StatusMenuInformation, StatusMenuActions, MenuAlign } from '@console/shared/ui'
import { MenuItemProps } from '../../../menu/menu-item/menu-item'
import StatusMenuAction from '../../../status-menu-action/status-menu-action'

export interface ButtonIconActionElementProps {
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  onClick?: () => void
  menus?: {
    items: MenuItemProps[]
  }[]
  menusClassName?: string
  menuAlign?: MenuAlign
  statusActions?: {
    status: StateEnum | undefined
    actions: StatusMenuActions[]
    information?: StatusMenuInformation
  }
  statusInformation?: StatusMenuInformation
  triggerClassName?: string
}

export function ButtonIconActionElement(props: ButtonIconActionElementProps) {
  const {
    iconLeft,
    iconRight,
    onClick,
    menus,
    menusClassName = '',
    triggerClassName = '',
    statusActions,
    statusInformation,
    menuAlign = MenuAlign.START,
  } = props

  const [open, setOpen] = useState(false)

  if (menus) {
    return (
      <Menu
        className={menusClassName}
        menus={menus}
        arrowAlign={menuAlign}
        width={248}
        onOpen={(isOpen) => setOpen(isOpen)}
        trigger={
          <div
            data-testid="element"
            className={`btn-icon-action__element ${triggerClassName} ${open ? 'is-active' : ''}`}
          >
            {iconLeft}
            {iconRight}
          </div>
        }
      />
    )
  } else if (statusActions && statusActions.status) {
    return (
      <StatusMenuAction
        className={menusClassName}
        width={248}
        statusActions={{
          status: statusActions.status,
          actions: statusActions.actions,
          information: statusInformation,
        }}
        setOpen={(isOpen) => setOpen(isOpen)}
        paddingMenuX={8}
        paddingMenuY={8}
        trigger={
          <div data-testid="element" className={`btn-icon-action__element ${open ? 'is-active' : ''}`}>
            {iconLeft}
            {iconRight}
          </div>
        }
      />
    )
  } else {
    return (
      <div data-testid="element" className="btn-icon-action__element" onClick={onClick}>
        {iconLeft}
        {iconRight}
      </div>
    )
  }
}

export default ButtonIconActionElement
