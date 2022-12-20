import { useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { postProject } from '@qovery/domains/projects'
import {
  ENVIRONMENTS_URL,
  SETTINGS_PROJECT_GENERAL_URL,
  SETTINGS_PROJECT_URL,
  SETTINGS_URL,
} from '@qovery/shared/router'
import { AppDispatch } from '@qovery/store'
import CreateProjectModal from '../ui/create-project-modal'

export interface CreateProjectModalFeatureProps {
  onClose: () => void
  organizationId: string
  goToEnvironment?: boolean
}

export function CreateProjectModalFeature(props: CreateProjectModalFeatureProps) {
  const { onClose, organizationId, goToEnvironment } = props

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
        if (goToEnvironment) {
          navigate(ENVIRONMENTS_URL(organizationId, project.id))
        } else {
          navigate(SETTINGS_URL(organizationId) + SETTINGS_PROJECT_URL(project.id) + SETTINGS_PROJECT_GENERAL_URL)
        }
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
