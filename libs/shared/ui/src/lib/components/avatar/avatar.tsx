import { Link } from 'react-router-dom'
import Icon from '../icon/icon'

export enum AvatarStyle {
  NORMAL = 'normal',
  STROKED = 'stroked',
}

export interface AvatarProps {
  url?: string
  style?: AvatarStyle
  icon?: string
  className?: string
  alt?: string
  link?: string
}

export function Avatar(props: AvatarProps) {
  const { url, style, icon, className = '', alt, link } = props

  const defineClass = `${style === AvatarStyle.STROKED ? 'border-2 border-element-light-lighter-400' : ''}`

  const content = () => (
    <>
      {url ? (
        <img src={url} alt={alt} className="w-full h-full rounded-full" />
      ) : (
        <div className="w-full h-full rounded-full bg-element-light-lighter-400"></div>
      )}
      {icon && <Icon name={icon} className="absolute -bottom-1 -right-1 w-4 h-4 drop-shadow-sm"></Icon>}
    </>
  )

  if (!link) {
    return <div className={`w-8 h-8 block rounded-full relative ${defineClass} ${className}`}>{content()}</div>
  } else {
    return (
      <Link to={link} className={`w-8 h-8 block rounded-full relative ${defineClass} ${className}`}>
        {content()}
      </Link>
    )
  }
}

export default Avatar
