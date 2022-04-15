import { IconEnum } from '@console/shared/enums'
import { Link } from 'react-router-dom'
import Icon from '../../icon/icon'

export enum ButtonIconSize {
  BIG = 'big',
  NORMAL = 'normal',
}

export enum ButtonIconStyle {
  BASIC = 'basic',
  RAISED = 'raised',
  STROKED = 'stroked',
  FLAT = 'flat',
  ALT = 'alt',
  DARK = 'dark',
}

export interface ButtonIconProps {
  size?: ButtonIconSize
  style?: ButtonIconStyle
  icon: IconEnum | string
  link?: string
  disabled?: boolean
  className?: string
  onClick?: (e: React.MouseEvent) => void
  loading?: boolean
  notification?: boolean
  active?: boolean
}

export function ButtonIcon(props: ButtonIconProps) {
  const {
    icon,
    style = ButtonIconStyle.BASIC,
    size = ButtonIconSize.NORMAL,
    disabled = false,
    loading = false,
    className = '',
    onClick,
    notification = false,
    link,
    active = false,
  } = props

  const defineClass = `btn btn-icon ${size ? `btn-icon--${size}` : ''} ${style ? `btn-icon--${style}` : ''} ${
    disabled || loading ? 'btn--disabled' : ''
  } ${active ? 'btn--active' : ''} ${className}`

  if (!link) {
    return (
      <button className={defineClass} onClick={(e) => onClick && onClick(e)}>
        {notification && (
          <span className="btn__notification w-2 h-2 rounded-lg bg-error-500 absolute -top-0.5 -right-0.5"></span>
        )}
        <Icon name={icon}></Icon>
      </button>
    )
  } else {
    return (
      <Link to={link} className={defineClass} onClick={onClick}>
        {notification && (
          <span className="btn__notification w-2 h-2 rounded-lg bg-error-500 absolute -top-0.5 -right-0.5"></span>
        )}
        <Icon name={icon}></Icon>
      </Link>
    )
  }
}

export default ButtonIcon
