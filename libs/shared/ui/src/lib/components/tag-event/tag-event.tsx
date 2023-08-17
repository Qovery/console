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
          <Tag fontWeight="font-medium" className="bg-green-50 text-green-500 border border-green-500 !h-6">
            Accept <Icon name={IconAwesomeEnum.CHECK} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.CREATE:
        return (
          <Tag fontWeight="font-medium" className="bg-green-50 text-green-500 border border-green-500 !h-6">
            Create <Icon name={IconAwesomeEnum.CHECK} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.DELETE:
        return (
          <Tag
            fontWeight="font-medium"
            className="bg-element-light-lighter-200 text-element-light-lighter-700 border border-element-light-lighter-500 !h-6"
          >
            Delete <Icon name={IconAwesomeEnum.ERASER} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.UPDATE:
        return (
          <Tag fontWeight="font-medium" className="bg-accent2-50 text-accent2-600 border border-accent2-500 !h-6">
            Update <Icon name={IconAwesomeEnum.ROTATE} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.TRIGGER_CANCEL:
        return (
          <Tag
            fontWeight="font-medium"
            className="bg-element-light-lighter-200 text-element-light-lighter-700 border border-element-light-lighter-500 !h-6"
          >
            Trigger Cancel <Icon name={IconAwesomeEnum.XMARK} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.TRIGGER_DELETE:
        return (
          <Tag
            fontWeight="font-medium"
            className="bg-element-light-lighter-200 text-element-light-lighter-700 border border-element-light-lighter-500 !h-6 truncate"
          >
            Trigger Delete <Icon name={IconAwesomeEnum.ERASER} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.TRIGGER_DEPLOY:
        return (
          <Tag
            fontWeight="font-medium"
            className="bg-element-light-lighter-200 text-element-light-lighter-700 border border-element-light-lighter-500 !h-6 truncate"
          >
            Trigger Deploy <Icon name={IconAwesomeEnum.CHECK} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.TRIGGER_REDEPLOY:
        return (
          <Tag
            fontWeight="font-medium"
            className="bg-element-light-lighter-200 text-element-light-lighter-700 border border-element-light-lighter-500 !h-6 truncate"
          >
            Trigger Redeploy <Icon name={IconAwesomeEnum.CHECK} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.TRIGGER_STOP:
        return (
          <Tag
            fontWeight="font-medium"
            className="bg-accent2-50 text-accent2-600 border border-accent2-500 !h-6 truncate"
          >
            Trigger Stop <Icon name={IconAwesomeEnum.XMARK} className="ml-1" />
          </Tag>
        )
      case OrganizationEventType.TRIGGER_RESTART:
        return (
          <Tag
            fontWeight="font-medium"
            className="bg-accent2-50 text-accent2-600 border border-accent2-500 !h-6 truncate"
          >
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
