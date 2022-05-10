import { useState } from 'react'
import { Menu } from '@console/shared/ui'
import { MenuItemProps } from '../../../menu/menu-item/menu-item'

export interface ButtonIconActionElementProps {
  iconLeft: React.ReactNode
  iconRight?: React.ReactNode
  onClick?: () => void
  menus?: {
    items: MenuItemProps[]
  }[]
  menusClassName?: string
}

export function ButtonIconActionElement(props: ButtonIconActionElementProps) {
  const { iconLeft, iconRight, onClick, menus, menusClassName = '' } = props

  const [open, setOpen] = useState(false)

  if (menus) {
    return (
      <Menu
        className={menusClassName}
        menus={menus}
        width={248}
        onOpen={(e) => setOpen(e)}
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
