import { DeploymentStageRequest, DeploymentStageResponse } from 'qovery-typescript-axios'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { createEnvironmentDeploymentStage, editEnvironmentDeploymentStage } from '@qovery/domains/environment'
import { AppDispatch } from '@qovery/store'
import StageModal from '../../../ui/page-settings-deployment-pipeline/stage-modal/stage-modal'

export interface StageModalFeatureProps {
  environmentId: string
  onClose: () => void
  stage?: DeploymentStageResponse
}

export function StageModalFeature(props: StageModalFeatureProps) {
  const methods = useForm({
    defaultValues: {
      name: props.stage?.name || '',
      description: props.stage?.description || '',
    },
    mode: 'onChange',
  })

  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch<AppDispatch>()

  const onSubmit = methods.handleSubmit((data) => {
    if (!data) {
      return
    }

    setLoading(true)
    const currentData: DeploymentStageRequest = {
      name: data['name'],
      description: data['description'],
    }

    if (props.stage) {
      // edit stage
      dispatch(
        editEnvironmentDeploymentStage({
          stageId: props.stage.id,
          environmentId: props.environmentId,
          data: currentData,
        })
      )
        .unwrap()
        .then(() => props.onClose())
        .catch((e) => console.error(e))
        .finally(() => setLoading(false))
    } else {
      // create stage
      dispatch(
        createEnvironmentDeploymentStage({
          environmentId: props.environmentId,
          data: currentData,
        })
      )
        .unwrap()
        .then(() => props.onClose())
        .catch((e) => console.error(e))
        .finally(() => setLoading(false))
    }
  })

  return (
    <FormProvider {...methods}>
      <StageModal onClose={props.onClose} onSubmit={onSubmit} isEdit={!!props.stage} loading={loading} />
    </FormProvider>
  )
}

export default StageModalFeature
