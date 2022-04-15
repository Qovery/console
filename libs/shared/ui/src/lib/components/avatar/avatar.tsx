import Icon from '../icon/icon'

export enum AvatarStyle {
  NORMAL = 'normal',
  STROKED = 'stroked',
}

export interface AvatarProps {
  firstName: string
  lastName: string
  url?: string
  style?: AvatarStyle
  icon?: string
  className?: string
  alt?: string
  onClick?: () => void
}

export function Avatar(props: AvatarProps) {
  const { firstName, lastName, url, style, icon, className = '', alt, onClick } = props

  const defineClass = `${style === AvatarStyle.STROKED ? 'border-2 border-element-light-lighter-400' : ''} ${
    onClick ? 'cursor-pointer' : ''
  }`

  return (
    <div
      data-testid="avatar"
      className={`w-8 h-8 block rounded-full relative ${defineClass} ${className}`}
      onClick={() => onClick && onClick()}
    >
      {url ? (
        <img src={url} alt={alt} className="w-full h-full rounded-full" />
      ) : (
        <div className="w-full h-full rounded-full bg-element-light-lighter-400 text-center">
          <span className="text-xs text-text-500 font-medium relative top-[2px]">
            {firstName && firstName.charAt(0)}
            {lastName && lastName.charAt(0)}
          </span>
        </div>
      )}
      {icon && (
        <Icon
          data-testid="avatar-icon"
          name={icon}
          className="absolute -bottom-1 -right-1 w-4 h-4 drop-shadow-sm"
        ></Icon>
      )}
    </div>
  )
}

export default Avatar
