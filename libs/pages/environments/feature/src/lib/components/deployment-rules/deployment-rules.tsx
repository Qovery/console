import { selectDeploymentRulesEntitiesByProjectId } from '@console/domains/projects'
import { DeploymentRulesPage } from '@console/pages/environments/ui'
import { RootState } from '@console/store/data'
import { BaseLink } from '@console/shared/ui'
import { ProjectDeploymentRule } from 'qovery-typescript-axios'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'

export function DeploymentRules() {
  const { projectId = '' } = useParams()

  const listHelpfulLinks: BaseLink[] = [{ link: '#', linkLabel: 'How to configure my application', external: true }]

  const deploymentRulesList = useSelector<RootState, ProjectDeploymentRule[]>((state) =>
    selectDeploymentRulesEntitiesByProjectId(state, projectId)
  )

  console.log(deploymentRulesList)

  return <DeploymentRulesPage listHelpfulLinks={listHelpfulLinks} deploymentRules={deploymentRulesList} />
}
