import {
  PayloadAction,
  Update,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import {
  CloneRequest,
  CreateEnvironmentRequest,
  DatabasesApi,
  DeploymentHistoryEnvironment,
  Environment,
  EnvironmentActionsApi,
  EnvironmentDeploymentHistoryApi,
  EnvironmentDeploymentRule,
  EnvironmentDeploymentRuleApi,
  EnvironmentEditRequest,
  EnvironmentMainCallsApi,
  EnvironmentsApi,
  Status,
} from 'qovery-typescript-axios'
import { QueryClient, useMutation, useQuery, useQueryClient } from 'react-query'
import { EnvironmentEntity, EnvironmentsState, WebsocketRunningStatusInterface } from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import { getEntitiesByIds, refactoPayload, sortByKey } from '@qovery/shared/utils'
import { RootState } from '@qovery/store'

export const ENVIRONMENTS_FEATURE_KEY = 'environments'

const environmentsApi = new EnvironmentsApi()
const environmentsActionsApi = new EnvironmentActionsApi()
const environmentMainCallsApi = new EnvironmentMainCallsApi()
const environmentDeploymentsApi = new EnvironmentDeploymentHistoryApi()
const environmentDeploymentRulesApi = new EnvironmentDeploymentRuleApi()
const databasesApi = new DatabasesApi()

export const environmentsAdapter = createEntityAdapter<EnvironmentEntity>()

export const useFetchEnvironments = (projectId: string) => {
  const queryClient = useQueryClient()

  return useQuery<Environment[], Error>(
    ['project', projectId, 'environments'],
    async () => {
      const response = await environmentsApi.listEnvironment(projectId)
      return response.data.results as Environment[]
    },
    {
      initialData: queryClient.getQueryData(['project', projectId, 'environments']),
      onSuccess: () => {
        // refetch environmentsStatus requests
        queryClient.invalidateQueries(['environmentsStatus', projectId])
      },
      onError: (err) => toastError(err),
      enabled: projectId !== '',
    }
  )
}

export const getEnvironmentById = (environmentId: string, environments?: Environment[]) => {
  return environments?.find((environment) => environment.id === environmentId)
}

export const useFetchEnvironmentsStatus = (projectId: string) => {
  const queryClient = useQueryClient()

  return useQuery<Status[], Error>(
    ['environmentsStatus', projectId],
    async () => {
      const response = await environmentsApi.getProjectEnvironmentsStatus(projectId)
      return response.data.results as Status[]
    },
    {
      initialData: queryClient.getQueryData(['environmentsStatus', projectId]),
      onError: (err) => toastError(err),
    }
  )
}

export const getEnvironmentStatusById = (environmentId: string, status?: Status[]) => {
  return status?.find((environment) => environment.id === environmentId)
}

export const updateEnvironmentsRunningStatus = async (
  queryClient: QueryClient,
  environments: WebsocketRunningStatusInterface[]
) => {
  for (let i = 0; i < environments.length; i++) {
    const environment = environments[i]
    const queryKey = ['environments-running-status', environment.id]
    queryClient.invalidateQueries({ queryKey })
    queryClient.setQueryData(queryKey, environment)
  }
}

export const useEnvironmentRunningStatus = (environmentId: string) => {
  const queryClient = useQueryClient()

  const queryKey = ['environments-running-status', environmentId]
  const environmentsRunningStatusById: WebsocketRunningStatusInterface | undefined = queryClient.getQueryData(queryKey)
  return environmentsRunningStatusById
}

export const getEnvironmentRunningStatusById = (queryClient: QueryClient, environmentId: string) => {
  const queryKey = ['environments-running-status', environmentId]
  const environmentsRunningStatusById: WebsocketRunningStatusInterface | undefined = queryClient.getQueryData(queryKey)
  return environmentsRunningStatusById
}

export const useEditEnvironment = (projectId: string, onSettledCallback: () => void) => {
  const queryClient = useQueryClient()

  return useMutation(
    async ({ environmentId, data }: { environmentId: string; data: EnvironmentEditRequest }) => {
      const response = await environmentMainCallsApi.editEnvironment(environmentId, data)
      return response.data
    },
    {
      onSuccess: (result, variables) => {
        queryClient.setQueryData<Environment[] | undefined>(['project', projectId, 'environments'], (old) => {
          return old?.map((environment) => (environment.id === variables.environmentId ? result : environment))
        })
        toast(ToastEnum.SUCCESS, 'Your environment is updated')
      },
      onError: (err) => {
        toastError(err as Error)
      },
      onSettled: () => onSettledCallback(),
    }
  )
}

export const useFetchEnvironmentDeploymentRule = (projectId: string, environmentId: string) => {
  const queryClient = useQueryClient()

  return useQuery<EnvironmentDeploymentRule, Error>(
    ['project', projectId, 'environments', environmentId, 'deploymentRules'],
    async () => {
      const response = await environmentDeploymentRulesApi.getEnvironmentDeploymentRule(environmentId)
      return response.data
    },
    {
      initialData: queryClient.getQueryData(['project', projectId, 'environments', environmentId, 'deploymentRules']),
      onError: (err) => toastError(err),
    }
  )
}

export const useEditEnvironmentDeploymentRule = (
  projectId: string,
  environmentId: string,
  onSettledCallback?: () => void
) => {
  const queryClient = useQueryClient()

  return useMutation(
    async ({
      environmentId,
      deploymentRuleId,
      data,
    }: {
      environmentId: string
      deploymentRuleId: string
      data: EnvironmentDeploymentRule
    }) => {
      const cloneEnvironmentDeploymentRules = Object.assign({}, refactoPayload(data))
      const response = await environmentDeploymentRulesApi.editEnvironmentDeploymentRule(
        environmentId,
        deploymentRuleId,
        cloneEnvironmentDeploymentRules
      )
      return response.data
    },
    {
      onSuccess: (result) => {
        queryClient.setQueryData<EnvironmentDeploymentRule>(
          ['project', projectId, 'environments', environmentId, 'deploymentRules'],
          result
        )
        toast(ToastEnum.SUCCESS, 'Your environment deployment rules is updated')
      },
      onError: (err) => toastError(err as Error),
      onSettled: () => onSettledCallback && onSettledCallback(),
    }
  )
}

export const useEnvironmentDeploymentHistory = (projectId: string, environmentId: string) => {
  const queryClient = useQueryClient()

  return useQuery<DeploymentHistoryEnvironment[], Error>(
    ['project', projectId, 'environments', environmentId, 'deploymentHistory'],
    async () => {
      const response = await environmentDeploymentsApi.listEnvironmentDeploymentHistory(environmentId)
      return response.data.results as DeploymentHistoryEnvironment[]
    },
    {
      initialData: queryClient.getQueryData(['project', projectId, 'environments', environmentId, 'deploymentHistory']),
      onError: (err) => toastError(err),
    }
  )
}

export const useCreateEnvironment = (
  onSuccessCallback?: (result: Environment) => void,
  onSettledCallback?: () => void
) => {
  const queryClient = useQueryClient()

  return useMutation(
    async ({ projectId, data }: { projectId: string; data: CreateEnvironmentRequest }) => {
      const response = await environmentsApi.createEnvironment(projectId, data)
      return response.data
    },
    {
      onSuccess: (result, variables) => {
        queryClient.setQueryData<Environment[] | undefined>(['project', variables.projectId, 'environments'], (old) => {
          return old ? [...old, result] : old
        })

        toast(ToastEnum.SUCCESS, 'Your environment has been successfully created')
        onSuccessCallback && onSuccessCallback(result)
      },
      onError: (err) => toastError(err as Error),
      onSettled: () => onSettledCallback && onSettledCallback(),
    }
  )
}

export const useCloneEnvironment = (
  projectId: string,
  onSuccessCallback?: (result: Environment) => void,
  onSettledCallback?: () => void
) => {
  const queryClient = useQueryClient()

  return useMutation(
    async ({ environmentId, data }: { environmentId: string; data: CloneRequest }) => {
      const response = await environmentsActionsApi.cloneEnvironment(environmentId, data)
      return response.data
    },
    {
      onSuccess: (result) => {
        queryClient.setQueryData<Environment[] | undefined>(['project', projectId, 'environments'], (old) => {
          return old ? [...old, result] : old
        })

        toast(ToastEnum.SUCCESS, 'Your environment has been successfully cloned')
        onSuccessCallback && onSuccessCallback(result)
      },
      onError: (err) => toastError(err as Error),
      onSettled: () => onSettledCallback && onSettledCallback(),
    }
  )
}

/// --------

// done
// export const c = createAsyncThunk<Environment[], { projectId: string; withoutStatus?: boolean }>(
//   'environments/fetch',
//   async (data, thunkApi) => {
//     const response = await environmentsApi.listEnvironment(data.projectId)

//     if (!data.withoutStatus) {
//       thunkApi.dispatch(fetchEnvironmentsStatus({ projectId: data.projectId }))
//     }

//     return response.data.results as Environment[]
//   }
// )

// done
export const fetchEnvironmentsStatus = createAsyncThunk<Status[], { projectId: string }>(
  'environmentsStatus/fetch',
  async (data) => {
    const response = await environmentsApi.getProjectEnvironmentsStatus(data.projectId)
    return response.data.results as Status[]
  }
)

export const fetchEnvironmentDeploymentHistory = createAsyncThunk<
  DeploymentHistoryEnvironment[],
  { environmentId: string; silently?: boolean }
>('environments-deployments/fetch', async (data) => {
  const response = await environmentDeploymentsApi.listEnvironmentDeploymentHistory(data.environmentId)
  return response.data.results as DeploymentHistoryEnvironment[]
})

export const updateEnvironment = createAsyncThunk(
  'environment/update',
  async (payload: { environmentId: string; data: EnvironmentEditRequest }) => {
    const response = await environmentMainCallsApi.editEnvironment(payload.environmentId, payload.data)
    return response.data
  }
)

// export const fetchEnvironmentDeploymentRules = createAsyncThunk(
//   'environment-deployment-rules/fetch',
//   async (environmentId: string) => {
//     const response = await environmentDeploymentRulesApi.getEnvironmentDeploymentRule(environmentId)
//     return response.data as EnvironmentDeploymentRule
//   }
// )

// export const editEnvironmentDeploymentRules = createAsyncThunk(
//   'environment-deployment-rules/edit',
//   async (payload: { environmentId: string; deploymentRuleId: string; data: EnvironmentDeploymentRule }) => {
//     const cloneEnvironmentDeploymentRules = Object.assign({}, refactoPayload(payload.data) as any)

//     const response = await environmentDeploymentRulesApi.editEnvironmentDeploymentRule(
//       payload.environmentId,
//       payload.deploymentRuleId,
//       cloneEnvironmentDeploymentRules
//     )
//     return response.data as EnvironmentDeploymentRule
//   }
// )

// export const createEnvironment = createAsyncThunk(
//   'environment/create',
//   async (payload: { projectId: string; environmentRequest: CreateEnvironmentRequest }) => {
//     const response = await environmentsApi.createEnvironment(payload.projectId, payload.environmentRequest)
//     return response.data
//   }
// )

// export const cloneEnvironment = createAsyncThunk(
//   'environment/clone',
//   async (payload: { environmentId: string; cloneRequest: CloneRequest }) => {
//     const response = await environmentsActionsApi.cloneEnvironment(payload.environmentId, payload.cloneRequest)
//     return response.data
//   }
// )

// export const fetchEnvironmentContainers = createAsyncThunk(
//   'environment-containers/fetch',
//   async (payload: { environmentId: string }) => {
//     const response = await environmentContainersApi.listContainer(payload.environmentId)
//     return response.data
//   }
// )

export const fetchDatabaseConfiguration = createAsyncThunk(
  'environment/database-configuration/fetch',
  async (payload: { environmentId: string }) => {
    const response = await databasesApi.listEnvironmentDatabaseConfig(payload.environmentId)
    return response.data.results
  }
)

export const initialEnvironmentsState: EnvironmentsState = environmentsAdapter.getInitialState({
  loadingStatus: 'not loaded',
  loadingEnvironmentStatus: 'not loaded',
  loadingEnvironmentDeployments: 'not loaded',
  loadingEnvironmentDeploymentRules: 'not loaded',
  error: null,
  joinProjectEnvironments: {},
})

export const environmentsSlice = createSlice({
  name: ENVIRONMENTS_FEATURE_KEY,
  initialState: initialEnvironmentsState,
  reducers: {
    add: environmentsAdapter.addOne,
    remove: environmentsAdapter.removeOne,
    // updateEnvironmentsRunningStatus: (
    //   state,
    //   action: PayloadAction<{ websocketRunningStatus: WebsocketRunningStatusInterface[]; clusterId: string }>
    // ) => {
    //   // we have to force this reset change because of the way the socket works.
    //   // You can have information about an application (eg. if it's stopping)
    //   // But you can also lose the information about this application (eg. it it's stopped it won't appear in the socket result)
    //   const resetChanges: Update<EnvironmentEntity>[] = state.ids.map((id) => {
    //     // as we can have this dispatch from different websocket, we don't want to reset
    //     // and override all the entry but only the one associated to the cluster the websocket is
    //     // coming from
    //     const runningStatusChanges =
    //       state.entities[id]?.cluster_id === action.payload.clusterId ? undefined : state.entities[id]?.running_status
    //     return {
    //       id,
    //       changes: {
    //         running_status: runningStatusChanges,
    //       },
    //     }
    //   })
    //   environmentsAdapter.updateMany(state, resetChanges)

    //   const changes: Update<EnvironmentEntity>[] = action.payload.websocketRunningStatus.map((runningStatus) => {
    //     const realId = shortToLongId(runningStatus.id, state.ids as string[])
    //     return {
    //       id: realId,
    //       changes: {
    //         running_status: runningStatus,
    //       },
    //     }
    //   })

    //   environmentsAdapter.updateMany(state, changes)
    // },
  },
  extraReducers: (builder) => {
    builder
      // get environments
      // .addCase(fetchEnvironments.pending, (state: EnvironmentsState) => {
      //   state.loadingStatus = 'loading'
      // })
      // .addCase(fetchEnvironments.fulfilled, (state: EnvironmentsState, action: PayloadAction<Environment[]>) => {
      //   environmentsAdapter.upsertMany(state, action.payload)
      //   action.payload.forEach((environment) => {
      //     state.joinProjectEnvironments = addOneToManyRelation(environment.project?.id, environment.id, {
      //       ...state.joinProjectEnvironments,
      //     })
      //   })

      //   state.loadingStatus = 'loaded'
      // })
      // .addCase(fetchEnvironments.rejected, (state: EnvironmentsState, action) => {
      //   state.loadingStatus = 'error'
      //   state.error = action.error.message
      // })
      // create environment
      // .addCase(createEnvironment.fulfilled, (state: EnvironmentsState, action: PayloadAction<Environment>) => {
      //   environmentsAdapter.addOne(state, action.payload)
      //   state.joinProjectEnvironments = addOneToManyRelation(action.payload.project?.id, action.payload.id, {
      //     ...state.joinProjectEnvironments,
      //   })
      //   toast(ToastEnum.SUCCESS, 'Your environment has been successfully created')
      // })
      // .addCase(createEnvironment.rejected, (state: EnvironmentsState, action) => {
      //   state.error = action.error.message
      //   toast(ToastEnum.ERROR, 'Creation Error', state.error)
      // })
      // clone environment
      // .addCase(cloneEnvironment.fulfilled, (state: EnvironmentsState, action: PayloadAction<Environment>) => {
      //   environmentsAdapter.addOne(state, action.payload)
      //   state.joinProjectEnvironments = addOneToManyRelation(action.payload.project?.id, action.payload.id, {
      //     ...state.joinProjectEnvironments,
      //   })
      //   toast(ToastEnum.SUCCESS, 'Your environment has been successfully cloned')
      // })
      // .addCase(cloneEnvironment.rejected, (state: EnvironmentsState, action) => {
      //   state.error = action.error.message
      //   toast(ToastEnum.ERROR, 'Cloning Error', state.error)
      // })
      // get environments status
      .addCase(fetchEnvironmentsStatus.pending, (state: EnvironmentsState) => {
        state.loadingEnvironmentStatus = 'loading'
      })
      .addCase(fetchEnvironmentsStatus.fulfilled, (state: EnvironmentsState, action: PayloadAction<Status[]>) => {
        const update: { id: string | undefined; changes: { status: Status } }[] = action.payload.map(
          (status: Status) => ({
            id: status.id,
            changes: {
              status: status,
            },
          })
        )
        environmentsAdapter.updateMany(state, update as Update<Environment>[])
        state.loadingEnvironmentStatus = 'loaded'
      })
      .addCase(fetchEnvironmentsStatus.rejected, (state: EnvironmentsState, action) => {
        state.loadingEnvironmentStatus = 'error'
        state.error = action.error.message
      })
      // get environment deployment history
      .addCase(fetchEnvironmentDeploymentHistory.pending, (state: EnvironmentsState, action) => {
        if (!action.meta.arg.silently) state.loadingEnvironmentDeployments = 'loading'
      })
      .addCase(fetchEnvironmentDeploymentHistory.fulfilled, (state: EnvironmentsState, action) => {
        const update = {
          id: action.meta.arg.environmentId,
          changes: {
            deployments: action.payload,
          },
        }
        environmentsAdapter.updateOne(state, update as Update<Environment>)
        state.loadingEnvironmentDeployments = 'loaded'
      })
      .addCase(fetchEnvironmentDeploymentHistory.rejected, (state: EnvironmentsState, action) => {
        state.loadingEnvironmentDeployments = 'error'
        state.error = action.error.message
      })
      // update environment
      .addCase(updateEnvironment.pending, (state: EnvironmentsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(updateEnvironment.fulfilled, (state: EnvironmentsState, action) => {
        const update: Update<Environment> = {
          id: action.payload.id,
          changes: {
            ...action.payload,
          },
        }
        environmentsAdapter.updateOne(state, update)
        state.error = null
        state.loadingStatus = 'loaded'
        toast(ToastEnum.SUCCESS, 'Your environment is updated')
      })
      .addCase(updateEnvironment.rejected, (state: EnvironmentsState, action) => {
        state.loadingStatus = 'error'
        toastError(action.error)
        state.error = action.error.message
      })
      // fetch environment deployment rules
      // .addCase(fetchEnvironmentDeploymentRules.pending, (state: EnvironmentsState) => {
      //   state.loadingEnvironmentDeploymentRules = 'loading'
      // })
      // .addCase(fetchEnvironmentDeploymentRules.fulfilled, (state: EnvironmentsState, action) => {
      //   const update: Update<EnvironmentEntity> = {
      //     id: action.meta.arg,
      //     changes: {
      //       deploymentRules: action.payload,
      //     },
      //   }
      //   environmentsAdapter.updateOne(state, update)
      //   state.error = null
      //   state.loadingStatus = 'loaded'
      //   state.loadingEnvironmentDeploymentRules = 'loaded'
      // })
      // .addCase(fetchEnvironmentDeploymentRules.rejected, (state: EnvironmentsState, action) => {
      //   state.loadingEnvironmentDeploymentRules = 'error'
      //   state.error = action.error.message
      // })
      // update environment deployment rules
      // .addCase(editEnvironmentDeploymentRules.pending, (state: EnvironmentsState) => {
      //   state.loadingEnvironmentDeploymentRules = 'loading'
      // })
      // .addCase(editEnvironmentDeploymentRules.fulfilled, (state: EnvironmentsState, action) => {
      //   const update: Update<EnvironmentEntity> = {
      //     id: action.meta.arg.environmentId,
      //     changes: {
      //       deploymentRules: action.payload,
      //     },
      //   }
      //   environmentsAdapter.updateOne(state, update)
      //   state.error = null
      //   state.loadingEnvironmentDeploymentRules = 'loaded'
      //   toast(ToastEnum.SUCCESS, 'Your environment deployment rules is updated')
      // })
      // .addCase(editEnvironmentDeploymentRules.rejected, (state: EnvironmentsState, action) => {
      //   state.loadingEnvironmentDeploymentRules = 'error'
      //   toastError(action.error)
      //   state.error = action.error.message
      // })
      // fetch database configurations for this environment
      .addCase(fetchDatabaseConfiguration.pending, (state: EnvironmentsState, action) => {
        const update: Update<EnvironmentEntity> = {
          id: action.meta.arg.environmentId,
          changes: {
            databaseConfigurations: {
              loadingStatus: 'loading',
            },
          },
        }
        environmentsAdapter.updateOne(state, update)
      })
      .addCase(fetchDatabaseConfiguration.fulfilled, (state: EnvironmentsState, action) => {
        const update: Update<EnvironmentEntity> = {
          id: action.meta.arg.environmentId,
          changes: {
            databaseConfigurations: {
              loadingStatus: 'loaded',
              data: action.payload,
            },
          },
        }
        environmentsAdapter.updateOne(state, update)
      })
  },
})

export const environments = environmentsSlice.reducer

export const environmentsActions = environmentsSlice.actions

const { selectAll, selectEntities } = environmentsAdapter.getSelectors()

export const getEnvironmentsState = (rootState: RootState): EnvironmentsState =>
  rootState.environment[ENVIRONMENTS_FEATURE_KEY]

export const selectAllEnvironments = createSelector(getEnvironmentsState, selectAll)

export const selectEnvironmentsEntities = createSelector(getEnvironmentsState, selectEntities)

export const selectEnvironmentsEntitiesByProjectId = (
  state: RootState,
  projectId: string,
  sortBy: keyof EnvironmentEntity = 'name'
): EnvironmentEntity[] => {
  const environmentState = getEnvironmentsState(state)
  const entities = getEntitiesByIds<Environment>(
    environmentState.entities,
    environmentState?.joinProjectEnvironments[projectId]
  )
  return sortBy ? sortByKey<EnvironmentEntity>(entities, sortBy) : entities
}

export const selectEnvironmentsEntitiesByClusterId = (clusterId: string) =>
  createSelector(
    (state: RootState) => {
      return selectAll(getEnvironmentsState(state))
    },
    (environments): EnvironmentEntity[] => {
      return environments.filter((env) => {
        return env.cluster_id === clusterId
      })
    }
  )

export const selectEnvironmentsIdByClusterId = createSelector(
  [getEnvironmentsState, (state, clusterId: string) => clusterId],
  (state, clusterId) => {
    const environments = selectAll(state)
    return environments
      .filter((env) => {
        return env.cluster_id === clusterId
      })
      .map((env) => env.id)
  }
)

export const selectEnvironmentById = (state: RootState, environmentId: string) =>
  getEnvironmentsState(state).entities[environmentId]

export const environmentsLoadingStatus = (state: RootState): string | undefined =>
  getEnvironmentsState(state).loadingStatus

export const environmentsLoadingEnvironmentStatus = (state: RootState): string | undefined =>
  getEnvironmentsState(state).loadingEnvironmentStatus

export const environmentsLoadingEnvironmentDeployments = (state: RootState): string | undefined =>
  getEnvironmentsState(state).loadingEnvironmentDeployments

export const environmentsLoadingEnvironmentDeploymentRules = (state: RootState): string | undefined =>
  getEnvironmentsState(state).loadingEnvironmentDeploymentRules

export const selectEnvironmentDeploymentRulesByEnvId = (
  state: RootState,
  environmentId: string
): EnvironmentDeploymentRule | undefined => {
  return getEnvironmentsState(state).entities[environmentId]?.deploymentRules
}
