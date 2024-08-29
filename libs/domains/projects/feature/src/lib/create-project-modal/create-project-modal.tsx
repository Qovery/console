import { useState } from 'react'
import { Controller, type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ENVIRONMENTS_GENERAL_URL, ENVIRONMENTS_URL } from '@qovery/shared/routes'
import { InputText, ModalCrud } from '@qovery/shared/ui'
import { useCreateProject } from '../hooks/use-create-project/use-create-project'

export interface CreateProjectModalProps {
  onClose: () => void
  organizationId: string
}

export function CreateProjectModal(props: CreateProjectModalProps) {
  const { onClose, organizationId } = props

  const navigate = useNavigate()
  const methods = useForm({
    mode: 'onChange',
  })
  const [loading, setLoading] = useState(false)
  const { mutateAsync: createProject } = useCreateProject()

  const onSubmit = methods.handleSubmit(async (data: FieldValues) => {
    setLoading(true)

    try {
      const project = await createProject({
        organizationId: organizationId,
        projectRequest: {
          name: data['name'],
          description: data['description'],
        },
      })
      navigate(ENVIRONMENTS_URL(organizationId, project.id) + ENVIRONMENTS_GENERAL_URL)
      onClose()
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="New project"
        description="You will have the possibility to modify the parameters once created"
        onClose={() => onClose()}
        onSubmit={onSubmit}
        submitLabel="Create"
        loading={loading}
      >
        <Controller
          name="name"
          control={methods.control}
          rules={{
            required: 'Please enter a name.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-3"
              dataTestId="input-name"
              label="Project name"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        <Controller
          name="description"
          control={methods.control}
          render={({ field }) => (
            <InputText
              className="mb-6"
              dataTestId="input-description"
              label="Description"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
            />
          )}
        />
      </ModalCrud>{' '}
    </FormProvider>
  )
}

export default CreateProjectModal
