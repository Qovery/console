import { ActionReducerMapBuilder, Update, createAsyncThunk } from '@reduxjs/toolkit'
import {
  AwsCredentialsRequest,
  CloudProviderCredentialsApi,
  CloudProviderEnum,
  ClusterCredentials,
  DoCredentialsRequest,
  ScalewayCredentialsRequest,
} from 'qovery-typescript-axios'
import { OrganizationEntity, OrganizationState } from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import { organizationAdapter } from './organization.slice'

const cloudProviderCredentialsApi = new CloudProviderCredentialsApi()

export const fetchCredentialsList = createAsyncThunk(
  'organization/fetch-credentials-list',
  async (payload: { cloudProvider: CloudProviderEnum; organizationId: string }) => {
    let response
    if (payload.cloudProvider === CloudProviderEnum.AWS)
      response = await cloudProviderCredentialsApi.listAWSCredentials(payload.organizationId)
    if (payload.cloudProvider === CloudProviderEnum.SCW)
      response = await cloudProviderCredentialsApi.listScalewayCredentials(payload.organizationId)
    if (payload.cloudProvider === CloudProviderEnum.DO)
      response = await cloudProviderCredentialsApi.listDOCredentials(payload.organizationId)

    return response?.data.results as ClusterCredentials[]
  }
)

export const postCredentials = createAsyncThunk(
  'organization/post-credentials',
  async (payload: {
    cloudProvider: CloudProviderEnum
    organizationId: string
    credentials: AwsCredentialsRequest | ScalewayCredentialsRequest | DoCredentialsRequest
  }) => {
    let response
    if (payload.cloudProvider === CloudProviderEnum.AWS)
      response = await cloudProviderCredentialsApi.createAWSCredentials(
        payload.organizationId,
        payload.credentials as AwsCredentialsRequest
      )
    if (payload.cloudProvider === CloudProviderEnum.SCW)
      response = await cloudProviderCredentialsApi.createScalewayCredentials(
        payload.organizationId,
        payload.credentials
      )

    return response?.data as ClusterCredentials
  }
)

export const deleteCredentials = createAsyncThunk(
  'organization/delete-credentials',
  async (payload: { cloudProvider: CloudProviderEnum; organizationId: string; credentialsId: string }) => {
    let response
    if (payload.cloudProvider === CloudProviderEnum.AWS)
      response = await cloudProviderCredentialsApi.deleteAWSCredentials(payload.credentialsId, payload.organizationId)
    if (payload.cloudProvider === CloudProviderEnum.SCW)
      response = await cloudProviderCredentialsApi.deleteScalewayCredentials(
        payload.credentialsId,
        payload.organizationId
      )

    return response
  }
)

export const editCredentials = createAsyncThunk(
  'organization/edit-credentials',
  async (payload: {
    cloudProvider: CloudProviderEnum
    organizationId: string
    credentialsId: string
    credentials: AwsCredentialsRequest | ScalewayCredentialsRequest | DoCredentialsRequest
  }) => {
    let response
    if (payload.cloudProvider === CloudProviderEnum.AWS)
      response = await cloudProviderCredentialsApi.editAWSCredentials(
        payload.organizationId,
        payload.credentialsId,
        payload.credentials as AwsCredentialsRequest
      )
    if (payload.cloudProvider === CloudProviderEnum.SCW)
      response = await cloudProviderCredentialsApi.editScalewayCredentials(
        payload.organizationId,
        payload.credentialsId,
        payload.credentials
      )

    return response?.data as ClusterCredentials
  }
)

