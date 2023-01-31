import { PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'
import { GitAuthProvider, OrganizationAccountGitRepositoriesApi } from 'qovery-typescript-axios'
import { AuthProviderState, LoadingStatus } from '@qovery/shared/interfaces'
import { toastError } from '@qovery/shared/ui'
import { RootState } from '@qovery/store'

export const AUTH_PROVIDER_FEATURE_KEY = 'authProvider'

const authProviderApi = new OrganizationAccountGitRepositoriesApi()

export const authProviderAdapter = createEntityAdapter<GitAuthProvider>()

export const fetchAuthProvider = createAsyncThunk('authProvider/fetch', async (payload: { organizationId: string }) => {
  const response = await authProviderApi.getOrganizationGitProviderAccount(payload.organizationId)
  return response.data as GitAuthProvider[]
})

export const initialAuthProviderState: AuthProviderState = authProviderAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
})

export const authProviderSlice = createSlice({
  name: AUTH_PROVIDER_FEATURE_KEY,
  initialState: initialAuthProviderState,
  reducers: {
    add: authProviderAdapter.addOne,
    remove: authProviderAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthProvider.pending, (state: AuthProviderState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchAuthProvider.fulfilled, (state: AuthProviderState, action: PayloadAction<GitAuthProvider[]>) => {
        authProviderAdapter.setAll(state, action.payload)
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchAuthProvider.rejected, (state: AuthProviderState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
        toastError(action.error)
      })
  },
})

export const authProviderReducer = authProviderSlice.reducer

export const authProviderActions = authProviderSlice.actions

const { selectAll, selectEntities } = authProviderAdapter.getSelectors()

export const getAuthProviderState = (rootState: RootState): AuthProviderState =>
  rootState.organization[AUTH_PROVIDER_FEATURE_KEY]

export const selectAllAuthProvider = createSelector(getAuthProviderState, selectAll)

export const selectAuthProviderEntities = createSelector(getAuthProviderState, selectEntities)

export const authProviderLoadingStatus = (state: RootState): LoadingStatus => getAuthProviderState(state).loadingStatus
