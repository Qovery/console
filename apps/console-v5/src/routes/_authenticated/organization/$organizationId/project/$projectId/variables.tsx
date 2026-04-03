import { createFileRoute, useParams } from '@tanstack/react-router'
import { Suspense } from 'react'
import { VariableList, VariablesActionToolbar } from '@qovery/domains/variables/feature'
import { Heading, LoaderSpinner, Section, toast } from '@qovery/shared/ui'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/project/$projectId/variables')({
  component: RouteComponent,
})

function RouteComponent() {
  const { projectId = '' } = useParams({ strict: false })

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
              <VariablesActionToolbar
                scope="PROJECT"
                projectId={projectId}
                onCreateVariable={() => toast('SUCCESS', 'Creation success')}
              />
            </div>
            <hr className="w-full border-neutral" />
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-8">
            <VariableList
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
          </div>
        </Section>
      </div>
    </Suspense>
  )
}
