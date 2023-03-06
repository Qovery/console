import { ActionReducerMapBuilder, Update, createAsyncThunk } from '@reduxjs/toolkit'
import { DeploymentStageMainCallsApi, DeploymentStageRequest } from 'qovery-typescript-axios'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { EnvironmentEntity, EnvironmentsState } from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import { environmentsAdapter } from './environments.slice'

const deploymentStageMainCallApi = new DeploymentStageMainCallsApi()

export const useFetchDeploymentStageList = (environmentId: string) => {
  const queryClient = useQueryClient()

  return useQuery(
    ['environment', environmentId, 'deploymentStageList'],
    async () => {
      const response = await deploymentStageMainCallApi.listEnvironmentDeploymentStage(environmentId)
      return response.data.results
    },
    {
      initialData: queryClient.getQueryData(['environment', environmentId, 'deploymentStageList']),
      onError: (err: any) => {
        console.log(err)
        toastError(err)
      },
    }
  )
}

export const useAddServiceToDeploymentStage = (environmentId: string) => {
  const queryClient = useQueryClient()

  return useMutation(
    async ({ deploymentStageId, serviceId }: { deploymentStageId: string; serviceId: string }) => {
      const response = await deploymentStageMainCallApi.attachServiceToDeploymentStage(deploymentStageId, serviceId)
      return response.data.results
    },
    {
      onSuccess: () => queryClient.invalidateQueries(['environment', environmentId, 'deploymentStageList']),
      onError: (err: any) => {
        console.log(err)
        toastError(err)
      },
    }
  )
}

// export const useMoveDeploymentStageRequested = () => {
//   const queryClient = useQueryClient()

//   return useMutation(
//     async ({ stageId, beforeOrAfterStageId, after }: any) => {
//       let response
//       if (after) {
//         response = await deploymentStageMainCallApi.moveAfterDeploymentStage(stageId, beforeOrAfterStageId)
//       } else {
//         response = await deploymentStageMainCallApi.moveBeforeDeploymentStage(stageId, beforeOrAfterStageId)
//       }
//       return response.data.results
//     },
//     {
//       onSuccess: (data, { environmentId }) => {
//         queryClient.invalidateQueries(['environment', environmentId, 'deploymentStageList'])
//       },
//       onError: (err: any) => {
//         toastError(err)
//       },
//     }
//   )
// }

// export const useCreateEnvironmentDeploymentStage = () => {
//   const queryClient = useQueryClient()

//   return useMutation(
//     async ({ environmentId, data }: any) => {
//       const response = await deploymentStageMainCallApi.createEnvironmentDeploymentStage(environmentId, data)
//       return response.data
//     },
//     {
//       onSuccess: (data, { environmentId }) => {
//         queryClient.invalidateQueries(['environment', environmentId, 'deploymentStageList'])
//         toast(ToastEnum.SUCCESS, 'Your stage has been successfully created')
//       },
//       onError: (err: any) => {
//         toastError(err)
//       },
//     }
//   )
// }

// export const useEditEnvironmentDeploymentStage = () => {
//   const queryClient = useQueryClient()

//   return useMutation(
//     async ({ environmentId, stageId, data }: any) => {
//       const response = await deploymentStageMainCallApi.editDeploymentStage(stageId, data)
//       return response.data
//     },
//     {
//       onSuccess: (data, { environmentId }) => {
//         queryClient.invalidateQueries(['environment', environmentId, 'deploymentStageList'])
//       },
//       onError: (err: any) => {
//         toastError(err)
//       },
//     }
//   )
// }

// export const useDeleteEnvironmentDeploymentStage = () => {
//   const queryClient = useQueryClient()

//   return useMutation(
//     async ({ environmentId, stageId }: any) => {
//       const response = await deploymentStageMainCallApi.deleteDeploymentStage(stageId)
//       return response.data
//     },
//     {
//       onSuccess: (data, { environmentId }) => {
//         queryClient.invalidateQueries(['environment', environmentId, 'deploymentStageList'])
//       },
//       onError: (err: any) => {
//         toastError(err)
//       },
//     }
//   )
// }

// ////////////////////////////////////////////////

// export const fetchDeploymentStageList = createAsyncThunk(
//   'environment/fetchDeploymentStageList',
//   async (payload: { environmentId: string }) => {
//     const response = await deploymentStageMainCallApi.listEnvironmentDeploymentStage(payload.environmentId)
//     return response.data.results
//   }
// )

// export const addServiceToDeploymentStage = createAsyncThunk(
//   'environment/addServiceToDeploymentStage',
//   async (payload: { deploymentStageId: string; serviceId: string }) => {
//     const response = await deploymentStageMainCallApi.attachServiceToDeploymentStage(
//       payload.deploymentStageId,
//       payload.serviceId
//     )
//     return response.data.results
//   }
// )

export const moveDeploymentStageRequested = createAsyncThunk(
  'environment/moveDeploymentStageRequested',
  async (payload: { stageId: string; beforeOrAfterStageId: string; after: boolean }) => {
    let response
    if (payload.after) {
      response = await deploymentStageMainCallApi.moveAfterDeploymentStage(
        payload.stageId,
        payload.beforeOrAfterStageId
      )
    } else {
      response = await deploymentStageMainCallApi.moveBeforeDeploymentStage(
        payload.stageId,
        payload.beforeOrAfterStageId
      )
    }
    return response.data.results
  }
)

