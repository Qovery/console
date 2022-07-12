import {
  deleteDeploymentRule,
  deploymentRulesLoadingStatus,
  fetchDeploymentRules,
  selectDeploymentRulesEntitiesByProjectId,
  updateDeploymentRuleOrder,
} from '@console/domains/projects'
import { AppDispatch, RootState } from '@console/store/data'
import { BaseLink } from '@console/shared/ui'
import { ProjectDeploymentRule } from 'qovery-typescript-axios'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { useEffect } from 'react'
import PageDeploymentRules from '../../ui/page-deployment-rules/page-deployment-rules'
import { ENVIRONMENTS_DEPLOYMENT_RULES_URL_CREATE, ENVIRONMENTS_URL } from '@console/shared/router'
import { useDocumentTitle } from '@console/shared/utils'

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

  const linkNewRule = ENVIRONMENTS_URL(organizationId, projectId) + ENVIRONMENTS_DEPLOYMENT_RULES_URL_CREATE

  useEffect(() => {
    dispatch(fetchDeploymentRules({ projectId }))
  }, [projectId, dispatch])

  return (
    <PageDeploymentRules
      listHelpfulLinks={listHelpfulLinks}
      deploymentRules={deploymentRulesList}
      updateDeploymentRulesOrder={updateDeploymentRulesOrder}
      isLoading={loadingStatus !== 'loaded'}
      deleteDeploymentRule={removeDeploymentRule}
      linkNewRule={linkNewRule}
    />
  )
}

export default PageDeploymentRulesFeature
