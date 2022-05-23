import { ProjectDeploymentRule } from 'qovery-typescript-axios'
import { DefaultEntityState } from './default-entity-state.interface'

export interface DeploymentRuleState extends DefaultEntityState<ProjectDeploymentRule> {
  joinProjectDeploymentRules: Record<string, string[]>
}
