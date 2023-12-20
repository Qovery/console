import {
  type CloneEnvironmentRequest,
  type CreateEnvironmentModeEnum,
  type CreateEnvironmentRequest,
  type Environment,
  EnvironmentModeEnum,
} from 'qovery-typescript-axios'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useClusters } from '@qovery/domains/clusters/feature'
import { useCloneEnvironment, useCreateEnvironment } from '@qovery/domains/environment'
import { SERVICES_GENERAL_URL, SERVICES_URL } from '@qovery/shared/routes'
import { useModal } from '@qovery/shared/ui'
import CreateCloneEnvironmentModal from '../ui/create-clone-environment-modal'

export interface CreateCloneEnvironmentModalFeatureProps {
  environmentToClone?: Environment
  onClose: () => void
  projectId: string
  organizationId: string
}

export function CreateCloneEnvironmentModalFeature(props: CreateCloneEnvironmentModalFeatureProps) {
  const [loading, setLoading] = useState(false)

  const { enableAlertClickOutside } = useModal()

  const { data: clusters = [] } = useClusters({ organizationId: props.organizationId })

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      name: props.environmentToClone?.name ? props.environmentToClone?.name + '-clone' : '',
      cluster: clusters.find(({ is_default }) => is_default)?.id,
      mode: EnvironmentModeEnum.DEVELOPMENT,
    },
  })

  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const navigate = useNavigate()
  const createEnvironment = useCreateEnvironment(
    (result: Environment) => {
      navigate(SERVICES_URL(props.organizationId, props.projectId, result.id) + SERVICES_GENERAL_URL)
      props.onClose()
    },
    () => setLoading(false)
  )
  const cloneEnvironment = useCloneEnvironment(
    props.projectId,
    (result: Environment) => {
      navigate(SERVICES_URL(props.organizationId, props.projectId, result.id) + SERVICES_GENERAL_URL)
      props.onClose()
    },
    () => setLoading(false)
  )

  const onSubmit = methods.handleSubmit(async (data) => {
    const dataFormatted: { name: string; cluster?: string; mode?: string } = {
      name: data.name,
      cluster: data.cluster,
      mode: data.mode,
    }

    setLoading(true)

    if (props.environmentToClone) {
      const cloneRequest: CloneEnvironmentRequest = {
        name: dataFormatted.name,
        mode: dataFormatted.mode as EnvironmentModeEnum,
        cluster_id: dataFormatted.cluster,
      }
      cloneEnvironment.mutate({ environmentId: props.environmentToClone.id, data: cloneRequest })
    } else {
      const environmentRequest: CreateEnvironmentRequest = {
        name: dataFormatted.name,
        mode: dataFormatted.mode as CreateEnvironmentModeEnum,
        cluster: dataFormatted.cluster,
      }
      createEnvironment.mutate({ projectId: props.projectId, data: environmentRequest })
    }
  })

  return (
    <FormProvider {...methods}>
      <CreateCloneEnvironmentModal
        environmentToClone={props.environmentToClone}
        loading={loading}
        closeModal={props.onClose}
        onSubmit={onSubmit}
        clusters={clusters}
      />
    </FormProvider>
  )
}

export default CreateCloneEnvironmentModalFeature
