import { UserInterface } from './user.interface'
import { UserSignUpState } from './user-sign-up.interface'
import { OrganizationState } from './organizations.interface'
import { ProjectsState } from './projects.interface'
import { EnvironmentsState } from './environments.interface'
import { ApplicationsState } from './applications.interface'

export type RootState = {
  ui: {
    user: UserInterface
    userSignUp: UserSignUpState
  }
  entities: {
    organization: OrganizationState
    projects: ProjectsState
    environments: EnvironmentsState
    applications: ApplicationsState
  }
}
