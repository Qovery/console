import { DeploymentStageResponse } from 'qovery-typescript-axios'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import StageOrderModal from '../../../ui/page-settings-deployment-pipeline/stage-order-modal/stage-order-modal'

export interface StageOrderModalFeatureProps {
  onClose: () => void
  stages?: DeploymentStageResponse[]
}

export function StageOrderModalFeature(props: StageOrderModalFeatureProps) {
  const methods = useForm({
    mode: 'onChange',
  })

  const [loading, setLoading] = useState(false)
  // const dispatch = useDispatch<AppDispatch>()

  const onSubmit = methods.handleSubmit((data) => {
    if (!data) {
      return
    }

    setLoading(true)

    // if (props.stage) {
    //   // edit stage
    //   dispatch(
    //     editEnvironmentDeploymentStage({
    //       stageId: props.stage.id,
    //       environmentId: props.environmentId,
    //       data: currentData,
    //     })
    //   )
    //     .unwrap()
    //     .then(() => props.onClose())
    //     .catch((e) => console.error(e))
    //     .finally(() => setLoading(false))
    // } else {
    //   // create stage
    //   dispatch(
    //     createEnvironmentDeploymentStage({
    //       environmentId: props.environmentId,
    //       data: currentData,
    //     })
    //   )
    //     .unwrap()
    //     .then(() => props.onClose())
    //     .catch((e) => console.error(e))
    //     .finally(() => setLoading(false))
    // }
  })

  console.log(props.stages)

  return (
    <FormProvider {...methods}>
      <StageOrderModal stages={props.stages} onClose={props.onClose} onSubmit={onSubmit} loading={loading} />
    </FormProvider>
  )
}

export default StageOrderModalFeature
