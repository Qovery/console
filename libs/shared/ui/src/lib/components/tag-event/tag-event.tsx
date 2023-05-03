import { OrganizationEventType } from 'qovery-typescript-axios'
import Icon from '../icon/icon'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'
import { Tag, TagSize } from '../tag/tag'

export interface TagEventProps {
  eventType?: OrganizationEventType
  size?: TagSize
}

export function TagEvent(props: TagEventProps) {
  const { eventType, size = TagSize.NORMAL } = props

  function formatStatusName(eventType?: OrganizationEventType) {
    switch (eventType) {
      case OrganizationEventType.ACCEPT:
        return (
          <Tag size={size} className="bg-success-50 text-success-500 border border-success-500">
            Accept <Icon name={IconAwesomeEnum.CHECK} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.CREATE:
        return (
          <Tag size={size} className="bg-success-50 text-success-500 border border-success-500">
            Create <Icon name={IconAwesomeEnum.CHECK} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.DELETE:
        return (
          <Tag size={size} className="bg-error-50 text-error-500 border border-error-500">
            DELETE <Icon name={IconAwesomeEnum.ERASER} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.UPDATE:
        return (
          <Tag size={size} className="bg-orange-50 text-orange-500 border border-orange-500">
            Update <Icon name={IconAwesomeEnum.ROTATE} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.TRIGGER_CANCEL:
        return (
          <Tag
            size={size}
            className="bg-element-light-lighter-200 text-element-light-lighter-700 border border-element-light-lighter-500"
          >
            Trigger Cancel <Icon name={IconAwesomeEnum.CROSS} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.TRIGGER_DELETE:
        return (
          <Tag size={size} className="bg-error-50 text-error-500 border border-error-500">
            Trigger Delete <Icon name={IconAwesomeEnum.ERASER} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.TRIGGER_DEPLOY:
        return (
          <Tag
            size={size}
            className="bg-element-light-lighter-200 text-element-light-lighter-700 border border-element-light-lighter-500"
          >
            Trigger Deploy <Icon name={IconAwesomeEnum.CHECK} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.TRIGGER_REDEPLOY:
        return (
          <Tag
            size={size}
            className="bg-element-light-lighter-200 text-element-light-lighter-700 border border-element-light-lighter-500"
          >
            Trigger Redeploy <Icon name={IconAwesomeEnum.CHECK} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.TRIGGER_STOP:
        return (
          <Tag size={size} className="bg-orange-50 text-orange-500 border border-orange-500">
            Trigger Stop <Icon name={IconAwesomeEnum.CROSS} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.TRIGGER_RESTART:
        return (
          <Tag size={size} className="bg-orange-50 text-orange-500 border border-orange-500">
            Trigger Restart <Icon name={IconAwesomeEnum.ROTATE_RIGHT} className="ml-1" />
          </Tag>
        )
      default:
        return '-'
    }
  }

  return <>{formatStatusName(eventType)}</>
}

export default TagEvent
