import { Color } from '../../enums/colors.enum'
import Icon from '../icon/icon'
import { IconEnum } from '../../enums/icon.enum'
import { IconFaEnum } from '../../enums/icon-fa.enum'
import { Link } from 'react-router-dom'
import IconFa from '../icon-fa/icon-fa'

export enum ButtonSize {
  BIG = 'BIG',
  NORMAL = 'NORMAL',
  SMALL = 'SMALL',
  VERY_SMALL = 'VERY_SMALL'
}

export enum ButtonType {
  BASIC = 'BASIC',
  RAISED = 'RAISED',
  STROKED = 'STROKED',
  FLAT = 'FLAT'
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
  link?: string
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

  if(!link) {
    return (
      <button className={`btn btn--${size} btn--${type}`}>
        {content()} 
      </button>
    )
  } else {
    return (
      <Link to={link} className={`btn btn--${size} btn--${type}`}>
        {content()} 
      </Link>
    )
  }
  
}

export default Button
