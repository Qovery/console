import {
  ApplicationsState,
  EnvironmentsState,
  OrganizationState,
  ProjectsState,
  UserInterface,
  UserSignUpState,
} from '@console/shared/interfaces'

export type RootState = {
  user: UserInterface
  userSignUp: UserSignUpState
  organization: OrganizationState
  projects: ProjectsState
  environments: EnvironmentsState
  applications: ApplicationsState
}