export const createEnvironmentDeploymentStage = createAsyncThunk(
  'environment/createEnvironmentDeploymentStage',
  async (payload: { environmentId: string; data: DeploymentStageRequest }) => {
    const response = await deploymentStageMainCallApi.createEnvironmentDeploymentStage(
      payload.environmentId,
      payload.data
    )
    return response.data
  }
)

export const editEnvironmentDeploymentStage = createAsyncThunk(
  'environment/editEnvironmentDeploymentStage',
  async (payload: { environmentId: string; stageId: string; data: DeploymentStageRequest }) => {
    const response = await deploymentStageMainCallApi.editDeploymentStage(payload.stageId, payload.data)
    return response.data
  }
)

export const deleteEnvironmentDeploymentStage = createAsyncThunk(
  'environment/deleteEnvironmentDeploymentStage',
  async (payload: { environmentId: string; stageId: string }) => {
    const response = await deploymentStageMainCallApi.deleteDeploymentStage(payload.stageId)
    return response.data
  }
)

export const deploymentStageExtraReducers = (builder: ActionReducerMapBuilder<EnvironmentsState>) => {
  builder
    // fetch deployment stage list
    .addCase(fetchDeploymentStageList.pending, (state: EnvironmentsState, action) => {
      const update: Update<EnvironmentEntity> = {
        id: action.meta.arg.environmentId,
        changes: {
          deploymentStage: {
            loadingStatus: 'loading',
          },
        },
      }
      environmentsAdapter.updateOne(state, update)
    })
    .addCase(fetchDeploymentStageList.fulfilled, (state: EnvironmentsState, action) => {
      const update: Update<EnvironmentEntity> = {
        id: action.meta.arg.environmentId,
        changes: {
          deploymentStage: {
            loadingStatus: 'loaded',
            items: action.payload,
          },
        },
      }
      environmentsAdapter.updateOne(state, update)
    })
    .addCase(fetchDeploymentStageList.rejected, (state: EnvironmentsState, action) => {
      toastError(action.error)
    })
    // add service to deployment stage
    .addCase(addServiceToDeploymentStage.fulfilled, (state: EnvironmentsState, action) => {
      const environmentId = action.payload ? action.payload[0].environment.id : ''
      const update: Update<EnvironmentEntity> = {
        id: environmentId,
        changes: {
          deploymentStage: {
            loadingStatus: 'loaded',
            items: action.payload,
          },
        },
      }
      environmentsAdapter.updateOne(state, update)
    })
    .addCase(addServiceToDeploymentStage.rejected, (state: EnvironmentsState, action) => {
      toastError(action.error)
    })
    // create deployment stage
    .addCase(createEnvironmentDeploymentStage.fulfilled, (state: EnvironmentsState, action) => {
      const environmentId = action.meta.arg.environmentId
      const update: Update<EnvironmentEntity> = {
        id: environmentId,
        changes: {
          deploymentStage: {
            loadingStatus: 'loaded',
            items: [...(state.entities[environmentId]?.deploymentStage?.items || []), action.payload],
          },
        },
      }
      environmentsAdapter.updateOne(state, update)
      toast(ToastEnum.SUCCESS, 'Your stage has been successfully created')
    })
    .addCase(createEnvironmentDeploymentStage.rejected, (state: EnvironmentsState, action) => {
      toastError(action.error)
    })
    // edit deployment stage
    .addCase(editEnvironmentDeploymentStage.fulfilled, (state: EnvironmentsState, action) => {
      const environmentId = action.meta.arg.environmentId
      const stageId = action.meta.arg.stageId

      const stages = state.entities[environmentId]?.deploymentStage?.items || []
      const index = stages.findIndex((obj) => obj.id === stageId)
      stages[index] = action.payload

      const update: Update<EnvironmentEntity> = {
        id: environmentId,
        changes: {
          deploymentStage: {
            loadingStatus: 'loaded',
            items: stages,
          },
        },
      }
      environmentsAdapter.updateOne(state, update)
      toast(ToastEnum.SUCCESS, 'Your stage has been successfully updated')
    })
    .addCase(editEnvironmentDeploymentStage.rejected, (state: EnvironmentsState, action) => {
      toastError(action.error)
    })
    // delete deployment stage
    .addCase(deleteEnvironmentDeploymentStage.fulfilled, (state: EnvironmentsState, action) => {
      const environmentId = action.meta.arg.environmentId
      const stageId = action.meta.arg.stageId

      const stages = state.entities[environmentId]?.deploymentStage?.items || []
      const newStages = stages.filter((obj) => obj.id !== stageId)

      const update: Update<EnvironmentEntity> = {
        id: environmentId,
        changes: {
          deploymentStage: {
            loadingStatus: 'loaded',
            items: newStages,
          },
        },
      }
      environmentsAdapter.updateOne(state, update)
      toast(ToastEnum.SUCCESS, 'Your stage has been successfully deleted')
    })
    .addCase(deleteEnvironmentDeploymentStage.rejected, (state: EnvironmentsState, action) => {
      toastError(action.error)
    })
    // move deployment stage before requested statge
    .addCase(moveDeploymentStageRequested.fulfilled, (state: EnvironmentsState, action) => {
      const environmentId = action.payload ? action.payload[0].environment.id : ''
      const update: Update<EnvironmentEntity> = {
        id: environmentId,
        changes: {
          deploymentStage: {
            loadingStatus: 'loaded',
            items: action.payload,
          },
        },
      }
      environmentsAdapter.updateOne(state, update)
      toast(ToastEnum.SUCCESS, 'Your stage order has been successfully updated')
    })
    .addCase(moveDeploymentStageRequested.rejected, (state: EnvironmentsState, action) => {
      toastError(action.error)
    })
}
