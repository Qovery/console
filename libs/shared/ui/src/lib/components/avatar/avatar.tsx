import Icon from '../icon/icon'
import Tooltip from '../tooltip/tooltip'

export enum AvatarStyle {
  NORMAL = 'normal',
  STROKED = 'stroked',
}

export interface AvatarProps {
  firstName: string
  lastName?: string
  url?: string
  style?: AvatarStyle
  icon?: string
  logoUrl?: string
  logoText?: string
  className?: string
  alt?: string
  onClick?: () => void
  size?: number
  noTooltip?: boolean
}

export function Avatar(props: AvatarProps) {
  const {
    firstName,
    lastName = '',
    url,
    style,
    icon,
    logoUrl,
    logoText,
    className = '',
    alt,
    onClick,
    size = 32,
    noTooltip = false,
  } = props

  const defineClass = `${style === AvatarStyle.STROKED ? 'border border-element-light-lighter-400' : ''} ${
    onClick ? 'cursor-pointer' : ''
  }`

  const avatarContent = (
    <div
      data-testid="avatar"
      style={{ width: size, height: size }}
      className={`block rounded-full relative ${defineClass} ${className}`}
      onClick={() => onClick && onClick()}
    >
      {url ? (
        <img src={url} alt={alt} className="w-full h-full rounded-full" />
      ) : (
        <div className="w-full h-full rounded-full bg-element-light-lighter-400 text-center flex justify-center items-center">
          <span className="text-xs text-text-500 font-medium relative">
            {firstName && firstName.charAt(0).toUpperCase()}
            {lastName && lastName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      {icon && (
        <Icon data-testid="avatar-icon" name={icon} className="absolute -bottom-1 -right-1 w-4 h-4 drop-shadow-sm" />
      )}
      {(logoUrl || logoText) && (
        <div
          data-testid="avatar-logo"
          className="flex items-center text-sm font-medium w-[18px] h-[18px] rounded-full absolute top-[24px] -right-[2px]"
        >
          {logoUrl ? (
            <span className="flex items-center justify-center w-full h-full bg-element-light-lighter-100 rounded-full p-[2px]">
              <img src={logoUrl} alt="Logo Organization" />
            </span>
          ) : (
            <span className="w-full h-full text-xxs text-text-400 bg-element-light-lighter-300 border border-element-light-lighter-100 rounded-full flex items-center justify-center uppercase">
              {logoText}
            </span>
          )}
        </div>
      )}
    </div>
  )

  return !noTooltip ? <Tooltip content={`${firstName} ${lastName}`}>{avatarContent}</Tooltip> : <>{avatarContent}</>
}

export default Avatar
