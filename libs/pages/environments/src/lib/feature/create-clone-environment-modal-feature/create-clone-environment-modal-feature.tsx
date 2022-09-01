import { CloneRequest, EnvironmentModeEnum, EnvironmentRequest } from 'qovery-typescript-axios'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { cloneEnvironment, createEnvironment } from '@console/domains/environment'
import { selectClustersEntitiesByOrganizationId } from '@console/domains/organization'
import { ClusterEntity, EnvironmentEntity } from '@console/shared/interfaces'
import { AppDispatch, RootState } from '@console/store/data'
import CreateCloneEnvironmentModal from '../../ui/create-clone-environment-modal/create-clone-environment-modal'

export interface CreateCloneEnvironmentModalFeatureProps {
  environmentToClone?: EnvironmentEntity
  onClose: () => void
  projectId: string
  organizationId: string
}

export function CreateCloneEnvironmentModalFeature(props: CreateCloneEnvironmentModalFeatureProps) {
  const [loading, setLoading] = useState(false)

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

  const dispatch = useDispatch<AppDispatch>()

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
      dispatch(cloneEnvironment({ environmentId: props.environmentToClone.id, cloneRequest }))
        .unwrap()
        .then(() => {
          setLoading(false)
          props.onClose()
        })
        .catch((e) => {
          setLoading(false)
          console.error(e)
        })
    } else {
      const environmentRequest: EnvironmentRequest = {
        name: dataFormatted.name,
        mode: dataFormatted.mode as EnvironmentModeEnum,
        cluster: dataFormatted.cluster,
      }
      dispatch(createEnvironment({ projectId: props.projectId, environmentRequest }))
        .unwrap()
        .then(() => {
          setLoading(false)
          props.onClose()
        })
        .catch((e) => {
          setLoading(false)
          console.error(e)
        })
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
