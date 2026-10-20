import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { getClusterSetupCommand } from '@qovery/domains/clusters/feature'
import { useAuth } from '@qovery/shared/auth'
import { Button, Callout, CopyButton, ExternalLink, Heading, Icon, toastError } from '@qovery/shared/ui'
import { useDocumentTitle, useOS } from '@qovery/shared/util-hooks'
import { queries } from '@qovery/state/util-queries'
import { useDemoClusterInstallation } from '../hooks/use-demo-cluster-installation/use-demo-cluster-installation'
import { readPendingOnboarding } from '../utils/pending-onboarding'

export function OnboardingDemoCluster() {
  useDocumentTitle('Create a demo cluster - Qovery')
  const { organizationId = '' } = useParams({ strict: false })
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isContinuing, setIsContinuing] = useState(false)
  const os = useOS()
  const command = getClusterSetupCommand(os, 'LOCAL_DEMO')
  const [program, ...arguments_] = command.split(' ')
  const { readyCluster, isError } = useDemoClusterInstallation({ organizationId })
  const continueToPlatform = async () => {
    if (!readyCluster || isContinuing) return
    setIsContinuing(true)
    const pending = readPendingOnboarding(user?.sub)
    const projectId = pending?.organizationId === organizationId ? pending.projectId : undefined
    try {
      const projects = projectId
        ? await queryClient.fetchQuery({
            ...queries.projects.list({ organizationId }),
            staleTime: 0,
            retry: false,
          })
        : []
      if (projectId && projects?.some((project) => project.id === projectId)) {
        await navigate({
          to: '/organization/$organizationId/project/$projectId/overview',
          params: { organizationId, projectId },
          replace: true,
        })
      } else {
        await navigate({ to: '/organization/$organizationId/overview', params: { organizationId }, replace: true })
      }
    } catch (error) {
      toastError(error as Error)
    } finally {
      setIsContinuing(false)
    }
  }

  return (
    <section className="flex min-h-[542px] flex-col justify-between gap-6">
      <div className="flex flex-col gap-6">
        <div className="motion-safe:animate-[slidein-up-sm_240ms_cubic-bezier(0.165,0.84,0.44,1)_both,fadein_200ms_cubic-bezier(0.165,0.84,0.44,1)_both] motion-reduce:animate-[fadein_120ms_cubic-bezier(0.165,0.84,0.44,1)]">
          <Heading level={1} className="mb-2 font-brand text-[28px] font-normal leading-9 text-neutral">
            Create a demo cluster
          </Heading>
          <p className="text-base text-neutral-subtle">
            Complete these two steps. You can continue to your project when the cluster is ready.
          </p>
        </div>
        <div className="flex flex-col gap-6 motion-safe:animate-[slidein-up-sm_240ms_cubic-bezier(0.165,0.84,0.44,1)_both,fadein_200ms_cubic-bezier(0.165,0.84,0.44,1)_both] motion-safe:[animation-delay:40ms] motion-reduce:animate-[fadein_120ms_cubic-bezier(0.165,0.84,0.44,1)]">
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-neutral">Prepare your machine</h2>
            <div className="flex items-center justify-between gap-3 rounded-md border border-neutral bg-surface-neutral-subtle p-3 text-sm text-neutral">
              <p>Install and open Docker Desktop</p>
              <ExternalLink
                as="button"
                href="https://www.docker.com/products/docker-desktop/"
                size="md"
                variant="outline"
                color="neutral"
              >
                Docker website <Icon iconName="arrow-up-right-from-square" />
              </ExternalLink>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-neutral">Run this command in your terminal</h2>
            {os === 'windows' && (
              <p className="text-sm text-neutral-subtle">
                Run in PowerShell with WSL 2 installed and Docker Desktop’s WSL integration enabled.
              </p>
            )}
            <div
              data-theme="dark"
              className="flex items-center gap-4 rounded-lg border border-neutral bg-surface-neutral px-4 py-3"
            >
              <code className="min-w-0 flex-1 break-words font-code text-xs leading-5 text-neutral">
                <span className="text-info">{program}</span> {arguments_.join(' ')}
              </code>
              <CopyButton
                content={command}
                size="md"
                iconPosition="left"
                className="bg-surface-neutral-component hover:bg-surface-neutral-componentHover"
              />
            </div>
            {!readyCluster && (
              <p id="demo-cluster-continue-hint" className="text-sm text-neutral-subtle">
                Continue will be enabled once we detect that your demo cluster is ready.
              </p>
            )}
          </div>
          {readyCluster && (
            <Callout.Root color="green" role="status">
              <Callout.Icon>
                <Icon iconName="circle-check" />
              </Callout.Icon>
              <Callout.Text>Your demo cluster is ready.</Callout.Text>
            </Callout.Root>
          )}
          {isError && !readyCluster && (
            <Callout.Root color="red">
              <Callout.Icon>
                <Icon iconName="circle-exclamation" />
              </Callout.Icon>
              <Callout.Text>We couldn’t check your cluster yet. Retrying automatically.</Callout.Text>
            </Callout.Root>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          size="lg"
          variant="outline"
          color="neutral"
          className="self-start text-base font-medium"
          onClick={() =>
            navigate({ to: '/onboarding/organization/$organizationId/cluster', params: { organizationId } })
          }
        >
          <Icon iconName="arrow-left" iconStyle="solid" className="text-base text-neutral-subtle" /> Back
        </Button>
        <Button
          type="button"
          size="lg"
          className="flex-1 justify-center text-base font-medium"
          disabled={!readyCluster}
          aria-describedby={!readyCluster ? 'demo-cluster-continue-hint' : undefined}
          loading={isContinuing}
          onClick={continueToPlatform}
        >
          Continue <Icon iconName="arrow-right" iconStyle="solid" className="text-base" />
        </Button>
      </div>
    </section>
  )
}
