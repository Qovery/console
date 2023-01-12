import { useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { postProject } from '@qovery/domains/projects'
import { ENVIRONMENTS_GENERAL_URL, ENVIRONMENTS_URL } from '@qovery/shared/routes'
import { AppDispatch } from '@qovery/store'
import CreateProjectModal from '../ui/create-project-modal'

export interface CreateProjectModalFeatureProps {
  onClose: () => void
  organizationId: string
}

export function CreateProjectModalFeature(props: CreateProjectModalFeatureProps) {
  const { onClose, organizationId } = props

  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const methods = useForm({
    mode: 'onChange',
  })
  const [loading, setLoading] = useState(false)

  const onSubmit = methods.handleSubmit((data: FieldValues) => {
    setLoading(true)

    dispatch(
      postProject({
        organizationId: organizationId,
        name: data['name'],
        description: data['description'],
      })
    )
      .unwrap()
      .then((project) => {
        navigate(ENVIRONMENTS_URL(organizationId, project.id) + ENVIRONMENTS_GENERAL_URL)
        setLoading(false)
        onClose()
      })
      .catch(() => setLoading(false))
  })

  return (
    <FormProvider {...methods}>
      <CreateProjectModal closeModal={onClose} onSubmit={onSubmit} loading={loading} />
    </FormProvider>
  )
}

export default CreateProjectModalFeature
