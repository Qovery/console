import { type DeploymentStageResponse } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { toast as toastAction } from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import { useAttachServiceToDeploymentStage, useListDeploymentStages } from '@qovery/domains/environments/feature'
import { useServices } from '@qovery/domains/services/feature'
import { useModal } from '@qovery/shared/ui'
import PageSettingsDeploymentPipeline from '../../ui/page-settings-deployment-pipeline/page-settings-deployment-pipeline'
import StageModalFeature from './stage-modal-feature/stage-modal-feature'

export interface StageRequest {
  stageId: string
  serviceId: string
}

export function PageSettingsDeploymentPipelineFeature() {
  const { environmentId = '' } = useParams()

  const { data: services } = useServices({ environmentId })

  const { openModal, closeModal } = useModal()

  const [stages, setStages] = useState<DeploymentStageResponse[] | undefined>()

  const { data: deploymentStageList } = useListDeploymentStages({ environmentId })
  const { mutate: addServiceToDeploymentStage } = useAttachServiceToDeploymentStage()

  useEffect(() => {
    if (deploymentStageList) {
      setStages(deploymentStageList)
    }
  }, [deploymentStageList])

  const onSubmit = (newStage: StageRequest, prevStage: StageRequest) => {
    if (deploymentStageList) {
      // remove current toast to avoid flood of multiple toasts
      toastAction.remove()
      // mutate action
      addServiceToDeploymentStage({
        stageId: newStage.stageId,
        serviceId: newStage.serviceId,
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
