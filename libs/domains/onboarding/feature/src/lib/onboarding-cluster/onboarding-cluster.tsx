import { useNavigate, useParams } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { useAuth } from '@qovery/shared/auth'
import { Button, ExternalLink, Heading, Icon, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { readPendingOnboarding } from '../utils/pending-onboarding'

export function OnboardingCluster() {
  useDocumentTitle('Create a cluster - Qovery')
  const { organizationId = '' } = useParams({ strict: false })
  const { user } = useAuth()
  const navigate = useNavigate()
  const pending = readPendingOnboarding(user?.sub)
  const canGoBack = pending?.organizationId === organizationId

  const leaveOnboarding = async () => {
    await navigate({ to: '/organization/$organizationId/overview', params: { organizationId } })
  }

  const createCluster = async () => {
    posthog.capture('onboarding-cluster-selected', {
      option: 'create-cluster',
      organization_id: organizationId,
      $groups: { organization_id: organizationId },
    })
    await navigate({
      to: '/organization/$organizationId/cluster/new',
      params: { organizationId },
      search: { 'no-demo': true },
    })
  }

  const testPlatform = () => {
    posthog.capture('onboarding-demo-selected', {
      option: 'platform-demo',
      organization_id: organizationId,
      $groups: { organization_id: organizationId },
    })
  }

  return (
    <Section className="gap-20">
      <div className="flex flex-col gap-6">
        <div className="motion-safe:animate-[slidein-up-sm_240ms_cubic-bezier(0.165,0.84,0.44,1)_both,fadein_200ms_cubic-bezier(0.165,0.84,0.44,1)_both] motion-reduce:animate-[fadein_120ms_cubic-bezier(0.165,0.84,0.44,1)]">
          <Heading level={1} className="mb-2 font-brand text-[28px] font-normal leading-9 text-neutral">
            Create a cluster
          </Heading>
          <p className="text-base text-neutral-subtle">
            Create a cluster to deploy your applications, or test the platform with a demo.
          </p>
        </div>
        <div className="flex flex-col gap-2 motion-safe:animate-[slidein-up-sm_240ms_cubic-bezier(0.165,0.84,0.44,1)_both,fadein_200ms_cubic-bezier(0.165,0.84,0.44,1)_both] motion-safe:[animation-delay:40ms] motion-reduce:animate-[fadein_120ms_cubic-bezier(0.165,0.84,0.44,1)]">
          <Button
            size="md"
            variant="outline"
            color="neutral"
            className="h-auto flex-col items-start gap-3 px-4 pb-3 pt-4 text-left font-normal shadow-sm hover:border-brand-strong"
            onClick={createCluster}
          >
            <span aria-hidden className="flex h-5 items-center gap-2">
              <span className="flex size-5 items-center justify-center">
                <Icon name="AWS" width={20} height={20} />
              </span>
              <span className="flex size-5 items-center justify-center">
                <Icon name="GCP" width={20} height={20} />
              </span>
              <span className="flex size-5 items-center justify-center">
                <Icon name="SCW" width={20} height={20} />
              </span>
            </span>
            <span className="flex min-h-[68px] flex-col gap-1">
              <span className="font-medium">Create a cluster</span>
              <span className="text-neutral-subtle">
                Set up a cluster on your infrastructure to deploy your applications with Qovery.
              </span>
            </span>
          </Button>
          <ExternalLink
            as="button"
            href="https://console-demo.qovery.com"
            target="_self"
            size="md"
            variant="outline"
            color="neutral"
            className="h-auto flex-col items-start gap-3 px-4 pb-3 pt-4 text-left font-normal shadow-sm hover:border-brand-strong"
            onClick={testPlatform}
          >
            <Icon iconName="laptop-code" className="text-xl text-neutral-subtle" />
            <span className="flex min-h-[68px] flex-col gap-1">
              <span className="font-medium">Test the platform</span>
              <span className="text-neutral-subtle">
                Explore the Qovery demo platform with sample applications. No cloud account or setup required.
              </span>
            </span>
          </ExternalLink>
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
    </Section>
  )
}
