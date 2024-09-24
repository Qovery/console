import { type DeploymentStageResponse } from 'qovery-typescript-axios'
import { useState } from 'react'
import { useMoveDeploymentStage } from '@qovery/domains/environments/feature'
import StageOrderModal from '../../../ui/page-settings-deployment-pipeline/stage-order-modal/stage-order-modal'

export interface StageOrderModalFeatureProps {
  onClose: () => void
  stages?: DeploymentStageResponse[]
}

export function StageOrderModalFeature(props: StageOrderModalFeatureProps) {
  const [currentStages, setCurrentStages] = useState<DeploymentStageResponse[] | undefined>(props.stages)

  const { mutateAsync: moveDeploymentStageRequested } = useMoveDeploymentStage()

  const onSubmit = async (stageId: string, targetStageId: string, after: boolean) => {
    const result = await moveDeploymentStageRequested({ stageId, targetStageId, after })
    setCurrentStages(result)
    return result
  }

  return <StageOrderModal currentStages={currentStages} onClose={props.onClose} onSubmit={onSubmit} />
}

export default StageOrderModalFeature
