import { type PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'
import { type IconEnum } from '@qovery/shared/enums'
import Icon from '../../icon/icon'
import LoaderSpinner from '../../loader-spinner/loader-spinner'

export enum ButtonSize {
  XLARGE = 'xlarge',
  LARGE = 'large',
  REGULAR = 'regular',
  SMALL = 'small',
  TINY = 'tiny',
}

export enum ButtonStyle {
  BASIC = 'basic',
  RAISED = 'raised',
  STROKED = 'stroked',
  FLAT = 'flat',
  ERROR = 'error',
  CONFIRM = 'confirm',
  DARK = 'dark',
}

export interface ButtonProps {
  size?: ButtonSize
  style?: ButtonStyle
  iconLeft?: IconEnum | string
  iconLeftClassName?: string
  iconRight?: IconEnum | string
  iconRightClassName?: string
  link?: string
  disabled?: boolean
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset' | undefined
  external?: boolean
  loading?: boolean
  dataTestId?: string
}

export function Button(props: PropsWithChildren<ButtonProps>) {
  const {
    children,
    size = ButtonSize.REGULAR,
    style = ButtonStyle.BASIC,
    iconLeft,
    iconRight,
    link,
    disabled = false,
    className = '',
    type = 'button',
    onClick,
    external = false,
    loading = false,
    iconRightClassName = '',
    iconLeftClassName = '',
    dataTestId,
  } = props

  function content() {
    return !loading ? (
      <>
        {iconLeft && <Icon name={iconLeft} className={iconLeftClassName} />}
        <span>{children}</span>
        {iconRight && <Icon name={iconRight} className={iconRightClassName} />}
      </>
    ) : (
      <LoaderSpinner theme="dark" />
    )
  }

  const defineClass = `btn${size ? ` btn--${size}` : ''}${style ? ` btn--${style}` : ''}${
    disabled ? ' btn--disabled' : ''
  }${className ? ' ' + className : ''} ${loading ? 'pointer-events-none cursor-default' : ''}`

  if (!link) {
    return (
      <button data-testid={dataTestId} className={defineClass} onClick={onClick} type={type} disabled={disabled}>
        {content()}
      </button>
    )
  } else if (link && external) {
    return (
      <a className={defineClass} href={link} target="_blank" rel="noreferrer" data-testid={dataTestId}>
        {content()}
      </a>
    )
  } else {
    return (
      <Link to={link} className={defineClass} onClick={onClick} data-testid={dataTestId}>
        {content()}
      </Link>
    )
  }
}

export default Button
