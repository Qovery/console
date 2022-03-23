import { IconEnum } from "@console/shared/enums"
import { Link } from "react-router-dom"
import Icon from "../icon/icon"

export enum AvatarStyle {
  NORMAL = 'normal',
  STROKED = 'stroked'
}

export interface AvatarProps {
  url: string,
  style?: AvatarStyle,
  icon?: string,
  className?: string,
  alt?: string,
  link?: string,
}

export function Avatar(props: AvatarProps) {

  const { url = '', style, icon, className, alt, link } = props

  const defineClass = `avatar ${style ? 'avatar--' + style : ''} ${className}`

  if(!link) {
    return (
      <div className={defineClass}>
        <img src={url} alt={alt} />
        {icon && <Icon name={icon} className='avatar__icon'></Icon>}
      </div>
    )
  } else {
    return (
      <Link to={link} className={defineClass}>
        <img src={url} alt={alt} />
        {icon && <Icon name={icon} className='avatar__icon'></Icon>}
      </Link>
    )
  }
}

export default Avatar
