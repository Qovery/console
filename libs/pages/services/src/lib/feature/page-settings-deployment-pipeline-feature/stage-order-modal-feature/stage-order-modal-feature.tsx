import { DeploymentStageResponse } from 'qovery-typescript-axios'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { moveDeploymentStageRequested } from '@qovery/domains/environment'
import { AppDispatch } from '@qovery/store'
import StageOrderModal from '../../../ui/page-settings-deployment-pipeline/stage-order-modal/stage-order-modal'

export interface StageOrderModalFeatureProps {
  onClose: () => void
  stages?: DeploymentStageResponse[]
}

export function StageOrderModalFeature(props: StageOrderModalFeatureProps) {
  const dispatch = useDispatch<AppDispatch>()

  const [currentStages, setCurrentStages] = useState<DeploymentStageResponse[] | undefined>(props.stages)

  const onSubmit = (stageId: string, beforeOrAfterStageId: string, before: boolean) => {
    dispatch(moveDeploymentStageRequested({ stageId, beforeOrAfterStageId, before }))
      .unwrap()
      .then((result) => setCurrentStages(result))
      .catch((e) => console.error(e))
  }

  return (
    <StageOrderModal
      currentStages={currentStages}
      setCurrentStages={setCurrentStages}
      onClose={props.onClose}
      onSubmit={onSubmit}
    />
  )
}

export default StageOrderModalFeature
