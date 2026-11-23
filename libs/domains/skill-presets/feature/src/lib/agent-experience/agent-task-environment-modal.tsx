import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useProjects } from '@qovery/domains/projects/feature'
import { Button, InputSelect, ModalCrud } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'

function RefetchError({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div role="alert" className="flex items-center gap-2 text-sm text-neutral-subtle">
      {message}
      <Button type="button" variant="plain" size="xs" onClick={retry}>
        Try again
      </Button>
    </div>
  )
}

export function AgentTaskEnvironmentModal({
  organizationId,
  onClose,
}: {
  organizationId: string
  onClose: () => void
}) {
  const navigate = useNavigate()
  const methods = useForm({ mode: 'onChange', defaultValues: { projectId: '', environmentId: '' } })
  const projectId = methods.watch('projectId')
  const environmentId = methods.watch('environmentId')
  const projects = useProjects({ organizationId })
  const environments = useQuery({ ...queries.environments.list({ projectId }), enabled: Boolean(projectId) })
  const availableEnvironments = environments.data ?? []
  const projectsUnavailable = projects.isError && !projects.data
  const environmentsUnavailable = environments.isError && !environments.data
  const canContinue = !projectsUnavailable && availableEnvironments.some(({ id }) => id === environmentId)

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Choose an environment"
        description="Create the agent task in the environment where it should run."
        submitLabel="Open Automations"
        submitDisabled={!canContinue || methods.formState.isSubmitting}
        loading={methods.formState.isSubmitting}
        onClose={onClose}
        onSubmit={methods.handleSubmit(async ({ projectId, environmentId }) => {
          if (!canContinue) return
          await navigate({
            to: '/organization/$organizationId/project/$projectId/environment/$environmentId/automation',
            params: { organizationId, projectId, environmentId },
          })
          onClose()
        })}
      >
        <div className="flex flex-col gap-4">
          <Controller
            name="projectId"
            control={methods.control}
            rules={{ required: true }}
            render={({ field }) => (
              <InputSelect
                label="Project"
                value={field.value}
                onChange={(value) => {
                  methods.setValue('environmentId', '', { shouldValidate: true })
                  field.onChange(value)
                }}
                options={(projects.data ?? []).map(({ id, name }) => ({ value: id, label: name }))}
                isSearchable
                portal
                disabled={projects.isLoading}
              />
            )}
          />
          {projects.isError ? (
            <RefetchError
              message={projectsUnavailable ? 'Unable to load projects.' : 'Unable to refresh projects.'}
              retry={() => projects.refetch()}
            />
          ) : (
            !projects.isLoading &&
            !projects.data?.length && (
              <p className="text-sm text-neutral-subtle">
                Create a project and an environment before creating an agent task.
              </p>
            )
          )}
          <Controller
            name="environmentId"
            control={methods.control}
            rules={{ required: true }}
            render={({ field }) => (
              <InputSelect
                label="Environment"
                value={field.value}
                onChange={field.onChange}
                options={availableEnvironments.map(({ id, name }) => ({ value: id, label: name }))}
                isSearchable
                portal
                disabled={!projectId || environments.isLoading}
              />
            )}
          />
          {projectId &&
            (environments.isError ? (
              <RefetchError
                message={environmentsUnavailable ? 'Unable to load environments.' : 'Unable to refresh environments.'}
                retry={() => environments.refetch()}
              />
            ) : (
              !environments.isFetching &&
              !availableEnvironments.length && (
                <p className="text-sm text-neutral-subtle">
                  This project has no environments. Create one before creating an agent task.
                </p>
              )
            ))}
        </div>
      </ModalCrud>
    </FormProvider>
  )
}
