import { ActionReducerMapBuilder, Update, createAsyncThunk } from '@reduxjs/toolkit'
import { DeploymentStageMainCallsApi } from 'qovery-typescript-axios'
import { EnvironmentEntity, EnvironmentsState } from '@qovery/shared/interfaces'
import { toastError } from '@qovery/shared/ui'
import { environmentsAdapter } from './environments.slice'

const deploymentStageMainCallApi = new DeploymentStageMainCallsApi()

export const fetchDeploymentStageList = createAsyncThunk(
  'environment/fetchDeploymentStageList',
  async (payload: { environmentId: string }) => {
    const response = await deploymentStageMainCallApi.listEnvironmentDeploymentStage(payload.environmentId)
    return response.data.results
  }
)

export const addServiceToDeploymentStage = createAsyncThunk(
  'environment/addServiceToDeploymentStage',
  async (payload: { deploymentStageId: string; serviceId: string }) => {
    const response = await deploymentStageMainCallApi.attachServiceToDeploymentStage(
      payload.deploymentStageId,
      payload.serviceId
    )
    return response.data.results
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
}
