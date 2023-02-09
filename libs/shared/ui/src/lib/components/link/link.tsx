import { NavLink } from 'react-router-dom'
import { IconEnum } from '@qovery/shared/enums'
import Icon from '../icon/icon'

export interface BaseLink {
  link: string
  linkLabel?: string
  external?: boolean
}

export interface LinkProps extends BaseLink {
  className?: string
  size?: string
  iconRight?: IconEnum | string
  iconRightClassName?: string
  iconLeft?: IconEnum | string
  iconLeftClassName?: string
}

export function Link(props: LinkProps) {
  const {
    link,
    linkLabel,
    external = false,
    className = '',
    size = 'text-sm',
    iconLeft,
    iconRight,
    iconLeftClassName = 'text-xs leading-5',
    iconRightClassName = 'ml-0.5 text-xs leading-5 ',
  } = props

  const currentClassName = `${className} ${size} text-accent2-500 inline-flex flex-center gap-1 hover:underline`

  const content = () => (
    <>
      {iconLeft && <Icon name={iconLeft} className={iconLeftClassName} />}
      {linkLabel}
      {iconRight && <Icon name={iconRight} className={iconRightClassName} />}
    </>
  )

  if (external) {
    return (
      <a className={currentClassName} href={link} target="_blank" rel="noreferrer">
        {content()}
      </a>
    )
  } else {
    return (
      <NavLink className={currentClassName} to={link}>
        {content()}
      </NavLink>
    )
  }
}

export default Link
