import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { User } from 'qovery-typescript-axios'
import { initialOrganizationState, organization, OrganizationState } from '@console/domains/organization'
import {
  initialProjectsState,
  ProjectsState,
  projects,
  EnvironmentsState,
  environments,
  initialEnvironmentsState,
} from '@console/domains/projects'
import { initialUserSignUpState, initialUserState, user, UserSignUpState, userSignUp } from '@console/domains/user'
import { applications, ApplicationsState, initialApplicationsState } from '@console/domains/application'

export const rootReducer = combineReducers({
  user: user,
  userSignUp: userSignUp,
  organization: organization,
  projects: projects,
  environments: environments,
  applications: applications,
})

export const store = configureStore({
  reducer: rootReducer,
})

export type RootState = {
  user: User
  userSignUp: UserSignUpState
  entities: {
    organization: OrganizationState
    projects: ProjectsState
    environments: EnvironmentsState
    applications: ApplicationsState
  }
}

export type AppDispatch = typeof store.dispatch

export const initialRootState = (): RootState => ({
  user: initialUserState,
  userSignUp: initialUserSignUpState,
  entities: {
    organization: initialOrganizationState,
    projects: initialProjectsState,
    environments: initialEnvironmentsState,
    applications: initialApplicationsState,
  },
})
