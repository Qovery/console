import { createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'
import {
  ContainerCustomDomainApi,
  type CustomDomain,
  CustomDomainApi,
  type CustomDomainRequest,
} from 'qovery-typescript-axios'
import { type ServiceTypeEnum, isContainer } from '@qovery/shared/enums'
import { type CustomDomainsState } from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import { getEntitiesByIds } from '@qovery/shared/util-js'
import { type RootState } from '@qovery/state/store'

export const CUSTOM_DOMAIN_FEATURE_KEY = 'customDomains'

export const customDomainAdapter = createEntityAdapter<CustomDomain>()

const customDomainApplicationApi = new CustomDomainApi()
const customDomainContainerApi = new ContainerCustomDomainApi()

export const editCustomDomain = createAsyncThunk(
  'customDomains/edit',
  async (payload: {
    applicationId: string
    id: string
    data: CustomDomainRequest
    serviceType: ServiceTypeEnum
    toasterCallback: () => void
  }) => {
    let response
    if (isContainer(payload.serviceType)) {
      response = await customDomainContainerApi.editContainerCustomDomain(
        payload.applicationId,
        payload.id,
        payload.data
      )
    } else {
      response = await customDomainApplicationApi.editCustomDomain(payload.applicationId, payload.id, payload.data)
    }

    return response.data as CustomDomain
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
