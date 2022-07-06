import { UserInterface } from './user.interface'
import { UserSignUpState } from './user-sign-up.interface'
import { OrganizationState } from './organizations.interface'
import { ProjectsState } from './projects.interface'
import { EnvironmentsState } from './environments.interface'
import { ApplicationsState } from './applications.interface'
import { DeploymentRuleState } from './deployment-rules.interface'
import { EnvironmentVariablesState } from './environment-variables.interface'
import { SecretEnvironmentVariablesState } from './secret-environment-variables.interface'

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
