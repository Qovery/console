import { createFileRoute, useParams } from '@tanstack/react-router'
import { Suspense, useState } from 'react'
import { VariableList, VariablesActionToolbar } from '@qovery/domains/variables/feature'
import { Heading, Icon, LoaderSpinner, Navbar, Section, toast } from '@qovery/shared/ui'

type VariableTab = 'custom' | 'built-in'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/project/$projectId/variables')({
  component: RouteComponent,
})

function RouteComponent() {
  const { projectId = '' } = useParams({ strict: false })
  const [activeTab, setActiveTab] = useState<VariableTab>('custom')

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
              <Heading>Project variables</Heading>
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
                        scope="PROJECT"
                        projectId={projectId}
                        onCreateVariable={() => toast('SUCCESS', 'Creation success')}
                      />
                    }
                    scope="PROJECT"
                    projectId={projectId}
                    onCreateVariable={() => {
                      toast('SUCCESS', 'Creation success')
                    }}
                    onEditVariable={() => {
                      toast('SUCCESS', 'Edition success')
                    }}
                    onDeleteVariable={() => {
                      toast('SUCCESS', 'Deletion success')
                    }}
                  />
                )}
                {activeTab === 'built-in' && (
                  <VariableList
                    showOnly="built-in"
                    hideSectionLabel
                    headerActions={<div className="hidden" />}
                    scope="PROJECT"
                    projectId={projectId}
                    onCreateVariable={() => {
                      toast('SUCCESS', 'Creation success')
                    }}
                    onEditVariable={() => {
                      toast('SUCCESS', 'Edition success')
                    }}
                    onDeleteVariable={() => {
                      toast('SUCCESS', 'Deletion success')
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
