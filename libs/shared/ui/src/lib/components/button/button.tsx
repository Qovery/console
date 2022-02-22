import { Color } from '../../enums/colors.enum'
import Icon from '../icon/icon'
import { IconEnum } from '../../enums/icon.enum'
import { IconFaEnum } from '../../enums/icon-fa.enum'
import { Link } from 'react-router-dom'
import IconFa from '../icon-fa/icon-fa'

export enum ButtonSize {
  BIG = 'big',
  NORMAL = 'normal',
  SMALL = 'small',
  VERY_SMALL = 'very-small'
}

export enum ButtonType {
  BASIC = 'basic',
  RAISED = 'raised',
  STROKED = 'stroked',
  FLAT = 'flat'
}

export interface ButtonProps {
  children: React.ReactNode
  size?: ButtonSize
  type?: ButtonType
  iconLeft?: IconEnum
  iconRight?: IconEnum
  faLeft?: string
  faRight?: string
  faLeftType?: IconFaEnum
  faRightType?: IconFaEnum
  link?: string,
  disabled?: boolean,
  className?: string
}

export function Button(props: ButtonProps) {
  const {
    children,
    size = ButtonSize.NORMAL,
    type = ButtonType.FLAT,
    iconLeft,
    iconRight,
    faLeft,
    faRight,
    faLeftType,
    faRightType,
    link = '/',
    disabled = false,
    className
  } = props

  function content() {
    return (
      <>
        {faLeft && faLeftType ? <IconFa type={faLeftType} name={faLeft} /> : null}
        {iconLeft ? <Icon name={iconLeft} /> : null}
        <span>{children}</span>
        {faRight && faRightType ? <IconFa type={faRightType} name={faRight} /> : null}
        {iconRight ? <Icon name={iconRight} /> : null}
      </>
    )
  }

  const defineClass = `btn btn--${size} btn--${type} ${disabled ? 'btn--disabled' : null} ${className}`

  if(!link) {
    return (
      <button className={defineClass}>
        {content()} 
      </button>
    )
  } else {
    return (
      <Link to={link} className={defineClass}>
        {content()} 
      </Link>
    )
  }
  
}

export default Button
