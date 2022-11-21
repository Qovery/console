import { useState } from 'react'
import { Menu, MenuAlign, MenuData } from '../../../menu/menu'

export interface ButtonIconActionElementProps {
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  onClick?: () => void
  menus?: MenuData
  menusClassName?: string
  menuAlign?: MenuAlign
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
