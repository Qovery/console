import { type Environment } from 'qovery-typescript-axios'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useProjects } from '@qovery/domains/projects/feature'
import { APPLICATION_GENERAL_URL, APPLICATION_URL, DATABASE_GENERAL_URL, DATABASE_URL } from '@qovery/shared/routes'
import { ExternalLink, InputSelect, InputText, LoaderSpinner, ModalCrud, useModal } from '@qovery/shared/ui'
import { useCloneService } from '../hooks/use-clone-service/use-clone-service'
import { useEnvironments } from '../hooks/use-environments/use-environments'
import { useService } from '../hooks/use-service/use-service'

export interface ServiceCloneModalProps {
  onClose: () => void
  organizationId: string
  projectId: string
  serviceId: string
}

export function ServiceCloneModal({ onClose, organizationId, projectId, serviceId }: ServiceCloneModalProps) {
  const { enableAlertClickOutside } = useModal()
  const { data: service } = useService({ serviceId })
  const { mutateAsync: cloneService, isLoading: isCloneServiceLoading } = useCloneService()
  const { data: projects = [] } = useProjects({ organizationId })

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      name: service?.name + '-clone',
      environment: service?.environment?.id as string,
      project: projectId,
    },
  })

  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const selectedProjectId = methods.watch('project')
  const environments: Environment[] = []
  const { data = [], isLoading: isFetchEnvironmentsLoading } = useEnvironments({ projectId: selectedProjectId })
  // Avoid array ref mutation to prevent re-rendering
  environments.splice(0, environments.length)
  environments.push(...data)

  const navigate = useNavigate()

  const onSubmit = methods.handleSubmit(async ({ name, environment: environmentId, project: projectId }) => {
    if (!service) return null

    const cloneRequest = {
      name,
      environment_id: environmentId,
    }

    const result = await cloneService({
      serviceId: service.id,
      serviceType: service.serviceType,
      payload: cloneRequest,
    })

    if (service.serviceType === 'DATABASE') {
      navigate(DATABASE_URL(organizationId, projectId, environmentId, result.id) + DATABASE_GENERAL_URL)
    } else {
      navigate(APPLICATION_URL(organizationId, projectId, environmentId, result.id) + APPLICATION_GENERAL_URL)
    }
    return onClose()
  })

  if (!environments || !service) {
    return null
  }

  const documentationLink = match(service)
    .with(
      { serviceType: 'APPLICATION' },
      () => 'https://hub.qovery.com/docs/using-qovery/configuration/application/#clone'
    )
    .with({ serviceType: 'DATABASE' }, () => 'https://hub.qovery.com/docs/using-qovery/configuration/database/#clone')
    .with(
      { serviceType: 'CONTAINER' },
      () => 'https://hub.qovery.com/docs/using-qovery/configuration/application/#clone'
    )
    .with(
      { serviceType: 'JOB', job_type: 'CRON' },
      () => 'https://hub.qovery.com/docs/using-qovery/configuration/cronjob/#clone'
    )
    .with(
      { serviceType: 'JOB', job_type: 'LIFECYCLE' },
      () => 'https://hub.qovery.com/docs/using-qovery/configuration/lifecylejob/#clone'
    )
    .with({ serviceType: 'HELM' }, () => 'https://hub.qovery.com/docs/using-qovery/configuration/helm/#clone')
    .exhaustive()

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Clone Service"
        description="Clone the service on the same or different target environment."
        onClose={onClose}
        onSubmit={onSubmit}
        loading={isCloneServiceLoading}
        submitLabel="Clone"
        howItWorks={
          <>
            <p>
              The service will be cloned within the target environment.
              <br />
              All the configurations will be copied into the new service with a few exceptions:
            </p>
            <ul className="ml-4 list-outside list-disc">
              <li>target environment is the current environment: custom domains</li>
              <li>
                target environment is NOT the current environment: custom domains, pipeline deployment stages,
                environment variables with environment/project scope (including aliases/overrides).
              </li>
            </ul>
            <p>
              Once cloned, check the service setup.
              <br />
            </p>
            <ExternalLink href={documentationLink} className="mt-2">
              Documentation
            </ExternalLink>
          </>
        }
      >
        <InputText className="mb-6" name="clone" value={service.name} label="Service to clone" disabled={true} />

        <Controller
          name="name"
          control={methods.control}
          rules={{
            required: 'Please enter a value',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-6"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="New service name"
              error={error?.message}
            />
          )}
        />
        <Controller
          name="project"
          control={methods.control}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              className="mb-6"
              onChange={(...args) => {
                methods.setValue('environment', '')
                field.onChange(...args)
              }}
              value={field.value}
              label="Project"
              error={error?.message}
              options={projects.map((c) => ({ value: c.id, label: c.name }))}
              portal
              isSearchable
            />
          )}
        />

        <Controller
          name="environment"
          control={methods.control}
          rules={{ required: true }}
          render={({ field, fieldState: { error } }) =>
            isFetchEnvironmentsLoading ? (
              <div className="flex justify-center">
                <LoaderSpinner />
              </div>
            ) : (
              <InputSelect
                className="mb-6"
                onChange={field.onChange}
                value={field.value}
                label="Environment"
                error={error?.message}
                options={environments.map((c) => ({ value: c.id, label: c.name }))}
                portal
                isSearchable
              />
            )
          }
        />
      </ModalCrud>
    </FormProvider>
  )
}

export default ServiceCloneModal
