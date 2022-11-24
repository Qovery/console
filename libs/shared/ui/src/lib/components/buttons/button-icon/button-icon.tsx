import { Link } from 'react-router-dom'
import { IconEnum } from '@qovery/shared/enums'
import Icon from '../../icon/icon'
import { ButtonSize } from '../button/button'

export enum ButtonIconStyle {
  BASIC = 'basic',
  RAISED = 'raised',
  STROKED = 'stroked',
  FLAT = 'flat',
  ALT = 'alt',
  DARK = 'dark',
}

export interface ButtonIconProps {
  size?: ButtonSize
  style?: ButtonIconStyle
  icon: IconEnum | string
  link?: string
  disabled?: boolean
  className?: string
  onClick?: (e: React.MouseEvent) => void
  loading?: boolean
  notification?: boolean
  active?: boolean
  iconClassName?: string
  external?: boolean
  dataTestId?: string
  type?: 'button' | 'submit' | 'reset'
}

export function ButtonIcon(props: ButtonIconProps) {
  const {
    icon,
    style = ButtonIconStyle.BASIC,
    size = ButtonSize.REGULAR,
    disabled = false,
    loading = false,
    className = '',
    onClick,
    notification = false,
    link,
    external = false,
    active = false,
    iconClassName = '',
    type = 'button',
  } = props

  const defineClass = `btn btn-icon group ${size ? `btn--${size}` : ''} ${style ? `btn-icon--${style}` : ''} ${
    disabled || loading ? 'btn--disabled' : ''
  } ${active ? 'btn--active' : ''} ${className}`

  const contentBtn = () => {
    return (
      <>
        {!link && (
          <button
            type={type}
            data-testid={props.dataTestId}
            className={defineClass}
            onClick={(e) => onClick && onClick(e)}
          >
            {notification && (
              <span className="btn__notification w-2 h-2 rounded-lg bg-error-500 absolute -top-0.5 -right-0.5"></span>
            )}
            <Icon name={icon} className={iconClassName} />
          </button>
        )}

        {link && !external && (
          <Link data-testid={props.dataTestId} to={link} className={defineClass} onClick={onClick}>
            {notification && (
              <span className="btn__notification w-2 h-2 rounded-lg bg-error-500 absolute -top-0.5 -right-0.5"></span>
            )}
            <Icon name={icon} className={iconClassName} />
          </Link>
        )}

        {link && external && (
          <a
            data-testid={props.dataTestId}
            href={link}
            target="_blank"
            rel="noreferrer"
            className={defineClass}
            onClick={onClick}
          >
            {notification && (
              <span className="btn__notification w-2 h-2 rounded-lg bg-error-500 absolute -top-0.5 -right-0.5"></span>
            )}
            <Icon name={icon} className={iconClassName} />
          </a>
        )}
      </>
    )
  }

  return contentBtn()
}

export default ButtonIcon
