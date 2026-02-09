import { createFileRoute } from '@tanstack/react-router'
import { useParams } from '@tanstack/react-router'
import { Suspense } from 'react'
import { useDeployEnvironment, useEnvironment } from '@qovery/domains/environments/feature'
import { CreateUpdateVariableModal, VariableList } from '@qovery/domains/variables/feature'
import { ENVIRONMENT_LOGS_URL, ENVIRONMENT_STAGES_URL } from '@qovery/shared/routes'
import { Button, DropdownMenu, Heading, Icon, LoaderSpinner, Section, toast, useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/variables'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const { openModal, closeModal } = useModal()

  useDocumentTitle('Services - Variables')

  const { mutate: deployEnvironment } = useDeployEnvironment({
    projectId,
    logsLink: ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + ENVIRONMENT_STAGES_URL(),
  })

  const toasterCallback = () => {
    deployEnvironment({ environmentId })
  }

  const onCreateVariable = (isFile?: boolean) =>
    openModal({
      content: (
        <CreateUpdateVariableModal
          scope="ENVIRONMENT"
          projectId={projectId}
          environmentId={environmentId}
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
      <div className="container mx-auto flex min-h-page-container flex-col pt-6">
        <Section className="min-h-0 flex-1 gap-8">
          <div className="flex shrink-0 flex-col gap-6">
            <div className="flex justify-between">
              <Heading>Variables</Heading>
              <div className="flex gap-3">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Button color="neutral" variant="outline" size="md" className="gap-2">
                      <Icon iconName="arrow-up-from-line" iconStyle="regular" />
                      Import variable
                    </Button>
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
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Button color="brand" variant="solid" size="md" className="gap-2">
                      <Icon iconName="circle-plus" iconStyle="regular" />
                      New variable
                    </Button>
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
              </div>
            </div>
            <hr className="w-full border-neutral" />
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-8">
            <VariableList
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
          </div>
        </Section>
      </div>
    </Suspense>
  )
}
