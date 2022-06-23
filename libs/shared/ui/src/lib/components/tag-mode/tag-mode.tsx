import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { Tag, TagSize } from '../tag/tag'

export interface TagModeProps {
  status: EnvironmentModeEnum
  size?: TagSize
}

export function TagMode(props: TagModeProps) {
  const { status, size = TagSize.NORMAL } = props

  function formatStatusName(status: EnvironmentModeEnum) {
    switch (status) {
      case EnvironmentModeEnum.PRODUCTION:
        return (
          <Tag size={size} className="bg-brand-50 text-brand-500 border border-brand-500">
            PROD
          </Tag>
        )
      case EnvironmentModeEnum.DEVELOPMENT:
        return (
          <Tag size={size} className="bg-element-light-lighter-300 text-text-400 border border-text-400">
            DEV
          </Tag>
        )
      case EnvironmentModeEnum.PREVIEW:
        return (
          <Tag size={size} className="bg-accent1-50 text-accent1-500 border border-accent1-500">
            PREVIEW
          </Tag>
        )
      case EnvironmentModeEnum.STAGING:
        return (
          <Tag size={size} className="bg-element-light-lighter-300 text-text-400 border border-text-400">
            STAGING
          </Tag>
        )
      default:
        return '-'
    }
  }

  return <>{formatStatusName(status)}</>
}

export default TagMode
