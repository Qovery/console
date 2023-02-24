import equal from 'fast-deep-equal'
import { CloudProviderEnum, DeploymentStageResponse, EnvironmentAllOfCloudProvider } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { toast as toastAction } from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { selectApplicationsEntitiesByEnvId } from '@qovery/domains/application'
import { selectDatabasesEntitiesByEnvId } from '@qovery/domains/database'
import {
  addServiceToDeploymentStage,
  deleteEnvironmentDeploymentStage,
  environmentsLoadingStatus,
  fetchDeploymentStageList,
  selectEnvironmentById,
} from '@qovery/domains/environment'
import { EnvironmentEntity } from '@qovery/shared/interfaces'
import { Icon, IconAwesomeEnum, ToastEnum, toast, useModal, useModalConfirmation } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/store'
import PageSettingsDeploymentPipeline from '../../ui/page-settings-deployment-pipeline/page-settings-deployment-pipeline'
import StageModalFeature from './stage-modal-feature/stage-modal-feature'

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

  const loadingStatus = useSelector(environmentsLoadingStatus)

  const deploymentStage = useSelector<RootState, EnvironmentEntity | undefined>(
    (state) => selectEnvironmentById(state, environmentId),
    (a, b) => equal(a?.deploymentStage?.items, b?.deploymentStage?.items)
  )?.deploymentStage

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  useEffect(() => {
    if (loadingStatus === 'loaded') dispatch(fetchDeploymentStageList({ environmentId }))
  }, [dispatch, environmentId, loadingStatus])

  const [stages, setStages] = useState<DeploymentStageResponse[] | undefined>(deploymentStage?.items)

  useEffect(() => {
    if (deploymentStage?.items) setStages(deploymentStage?.items)
  }, [setStages, deploymentStage?.items])

  const onSubmit = async (newStage: StageRequest, prevStage: StageRequest) => {
    // dispatch function with two actions, undo and update stage
    function dispatchServiceToDeployment(stage: StageRequest, previous?: boolean) {
      dispatch(addServiceToDeploymentStage({ deploymentStageId: stage.deploymentStageId, serviceId: stage.serviceId }))
        .unwrap()
        .then(() => {
          if (previous) {
            // toast after apply undo
            toast(ToastEnum.SUCCESS, 'Your deployment stage is updated')
          } else {
            // default toast when we don't apply undo
            toast(
              ToastEnum.SUCCESS,
              'Your deployment stage is updated',
              'Do you need to go back?',
              () => dispatchServiceToDeployment(prevStage, true),
              '',
              'Undo update'
            )
          }
        })
        .catch((e) => console.error(e))
    }

    if (deploymentStage?.items) {
      // remove current toast to avoid flood of multiple toasts
      toastAction.remove()
      // dispatch action
      dispatchServiceToDeployment(newStage)
    }
  }

  const menuStage = (stage: DeploymentStageResponse) => [
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
          contentLeft: <Icon name={IconAwesomeEnum.TRASH} className="text-sm text-brand-500" />,
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
