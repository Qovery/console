import { IconEnum } from '@qovery/shared/enums'
import Icon from '../icon/icon'

export interface BaseLink {
  link: string
  linkLabel?: string
  external?: boolean
}

export interface LinkProps extends BaseLink {
  className?: string
  iconRight?: IconEnum | string
  iconLeft?: IconEnum | string
}

export function Link(props: LinkProps) {
  const { link, linkLabel, external = false, className = '', iconLeft, iconRight } = props
  return (
    <a
      className={`${className} text-accent2-500 text-sm inline-flex flex-center gap-1 hover:underline`}
      href={link}
      target={external ? '_blank' : '_self'}
      rel="noreferrer"
    >
      {iconLeft && <Icon name={iconLeft} className="text-xs leading-5" />}
      {linkLabel}
      {iconRight && <Icon name={iconRight} className="ml-0.5 text-xs leading-5" />}
    </a>
  )
}

export default Link
