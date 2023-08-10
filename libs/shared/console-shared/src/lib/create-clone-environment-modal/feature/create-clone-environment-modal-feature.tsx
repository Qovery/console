import {
  CloneRequest,
  CreateEnvironmentModeEnum,
  CreateEnvironmentRequest,
  Environment,
  EnvironmentModeEnum,
} from 'qovery-typescript-axios'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useCloneEnvironment, useCreateEnvironment } from '@qovery/domains/environment'
import { selectClustersEntitiesByOrganizationId } from '@qovery/domains/organization'
import { ClusterEntity } from '@qovery/shared/interfaces'
import { SERVICES_GENERAL_URL, SERVICES_URL } from '@qovery/shared/routes'
import { useModal } from '@qovery/shared/ui'
import { RootState } from '@qovery/state/store'
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

  const clusters = useSelector<RootState, ClusterEntity[]>((state) =>
    selectClustersEntitiesByOrganizationId(state, props.organizationId)
  )

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      name: props.environmentToClone?.name ? props.environmentToClone?.name + '-clone' : '',
      cluster: 'automatic',
      mode: 'automatic',
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

    if (dataFormatted.cluster === 'automatic') delete dataFormatted.cluster

    if (dataFormatted.mode === 'automatic') delete dataFormatted.mode

    setLoading(true)

    if (props.environmentToClone) {
      const cloneRequest: CloneRequest = {
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
