import { createFileRoute, useParams } from '@tanstack/react-router'
import { Suspense } from 'react'
import { CreateUpdateVariableModal, VariableList } from '@qovery/domains/variables/feature'
import { ActionToolbar, DropdownMenu, Heading, Icon, LoaderSpinner, Section, toast, useModal } from '@qovery/shared/ui'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/project/$projectId/variables')({
  component: RouteComponent,
})

function RouteComponent() {
  const { projectId } = useParams({ strict: false })
  const { openModal, closeModal } = useModal()

  const onCreateVariable = (isFile?: boolean) =>
    openModal({
      content: (
        <CreateUpdateVariableModal
          scope="PROJECT"
          projectId={projectId}
          closeModal={closeModal}
          type="VALUE"
          mode="CREATE"
          onSubmit={() => toast('SUCCESS', 'Creation success')}
          isFile={isFile}
        />
      ),
      options: {
        fakeModal: true,
      },
    })

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <LoaderSpinner className="w-6" />
        </div>
      }
    >
      <div className="container mx-auto mt-6 pb-10">
        <Section className="gap-8">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between">
              <Heading>Variables</Heading>
              <ActionToolbar.Root className="flex">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <ActionToolbar.Button color="brand" variant="solid" size="md" className="gap-2">
                      <Icon iconName="circle-plus" iconStyle="regular" />
                      New variable
                    </ActionToolbar.Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item onSelect={() => onCreateVariable()} icon={<Icon iconName="key" />}>
                      Variable
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() => onCreateVariable(true)}
                      icon={<Icon iconName="file-lines" iconStyle="regular" />}
                    >
                      Variable as file
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </ActionToolbar.Root>
            </div>
            <hr className="w-full border-neutral" />
          </div>
          <div className="flex flex-col gap-8">
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
