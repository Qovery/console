import { createFileRoute, useParams } from '@tanstack/react-router'
import { Suspense } from 'react'
import { match } from 'ts-pattern'
import { useDeployService, useService } from '@qovery/domains/services/feature'
import {
  ImportEnvironmentVariableModalFeature,
  VariableList,
  VariablesActionToolbar,
} from '@qovery/domains/variables/feature'
import { Heading, LoaderSpinner, Section, toast, useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/variables'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  useDocumentTitle('Service - Variables')

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
  const { openModal, closeModal } = useModal()

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
      <div className="container mx-auto flex min-h-page-container flex-col pt-6">
        <Section className="min-h-0 flex-1 gap-8">
          <div className="flex shrink-0 flex-col gap-6">
            <div className="flex justify-between">
              <Heading>Service variables</Heading>
              {scope && (
                <VariablesActionToolbar
                  scope={scope}
                  projectId={projectId}
                  environmentId={environmentId}
                  serviceId={serviceId}
                  importEnvFileAccess="dropdown"
                  onImportEnvFile={() =>
                    openModal({
                      content: (
                        <ImportEnvironmentVariableModalFeature
                          scope={scope}
                          projectId={projectId}
                          environmentId={environmentId}
                          serviceId={serviceId}
                          closeModal={closeModal}
                          serviceType={service?.serviceType}
                        />
                      ),
                      options: {
                        width: 750,
                      },
                    })
                  }
                  onCreateVariable={() =>
                    toast(
                      'success',
                      'Creation success',
                      'You need to redeploy your service for your changes to be applied.',
                      toasterCallback,
                      'Redeploy'
                    )
                  }
                />
              )}
            </div>
            <hr className="w-full border-neutral" />
          </div>
          {scope && (
            <div className="flex min-h-0 flex-1 flex-col gap-8">
              <VariableList
                scope={scope}
                serviceId={serviceId}
                organizationId={organizationId}
                projectId={projectId}
                environmentId={environmentId}
                onCreateVariable={() => {
                  toast(
                    'success',
                    'Creation success',
                    'You need to redeploy your service for your changes to be applied.',
                    toasterCallback,
                    'Redeploy'
                  )
                }}
                onEditVariable={() => {
                  toast(
                    'success',
                    'Edition success',
                    'You need to redeploy your service for your changes to be applied.',
                    toasterCallback,
                    'Redeploy'
                  )
                }}
                onDeleteVariable={(variable) => {
                  let name = variable.key
                  if (name && name.length > 30) {
                    name = name.substring(0, 30) + '...'
                  }
                  toast(
                    'success',
                    'Deletion success',
                    `${name} has been deleted. You need to redeploy your service for your changes to be applied.`,
                    toasterCallback,
                    'Redeploy'
                  )
                }}
              />
            </div>
          )}
        </Section>
      </div>
    </Suspense>
  )
}
