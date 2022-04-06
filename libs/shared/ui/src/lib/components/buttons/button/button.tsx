import Icon from '../../icon/icon'
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
  external?: boolean
  loading?: boolean
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
    external = false,
    loading = false,
  } = props

  function content() {
    return !loading ? (
      <>
        {iconLeft && <Icon name={iconLeft} />}
        <span>{children}</span>
        {iconRight && <Icon name={iconRight} />}
      </>
    ) : (
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

  const defineClass = `btn ${size ? `btn--${size}` : ''} ${type ? `btn--${type}` : ''} ${
    disabled ? 'btn--disabled' : ''
  }${className}`

  if (!link) {
    return (
      <button className={defineClass} onClick={onClick} type={type}>
        {content()}
      </button>
    )
  } else if (link && external) {
    return (
      <a className={defineClass} href={link} target="_blank" rel="noreferrer">
        {content()}
      </a>
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
