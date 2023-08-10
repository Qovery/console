import { PreloadedState, combineReducers, configureStore } from '@reduxjs/toolkit'
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
  environmentVariables,
  initialEnvironmentVariablesState,
  initialSecretEnvironmentVariablesState,
  secretEnvironmentVariables,
} from '@qovery/domains/environment-variable'
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  authProviderReducer,
  clusterReducer,
  creditCardsReducer,
  initialAuthProviderState,
  initialClusterState,
  initialCreditCardsState,
  initialOrganizationState,
  initialRepositoryState,
  organization,
  repositoryReducer,
} from '@qovery/domains/organization'
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  deploymentRulesReducer,
  initialDeploymentRulesState,
  initialProjectsState,
  projects,
} from '@qovery/domains/projects'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { initialUserSignUpState, initialUserState, user, userSignUp } from '@qovery/domains/user'

export const organizationReducer = combineReducers({
  organizations: organization,
  authProvider: authProviderReducer,
  repository: repositoryReducer,
  creditCards: creditCardsReducer,
})

export const projectReducer = combineReducers({
  projects: projects,
  deploymentRules: deploymentRulesReducer,
})

export const environmentVariable = combineReducers({
  public: environmentVariables,
  secret: secretEnvironmentVariables,
})

export const applicationReducer = combineReducers({
  applications: applications,
  customDomains: customDomainReducer,
})

export const rootReducer = combineReducers({
  organization: organizationReducer,
  cluster: clusterReducer,
  project: projectReducer,
  databases: databases,
  environmentVariable,
  application: applicationReducer,
  user: user,
  userSignUp: userSignUp,
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
    organizations: initialOrganizationState,
    authProvider: initialAuthProviderState,
    repository: initialRepositoryState,
    creditCards: initialCreditCardsState,
  },
  cluster: initialClusterState,
  project: {
    projects: initialProjectsState,
    deploymentRules: initialDeploymentRulesState,
  },
  environmentVariable: {
    public: initialEnvironmentVariablesState,
    secret: initialSecretEnvironmentVariablesState,
  },
  databases: initialDatabasesState,
  application: {
    applications: initialApplicationsState,
    customDomains: initialCustomDomainState,
  },
  user: initialUserState,
  userSignUp: initialUserSignUpState,
})
