import { DeploymentStageRequest, DeploymentStageResponse } from 'qovery-typescript-axios'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useCreateEnvironmentDeploymentStage, useEditEnvironmentDeploymentStage } from '@qovery/domains/environment'
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

  const createEnvironmentDeploymentStage = useCreateEnvironmentDeploymentStage(props.environmentId, props.onClose, () =>
    setLoading(false)
  )

  const editEnvironmentDeploymentStage = useEditEnvironmentDeploymentStage(props.environmentId, props.onClose, () =>
    setLoading(false)
  )

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
      editEnvironmentDeploymentStage.mutate({ stageId: props.stage.id, data: currentData })
    } else {
      // create stage
      createEnvironmentDeploymentStage.mutate({ data: currentData })
    }
  })

  return (
    <FormProvider {...methods}>
      <StageModal onClose={props.onClose} onSubmit={onSubmit} isEdit={!!props.stage} loading={loading} />
    </FormProvider>
  )
}

export default StageModalFeature
