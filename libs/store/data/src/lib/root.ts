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
import { applications, ApplicationsState, initialApplicationsState } from '@console/domains/environment'
import { application, ApplicationState, initialApplicationState } from '@console/domains/application'

export const rootReducer = combineReducers({
  user: user,
  organization: organization,
  userSignUp: userSignUp,
  projects: projects,
  environments: environments,
  applications: applications,
  application: application,
})

export const store = configureStore({
  reducer: rootReducer,
})

export type RootState = {
  user: User
  userSignUp: UserSignUpState
  organization: OrganizationState
  projects: ProjectsState
  environments: EnvironmentsState
  applications: ApplicationsState
  application: ApplicationState
}

export type AppDispatch = typeof store.dispatch

export const initialRootState = (): RootState => ({
  user: initialUserState,
  userSignUp: initialUserSignUpState,
  organization: initialOrganizationState,
  projects: initialProjectsState,
  environments: initialEnvironmentsState,
  applications: initialApplicationsState,
  application: initialApplicationState,
})
