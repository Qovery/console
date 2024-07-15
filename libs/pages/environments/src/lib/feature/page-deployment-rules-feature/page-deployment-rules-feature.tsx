import { type ProjectDeploymentRule } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { useClusters } from '@qovery/domains/clusters/feature'
import {
  useDeleteDeploymentRule,
  useEditDeploymentRulesPriorityOrder,
  useListDeploymentRules,
} from '@qovery/domains/projects/feature'
import { ENVIRONMENTS_DEPLOYMENT_RULES_CREATE_URL, ENVIRONMENTS_URL } from '@qovery/shared/routes'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import PageDeploymentRules from '../../ui/page-deployment-rules/page-deployment-rules'

export function PageDeploymentRulesFeature() {
  const { projectId = '', organizationId = '' } = useParams()
  useDocumentTitle('Deployment Rules - Qovery')

  const { data: deploymentRules = [], isLoading: isLoadingDeploymentRules } = useListDeploymentRules({ projectId })
  const { mutate: deleteDeploymentRule } = useDeleteDeploymentRule()
  const { mutate: deploymentRuleOrder } = useEditDeploymentRulesPriorityOrder()

  const updateDeploymentRulesOrder = (deploymentRules: ProjectDeploymentRule[]) => {
    deploymentRuleOrder({
      projectId,
      deploymentRulesPriorityOrderRequest: {
        project_deployment_rule_ids_in_order: deploymentRules.map((deploymentRule) => deploymentRule.id),
      },
    })
  }
  const { data: clusters = [] } = useClusters({ organizationId })

  const removeDeploymentRule = (deploymentRuleId: string) => {
    deleteDeploymentRule({ projectId, deploymentRuleId })
  }

  const linkNewRule = ENVIRONMENTS_URL(organizationId, projectId) + ENVIRONMENTS_DEPLOYMENT_RULES_CREATE_URL

  return (
    <PageDeploymentRules
      organizationId={organizationId}
      clusters={clusters}
      deploymentRules={deploymentRules}
      updateDeploymentRulesOrder={updateDeploymentRulesOrder}
      isLoading={isLoadingDeploymentRules}
      deleteDeploymentRule={removeDeploymentRule}
      linkNewRule={linkNewRule}
    />
  )
}

export default PageDeploymentRulesFeature
