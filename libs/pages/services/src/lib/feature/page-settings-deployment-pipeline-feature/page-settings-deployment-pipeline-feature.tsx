import { type CloudProviderEnum, type DeploymentStageResponse } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { toast as toastAction } from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import {
  useAddServiceToDeploymentStage,
  useDeleteEnvironmentDeploymentStage,
  useFetchDeploymentStageList,
  useFetchEnvironment,
} from '@qovery/domains/environment'
import { useServices } from '@qovery/domains/services/feature'
import { Icon, IconAwesomeEnum, useModal, useModalConfirmation } from '@qovery/shared/ui'
import PageSettingsDeploymentPipeline from '../../ui/page-settings-deployment-pipeline/page-settings-deployment-pipeline'
import StageModalFeature from './stage-modal-feature/stage-modal-feature'
import StageOrderModalFeature from './stage-order-modal-feature/stage-order-modal-feature'

export interface StageRequest {
  deploymentStageId: string
  serviceId: string
}

export function PageSettingsDeploymentPipelineFeature() {
  const { projectId = '', environmentId = '' } = useParams()

  const { data: environment } = useFetchEnvironment(projectId, environmentId)
  const { data: services } = useServices({ environmentId })

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const [stages, setStages] = useState<DeploymentStageResponse[] | undefined>()

  const { data: deploymentStageList } = useFetchDeploymentStageList(environmentId)
  const addServiceToDeploymentStage = useAddServiceToDeploymentStage(environmentId)
  const deleteEnvironmentDeploymentStage = useDeleteEnvironmentDeploymentStage(environmentId)

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
      addServiceToDeploymentStage.mutate({
        deploymentStageId: newStage.deploymentStageId,
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
          contentLeft: <Icon name={IconAwesomeEnum.PEN} className="text-sm text-brand-500" />,
        },
        {
          name: 'Edit order',
          onClick: () =>
            openModal({
              content: <StageOrderModalFeature onClose={closeModal} stages={stages} />,
            }),
          contentLeft: <Icon name={IconAwesomeEnum.ARROW_DOWN_19} className="text-sm text-brand-500" />,
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
              action: () => deleteEnvironmentDeploymentStage.mutate({ stageId: stage.id }),
            }),
          contentLeft: <Icon name={IconAwesomeEnum.TRASH} className="text-sm text-red-600" />,
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
