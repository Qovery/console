import Icon from '../icon/icon'
import Tooltip from '../tooltip/tooltip'

export enum LegacyAvatarStyle {
  NORMAL = 'normal',
  STROKED = 'stroked',
}

export interface LegacyAvatarProps {
  firstName: string
  lastName?: string
  url?: string
  style?: LegacyAvatarStyle
  icon?: string
  logoUrl?: string
  logoText?: string
  className?: string
  alt?: string
  onClick?: () => void
  size?: number
  noTooltip?: boolean
}

/**
 * @deprecated This component has been deprecated due to composability issue, use Avatar instead
 */
export function LegacyAvatar(props: LegacyAvatarProps) {
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

  const defineClass = `${style === LegacyAvatarStyle.STROKED ? 'border border-neutral-200' : ''} ${
    onClick ? 'cursor-pointer' : ''
  }`

  const avatarContent = (
    <div
      data-testid="avatar"
      style={{ width: size, height: size }}
      className={`relative block rounded-full ${defineClass} ${className}`}
      onClick={() => onClick && onClick()}
    >
      {url ? (
        <img src={url} alt={alt} className="h-full w-full rounded-full" />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-200 text-center">
          <span className="relative text-xs font-medium text-neutral-400">
            {firstName && firstName.charAt(0).toUpperCase()}
            {lastName && lastName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      {icon && (
        <Icon data-testid="avatar-icon" name={icon} className="absolute -bottom-1 -right-1 h-4 w-4 drop-shadow-sm" />
      )}
      {(logoUrl || logoText) && (
        <div
          data-testid="avatar-logo"
          className="absolute -right-[2px] top-[24px] flex h-[18px] w-[18px] items-center rounded-full text-sm font-medium"
        >
          {logoUrl ? (
            <span className="flex h-full w-full items-center justify-center rounded-full bg-neutral-50 p-[2px]">
              <img src={logoUrl} alt="Logo Organization" />
            </span>
          ) : (
            <span className="flex h-full w-full items-center justify-center rounded-full border border-neutral-50 bg-neutral-150 text-2xs uppercase text-neutral-350">
              {logoText}
            </span>
          )}
        </div>
      )}
    </div>
  )

  return !noTooltip ? <Tooltip content={`${firstName} ${lastName}`}>{avatarContent}</Tooltip> : <>{avatarContent}</>
}

export default LegacyAvatar
