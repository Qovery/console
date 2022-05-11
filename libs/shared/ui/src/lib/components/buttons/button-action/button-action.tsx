import { IconEnum } from '@console/shared/enums'
import { Icon } from '@console/shared/ui'
import { GlobalDeploymentStatus } from 'qovery-typescript-axios'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Menu, { MenuAlign } from '../../menu/menu'
import { MenuItemProps } from '../../menu/menu-item/menu-item'
import StatusMenuAction from '../../status-menu-action/status-menu-action'

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
  menus?: { items: MenuItemProps[]; title?: string; button?: string; buttonLink?: string; search?: boolean }[]
  status?: GlobalDeploymentStatus
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
    status,
  } = props

  const [menuOpen, setMenuOpen] = useState(false)

  const defineClass = `btn-action ${style ? `btn-action--${style}` : ''} ${
    disabled ? 'btn-action--disabled' : ''
  } ${className}`

  function contentBtn() {
    return (
      <>
        {!link && (
          <button className="btn-action__content" onClick={onClick}>
            <span>{children}</span>
            {iconRight && <Icon name={iconRight} className="text-base -mt-0.5" />}
          </button>
        )}
        {link && (
          <Link className="btn-action__content" to={link} onClick={onClick}>
            <span>{children}</span>
            {iconRight && <Icon name={iconRight} className="text-base -mt-0.5" />}
          </Link>
        )}
      </>
    )
  }

  if (!status) {
    return (
      <div data-testid="button-action" className={defineClass}>
        <Menu
          menus={menus}
          arrowAlign={MenuAlign.END}
          onOpen={(e) => setMenuOpen(e)}
          trigger={
            <div className={`btn-action__trigger btn-action__trigger--${menuOpen ? 'open' : 'closed'}`}>
              <Icon name="icon-solid-ellipsis-vertical" />
            </div>
          }
        />
        {contentBtn()}
      </div>
    )
  } else {
    return (
      <div data-testid="button-action" className={defineClass}>
        <StatusMenuAction
          arrowAlign={MenuAlign.END}
          onOpen={(e) => setMenuOpen(e)}
          trigger={
            <div className={`btn-action__trigger btn-action__trigger--${menuOpen ? 'open' : 'closed'}`}>
              <Icon name="icon-solid-ellipsis-vertical" />
            </div>
          }
          status={status}
        />
        {contentBtn()}
      </div>
    )
  }
}

export default ButtonAction
