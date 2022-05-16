import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { Tag } from '../tag/tag'

export interface TagModeProps {
  status: EnvironmentModeEnum
  withBorder?: boolean
}

export function TagMode(props: TagModeProps) {
  const { status, withBorder } = props

  function formatStatusName(status: EnvironmentModeEnum) {
    switch (status) {
      case EnvironmentModeEnum.PRODUCTION:
        return <Tag className={`bg-brand-50 text-brand-500 ${withBorder ? 'border border-brand-500' : ''}`}>PROD</Tag>
      case EnvironmentModeEnum.DEVELOPMENT:
        return (
          <Tag className={`bg-element-light-lighter-300 text-text-400 ${withBorder ? 'border border-text-400' : ''}`}>
            DEV
          </Tag>
        )
      case EnvironmentModeEnum.PREVIEW:
        return (
          <Tag className={`bg-success-50 text-success-500 ${withBorder ? 'border border-success-500' : ''}`}>
            PREVIEW
          </Tag>
        )
      case EnvironmentModeEnum.STAGING:
        return (
          <Tag className={`bg-element-light-lighter-300 text-text-400 ${withBorder ? 'border border-text-400' : ''}`}>
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
