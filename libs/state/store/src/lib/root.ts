import { type PreloadedState, combineReducers, configureStore } from '@reduxjs/toolkit'
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  applications,
  customDomainReducer,
  initialApplicationsState,
  initialCustomDomainState,
} from '@qovery/domains/application'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { databases, initialDatabasesState } from '@qovery/domains/database'
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  authProviderReducer,
  clusterReducer,
  initialAuthProviderState,
  initialClusterState,
  initialRepositoryState,
  repositoryReducer,
} from '@qovery/domains/organization'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { initialUserSignUpState, initialUserState, userReducer, userSignUp } from '@qovery/domains/users/data-access'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { deploymentRulesReducer, initialDeploymentRulesState } from '@qovery/project'

export const organizationReducer = combineReducers({
  authProvider: authProviderReducer,
  repository: repositoryReducer,
})

export const projectReducer = combineReducers({
  deploymentRules: deploymentRulesReducer,
})

export const applicationReducer = combineReducers({
  applications: applications,
  customDomains: customDomainReducer,
})

export const rootReducer = combineReducers({
  organization: organizationReducer,
  cluster: clusterReducer,
  databases: databases,
  application: applicationReducer,
  user: userReducer,
  userSignUp: userSignUp,
  project: projectReducer,
})

export function setupStore(preloadedState?: PreloadedState<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })
}

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']

export const initialRootState = (): RootState => ({
  organization: {
    authProvider: initialAuthProviderState,
    repository: initialRepositoryState,
  },
  cluster: initialClusterState,
  project: {
    deploymentRules: initialDeploymentRulesState,
  },
  databases: initialDatabasesState,
  application: {
    applications: initialApplicationsState,
    customDomains: initialCustomDomainState,
  },
  user: initialUserState,
  userSignUp: initialUserSignUpState,
})
