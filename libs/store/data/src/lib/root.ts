import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {
  clusterReducer,
  initialClusterState,
  initialOrganizationState,
  organization,
} from '@console/domains/organization'
import {
  deploymentRulesReducer,
  initialDeploymentRulesState,
  initialProjectsState,
  projects,
} from '@console/domains/projects'
import { initialUserSignUpState, initialUserState, user, userSignUp } from '@console/domains/user'
import { applications, initialApplicationsState } from '@console/domains/application'
import { environments, initialEnvironmentsState } from '@console/domains/environment'
import { databases, initialDatabasesState } from '@console/domains/database'
import {
  environmentVariables,
  initialEnvironmentVariablesState,
  initialSecretEnvironmentVariablesState,
  secretEnvironmentVariables,
} from '@console/domains/environment-variable'

export const uiReducer = combineReducers({
  user: user,
  userSignUp: userSignUp,
})

export const projectReducer = combineReducers({
  deploymentRules: deploymentRulesReducer,
})

export const environmentVariable = combineReducers({
  public: environmentVariables,
  secret: secretEnvironmentVariables,
})

export const entitiesReducer = combineReducers({
  organization: organization,
  cluster: clusterReducer,
  projects: projects,
  project: projectReducer,
  environments: environments,
  applications: applications,
  databases: databases,
  environmentVariable,
})

export const rootReducer = { ui: uiReducer, entities: entitiesReducer }
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const initialRootState = (): RootState => ({
  ui: {
    user: initialUserState,
    userSignUp: initialUserSignUpState,
  },
  entities: {
    organization: initialOrganizationState,
    cluster: initialClusterState,
    projects: initialProjectsState,
    project: {
      deploymentRules: initialDeploymentRulesState,
    },
    environments: initialEnvironmentsState,
    applications: initialApplicationsState,
    databases: initialDatabasesState,
    environmentVariable: {
      public: initialEnvironmentVariablesState,
      secret: initialSecretEnvironmentVariablesState,
    },
  },
})
