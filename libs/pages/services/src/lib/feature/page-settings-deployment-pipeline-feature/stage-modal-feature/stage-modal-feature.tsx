import { type DeploymentStageRequest, type DeploymentStageResponse } from 'qovery-typescript-axios'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useCreateDeploymentStage, useEditDeploymentStage } from '@qovery/domains/environments/feature'
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

  const { mutateAsync: createEnvironmentDeploymentStage } = useCreateDeploymentStage()
  const { mutateAsync: editEnvironmentDeploymentStage } = useEditDeploymentStage()

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!data) {
      return
    }

    setLoading(true)
    const currentData: DeploymentStageRequest = {
      name: data['name'],
      description: data['description'],
    }

    try {
      if (props.stage) {
        // edit stage
        await editEnvironmentDeploymentStage({ stageId: props.stage.id, payload: currentData })
      } else {
        // create stage
        await createEnvironmentDeploymentStage({ environmentId: props.environmentId, payload: currentData })
      }
      props.onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  })

  return (
    <FormProvider {...methods}>
      <StageModal onClose={props.onClose} onSubmit={onSubmit} isEdit={!!props.stage} loading={loading} />
    </FormProvider>
  )
}

export default StageModalFeature
