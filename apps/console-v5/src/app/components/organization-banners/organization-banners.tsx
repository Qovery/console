import { useParams } from '@tanstack/react-router'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { useUserRole } from '@qovery/shared/iam/feature'
import { AnnouncementBanner } from '@qovery/shared/posthog/feature'
import { Banner } from '@qovery/shared/ui'
import { OrganizationFreeTrialBanner } from './organization-free-trial-banner'

export function OrganizationBanners() {
  const { organizationId = '' } = useParams({ strict: false })
  const { data: organization } = useOrganization({ organizationId, enabled: !!organizationId })
  const { roles, isQoveryAdminUser } = useUserRole()

  const displayQoveryAdminBanner = (() => {
    if (isQoveryAdminUser) {
      const checkIfUserHasOrganization = roles.some((org) => org.includes(organizationId)) ?? true
      return !checkIfUserHasOrganization
    }
    return false
  })()

  return (
    <>
      {displayQoveryAdminBanner ? (
        <Banner color="yellow">
          Qovery admin message - This organization is a customer (<b>{organization?.name}</b>), please be careful with
          actions.
        </Banner>
      ) : null}
      <AnnouncementBanner />
      <OrganizationFreeTrialBanner />
    </>
  )
}
