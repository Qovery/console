import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useProjects } from '@qovery/domains/projects/feature'
import { type AgenticWorkflowTemplate } from '@qovery/domains/services/feature'
import { InputSelect, ModalCrud } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'

export function AgentTaskEnvironmentModal({
  organizationId,
  template,
  onClose,
}: {
  organizationId: string
  template?: AgenticWorkflowTemplate
  onClose: () => void
}) {
  const navigate = useNavigate()
  const methods = useForm({ mode: 'onChange', defaultValues: { projectId: '', environmentId: '' } })
  const projectId = methods.watch('projectId')
  const environmentId = methods.watch('environmentId')
  const projects = useProjects({ organizationId })
  const environments = useQuery({ ...queries.environments.list({ projectId }), enabled: Boolean(projectId) })
  const availableEnvironments = environments.data ?? []
  const canContinue =
    !projects.isError && !environments.isError && availableEnvironments.some(({ id }) => id === environmentId)

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={template ? 'Create Agent Task' : 'Open Automations'}
        description={template?.title}
        submitLabel={template ? 'Continue' : 'Open Automations'}
        submitDisabled={!canContinue}
        onClose={onClose}
        onSubmit={methods.handleSubmit(async ({ projectId, environmentId }) => {
          if (!canContinue) return
          if (template) {
            await navigate({
              to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/agentic-workflow',
              params: { organizationId, projectId, environmentId },
              search: { template: template.id },
            })
          } else {
            await navigate({
              to: '/organization/$organizationId/project/$projectId/environment/$environmentId/automation',
              params: { organizationId, projectId, environmentId },
            })
          }
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
            <p role="alert" className="text-sm text-neutral-subtle">
              Unable to load projects. Close and try again.
            </p>
          ) : (
            !projects.isLoading &&
            !projects.data?.length && (
              <p className="text-sm text-neutral-subtle">
                Create a project and an environment before adding an Agent Task.
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
                disabled={!projectId || environments.isFetching}
              />
            )}
          />
          {projectId &&
            (environments.isError ? (
              <p role="alert" className="text-sm text-neutral-subtle">
                Unable to load environments. Close and try again.
              </p>
            ) : (
              !environments.isFetching &&
              !availableEnvironments.length && (
                <p className="text-sm text-neutral-subtle">
                  This project has no environments. Create one before adding an Agent Task.
                </p>
              )
            ))}
        </div>
      </ModalCrud>
    </FormProvider>
  )
}
