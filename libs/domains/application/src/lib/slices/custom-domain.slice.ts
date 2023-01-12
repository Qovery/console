import { createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'
import { ContainerCustomDomainApi, CustomDomain, CustomDomainApi } from 'qovery-typescript-axios'
import { ServiceTypeEnum, isContainer } from '@qovery/shared/enums'
import { CustomDomainsState } from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import { addOneToManyRelation, getEntitiesByIds, removeOneToManyRelation } from '@qovery/shared/utils'
import { RootState } from '@qovery/store'

export const CUSTOM_DOMAIN_FEATURE_KEY = 'customDomains'

export const customDomainAdapter = createEntityAdapter<CustomDomain>()

const customDomainApplicationApi = new CustomDomainApi()
const customDomainContainerApi = new ContainerCustomDomainApi()

export const fetchCustomDomains = createAsyncThunk(
  'customDomains/fetch',
  async (payload: { applicationId: string; serviceType: ServiceTypeEnum }) => {
    let response
    if (isContainer(payload.serviceType)) {
      response = await customDomainContainerApi.listContainerCustomDomain(payload.applicationId)
    } else {
      response = await customDomainApplicationApi.listApplicationCustomDomain(payload.applicationId)
    }

    return response.data.results as CustomDomain[]
  }
)

export const createCustomDomain = createAsyncThunk(
  'customDomains/create',
  async (payload: {
    applicationId: string
    domain: string
    serviceType: ServiceTypeEnum
    toasterCallback: () => void
  }) => {
    let response
    if (isContainer(payload.serviceType)) {
      response = await customDomainContainerApi.createContainerCustomDomain(payload.applicationId, {
        domain: payload.domain,
      })
    } else {
      response = await customDomainApplicationApi.createApplicationCustomDomain(payload.applicationId, {
        domain: payload.domain,
      })
    }

    return response.data as CustomDomain
  }
)

export const editCustomDomain = createAsyncThunk(
  'customDomains/edit',
  async (payload: {
    applicationId: string
    domain: string
    customDomain: CustomDomain
    serviceType: ServiceTypeEnum
    toasterCallback: () => void
  }) => {
    let response
    if (isContainer(payload.serviceType)) {
      response = await customDomainContainerApi.editContainerCustomDomain(
        payload.applicationId,
        payload.customDomain.id,
        {
          domain: payload.domain,
        }
      )
    } else {
      response = await customDomainApplicationApi.editCustomDomain(payload.applicationId, payload.customDomain.id, {
        domain: payload.domain,
      })
    }

    return response.data as CustomDomain
  }
)

export const deleteCustomDomain = createAsyncThunk(
  'customDomains/delete',
  async (payload: { applicationId: string; customDomain: CustomDomain; serviceType: ServiceTypeEnum }) => {
    if (isContainer(payload.serviceType)) {
      return await customDomainContainerApi.deleteContainerCustomDomain(payload.applicationId, payload.customDomain.id)
    } else {
      return await customDomainApplicationApi.deleteCustomDomain(payload.applicationId, payload.customDomain.id)
    }
  }
)

export const initialCustomDomainState: CustomDomainsState = customDomainAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
  joinApplicationCustomDomain: {},
})

export const customDomainSlice = createSlice({
  name: CUSTOM_DOMAIN_FEATURE_KEY,
  initialState: initialCustomDomainState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomDomains.pending, (state: CustomDomainsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchCustomDomains.fulfilled, (state: CustomDomainsState, action) => {
        customDomainAdapter.upsertMany(state, action.payload)
        action.payload.forEach((customDomain: CustomDomain) => {
          state.joinApplicationCustomDomain = addOneToManyRelation(action.meta.arg.applicationId, customDomain.id, {
            ...state.joinApplicationCustomDomain,
          })
        })
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchCustomDomains.rejected, (state: CustomDomainsState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      .addCase(createCustomDomain.pending, (state: CustomDomainsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(createCustomDomain.fulfilled, (state: CustomDomainsState, action) => {
        customDomainAdapter.upsertOne(state, action.payload)

        state.joinApplicationCustomDomain = addOneToManyRelation(action.meta.arg.applicationId, action.payload.id, {
          ...state.joinApplicationCustomDomain,
        })

        state.loadingStatus = 'loaded'
        state.error = null
        toast(
          ToastEnum.SUCCESS,
          `Your domain has been created`,
          'Application must be redeployed to apply the settings update',
          action.meta.arg.toasterCallback,
          undefined,
          'Redeploy'
        )
      })
      .addCase(createCustomDomain.rejected, (state: CustomDomainsState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
        toastError(action.error)
      })
      .addCase(editCustomDomain.pending, (state: CustomDomainsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(editCustomDomain.fulfilled, (state: CustomDomainsState, action) => {
        customDomainAdapter.upsertOne(state, action.payload)

        state.loadingStatus = 'loaded'
        state.error = null
        toast(
          ToastEnum.SUCCESS,
          `Your domain has been updated`,
          'Application must be redeployed to apply the settings update',
          action.meta.arg.toasterCallback,
          undefined,
          'Redeploy'
        )
      })
      .addCase(editCustomDomain.rejected, (state: CustomDomainsState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
        toastError(action.error)
      })
      .addCase(deleteCustomDomain.pending, (state: CustomDomainsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(deleteCustomDomain.fulfilled, (state: CustomDomainsState, action) => {
        customDomainAdapter.removeOne(state, action.meta.arg.customDomain.id)
        state.joinApplicationCustomDomain = removeOneToManyRelation(action.meta.arg.customDomain.id, {
          ...state.joinApplicationCustomDomain,
        })
        state.loadingStatus = 'loaded'
        state.error = null
        toast(ToastEnum.SUCCESS, `Your domain has been deleted`)
      })
      .addCase(deleteCustomDomain.rejected, (state: CustomDomainsState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
        toastError(action.error)
      })
  },
})

/*
 * Export reducer for store configuration.
 */
export const customDomainReducer = customDomainSlice.reducer

export const customDomainActions = customDomainSlice.actions

const { selectAll, selectEntities } = customDomainAdapter.getSelectors()

export const getCustomDomainsState = (rootState: RootState): CustomDomainsState =>
  rootState.application[CUSTOM_DOMAIN_FEATURE_KEY]

export const selectAllCustomDomain = createSelector(getCustomDomainsState, selectAll)

export const selectCustomDomainEntities = createSelector(getCustomDomainsState, selectEntities)

export const selectCustomDomainsByApplicationId = (state: RootState, applicationId: string): CustomDomain[] => {
  const customDomainsState = getCustomDomainsState(state)
  return getEntitiesByIds<CustomDomain>(
    customDomainsState.entities,
    customDomainsState?.joinApplicationCustomDomain[applicationId]
  )
}
