import { IconEnum } from '@console/shared/enums'
import { Icon } from '@console/shared/ui'
import { useState } from 'react'
import { Link } from 'react-router-dom'
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
  disabled?: boolean
  className?: string
  onClick?: () => void
  menus: { items: MenuItemProps[]; title?: string; button?: string; buttonLink?: string; search?: boolean }[]
}

export function ButtonAction(props: ButtonActionProps) {
  const {
    children,
    style = ButtonActionStyle.BASIC,
    iconRight,
    link,
    disabled = false,
    className = '',
    onClick,
    menus = [],
  } = props

  const [menuOpen, setMenuOpen] = useState(false)

  const defineClass = `btn-menu ${style ? `btn-menu--${style}` : ''} ${
    disabled ? 'btn-menu--disabled' : ''
  } ${className}`

  function contentBtn() {
    return (
      <>
        {!link && (
          <button className="btn-menu__btn" onClick={onClick}>
            <span>{children}</span>
            {iconRight && <Icon name={iconRight} className="text-base -mt-0.5" />}
          </button>
        )}
        {link && (
          <Link className="btn-menu__btn" to={link} onClick={onClick}>
            <span>{children}</span>
            {iconRight && <Icon name={iconRight} className="text-base -mt-0.5" />}
          </Link>
        )}
      </>
    )
  }

  function content() {
    return (
      <div data-testid="button-action" className={defineClass}>
        <Menu
          menus={menus}
          arrowAlign={MenuAlign.END}
          onOpen={(e) => setMenuOpen(e)}
          trigger={
            <div className={`btn-menu__trigger btn-menu__trigger--${menuOpen ? 'open' : 'closed'}`}>
              <Icon name="icon-solid-ellipsis-vertical" />
            </div>
          }
        />
        {contentBtn()}
      </div>
    )
  }

  return content()
}

export default ButtonAction
