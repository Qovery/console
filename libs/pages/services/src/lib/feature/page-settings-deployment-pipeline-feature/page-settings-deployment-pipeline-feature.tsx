import { type DeploymentStageResponse } from 'qovery-typescript-axios'
import { useEffect, useMemo, useState } from 'react'
import { toast as toastAction } from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import { useAttachServiceToDeploymentStage, useListDeploymentStages } from '@qovery/domains/environments/feature'
import { useServices } from '@qovery/domains/services/feature'
import { useModal } from '@qovery/shared/ui'
import PageSettingsDeploymentPipeline, {
  SKIPPED_STAGE_ID,
} from '../../ui/page-settings-deployment-pipeline/page-settings-deployment-pipeline'
import StageModalFeature from './stage-modal-feature/stage-modal-feature'

const VIRTUAL_SKIPPED_STAGE: DeploymentStageResponse = {
  id: SKIPPED_STAGE_ID,
  created_at: '',
  environment: { id: '' },
  name: 'Skipped',
  description: 'Services excluded from environment-level deployments',
  deployment_order: -1,
  services: [],
}

export interface StageRequest {
  stageId: string
  serviceId: string
  isSkipped?: boolean
}

export function PageSettingsDeploymentPipelineFeature() {
  const { environmentId = '' } = useParams()

  const { data: services } = useServices({ environmentId })

  const { openModal, closeModal } = useModal()

  const [stages, setStages] = useState<DeploymentStageResponse[] | undefined>()

  const { data: deploymentStageList } = useListDeploymentStages({ environmentId })
  const { mutate: addServiceToDeploymentStage } = useAttachServiceToDeploymentStage()

  // Process stages to separate skipped services into virtual stage
  const processedStages = useMemo(() => {
    if (!deploymentStageList || deploymentStageList.length === 0) return []

    const regularStages = deploymentStageList.map((stage) => ({
      ...stage,
      services: stage.services?.filter((s) => !s.is_skipped) || [],
    }))

    const skippedServices = deploymentStageList.flatMap((stage) => stage.services?.filter((s) => s.is_skipped) || [])

    const virtualSkippedStage: DeploymentStageResponse = {
      ...VIRTUAL_SKIPPED_STAGE,
      environment: deploymentStageList[0]?.environment,
      services: skippedServices,
    }

    return [virtualSkippedStage, ...regularStages]
  }, [deploymentStageList])

  useEffect(() => {
    if (processedStages) {
      setStages(processedStages)
    }
  }, [processedStages])

  const onSubmit = (newStage: StageRequest, prevStage: StageRequest) => {
    if (!deploymentStageList) return

    // remove current toast to avoid flood of multiple toasts
    toastAction.remove()

    const isMovingToSkipped = newStage.stageId === SKIPPED_STAGE_ID

    if (isMovingToSkipped) {
      // Moving to skipped: set is_skipped=true, use previous stage as target
      addServiceToDeploymentStage({
        stageId: prevStage.stageId,
        serviceId: newStage.serviceId,
        isSkipped: true,
        prevStage,
      })
    } else {
      // Regular stage-to-stage move
      addServiceToDeploymentStage({
        stageId: newStage.stageId,
        serviceId: newStage.serviceId,
        isSkipped: false,
        prevStage,
      })
    }
  }

  return (
    <PageSettingsDeploymentPipeline
      stages={stages}
      setStages={setStages}
      onSubmit={onSubmit}
      services={services}
      onAddStage={() => {
        openModal({
          content: <StageModalFeature onClose={closeModal} environmentId={environmentId} />,
        })
      }}
    />
  )
}

export default PageSettingsDeploymentPipelineFeature
