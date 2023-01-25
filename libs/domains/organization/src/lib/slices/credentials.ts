import { ActionReducerMapBuilder, Update, createAsyncThunk } from '@reduxjs/toolkit'
import {
  AwsCredentialsRequest,
  CloudProviderCredentialsApi,
  CloudProviderEnum,
  ClusterCredentials,
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
  async (payload: { cloudProvider: CloudProviderEnum; organizationId: string; credentials: AwsCredentialsRequest }) => {
    let response
    if (payload.cloudProvider === CloudProviderEnum.AWS)
      response = await cloudProviderCredentialsApi.createAWSCredentials(payload.organizationId, payload.credentials)
    if (payload.cloudProvider === CloudProviderEnum.SCW)
      response = await cloudProviderCredentialsApi.createScalewayCredentials(
        payload.organizationId,
        payload.credentials
      )
    if (payload.cloudProvider === CloudProviderEnum.DO)
      response = await cloudProviderCredentialsApi.createDOCredentials(payload.organizationId, payload.credentials)

    return response?.data as ClusterCredentials
  }
)

export const credentialsExtraReducers = (builder: ActionReducerMapBuilder<OrganizationState>) => {
  builder
    .addCase(fetchCredentialsList.pending, (state: OrganizationState, action) => {
      const cloudProvider = action.meta.arg.cloudProvider as CloudProviderEnum

      const update: Update<OrganizationEntity> = {
        id: action.meta.arg.organizationId,
        changes: {
          credentials: {
            [cloudProvider]: {
              loadingStatus: 'loading',
              items: [],
            },
          },
        },
      }
      organizationAdapter.updateOne(state, update)
    })
    .addCase(fetchCredentialsList.fulfilled, (state: OrganizationState, action) => {
      const cloudProvider = action.meta.arg.cloudProvider as CloudProviderEnum
      const credentials = state.entities[action.meta.arg.organizationId]?.credentials

      const update: Update<OrganizationEntity> = {
        id: action.meta.arg.organizationId,
        changes: {
          credentials: {
            [cloudProvider]: {
              loadingStatus: 'loaded',
              items:
                credentials && credentials[cloudProvider]
                  ? [...(credentials[cloudProvider]?.items || []), ...action.payload]
                  : [],
            },
          },
        },
      }
      organizationAdapter.updateOne(state, update)
    })
    .addCase(fetchCredentialsList.rejected, (state: OrganizationState, action) => {
      const cloudProvider = action.meta.arg.cloudProvider as CloudProviderEnum

      const update: Update<OrganizationEntity> = {
        id: action.meta.arg.organizationId,
        changes: {
          credentials: {
            [cloudProvider]: {
              loadingStatus: 'error',
            },
          },
        },
      }
      organizationAdapter.updateOne(state, update)
      toastError(action.error)
    })
    // post credentials
    .addCase(postCredentials.fulfilled, (state: OrganizationState, action) => {
      // const cloudProvider = action.meta.arg.cloudProvider
      // const credentialsByCloudProvider = state.credentials[cloudProvider as 'aws' | 'do' | 'scw'].items

      toast(ToastEnum.SUCCESS, `Credentials added`)
    })
    .addCase(postCredentials.rejected, (state: OrganizationState, action) => {
      toastError(action.error)
    })
}
