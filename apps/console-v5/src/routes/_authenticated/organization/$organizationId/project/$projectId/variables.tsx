import { createFileRoute, useParams } from '@tanstack/react-router'
import { Suspense } from 'react'
import {
  CreateUpdateVariableModal,
  ImportEnvironmentVariableModalFeature,
  VariableList,
} from '@qovery/domains/variables/feature'
import {
  Button,
  DropdownMenu,
  Heading,
  Icon,
  LoaderSpinner,
  Section,
  Tooltip,
  toast,
  useModal,
} from '@qovery/shared/ui'

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

  const onImportEnvFile = () => {
    openModal({
      content: <ImportEnvironmentVariableModalFeature scope="PROJECT" projectId={projectId} closeModal={closeModal} />,
      options: {
        width: 750,
      },
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
      <div className="container mx-auto flex min-h-page-container flex-col pt-6">
        <Section className="min-h-0 flex-1 gap-8">
          <div className="flex shrink-0 flex-col gap-6">
            <div className="flex justify-between">
              <Heading>Project variables</Heading>
              <div className="flex gap-3">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Button color="neutral" variant="outline" size="md" className="gap-2">
                      <Icon iconName="arrow-up-from-line" iconStyle="regular" />
                      Import variable
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item onSelect={onImportEnvFile} icon={<Icon iconName="file-import" />}>
                      Import from .env file
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild icon={<Icon iconName="circle-info" iconStyle="regular" />}>
                      <a href="https://dashboard.doppler.com" target="_blank" rel="noopener noreferrer">
                        Import from Doppler
                        <Tooltip content="Documentation">
                          <a
                            className="ml-auto text-sm"
                            href="https://www.qovery.com/docs/configuration/integrations/secret-managers/doppler#doppler"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Icon iconName="circle-info" iconStyle="regular" className="text-neutral-subtle" />
                          </a>
                        </Tooltip>
                      </a>
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
