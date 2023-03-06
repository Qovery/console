import { CloudProviderEnum, DeploymentStageResponse, EnvironmentAllOfCloudProvider } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { toast as toastAction } from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { selectApplicationsEntitiesByEnvId } from '@qovery/domains/application'
import { selectDatabasesEntitiesByEnvId } from '@qovery/domains/database'
import {
  deleteEnvironmentDeploymentStage,
  selectEnvironmentById,
  useAddServiceToDeploymentStage,
  useFetchDeploymentStageList,
} from '@qovery/domains/environment'
import { Icon, IconAwesomeEnum, ToastEnum, toast, useModal, useModalConfirmation } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/store'
import PageSettingsDeploymentPipeline from '../../ui/page-settings-deployment-pipeline/page-settings-deployment-pipeline'
import StageModalFeature from './stage-modal-feature/stage-modal-feature'
import StageOrderModalFeature from './stage-order-modal-feature/stage-order-modal-feature'

export interface StageRequest {
  deploymentStageId: string
  serviceId: string
}

export function PageSettingsDeploymentPipelineFeature() {
  const { environmentId = '' } = useParams()
  const dispatch: AppDispatch = useDispatch()

  const cloudProvider = useSelector<RootState, EnvironmentAllOfCloudProvider | undefined>(
    (state) => selectEnvironmentById(state, environmentId)?.cloud_provider
  )

  const applications = useSelector(
    (state: RootState) => selectApplicationsEntitiesByEnvId(state, environmentId),
    (a, b) => a.length === b.length
  )
  const databases = useSelector(
    (state: RootState) => selectDatabasesEntitiesByEnvId(state, environmentId),
    (a, b) => a.length === b.length
  )

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const [stages, setStages] = useState<DeploymentStageResponse[] | undefined>()

  const { data: deploymentStageList } = useFetchDeploymentStageList(environmentId)
  const addServiceToDeploymentStage = useAddServiceToDeploymentStage(environmentId)

  useEffect(() => {
    if (deploymentStageList) {
      setStages(deploymentStageList)
    }
  }, [deploymentStageList])

  const onSubmit = (newStage: StageRequest, prevStage: StageRequest) => {
    if (deploymentStageList) {
      // remove current toast to avoid flood of multiple toasts
      toastAction.remove()
      // dispatch action
      addServiceToDeploymentStage
        .mutateAsync({
          deploymentStageId: newStage.deploymentStageId,
          serviceId: newStage.serviceId,
        })
        .then(() => {
          // default toast when we don't apply undo
          toast(
            ToastEnum.SUCCESS,
            'Your deployment stage is updated',
            'Do you need to go back?',
            () =>
              addServiceToDeploymentStage.mutate({
                deploymentStageId: prevStage.deploymentStageId,
                serviceId: prevStage.serviceId,
              }),
            '',
            'Undo'
          )
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
              description: 'Are you sure you want to delete this stage?',
              name: stage.name,
              action: () => dispatch(deleteEnvironmentDeploymentStage({ environmentId, stageId: stage.id })),
            }),
          contentLeft: <Icon name={IconAwesomeEnum.TRASH} className="text-sm text-error-600" />,
          containerClassName: 'text-error-600',
        },
      ],
    },
  ]

  return (
    <PageSettingsDeploymentPipeline
      stages={stages}
      setStages={setStages}
      onSubmit={onSubmit}
      services={[...applications, ...databases]}
      cloudProvider={cloudProvider?.provider as CloudProviderEnum}
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
