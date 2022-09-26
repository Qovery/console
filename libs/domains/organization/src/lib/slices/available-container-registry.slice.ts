import { PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'
import { AvailableContainerRegistryResponse, ContainerRegistriesApi } from 'qovery-typescript-axios'
import { AvailableContainerRegistryState } from '@qovery/shared/interfaces'
import { RootState } from '@qovery/store/data'

export const AVAILABLE_CONTAINER_REGISTRY_FEATURE_KEY = 'availableContainerRegistry'

export const availableContainerRegistryAdapter = createEntityAdapter<AvailableContainerRegistryResponse>()

const containerRegistriesApi = new ContainerRegistriesApi()

export const fetchAvailableContainerRegistry = createAsyncThunk('availableContainerRegistry/fetch', async () => {
  // fetch container registries
  const result = (await containerRegistriesApi.listAvailableContainerRegistry()) as any
  return result.data.results as AvailableContainerRegistryResponse[]
})

export const editAvailableContainerRegistry = createAsyncThunk('availableContainerRegistry/edit', async () => {
  // fetch container registries
  // const result = (await containerRegistriesApi.editContainerRegistry)
  // return result.data.results as AvailableContainerRegistryResponse[]
})

export const initialAvailableContainerRegistryState: AvailableContainerRegistryState = {
  loadingStatus: 'not loaded',
  error: null,
  items: [],
}

export const availableContainerRegistrySlice = createSlice({
  name: AVAILABLE_CONTAINER_REGISTRY_FEATURE_KEY,
  initialState: initialAvailableContainerRegistryState,
  reducers: {
    add(state, action) {
      return action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableContainerRegistry.pending, (state: AvailableContainerRegistryState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(
        fetchAvailableContainerRegistry.fulfilled,
        (state: AvailableContainerRegistryState, action: PayloadAction<AvailableContainerRegistryResponse[]>) => {
          state.loadingStatus = 'loaded'
          state.items = action.payload
        }
      )
      .addCase(fetchAvailableContainerRegistry.rejected, (state: AvailableContainerRegistryState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
  },
})

export const availableContainerRegistryReducer = availableContainerRegistrySlice.reducer

export const availableContainerRegistryActions = availableContainerRegistrySlice.actions

export const getAvailableContainerRegistryState = (rootState: RootState): AvailableContainerRegistryState =>
  rootState.entities.organization[AVAILABLE_CONTAINER_REGISTRY_FEATURE_KEY]

export const selectAvailableContainerRegistry = createSelector(
  getAvailableContainerRegistryState,
  (state) => state.items
)

export const selectAvailableContainerRegistryLoadingStatus = createSelector(
  getAvailableContainerRegistryState,
  (state) => state.loadingStatus
)
