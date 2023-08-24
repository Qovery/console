import { type ApplicationsState } from './applications.interface'
import { type DeploymentRuleState } from './deployment-rules.interface'
import { type EnvironmentVariablesState } from './environment-variables.interface'
import { type EnvironmentsState } from './environments.interface'
import { type OrganizationState } from './organizations.interface'
import { type ProjectsState } from './projects.interface'
import { type SecretEnvironmentVariablesState } from './secret-environment-variables.interface'
import { type UserSignUpState } from './user-sign-up.interface'
import { type UserInterface } from './user.interface'

export type RootState = {
  ui: {
    user: UserInterface
    userSignUp: UserSignUpState
  }
  entities: {
    organization: OrganizationState
    projects: ProjectsState
    project: {
      deploymentRules: DeploymentRuleState
    }
    environments: EnvironmentsState
    applications: ApplicationsState
    environmentVariable: {
      public: EnvironmentVariablesState
      secret: SecretEnvironmentVariablesState
    }
  }
}
