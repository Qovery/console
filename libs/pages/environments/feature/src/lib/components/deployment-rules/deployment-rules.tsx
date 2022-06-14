import {
  deleteDeploymentRule,
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

  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/deployment-rule/',
      linkLabel: 'How to configure my deployment rule',
      external: true,
    },
  ]

  const dispatch = useDispatch<AppDispatch>()

  const deploymentRulesList = useSelector<RootState, ProjectDeploymentRule[]>((state) =>
    selectDeploymentRulesEntitiesByProjectId(state, projectId)
  )

  const updateDeploymentRulesOrder = async (deploymentRules: ProjectDeploymentRule[]) => {
    await dispatch(updateDeploymentRuleOrder({ projectId, deploymentRules }))
  }

  const removeDeploymentRule = async (deploymentRuleId: string) => {
    await dispatch(deleteDeploymentRule({ projectId, deploymentRuleId }))
  }

  const loadingStatus = useSelector(deploymentRulesLoadingStatus)

  useEffect(() => {
    dispatch(fetchDeploymentRules({ projectId }))
  }, [projectId, dispatch])

  return (
    <DeploymentRulesPage
      listHelpfulLinks={listHelpfulLinks}
      deploymentRules={deploymentRulesList}
      updateDeploymentRulesOrder={updateDeploymentRulesOrder}
      isLoading={loadingStatus !== 'loaded'}
      deleteDeploymentRule={removeDeploymentRule}
    />
  )
}
