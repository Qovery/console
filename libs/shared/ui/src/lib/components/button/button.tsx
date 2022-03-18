import Icon from '../icon/icon'
import { IconEnum } from '@console/shared/enums'
import { Link } from 'react-router-dom'

export enum ButtonSize {
  BIG = 'big',
  NORMAL = 'normal',
  SMALL = 'small',
  VERY_SMALL = 'very-small',
}

export enum ButtonStyle {
  BASIC = 'basic',
  RAISED = 'raised',
  STROKED = 'stroked',
  FLAT = 'flat',
}

export interface ButtonProps {
  children: React.ReactNode
  size?: ButtonSize
  style?: ButtonStyle
  iconLeft?: IconEnum | string
  iconRight?: IconEnum | string
  link?: string
  disabled?: boolean
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset' | undefined
}

export function Button(props: ButtonProps) {
  const {
    children,
    size = ButtonSize.NORMAL,
    style = ButtonStyle.BASIC,
    iconLeft,
    iconRight,
    link,
    disabled = false,
    className = '',
    type = 'button',
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

  const defineClass = `btn ${size ? `btn--${size}` : ''} ${style ? `btn--${style}` : ''} ${
    disabled ? 'btn--disabled' : ''
  } ${className}`

  if (!link) {
    return (
      <button className={defineClass} onClick={onClick} type={type}>
        {content()}
      </button>
    )
  } else {
    return (
      <Link to={link} className={defineClass} onClick={onClick}>
        {content()}
      </Link>
    )
  }
}

export default Button
