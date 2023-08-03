import { PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'
import {
  GitAuthProvider,
  GithubAppApi,
  OrganizationAccountGitRepositoriesApi,
  OrganizationGithubAppConnectRequest,
} from 'qovery-typescript-axios'
import { AuthProviderState, LoadingStatus } from '@qovery/shared/interfaces'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'
import { RootState } from '@qovery/store'

export const AUTH_PROVIDER_FEATURE_KEY = 'authProvider'

const authProviderApi = new OrganizationAccountGitRepositoriesApi()
const githubAppApi = new GithubAppApi()

export const authProviderAdapter = createEntityAdapter<GitAuthProvider>({
  selectId: (authProvider: GitAuthProvider) => `${authProvider.name}-${authProvider.id}`,
})

export const fetchAuthProvider = createAsyncThunk('authProvider/fetch', async (payload: { organizationId: string }) => {
  const response = await authProviderApi.getOrganizationGitProviderAccount(payload.organizationId)
  return response.data as GitAuthProvider[]
})

export const connectGithubApp = createAsyncThunk(
  'authProvider/connectGithubApp',
  async (payload: { organizationId: string; appConnectRequest: OrganizationGithubAppConnectRequest }) => {
    const response = await githubAppApi.organizationGithubAppConnect(payload.organizationId, payload.appConnectRequest)
    return response.data
  }
)
export const disconnectGithubApp = createAsyncThunk(
  'authProvider/disconnectGithubApp',
  async (payload: { organizationId: string; force?: boolean }) => {
    const response = await githubAppApi.organizationGithubAppDisconnect(payload.organizationId, payload.force)
    return response.data
  }
)

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
      .addCase(disconnectGithubApp.fulfilled, () => {
        toast(ToastEnum.SUCCESS, `Github App disconnected successfully`)
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
