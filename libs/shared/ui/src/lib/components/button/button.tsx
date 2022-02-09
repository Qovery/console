import './button.module.css'
import { Color } from '../../enums/colors.enum'
import Icon from '../icon/icon'
import { IconEnum } from '../../enums/icon.enum'

export enum ButtonSize {
  BIG = 'BIG',
  NORMAL = 'NORMAL',
  SMALL = 'SMALL',
}

export enum ButtonType {
  BASIC = 'BASIC',
  RAISED = 'RAISED',
  STROKED = 'STROKED',
  FLAT = 'FLAT',
  ICON = 'ICON',
  FAB = 'FAB',
  MINI_FAB = 'MINI_FAB',
}

/* eslint-disable-next-line */
export interface ButtonProps {
  children: React.ReactNode
  size?: ButtonSize
  type?: ButtonType
  color?: Color
  iconLeft?: IconEnum
  iconRight?: IconEnum
}

export function Button(props: ButtonProps) {
  const { children, size = ButtonSize.NORMAL, type = ButtonType.FLAT, color = Color.VIOLET, iconLeft, iconRight } = props

  const defineClassName = () => {
    let className = ''

    switch (size) {
      case ButtonSize.NORMAL:
        className += ` h-9 px-4`
        break
      case ButtonSize.BIG:
        className += ` h-12 px-4`
        break
    }

    switch (type) {
      case ButtonType.FLAT:
        className += ` bg-${color}-500 hover:bg-${color}-600 text-white`
        break
      case ButtonType.STROKED:
        className += ` border border-${color}-500 text-${color}-500`
        break
    }

    return className
  }

  const className = defineClassName()

  return (
    <button className={`inline-flex items-center leading-none rounded font-sans text-medium ${className}`}>
      {iconLeft && <Icon name={iconLeft} data-cy="icon-left" className=" mr-2 w-7 fill-white" />}
      {children}
      {iconRight && <Icon name={iconRight} data-cy="icon-right" className=" ml-2 w-7 fill-white" />}
    </button>
  )
}

export default Button
