import equal from 'fast-deep-equal'
import { DeploymentStageResponse } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { toast as toastAction } from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { selectApplicationsEntitiesByEnvId } from '@qovery/domains/application'
import { selectDatabasesEntitiesByEnvId } from '@qovery/domains/database'
import {
  addServiceToDeploymentStage,
  environmentsLoadingStatus,
  fetchDeploymentStageList,
  selectEnvironmentById,
} from '@qovery/domains/environment'
import { EnvironmentEntity } from '@qovery/shared/interfaces'
import { ToastEnum, toast } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/store'
import PageSettingsDeploymentPipeline from '../../ui/page-settings-deployment-pipeline/page-settings-deployment-pipeline'

export interface StageRequest {
  deploymentStageId: string
  serviceId: string
}

export function PageSettingsDeploymentPipelineFeature() {
  const { environmentId = '' } = useParams()
  const dispatch: AppDispatch = useDispatch()

  const applications = useSelector((state: RootState) => selectApplicationsEntitiesByEnvId(state, environmentId))
  const databases = useSelector((state: RootState) => selectDatabasesEntitiesByEnvId(state, environmentId))

  const loadingStatus = useSelector(environmentsLoadingStatus)

  const deploymentStage = useSelector<RootState, EnvironmentEntity | undefined>(
    (state) => selectEnvironmentById(state, environmentId),
    (a, b) => {
      if (a?.deploymentStage?.items) {
        return equal(a?.deploymentStage?.items, b?.deploymentStage?.items)
      } else {
        return false
      }
    }
  )?.deploymentStage

  useEffect(() => {
    if (loadingStatus === 'loaded') dispatch(fetchDeploymentStageList({ environmentId }))
  }, [dispatch, environmentId, loadingStatus])

  const [stages, setStages] = useState<DeploymentStageResponse[] | undefined>()

  useEffect(() => {
    setStages(deploymentStage?.items)
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
              () => {
                dispatchServiceToDeployment(prevStage, true)
              },
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

  return (
    <PageSettingsDeploymentPipeline
      stages={stages}
      setStages={setStages}
      onSubmit={onSubmit}
      services={[...applications, ...databases]}
    />
  )
}

export default PageSettingsDeploymentPipelineFeature