export const credentialsExtraReducers = (builder: ActionReducerMapBuilder<OrganizationState>) => {
  builder
    .addCase(fetchCredentialsList.pending, (state: OrganizationState, action) => {
      const credentials = state.entities[action.meta.arg.organizationId]?.credentials?.items || []

      const update: Update<OrganizationEntity> = {
        id: action.meta.arg.organizationId,
        changes: {
          credentials: {
            loadingStatus: 'loading',
            items: credentials,
          },
        },
      }
      organizationAdapter.updateOne(state, update)
    })
    .addCase(fetchCredentialsList.fulfilled, (state: OrganizationState, action) => {
      const cloudProvider = action.meta.arg.cloudProvider as CloudProviderEnum

      const update: Update<OrganizationEntity> = {
        id: action.meta.arg.organizationId,
        changes: {
          credentials: {
            loadingStatus: 'loaded',
            items: action.payload.map((value) => ({ ...value, cloudProvider })),
          },
        },
      }
      organizationAdapter.updateOne(state, update)
    })
    .addCase(fetchCredentialsList.rejected, (state: OrganizationState, action) => {
      toastError(action.error)
    })
    // post credentials
    .addCase(postCredentials.pending, (state: OrganizationState, action) => {
      const credentials = state.entities[action.meta.arg.organizationId]?.credentials?.items || []

      const update: Update<OrganizationEntity> = {
        id: action.meta.arg.organizationId,
        changes: {
          credentials: {
            loadingStatus: 'loading',
            items: credentials,
          },
        },
      }
      organizationAdapter.updateOne(state, update)
    })
    .addCase(postCredentials.fulfilled, (state: OrganizationState, action) => {
      const cloudProvider = action.meta.arg.cloudProvider as CloudProviderEnum
      const credentials = state.entities[action.meta.arg.organizationId]?.credentials?.items || []

      const update: Update<OrganizationEntity> = {
        id: action.meta.arg.organizationId,
        changes: {
          credentials: {
            loadingStatus: 'loaded',
            items: [...credentials, { ...action.payload, cloudProvider }],
          },
        },
      }
      organizationAdapter.updateOne(state, update)
      toast(ToastEnum.SUCCESS, 'Credentials added')
    })
    .addCase(postCredentials.rejected, (state: OrganizationState, action) => {
      toastError(action.error)
    })
    // edit credentials
    .addCase(editCredentials.pending, (state: OrganizationState, action) => {
      const credentials = state.entities[action.meta.arg.organizationId]?.credentials?.items || []

      const update: Update<OrganizationEntity> = {
        id: action.meta.arg.organizationId,
        changes: {
          credentials: {
            loadingStatus: 'loading',
            items: credentials,
          },
        },
      }
      organizationAdapter.updateOne(state, update)
    })
    .addCase(editCredentials.fulfilled, (state: OrganizationState, action) => {
      const cloudProvider = action.meta.arg.cloudProvider as CloudProviderEnum
      const credentials = state.entities[action.meta.arg.organizationId]?.credentials?.items || []
      const index = credentials.findIndex((obj) => obj.id === action.payload.id)
      credentials[index] = Object.assign(action.payload, { cloudProvider: cloudProvider })

      const update: Update<OrganizationEntity> = {
        id: action.meta.arg.organizationId,
        changes: {
          credentials: {
            loadingStatus: 'loaded',
            items: credentials,
          },
        },
      }

      organizationAdapter.updateOne(state, update)
      toast(ToastEnum.SUCCESS, 'Credentials updated')
    })
    .addCase(editCredentials.rejected, (state: OrganizationState, action) => {
      toastError(action.error)
    })
    // delete credentials
    .addCase(deleteCredentials.fulfilled, (state: OrganizationState, action) => {
      const credentials = state.entities[action.meta.arg.organizationId]?.credentials?.items || []
      const currentCredentials = credentials.filter((obj) => obj.id !== action.meta.arg.credentialsId)

      const update: Update<OrganizationEntity> = {
        id: action.meta.arg.organizationId,
        changes: {
          credentials: {
            loadingStatus: 'loaded',
            items: currentCredentials,
          },
        },
      }

      organizationAdapter.updateOne(state, update)
      toast(ToastEnum.SUCCESS, 'Credentials deleted')
    })
    .addCase(deleteCredentials.rejected, (state: OrganizationState, action) => {
      toastError(action.error)
    })
}
