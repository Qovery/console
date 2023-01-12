import { ProjectDeploymentRule } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  deleteDeploymentRule,
  deploymentRulesLoadingStatus,
  fetchDeploymentRules,
  selectDeploymentRulesEntitiesByProjectId,
  updateDeploymentRuleOrder,
} from '@qovery/domains/projects'
import { ENVIRONMENTS_DEPLOYMENT_RULES_CREATE_URL, ENVIRONMENTS_URL } from '@qovery/shared/routes'
import { BaseLink } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import PageDeploymentRules from '../../ui/page-deployment-rules/page-deployment-rules'

export function PageDeploymentRulesFeature() {
  const { projectId = '', organizationId = '' } = useParams()
  useDocumentTitle('Deployment Rules - Qovery')

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

  const linkNewRule = ENVIRONMENTS_URL(organizationId, projectId) + ENVIRONMENTS_DEPLOYMENT_RULES_CREATE_URL

  useEffect(() => {
    dispatch(fetchDeploymentRules({ projectId }))
  }, [projectId, dispatch])

  return (
    <PageDeploymentRules
      listHelpfulLinks={listHelpfulLinks}
      deploymentRules={deploymentRulesList}
      updateDeploymentRulesOrder={updateDeploymentRulesOrder}
      isLoading={loadingStatus}
      deleteDeploymentRule={removeDeploymentRule}
      linkNewRule={linkNewRule}
    />
  )
}

export default PageDeploymentRulesFeature
