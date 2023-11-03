import { useState } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useCreateProject } from '@qovery/domains/projects/feature'
import { ENVIRONMENTS_GENERAL_URL, ENVIRONMENTS_URL } from '@qovery/shared/routes'
import CreateProjectModal from '../ui/create-project-modal'

export interface CreateProjectModalFeatureProps {
  onClose: () => void
  organizationId: string
}

export function CreateProjectModalFeature(props: CreateProjectModalFeatureProps) {
  const { onClose, organizationId } = props

  const navigate = useNavigate()
  const methods = useForm({
    mode: 'onChange',
  })
  const [loading, setLoading] = useState(false)
  const { mutateAsync: createProject } = useCreateProject({ organizationId })

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
      <CreateProjectModal closeModal={onClose} onSubmit={onSubmit} loading={loading} />
    </FormProvider>
  )
}

export default CreateProjectModalFeature
