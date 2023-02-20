import equal from 'fast-deep-equal'
import { DeploymentStageResponse } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { selectApplicationsEntitiesByEnvId } from '@qovery/domains/application'
import {
  addServiceToDeploymentStage,
  environmentsLoadingStatus,
  fetchDeploymentStageList,
  selectEnvironmentById,
} from '@qovery/domains/environment'
import { ApplicationEntity, EnvironmentEntity } from '@qovery/shared/interfaces'
import { AppDispatch, RootState } from '@qovery/store'
import PageSettingsDeploymentPipeline from '../../ui/page-settings-deployment-pipeline/page-settings-deployment-pipeline'

export interface StageRequest {
  deploymentStageId: string
  serviceId: string
}

export function PageSettingsDeploymentPipelineFeature() {
  const { environmentId = '' } = useParams()
  const dispatch: AppDispatch = useDispatch()

  // const applications =
  useSelector<RootState, ApplicationEntity[] | undefined>(
    (state: RootState) => selectApplicationsEntitiesByEnvId(state, environmentId),
    equal
  )

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
  const [stagesRequest, setStagesRequest] = useState<StageRequest[] | undefined>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setStages(deploymentStage?.items)
  }, [setStages, deploymentStage?.items])

  const onSubmit = async () => {
    if (deploymentStage?.items && stagesRequest) {
      setLoading(true)

      const result = await Promise.all(
        stagesRequest.map((stage) =>
          dispatch(
            addServiceToDeploymentStage({ deploymentStageId: stage.deploymentStageId, serviceId: stage.serviceId })
          )
        )
      )

      if (result) {
        setLoading(false)
      }
    }
  }

  const discardChanges = !equal(deploymentStage?.items, stages)

  return (
    <PageSettingsDeploymentPipeline
      stages={stages}
      setStages={setStages}
      stagesRequest={stagesRequest}
      setStagesRequest={setStagesRequest}
      onSubmit={onSubmit}
      onReset={() => {
        setStages(deploymentStage?.items)
        setStagesRequest(undefined)
      }}
      discardChanges={discardChanges}
      loading={loading}
    />
  )
}

export default PageSettingsDeploymentPipelineFeature
