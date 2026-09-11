import { OrganizationEventOrigin } from 'qovery-typescript-axios'
import { IconEnum } from '@qovery/shared/enums'
import { Icon } from '@qovery/shared/ui'

export interface EventOriginIconProps {
  origin?: OrganizationEventOrigin | null
}

export function EventOriginIcon({ origin }: EventOriginIconProps) {
  switch (origin) {
    case OrganizationEventOrigin.GIT:
      return <Icon iconName="code-branch" />
    case OrganizationEventOrigin.CONSOLE:
      return <Icon iconName="browser" />
    case OrganizationEventOrigin.QOVERY_INTERNAL:
      return <Icon iconName="wave-pulse" />
    case OrganizationEventOrigin.API:
      return <Icon iconName="cloud-arrow-up" />
    case OrganizationEventOrigin.CLI:
      return <Icon iconName="terminal" />
    case OrganizationEventOrigin.TERRAFORM_PROVIDER:
      return <Icon name={IconEnum.TERRAFORM} width="12" />
    default:
      return null
  }
}
