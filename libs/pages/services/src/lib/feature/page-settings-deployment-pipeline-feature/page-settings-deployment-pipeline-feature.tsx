import { type CloudProviderEnum, type DeploymentStageResponse } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { toast as toastAction } from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import {
  useAttachServiceToDeploymentStage,
  useDeleteDeploymentStage,
  useEnvironment,
  useListDeploymentStages,
} from '@qovery/domains/environments/feature'
import { useServices } from '@qovery/domains/services/feature'
import { Icon, useModal, useModalConfirmation } from '@qovery/shared/ui'
import PageSettingsDeploymentPipeline from '../../ui/page-settings-deployment-pipeline/page-settings-deployment-pipeline'
import StageModalFeature from './stage-modal-feature/stage-modal-feature'
import StageOrderModalFeature from './stage-order-modal-feature/stage-order-modal-feature'

export interface StageRequest {
  stageId: string
  serviceId: string
}

export function PageSettingsDeploymentPipelineFeature() {
  const { environmentId = '' } = useParams()

  const { data: environment } = useEnvironment({ environmentId })
  const { data: services } = useServices({ environmentId })

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const [stages, setStages] = useState<DeploymentStageResponse[] | undefined>()

  const { data: deploymentStageList } = useListDeploymentStages({ environmentId })
  const { mutateAsync: addServiceToDeploymentStage } = useAttachServiceToDeploymentStage()
  const { mutate: deleteEnvironmentDeploymentStage } = useDeleteDeploymentStage({ environmentId })

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

  const menuStage = (stage: DeploymentStageResponse, stages?: DeploymentStageResponse[]) => [
    {
      items: [
        {
          name: 'Edit stage',
          onClick: () =>
            openModal({
              content: <StageModalFeature onClose={closeModal} environmentId={environmentId} stage={stage} />,
            }),
          contentLeft: <Icon iconName="pen" className="text-sm text-brand-500" />,
        },
        {
          name: 'Edit order',
          onClick: () =>
            openModal({
              content: <StageOrderModalFeature onClose={closeModal} stages={stages} />,
            }),
          contentLeft: <Icon iconName="arrow-down-1-9" className="text-sm text-brand-500" />,
        },
      ],
    },
    {
      items: [
        {
          name: 'Delete stage',
          onClick: () =>
            openModalConfirmation({
              title: 'Delete this stage',
              isDelete: true,
              name: stage.name,
              action: () => deleteEnvironmentDeploymentStage({ stageId: stage.id }),
            }),
          contentLeft: <Icon iconName="trash" className="text-sm text-red-600" />,
          containerClassName: 'text-red-600',
        },
      ],
    },
  ]

  return (
    <PageSettingsDeploymentPipeline
      stages={stages}
      setStages={setStages}
      onSubmit={onSubmit}
      services={services}
      cloudProvider={environment?.cloud_provider.provider as CloudProviderEnum}
      onAddStage={() => {
        openModal({
          content: <StageModalFeature onClose={closeModal} environmentId={environmentId} />,
        })
      }}
      menuStage={menuStage}
    />
  )
}

export default PageSettingsDeploymentPipelineFeature
