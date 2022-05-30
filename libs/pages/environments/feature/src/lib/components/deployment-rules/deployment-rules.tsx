import {
  deleteDeploymentRule,
  deploymentRulesFactoryMock,
  deploymentRulesLoadingStatus,
  fetchDeploymentRules,
  selectDeploymentRulesEntitiesByProjectId,
  updateDeploymentRuleOrder,
} from '@console/domains/projects'
import { DeploymentRulesPage } from '@console/pages/environments/ui'
import { AppDispatch, RootState } from '@console/store/data'
import { BaseLink } from '@console/shared/ui'
import { ProjectDeploymentRule } from 'qovery-typescript-axios'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { useEffect } from 'react'

export function DeploymentRules() {
  const { projectId = '' } = useParams()

  const listHelpfulLinks: BaseLink[] = [{ link: '#', linkLabel: 'How to configure my application', external: true }]

  const dispatch = useDispatch<AppDispatch>()

  const deploymentRulesList = useSelector<RootState, ProjectDeploymentRule[]>((state) =>
    selectDeploymentRulesEntitiesByProjectId(state, projectId)
  )

  const updateDeploymentRulesOrder = async (deploymentRulesIds: string[]) => {
    await dispatch(updateDeploymentRuleOrder({ projectId, deploymentRulesIds }))
  }

  const removeDeploymentRule = async (deploymentRuleId: string) => {
    await dispatch(deleteDeploymentRule({ projectId, deploymentRuleId }))
  }

  const loadingStatus = useSelector(deploymentRulesLoadingStatus)
  const deploymentRulesLoading = deploymentRulesFactoryMock(3)

  useEffect(() => {
    dispatch(fetchDeploymentRules({ projectId }))
  }, [projectId, dispatch])

  return (
    <DeploymentRulesPage
      listHelpfulLinks={listHelpfulLinks}
      deploymentRules={loadingStatus !== 'loaded' ? deploymentRulesLoading : deploymentRulesList}
      updateDeploymentRulesOrder={updateDeploymentRulesOrder}
      isLoading={loadingStatus !== 'loaded'}
      deleteDeploymentRule={removeDeploymentRule}
    />
  )
}
