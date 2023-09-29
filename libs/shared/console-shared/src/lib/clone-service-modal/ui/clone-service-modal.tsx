import { type Environment, type Project } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { type ApplicationEntity, type DatabaseEntity } from '@qovery/shared/interfaces'
import { ExternalLink, InputSelect, InputText, LoaderSpinner, ModalCrud } from '@qovery/shared/ui'

export interface CloneServiceModalProps {
  closeModal: () => void
  environments: Environment[]
  loading: boolean
  isFetchEnvironmentsLoading: boolean
  onSubmit: () => void
  projects: Project[]
  serviceToClone: ApplicationEntity | DatabaseEntity
  serviceType: ServiceType
}

export function CloneServiceModal({
  closeModal,
  environments,
  loading,
  isFetchEnvironmentsLoading,
  onSubmit,
  projects,
  serviceToClone,
  serviceType,
}: CloneServiceModalProps) {
  const { control, setValue } = useFormContext()

  const documentationLink = {
    APPLICATION: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#clone',
    DATABASE: 'https://hub.qovery.com/docs/using-qovery/configuration/database/#clone',
    CONTAINER: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#clone',
    JOB: 'https://hub.qovery.com/docs/using-qovery/configuration/cronjob/#clone',
    CRON_JOB: 'https://hub.qovery.com/docs/using-qovery/configuration/cronjob/#clone',
    LIFECYCLE_JOB: 'https://hub.qovery.com/docs/using-qovery/configuration/lifecylejob/#clone',
  }[serviceType]

  return (
    <ModalCrud
      title="Clone Service"
      description="Clone the service on the same or different target environment."
      onClose={closeModal}
      onSubmit={onSubmit}
      loading={loading}
      submitLabel="Clone"
      howItWorks={
        <>
          <p>
            The service will be cloned within the target environment.
            <br />
            All the configurations will be copied into the new service with a few exceptions:
          </p>
          <ul className="list-disc list-outside ml-4">
            <li>target environment is the current environment: custom domains</li>
            <li>
              target environment is NOT the current environment: custom domains, pipeline deployment stages, environment
              variables with environment/project scope (including aliases/overrides).
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
      <InputText className="mb-6" name="clone" value={serviceToClone.name} label="Service to clone" disabled={true} />

      <Controller
        name="name"
        control={control}
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
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            dataTestId="input-select-project"
            className="mb-6"
            onChange={(...args) => {
              setValue('environment', '')
              field.onChange(...args)
            }}
            value={field.value}
            label="Project"
            error={error?.message}
            options={projects.map((c) => ({ value: c.id, label: c.name }))}
            portal={true}
          />
        )}
      />

      <Controller
        name="environment"
        control={control}
        rules={{ required: true }}
        render={({ field, fieldState: { error } }) => (
          <>
            {isFetchEnvironmentsLoading ? (
              <div className="flex justify-center">
                <LoaderSpinner />
              </div>
            ) : (
              <InputSelect
                dataTestId="input-select-environment"
                className="mb-6"
                onChange={field.onChange}
                value={field.value}
                label="Environment"
                error={error?.message}
                options={environments.map((c) => ({ value: c.id, label: c.name }))}
                portal={true}
              />
            )}
          </>
        )}
      />
    </ModalCrud>
  )
}

export default CloneServiceModal
