import equal from 'fast-deep-equal'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { selectApplicationsEntitiesByEnvId } from '@qovery/domains/application'
import { environmentsLoadingStatus, fetchDeploymentStageList, selectEnvironmentById } from '@qovery/domains/environment'
import { ApplicationEntity, EnvironmentEntity } from '@qovery/shared/interfaces'
import { AppDispatch, RootState } from '@qovery/store'
import PageSettingsDeploymentPipeline from '../../ui/page-settings-deployment-pipeline/page-settings-deployment-pipeline'

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

  return <PageSettingsDeploymentPipeline deploymentStage={deploymentStage?.items} />
}

export default PageSettingsDeploymentPipelineFeature
