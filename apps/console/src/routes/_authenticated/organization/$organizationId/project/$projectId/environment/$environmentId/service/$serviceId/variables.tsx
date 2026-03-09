import { createFileRoute, useParams } from '@tanstack/react-router'
import { Suspense, useState } from 'react'
import { match } from 'ts-pattern'
import { useDeployService, useService } from '@qovery/domains/services/feature'
import { Heading, Icon, LoaderSpinner, Navbar, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { BuiltInTab } from './variables-built-in-tab'
import { CustomTab } from './variables-custom-tab'
import { ExternalSecretsTab } from './variables-external-secrets-tab'

type VariableTab = 'custom' | 'external-secrets' | 'built-in'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/variables'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  useDocumentTitle('Service - Variables')

  const [activeTab, setActiveTab] = useState<VariableTab>('custom')

  const { data: service } = useService({
    environmentId,
    serviceId,
    suspense: true,
  })

  const scope = match(service?.serviceType)
    .with('APPLICATION', () => 'APPLICATION' as const)
    .with('CONTAINER', () => 'CONTAINER' as const)
    .with('JOB', () => 'JOB' as const)
    .with('HELM', () => 'HELM' as const)
    .with('TERRAFORM', () => 'TERRAFORM' as const)
    .otherwise(() => undefined)

  const { mutate: deployService } = useDeployService({
    organizationId,
    projectId,
    environmentId,
  })

  const toasterCallback = () => {
    if (!service?.serviceType) {
      return
    }
    deployService({
      serviceId,
      serviceType: service.serviceType,
    })
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <LoaderSpinner className="w-6" />
        </div>
      }
    >
      <div className="container mx-auto flex min-h-page-container flex-col pb-16 pt-6">
        <Section className="min-h-0 flex-1 gap-8">
          <div className="flex shrink-0 flex-col gap-6">
            <div className="flex justify-between">
              <Heading>Service variables</Heading>
            </div>
            <hr className="w-full border-neutral" />
          </div>

          <div className="flex flex-col">
            <div className="relative overflow-hidden rounded-t-lg border-x border-t border-neutral bg-surface-neutral-subtle">
              <div className="bg-surface-neutral-subtle px-4 pb-2">
                <Navbar.Root activeId={activeTab} className="relative">
                  <Navbar.Item id="custom" onClick={() => setActiveTab('custom')}>
                    <Icon iconName="sliders" iconStyle="regular" />
                    Custom
                  </Navbar.Item>
                  <Navbar.Item id="external-secrets" onClick={() => setActiveTab('external-secrets')}>
                    <Icon iconName="lock-keyhole" iconStyle="regular" />
                    External secrets
                  </Navbar.Item>
                  <Navbar.Item id="built-in" onClick={() => setActiveTab('built-in')}>
                    <Icon iconName="cube" iconStyle="regular" />
                    Built-in
                  </Navbar.Item>
                </Navbar.Root>
              </div>
            </div>

            <div className="relative -mt-2 rounded-lg">
              <div className="overflow-hidden rounded-lg border border-neutral bg-background">
                {activeTab === 'custom' && scope && (
                  <CustomTab
                    scope={scope}
                    organizationId={organizationId}
                    projectId={projectId}
                    environmentId={environmentId}
                    serviceId={serviceId}
                    toasterCallback={toasterCallback}
                  />
                )}
                {activeTab === 'external-secrets' && <ExternalSecretsTab />}
                {activeTab === 'built-in' && scope && (
                  <BuiltInTab
                    scope={scope}
                    organizationId={organizationId}
                    projectId={projectId}
                    environmentId={environmentId}
                    serviceId={serviceId}
                    toasterCallback={toasterCallback}
                  />
                )}
              </div>
            </div>
          </div>
        </Section>
      </div>
    </Suspense>
  )
}
