import { UserInterface } from './user.interface'
import { UserSignUpState } from './user-sign-up.interface'
import { OrganizationState } from './organizations.interface'
import { ProjectsState } from './projects.interface'
import { EnvironmentsState } from './environments.interface'
import { ApplicationsState } from './applications.interface'

export type RootState = {
  user: UserInterface
  userSignUp: UserSignUpState
  organization: OrganizationState
  projects: ProjectsState
  environments: EnvironmentsState
  applications: ApplicationsState
}
