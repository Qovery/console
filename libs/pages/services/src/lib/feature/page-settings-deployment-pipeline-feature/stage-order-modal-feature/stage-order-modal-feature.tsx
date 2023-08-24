import { type DeploymentStageResponse } from 'qovery-typescript-axios'
import { useState } from 'react'
import { useMoveDeploymentStageRequested } from '@qovery/domains/environment'
import StageOrderModal from '../../../ui/page-settings-deployment-pipeline/stage-order-modal/stage-order-modal'

export interface StageOrderModalFeatureProps {
  onClose: () => void
  stages?: DeploymentStageResponse[]
}

export function StageOrderModalFeature(props: StageOrderModalFeatureProps) {
  const [currentStages, setCurrentStages] = useState<DeploymentStageResponse[] | undefined>(props.stages)

  const moveDeploymentStageRequested = useMoveDeploymentStageRequested((result: DeploymentStageResponse[]) =>
    setCurrentStages(result)
  )

  const onSubmit = (stageId: string, beforeOrAfterStageId: string, after: boolean) => {
    moveDeploymentStageRequested.mutate({ stageId, beforeOrAfterStageId, after })
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
