import { type ReactNode } from 'react'
import Button from '../../../button/button'
import { Menu, MenuAlign, type MenuData } from '../../../menu/menu'
import Tooltip from '../../../tooltip/tooltip'

export interface ButtonIconActionElementProps {
  triggerTooltip?: string
  iconLeft?: ReactNode
  iconRight?: ReactNode
  onClick?: () => void
  menus?: MenuData
  menusClassName?: string
  menuAlign?: MenuAlign
}

export function ButtonIconActionElement(props: ButtonIconActionElementProps) {
  const {
    triggerTooltip,
    iconLeft,
    iconRight,
    onClick,
    menus,
    menusClassName = '',
    menuAlign = MenuAlign.START,
  } = props

  const tooltipWrapper = (content: ReactNode, withRightBorder = false) => {
    if (triggerTooltip) {
      return (
        <Tooltip content={triggerTooltip} delayDuration={100}>
          <span className={`flex ${withRightBorder ? 'border-r border-r-neutral-250' : ''}`}>{content}</span>
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
        trigger={
          <Button data-testid="element" variant="outline" size="md" className="w-9 justify-center">
            {iconLeft}
            {iconRight}
          </Button>
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
