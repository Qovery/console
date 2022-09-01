import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { cloneEnvironment, createEnvironment } from '@console/domains/environment'
import { selectClustersEntitiesByOrganizationId } from '@console/domains/organization'
import { ClusterEntity, EnvironmentEntity } from '@console/shared/interfaces'
import { AppDispatch, RootState } from '@console/store/data'
import CreateCloneEnvironmentModal from '../../ui/create-clone-environment-modal/create-clone-environment-modal'

export interface CreateCloneEnvironmentModalFeatureProps {
  environmentToClone?: EnvironmentEntity
  onClose: () => void
}

export function CreateCloneEnvironmentModalFeature(props: CreateCloneEnvironmentModalFeatureProps) {
  const { organizationId = '', projectId = '' } = useParams()
  const [loading, setLoading] = useState(false)

  const clusters = useSelector<RootState, ClusterEntity[]>((state) =>
    selectClustersEntitiesByOrganizationId(state, organizationId)
  )
  const methods = useForm({
    mode: 'onChange',
    defaultValues: { name: '', cluster_id: '', mode: EnvironmentModeEnum.STAGING },
  })

  const dispatch = useDispatch<AppDispatch>()

  const onSubmit = methods.handleSubmit(async (data) => {
    setLoading(true)
    if (props.environmentToClone) {
      dispatch(cloneEnvironment({ environmentId: props.environmentToClone.id, cloneRequest: { ...data } }))
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
      dispatch(createEnvironment({ projectId, environmentRequest: { ...data } }))
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
