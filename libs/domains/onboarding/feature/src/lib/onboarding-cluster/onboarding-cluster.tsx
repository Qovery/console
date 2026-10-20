import { useNavigate, useParams } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { useAuth } from '@qovery/shared/auth'
import { Button, Heading, Icon } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { readPendingOnboarding, savePendingOnboarding } from '../utils/pending-onboarding'
import aws from './assets/aws.svg'
import gcp from './assets/gcp.svg'
import laptopCode from './assets/laptop-code.svg'
import scaleway from './assets/scaleway.svg'

export function OnboardingCluster() {
  useDocumentTitle('Create a cluster - Qovery')
  const { organizationId = '' } = useParams({ strict: false })
  const { user } = useAuth()
  const navigate = useNavigate()
  const pending = readPendingOnboarding(user?.sub)
  const canGoBack = pending?.organizationId === organizationId

  const leaveOnboarding = async () => {
    await navigate({ to: '/organization/$organizationId/overview', params: { organizationId } })
    if (canGoBack) savePendingOnboarding(user?.sub, undefined)
  }

  const selectClusterOption = async (hasCloudAdminAccess: boolean) => {
    posthog.capture(hasCloudAdminAccess ? 'onboarding-cloud-admin-selected' : 'onboarding-demo-selected', {
      has_cloud_admin_access: hasCloudAdminAccess,
      option: hasCloudAdminAccess ? 'cloud-admin' : 'local-demo',
      organization_id: organizationId,
      $groups: { organization_id: organizationId },
    })
    if (hasCloudAdminAccess) {
      await navigate({
        to: '/organization/$organizationId/cluster/new',
        params: { organizationId },
        search: { 'no-demo': true },
      })
      if (canGoBack) savePendingOnboarding(user?.sub, undefined)
    } else {
      await navigate({ to: '/onboarding/organization/$organizationId/demo-cluster', params: { organizationId } })
    }
  }

  return (
    <section className="flex flex-col gap-20">
      <div className="flex flex-col gap-6">
        <div className="motion-safe:animate-[slidein-up-sm_240ms_cubic-bezier(0.165,0.84,0.44,1)_both,fadein_200ms_cubic-bezier(0.165,0.84,0.44,1)_both] motion-reduce:animate-[fadein_120ms_cubic-bezier(0.165,0.84,0.44,1)]">
          <Heading level={1} className="mb-2 font-brand text-[28px] font-normal leading-9 text-neutral">
            Create a cluster
          </Heading>
          <p className="text-base text-neutral-subtle">
            Choose where your apps will run. It's necessary to use the capabilities on Qovery, it takes few minutes.
          </p>
        </div>
        <div className="flex flex-col gap-2 motion-safe:animate-[slidein-up-sm_240ms_cubic-bezier(0.165,0.84,0.44,1)_both,fadein_200ms_cubic-bezier(0.165,0.84,0.44,1)_both] motion-safe:[animation-delay:40ms] motion-reduce:animate-[fadein_120ms_cubic-bezier(0.165,0.84,0.44,1)]">
          <Button
            size="md"
            variant="outline"
            color="neutral"
            className="h-auto flex-col items-start gap-3 px-4 pb-3 pt-4 text-left font-normal shadow-sm hover:border-brand-strong"
            onClick={() => selectClusterOption(true)}
          >
            <span aria-hidden className="flex h-5 items-center gap-1.5">
              <span className="flex size-5 items-center justify-center">
                <img src={aws} alt="" />
              </span>
              <span className="flex size-5 items-center justify-center">
                <img src={gcp} alt="" />
              </span>
              <span className="flex size-5 items-center justify-center">
                <img src={scaleway} alt="" />
              </span>
            </span>
            <span className="flex min-h-[68px] flex-col gap-1">
              <span className="font-medium">I have a cloud admin account</span>
              <span className="text-neutral-subtle">
                You’ll be able to create a fully Qovery-managed cluster by entering your cloud credentials next.
              </span>
            </span>
          </Button>
          <Button
            size="md"
            variant="outline"
            color="neutral"
            className="h-auto flex-col items-start gap-3 px-4 pb-3 pt-4 text-left font-normal shadow-sm hover:border-brand-strong"
            onClick={() => selectClusterOption(false)}
          >
            <img src={laptopCode} alt="" />
            <span className="flex min-h-[68px] flex-col gap-1">
              <span className="font-medium">I don’t have a cloud admin account</span>
              <span className="text-neutral-subtle">
                No worries, you’ll be able to create a cluster locally and deploy your applications on it.
              </span>
            </span>
          </Button>
        </div>
      </div>
      <Button
        type="button"
        size="lg"
        variant="outline"
        color="neutral"
        className="self-start text-base font-medium motion-safe:animate-[slidein-up-sm_240ms_cubic-bezier(0.165,0.84,0.44,1)_both,fadein_200ms_cubic-bezier(0.165,0.84,0.44,1)_both] motion-safe:[animation-delay:80ms] motion-reduce:animate-[fadein_120ms_cubic-bezier(0.165,0.84,0.44,1)]"
        onClick={() => (canGoBack ? navigate({ to: '/onboarding/profile' }) : leaveOnboarding())}
      >
        <Icon iconName="arrow-left" iconStyle="solid" className="text-base text-neutral-subtle" /> Back
      </Button>
    </section>
  )
}
