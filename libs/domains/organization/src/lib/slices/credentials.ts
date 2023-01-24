import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit'
import { CloudProviderCredentialsApi, CloudProviderEnum, ClusterCredentials } from 'qovery-typescript-axios'
import { OrganizationState } from '@qovery/shared/interfaces'

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

export const credentialsExtraReducers = (builder: ActionReducerMapBuilder<OrganizationState>) => {
  builder
    .addCase(fetchCredentialsList.pending, (state: OrganizationState, action) => {
      const cloudProvider = action.meta.arg.cloudProvider

      if (cloudProvider === CloudProviderEnum.AWS) {
        state.credentials.aws.loadingStatus = 'loading'
      }

      if (cloudProvider === CloudProviderEnum.DO) {
        state.credentials.do.loadingStatus = 'loading'
      }

      if (cloudProvider === CloudProviderEnum.SCW) {
        state.credentials.scw.loadingStatus = 'loading'
      }
    })
    .addCase(fetchCredentialsList.fulfilled, (state: OrganizationState, action) => {
      const cloudProvider = action.meta.arg.cloudProvider

      if (cloudProvider === CloudProviderEnum.AWS) {
        state.credentials.aws.loadingStatus = 'loaded'
        state.credentials.aws.items = action.payload
      }

      if (cloudProvider === CloudProviderEnum.DO) {
        state.credentials.do.loadingStatus = 'loaded'
        state.credentials.do.items = action.payload
      }

      if (cloudProvider === CloudProviderEnum.SCW) {
        state.credentials.scw.loadingStatus = 'loaded'
        state.credentials.scw.items = action.payload
      }
    })
    .addCase(fetchCredentialsList.rejected, (state: OrganizationState, action) => {
      const cloudProvider = action.meta.arg.cloudProvider

      if (cloudProvider === CloudProviderEnum.AWS) {
        state.credentials.aws.loadingStatus = 'error'
      }

      if (cloudProvider === CloudProviderEnum.DO) {
        state.credentials.do.loadingStatus = 'error'
      }

      if (cloudProvider === CloudProviderEnum.SCW) {
        state.credentials.scw.loadingStatus = 'error'
      }
    })
}
