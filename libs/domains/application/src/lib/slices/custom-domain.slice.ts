import { createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'
import { CustomDomain, CustomDomainApi } from 'qovery-typescript-axios'
import { CustomDomainsState } from '@console/shared/interfaces'
import { addOneToManyRelation, getEntitiesByIds } from '@console/shared/utils'
import { RootState } from '@console/store/data'

export const CUSTOM_DOMAIN_FEATURE_KEY = 'customDomains'

export const customDomainAdapter = createEntityAdapter<CustomDomain>()

const customDomainApi = new CustomDomainApi()

export const fetchCustomDomains = createAsyncThunk(
  'customDomains/fetch',
  async (payload: { applicationId: string }, thunkAPI) => {
    const response = await customDomainApi.listApplicationCustomDomain(payload.applicationId)
    return response.data.results as CustomDomain[]
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
        console.log(action.payload)
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
  },
})

/*
 * Export reducer for store configuration.
 */
export const customDomainReducer = customDomainSlice.reducer

export const customDomainActions = customDomainSlice.actions

const { selectAll, selectEntities } = customDomainAdapter.getSelectors()

export const getCustomDomainsState = (rootState: RootState): CustomDomainsState =>
  rootState.entities.application[CUSTOM_DOMAIN_FEATURE_KEY]

export const selectAllCustomDomain = createSelector(getCustomDomainsState, selectAll)

export const selectCustomDomainEntities = createSelector(getCustomDomainsState, selectEntities)

export const selectCustomDomainsByApplicationId = (state: RootState, applicationId: string): CustomDomain[] => {
  const customDomainsState = getCustomDomainsState(state)
  return getEntitiesByIds<CustomDomain>(
    customDomainsState.entities,
    customDomainsState?.joinApplicationCustomDomain[applicationId]
  )
}
