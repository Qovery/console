import { createFileRoute, useParams } from '@tanstack/react-router'
import { Suspense, useState } from 'react'
import { useDeployEnvironment } from '@qovery/domains/environments/feature'
import {
  EXTERNAL_SECRETS_USE_CASES,
  ExternalSecretsTab,
  type ExternalSecretsUseCaseId,
} from '@qovery/domains/services/feature'
import { VariableList, VariablesActionToolbar } from '@qovery/domains/variables/feature'
import { ENVIRONMENT_LOGS_URL, ENVIRONMENT_STAGES_URL } from '@qovery/shared/routes'
import { Heading, Icon, LoaderSpinner, Navbar, Section, toast } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useUseCasePage } from '../../../../../../../../app/components/use-cases/use-case-context'

type VariableTab = 'custom' | 'external-secrets' | 'built-in'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/variables'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const [activeTab, setActiveTab] = useState<VariableTab>('custom')
  const { selectedCaseId } = useUseCasePage({
    pageId: 'environment-variables-external-secrets',
    options: EXTERNAL_SECRETS_USE_CASES,
    defaultCaseId: 'filled',
  })

  useDocumentTitle('Services - Variables')

  const { mutate: deployEnvironment } = useDeployEnvironment({
    projectId,
    logsLink: ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + ENVIRONMENT_STAGES_URL(),
  })

  const toasterCallback = () => {
    deployEnvironment({ environmentId })
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <LoaderSpinner className="w-6" />
        </div>
      }
    >
      <div className="container mx-auto flex min-h-page-container flex-col pt-6">
        <Section className="min-h-0 flex-1 gap-8">
          <div className="flex shrink-0 flex-col gap-6">
            <div className="flex justify-between">
              <Heading>Environment variables</Heading>
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
              <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
                {activeTab === 'custom' && (
                  <VariableList
                    showOnly="custom"
                    hideSectionLabel
                    headerActions={
                      <VariablesActionToolbar
                        showDopplerButton
                        scope="ENVIRONMENT"
                        projectId={projectId}
                        environmentId={environmentId}
                        onCreateVariable={() =>
                          toast(
                            'SUCCESS',
                            'Creation success',
                            'You need to redeploy your environment for your changes to be applied.',
                            toasterCallback,
                            undefined,
                            'Redeploy'
                          )
                        }
                      />
                    }
                    scope="ENVIRONMENT"
                    organizationId={organizationId}
                    projectId={projectId}
                    environmentId={environmentId}
                    onCreateVariable={() => {
                      toast(
                        'SUCCESS',
                        'Creation success',
                        'You need to redeploy your environment for your changes to be applied.',
                        toasterCallback,
                        undefined,
                        'Redeploy'
                      )
                    }}
                    onEditVariable={() => {
                      toast(
                        'SUCCESS',
                        'Edition success',
                        'You need to redeploy your environment for your changes to be applied.',
                        toasterCallback,
                        undefined,
                        'Redeploy'
                      )
                    }}
                    onDeleteVariable={(variable) => {
                      let name = variable.key
                      if (name && name.length > 30) {
                        name = name.substring(0, 30) + '...'
                      }
                      toast(
                        'SUCCESS',
                        'Deletion success',
                        `${name} has been deleted. You need to redeploy your environment for your changes to be applied.`,
                        toasterCallback,
                        undefined,
                        'Redeploy'
                      )
                    }}
                  />
                )}

                {activeTab === 'external-secrets' && (
                  <ExternalSecretsTab selectedCaseId={selectedCaseId as ExternalSecretsUseCaseId} />
                )}

                {activeTab === 'built-in' && (
                  <VariableList
                    showOnly="built-in"
                    hideSectionLabel
                    headerActions={<div className="hidden" />}
                    scope="ENVIRONMENT"
                    organizationId={organizationId}
                    projectId={projectId}
                    environmentId={environmentId}
                    onCreateVariable={() => {
                      toast(
                        'SUCCESS',
                        'Creation success',
                        'You need to redeploy your environment for your changes to be applied.',
                        toasterCallback,
                        undefined,
                        'Redeploy'
                      )
                    }}
                    onEditVariable={() => {
                      toast(
                        'SUCCESS',
                        'Edition success',
                        'You need to redeploy your environment for your changes to be applied.',
                        toasterCallback,
                        undefined,
                        'Redeploy'
                      )
                    }}
                    onDeleteVariable={(variable) => {
                      let name = variable.key
                      if (name && name.length > 30) {
                        name = name.substring(0, 30) + '...'
                      }
                      toast(
                        'SUCCESS',
                        'Deletion success',
                        `${name} has been deleted. You need to redeploy your environment for your changes to be applied.`,
                        toasterCallback,
                        undefined,
                        'Redeploy'
                      )
                    }}
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
