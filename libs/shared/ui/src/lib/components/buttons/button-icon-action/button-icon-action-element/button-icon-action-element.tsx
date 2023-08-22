import { type ReactNode, useState } from 'react'
import { Menu, MenuAlign, MenuData } from '../../../menu/menu'
import Tooltip from '../../../tooltip/tooltip'

export interface ButtonIconActionElementProps {
  triggerTooltip?: string
  iconLeft?: ReactNode
  iconRight?: ReactNode
  onClick?: () => void
  menus?: MenuData
  menusClassName?: string
  menuAlign?: MenuAlign
  triggerClassName?: string
}

export function ButtonIconActionElement(props: ButtonIconActionElementProps) {
  const {
    triggerTooltip,
    iconLeft,
    iconRight,
    onClick,
    menus,
    menusClassName = '',
    triggerClassName = '',
    menuAlign = MenuAlign.START,
  } = props

  const [open, setOpen] = useState(false)

  const tooltipWrapper = (content: ReactNode, withRightBorder = false) => {
    if (triggerTooltip) {
      return (
        <Tooltip content={triggerTooltip} delayDuration={100}>
          <span className={`flex ${withRightBorder ? 'border-r border-r-zinc-250' : ''}`}>{content}</span>
        </Tooltip>
      )
    } else {
      return content
    }
  }

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
        triggerTooltip={triggerTooltip}
      />
    )
  } else {
    return (
      <>
        {tooltipWrapper(
          <div data-testid="element" className="btn-icon-action__element" onClick={onClick}>
            {iconLeft}
            {iconRight}
          </div>,
          true
        )}
      </>
    )
  }
}

export default ButtonIconActionElement
