import { IconEnum } from '@console/shared/enums'
import { Icon } from '@console/shared/ui'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Menu, { MenuAlign } from '../../menu/menu'
import { MenuItemProps } from '../../menu/menu-item/menu-item'

export enum ButtonMenuStyle {
  BASIC = 'basic',
  RAISED = 'raised',
  STROKED = 'stroked',
  FLAT = 'flat',
}

export interface ButtonMenuProps {
  children: React.ReactNode
  style?: ButtonMenuStyle
  iconRight?: IconEnum | string
  link?: string
  disabled?: boolean
  className?: string
  onClick?: () => void
  external?: boolean
  loading?: boolean
  menus: { items: MenuItemProps[]; title?: string; button?: string; buttonLink?: string; search?: boolean }[]
}

export function ButtonMenu(props: ButtonMenuProps) {
  const {
    children,
    style = ButtonMenuStyle.BASIC,
    iconRight,
    link,
    disabled = false,
    className = '',
    onClick,
    external = false,
    loading = false,
    menus = [],
  } = props

  const [menuOpen, setMenuOpen] = useState(false)

  const defineClass = `btn-menu ${style ? `btn-menu--${style}` : ''} ${
    disabled ? 'btn-menu--disabled' : ''
  } btn-menu--${menuOpen ? 'open' : 'closed'} ${className}`

  function loadingContent() {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" stroke="#fff" viewBox="0 0 38 38">
        <g fill="none" fillRule="evenodd" strokeWidth="2" transform="translate(1 1)">
          <circle cx="18" cy="18" r="18" strokeOpacity="0.5"></circle>
          <path d="M36 18c0-9.94-8.06-18-18-18">
            <animateTransform
              attributeName="transform"
              dur="1s"
              from="0 18 18"
              repeatCount="indefinite"
              to="360 18 18"
              type="rotate"
            ></animateTransform>
          </path>
        </g>
      </svg>
    )
  }

  function contentBtn() {
    return (
      <>
        {!link && (
          <button className="btn-menu__btn" onClick={onClick}>
            <span>{children}</span>
            {iconRight && <Icon name={iconRight} />}
          </button>
        )}
        {link && external && (
          <a href={link} className="btn-menu__btn" target="_blank" rel="noreferrer">
            <span>{children}</span>
            {iconRight && <Icon name={iconRight} />}
          </a>
        )}
        {link && !external && (
          <Link className="btn-menu__btn" to={link} onClick={onClick}>
            <span>{children}</span>
            {iconRight && <Icon name={iconRight} />}
          </Link>
        )}
      </>
    )
  }

  function content() {
    return (
      <div className={defineClass}>
        <Menu
          menus={menus}
          arrowAlign={MenuAlign.END}
          onOpen={(e) => setMenuOpen(e)}
          trigger={
            <div className="btn-menu__trigger">
              <Icon name="icon-solid-ellipsis-vertical" />
            </div>
          }
        />
        {!loading ? contentBtn() : loadingContent()}
      </div>
    )
  }

  return content()
}

export default ButtonMenu
