import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { applications, initialApplicationsState } from '@console/domains/application'
import { databases, initialDatabasesState } from '@console/domains/database'
import { environments, initialEnvironmentsState } from '@console/domains/environment'
import {
  environmentVariables,
  initialEnvironmentVariablesState,
  initialSecretEnvironmentVariablesState,
  secretEnvironmentVariables,
} from '@console/domains/environment-variable'
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

export const uiReducer = combineReducers({
  user: user,
  userSignUp: userSignUp,
})

export const projectReducer = combineReducers({
  projects: projects,
  deploymentRules: deploymentRulesReducer,
})

export const environmentReducer = combineReducers({
  environments: environments,
})

export const environmentVariable = combineReducers({
  public: environmentVariables,
  secret: secretEnvironmentVariables,
})

export const entitiesReducer = combineReducers({
  organization: organization,
  cluster: clusterReducer,
  project: projectReducer,
  environment: environmentReducer,
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
    project: {
      projects: initialProjectsState,
      deploymentRules: initialDeploymentRulesState,
    },
    environment: {
      environments: initialEnvironmentsState,
    },
    environmentVariable: {
      public: initialEnvironmentVariablesState,
      secret: initialSecretEnvironmentVariablesState,
    },
    applications: initialApplicationsState,
    databases: initialDatabasesState,
  },
})
