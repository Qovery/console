import Icon from '../icon/icon'
import { IconEnum } from '../../enums/icon.enum'
import { Link } from 'react-router-dom'

export enum ButtonSize {
  BIG = 'big',
  NORMAL = 'normal',
  SMALL = 'small',
  VERY_SMALL = 'very-small',
}

export enum ButtonType {
  BASIC = 'basic',
  RAISED = 'raised',
  STROKED = 'stroked',
  FLAT = 'flat',
}

export interface ButtonProps {
  children: React.ReactNode
  size?: ButtonSize
  type?: ButtonType
  iconLeft?: IconEnum | string
  iconRight?: IconEnum | string
  link?: string
  disabled?: boolean
  className?: string
  onClick?: () => void
}

export function Button(props: ButtonProps) {
  const {
    children,
    size = ButtonSize.NORMAL,
    type = ButtonType.BASIC,
    iconLeft,
    iconRight,
    link,
    disabled = false,
    className = '',
    onClick,
  } = props

  function content() {
    return (
      <>
        {iconLeft && <Icon name={iconLeft} />}
        <span>{children}</span>
        {iconRight && <Icon name={iconRight} />}
      </>
    )
  }

  const defineClass = `btn ${size ? `btn--${size}` : ''} ${type ? `btn--${type}` : ''} ${
    disabled ? 'btn--disabled' : ''
  } ${className}`

  if (!link) {
    return (
      <button className={defineClass} onClick={() => onClick}>
        {content()}
      </button>
    )
  } else {
    return (
      <Link to={link} className={defineClass} onClick={() => onClick}>
        {content()}
      </Link>
    )
  }
}

export default Button
