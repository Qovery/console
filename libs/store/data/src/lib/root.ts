import { initialOrganizationState, organization, OrganizationState } from '@console/domains/organization'
import { initialProjectsState, ProjectsState, projects } from '@console/domains/projects'
import {
  initialUserSignUpState,
  initialUserState,
  user,
  UserInterface,
  UserSignUpState,
  userSignUp,
} from '@console/domains/user'
import { combineReducers, configureStore } from '@reduxjs/toolkit'

export const rootReducer = combineReducers({
  user: user,
  organization: organization,
  userSignUp: userSignUp,
  projects: projects,
})

export const store = configureStore({
  reducer: rootReducer,
})

export type RootState = {
  user: UserInterface
  userSignUp: UserSignUpState
  organization: OrganizationState
  projects: ProjectsState
}

export type AppDispatch = typeof store.dispatch

export const initialRootState = (): RootState => ({
  user: initialUserState,
  userSignUp: initialUserSignUpState,
  organization: initialOrganizationState,
  projects: initialProjectsState,
})
