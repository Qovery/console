import { createFileRoute, useParams } from '@tanstack/react-router'
import { type FormEventHandler, useEffect, useState } from 'react'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { useEditProject, useProject } from '@qovery/domains/projects/feature'
import { BlockContent, Button, Heading, InputText, InputTextArea, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/settings/general'
)({
  component: RouteComponent,
})

export interface PageProjectGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  loading: boolean
}

function PageProjectGeneral(props: PageProjectGeneralProps) {
  const { onSubmit, loading } = props
  const { control, formState, getValues } = useFormContext()

  return (
    <div key={getValues().toString()} className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <Heading className="mb-10">Project infos</Heading>
        <form onSubmit={onSubmit}>
          <BlockContent title="Project settings">
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Please enter a name.' }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  className="mb-3"
                  dataTestId="input-name"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Project name"
                  error={error?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <InputTextArea
                  className="mb-3"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  label="Description"
                />
              )}
            />
          </BlockContent>
          <div className="flex justify-end">
            <Button data-testid="submit-button" type="submit" size="lg" disabled={!formState.isValid} loading={loading}>
              Save
            </Button>
          </div>
        </form>
      </Section>
    </div>
  )
}

function ProjectGeneralSettingsForm() {
  useDocumentTitle('General - Project settings')
  const { organizationId, projectId } = useParams({ strict: false })
  const { data: project } = useProject({ organizationId, projectId, suspense: true })
  const { mutateAsync: editProject } = useEditProject()
  const [loading, setLoading] = useState(false)

  const methods = useForm({
    mode: 'onChange',
  })

  useEffect(() => {
    methods.reset({
      name: project?.name || '',
      description: project?.description || '',
    })
  }, [methods, project?.name, project?.description])

  const onSubmit = methods.handleSubmit(async (data) => {
    if (data && project) {
      setLoading(true)

      try {
        await editProject({
          projectId,
          projectRequest: {
            name: data['name'],
            description: data['description'],
          },
        })
      } catch (error) {
        console.error(error)
      }
      setLoading(false)
    }
  })

  return (
    <FormProvider {...methods}>
      <PageProjectGeneral onSubmit={onSubmit} loading={loading} />
    </FormProvider>
  )
}

function RouteComponent() {
  return <ProjectGeneralSettingsForm />
}
