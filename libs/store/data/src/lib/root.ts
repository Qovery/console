import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { initialOrganizationState, organization } from '@console/domains/organization'
import { initialProjectsState, projects } from '@console/domains/projects'
import { initialUserSignUpState, initialUserState, user, userSignUp } from '@console/domains/user'
import { applications, initialApplicationsState } from '@console/domains/application'
import { environments, initialEnvironmentsState } from "@console/domains/environment";
import { RootState } from '@console/shared/interfaces'

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

export type AppDispatch = typeof store.dispatch

export const initialRootState = (): RootState => ({
  user: initialUserState,
  userSignUp: initialUserSignUpState,
  organization: initialOrganizationState,
  projects: initialProjectsState,
  environments: initialEnvironmentsState,
  applications: initialApplicationsState,
})
