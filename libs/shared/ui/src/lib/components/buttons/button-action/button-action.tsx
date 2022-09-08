import { StateEnum } from 'qovery-typescript-axios'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconEnum } from '@console/shared/enums'
import { ButtonSize, Icon, StatusMenuAction, StatusMenuActions, StatusMenuInformation } from '@console/shared/ui'
import Menu, { MenuAlign } from '../../menu/menu'
import { MenuItemProps } from '../../menu/menu-item/menu-item'

export enum ButtonActionStyle {
  BASIC = 'basic',
  RAISED = 'raised',
  STROKED = 'stroked',
  FLAT = 'flat',
}

export interface ButtonActionProps {
  children: React.ReactNode
  style?: ButtonActionStyle
  iconRight?: IconEnum | string
  link?: string
  external?: boolean
  disabled?: boolean
  className?: string
  onClick?: () => void
  menus?: { items: MenuItemProps[]; title?: string; button?: string; buttonLink?: string; search?: boolean }[]
  statusActions?: {
    status: StateEnum
    actions: StatusMenuActions[]
    information: StatusMenuInformation
  }
  size?: ButtonSize
}

export function ButtonAction(props: ButtonActionProps) {
  const {
    children,
    style = ButtonActionStyle.BASIC,
    iconRight,
    link,
    disabled = false,
    external = false,
    className = '',
    onClick,
    menus = [],
    statusActions,
    size = ButtonSize.REGULAR,
  } = props

  const [menuOpen, setMenuOpen] = useState(false)

  const defineClass = `btn-action btn--${size} ${style ? `btn-action--${style}` : ''} ${
    disabled ? 'btn-action--disabled' : ''
  } ${className}`

  function contentBtn() {
    return (
      <>
        {!link && (
          <button className="btn-action__content" onClick={onClick}>
            <span>{children}</span>
            {iconRight && <Icon name={iconRight} className="text-sm" />}
          </button>
        )}
        {link && !external && (
          <Link className="btn-action__content" to={link} onClick={onClick}>
            <span>{children}</span>
            {iconRight && <Icon name={iconRight} className="text-sm" />}
          </Link>
        )}
        {link && external && (
          <a className="btn-action__content" href={link} target="_blank" onClick={onClick}>
            <span>{children}</span>
            {iconRight && <Icon name={iconRight} className="text-sm" />}
          </a>
        )}
      </>
    )
  }

  if (!statusActions) {
    return (
      <div data-testid="button-action" className={defineClass}>
        {menus.length > 0 && (
          <Menu
            menus={menus}
            arrowAlign={MenuAlign.END}
            onOpen={(isOpen) => setMenuOpen(isOpen)}
            trigger={
              <div className={`btn-action__trigger btn-action__trigger--${menuOpen ? 'open' : 'closed'}`}>
                <Icon name="icon-solid-ellipsis-vertical" />
              </div>
            }
          />
        )}
        {contentBtn()}
      </div>
    )
  } else {
    return (
      <div data-testid="button-action" className={defineClass}>
        <StatusMenuAction
          arrowAlign={MenuAlign.END}
          setOpen={(isOpen: boolean) => setMenuOpen(isOpen)}
          trigger={
            <div className={`btn-action__trigger btn-action__trigger--${menuOpen ? 'open' : 'closed'}`}>
              <Icon name="icon-solid-ellipsis-vertical" />
            </div>
          }
          statusActions={statusActions}
        />
        {contentBtn()}
      </div>
    )
  }
}

export default ButtonAction
