// import {
//   type PayloadAction,
//   createAsyncThunk,
//   createEntityAdapter,
//   createSelector,
//   createSlice,
// } from '@reduxjs/toolkit'
// import {
//   type GitAuthProvider,
//   GithubAppApi,
//   type OrganizationGithubAppConnectRequest,
// } from 'qovery-typescript-axios'
// import { type AuthProviderState, type LoadingStatus } from '@qovery/shared/interfaces'
// import { toastError } from '@qovery/shared/ui'
// import { type RootState } from '@qovery/state/store'

// export const AUTH_PROVIDER_FEATURE_KEY = 'authProvider'

// const githubAppApi = new GithubAppApi()

// export const connectGithubApp = createAsyncThunk(
//   'authProvider/connectGithubApp',
//   async (payload: { organizationId: string; appConnectRequest: OrganizationGithubAppConnectRequest }) => {
//     const response = await githubAppApi.organizationGithubAppConnect(payload.organizationId, payload.appConnectRequest)
//     return response.data
//   }
// )

// export const initialAuthProviderState: AuthProviderState = authProviderAdapter.getInitialState({
//   loadingStatus: 'not loaded',
//   error: null,
// })

// export const authProviderSlice = createSlice({
//   name: AUTH_PROVIDER_FEATURE_KEY,
//   initialState: initialAuthProviderState,
//   reducers: {
//     add: authProviderAdapter.addOne,
//     remove: authProviderAdapter.removeOne,
//   },
//   extraReducers: (builder) => {
//     builder
//       // fetch auth provider
//       .addCase(fetchAuthProvider.pending, (state: AuthProviderState) => {
//         state.loadingStatus = 'loading'
//       })
//       .addCase(fetchAuthProvider.fulfilled, (state: AuthProviderState, action: PayloadAction<GitAuthProvider[]>) => {
//         authProviderAdapter.setAll(state, action.payload)
//         state.loadingStatus = 'loaded'
//       })
//       .addCase(fetchAuthProvider.rejected, (state: AuthProviderState, action) => {
//         state.loadingStatus = 'error'
//         state.error = action.error.message
//         toastError(action.error)
//       })
//   },
// })

// export const authProviderReducer = authProviderSlice.reducer

// export const authProviderActions = authProviderSlice.actions

// const { selectAll, selectEntities } = authProviderAdapter.getSelectors()

// export const getAuthProviderState = (rootState: RootState): AuthProviderState =>
//   rootState.organization[AUTH_PROVIDER_FEATURE_KEY]

// export const selectAllAuthProvider = createSelector(getAuthProviderState, selectAll)

// export const selectAuthProviderEntities = createSelector(getAuthProviderState, selectEntities)

// export const authProviderLoadingStatus = (state: RootState): LoadingStatus => getAuthProviderState(state).loadingStatus
