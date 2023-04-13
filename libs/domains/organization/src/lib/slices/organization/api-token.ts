import { ActionReducerMapBuilder, Update, createAsyncThunk } from '@reduxjs/toolkit'
import {
  OrganizationApiToken,
  OrganizationApiTokenApi,
  OrganizationApiTokenCreateRequest,
} from 'qovery-typescript-axios'
import { OrganizationEntity, OrganizationState } from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import { organizationAdapter } from './organization.slice'

const apiTokenApi = new OrganizationApiTokenApi()

export const fetchApiTokens = createAsyncThunk(
  'organization/fetch-api-tokens',
  async (payload: { organizationId: string }) => {
    const response = await apiTokenApi.listOrganizationApiTokens(payload.organizationId)
    return response?.data.results as OrganizationApiToken[]
  }
)

export const postApiToken = createAsyncThunk(
  'organization/post-api-token',
  async (payload: { organizationId: string; token: OrganizationApiTokenCreateRequest }) => {
    const response = await apiTokenApi.createOrganizationApiToken(payload.organizationId, payload.token)
    return response?.data as OrganizationApiToken
  }
)

export const deleteApiToken = createAsyncThunk(
  'organization/delete-api-token',
  async (payload: { apiTokenId: string; organizationId: string }) => {
    return await apiTokenApi.deleteOrganizationApiToken(payload.apiTokenId, payload.organizationId)
  }
)

export const apiTokenExtraReducers = (builder: ActionReducerMapBuilder<OrganizationState>) => {
  builder
    .addCase(fetchApiTokens.pending, (state: OrganizationState, action) => {
      const apiTokens = state.entities[action.meta.arg.organizationId]?.apiTokens?.items || []

      const update: Update<OrganizationEntity> = {
        id: action.meta.arg.organizationId,
        changes: {
          apiTokens: {
            loadingStatus: 'loading',
            items: apiTokens,
          },
        },
      }
      organizationAdapter.updateOne(state, update)
    })
    .addCase(fetchApiTokens.fulfilled, (state: OrganizationState, action) => {
      const update: Update<OrganizationEntity> = {
        id: action.meta.arg.organizationId,
        changes: {
          apiTokens: {
            loadingStatus: 'loaded',
            items: action.payload,
          },
        },
      }
      organizationAdapter.updateOne(state, update)
    })
    .addCase(fetchApiTokens.rejected, (state: OrganizationState, action) => {
      toastError(action.error)
    })
    // post credentials
    .addCase(postApiToken.pending, (state: OrganizationState, action) => {
      const apiTokens = state.entities[action.meta.arg.organizationId]?.apiTokens?.items || []

      const update: Update<OrganizationEntity> = {
        id: action.meta.arg.organizationId,
        changes: {
          apiTokens: {
            loadingStatus: 'loading',
            items: apiTokens,
          },
        },
      }
      organizationAdapter.updateOne(state, update)
    })
    .addCase(postApiToken.fulfilled, (state: OrganizationState, action) => {
      const apiTokens = state.entities[action.meta.arg.organizationId]?.apiTokens?.items || []

      const update: Update<OrganizationEntity> = {
        id: action.meta.arg.organizationId,
        changes: {
          apiTokens: {
            loadingStatus: 'loaded',
            items: [...apiTokens, action.payload],
          },
        },
      }
      organizationAdapter.updateOne(state, update)
      toast(ToastEnum.SUCCESS, 'Api token created')
    })
    .addCase(postApiToken.rejected, (state: OrganizationState, action) => {
      toastError(action.error)
    })

    .addCase(deleteApiToken.fulfilled, (state: OrganizationState, action) => {
      const credentials = state.entities[action.meta.arg.organizationId]?.apiTokens?.items || []
      const currentCredentials = credentials.filter((obj) => obj.id !== action.meta.arg.apiTokenId)

      const update: Update<OrganizationEntity> = {
        id: action.meta.arg.organizationId,
        changes: {
          apiTokens: {
            loadingStatus: 'loaded',
            items: currentCredentials,
          },
        },
      }

      organizationAdapter.updateOne(state, update)
      toast(ToastEnum.SUCCESS, 'Api token deleted')
    })
    .addCase(deleteApiToken.rejected, (state: OrganizationState, action) => {
      toastError(action.error)
    })
}
