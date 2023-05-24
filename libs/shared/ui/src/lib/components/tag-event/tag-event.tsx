import { OrganizationEventType } from 'qovery-typescript-axios'
import Icon from '../icon/icon'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'
import { Tag } from '../tag/tag'

export interface TagEventProps {
  eventType?: OrganizationEventType
}

export function TagEvent(props: TagEventProps) {
  const { eventType } = props

  function formatStatusName(eventType?: OrganizationEventType) {
    switch (eventType) {
      case OrganizationEventType.ACCEPT:
        return (
          <Tag className="bg-success-50 text-success-500 border border-success-500 !h-6">
            Accept <Icon name={IconAwesomeEnum.CHECK} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.CREATE:
        return (
          <Tag className="bg-success-50 text-success-500 border border-success-500 !h-6">
            Create <Icon name={IconAwesomeEnum.CHECK} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.DELETE:
        return (
          <Tag className="bg-error-50 text-error-500 border border-error-500 !h-6">
            Delete <Icon name={IconAwesomeEnum.ERASER} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.UPDATE:
        return (
          <Tag className="bg-orange-50 text-orange-500 border border-orange-500 !h-6">
            Update <Icon name={IconAwesomeEnum.ROTATE} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.TRIGGER_CANCEL:
        return (
          <Tag className="bg-element-light-lighter-200 text-element-light-lighter-700 border border-element-light-lighter-500 !h-6">
            Trigger Cancel <Icon name={IconAwesomeEnum.CROSS} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.TRIGGER_DELETE:
        return (
          <Tag className="bg-error-50 text-error-500 border border-error-500 !h-6">
            Trigger Delete <Icon name={IconAwesomeEnum.ERASER} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.TRIGGER_DEPLOY:
        return (
          <Tag className="bg-element-light-lighter-200 text-element-light-lighter-700 border border-element-light-lighter-500 !h-6">
            Trigger Deploy <Icon name={IconAwesomeEnum.CHECK} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.TRIGGER_REDEPLOY:
        return (
          <Tag className="bg-element-light-lighter-200 text-element-light-lighter-700 border border-element-light-lighter-500 !h-6">
            Trigger Redeploy <Icon name={IconAwesomeEnum.CHECK} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.TRIGGER_STOP:
        return (
          <Tag className="bg-orange-50 text-orange-500 border border-orange-500 !h-6">
            Trigger Stop <Icon name={IconAwesomeEnum.CROSS} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.TRIGGER_RESTART:
        return (
          <Tag className="bg-orange-50 text-orange-500 border border-orange-500 !h-6">
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
