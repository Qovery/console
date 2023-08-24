import { type EnvironmentDeploymentRule } from 'qovery-typescript-axios'
import { type DefaultEntityState } from './default-entity-state.interface'

export interface EnvironmentDeploymentRulesState extends DefaultEntityState<EnvironmentDeploymentRule> {
  joinEnvironmentDeploymentRules: Record<string, string[]>
}
