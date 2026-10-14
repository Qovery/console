import { Icon, Link } from '@qovery/shared/ui'

export interface CloudCredentialsLinkProps {
  organizationId: string
}

export function CloudCredentialsLink({ organizationId }: CloudCredentialsLinkProps) {
  return (
    <Link
      color="brand"
      to="/organization/$organizationId/settings/cloud-credentials"
      params={{ organizationId }}
      className="flex gap-1"
    >
      See and edit all Cloud credentials
      <Icon iconName="key" iconStyle="regular" />
    </Link>
  )
}

export default CloudCredentialsLink
