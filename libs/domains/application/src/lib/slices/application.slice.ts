import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Application, ApplicationMainCallsApi } from 'qovery-typescript-axios'

export const APPLICATION_FEATURE_KEY = 'application'

export interface ApplicationState {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error' | undefined
  error: string | null | undefined
  application: Application
}

const applicationApi = new ApplicationMainCallsApi()

export const fetchApplication = createAsyncThunk<any, { applicationId: string }>('application/fetch', async (data) => {
  const response = await applicationApi.getApplication(data.applicationId).then((response) => response.data)
  return response as Application
})

export const initialApplicationState: ApplicationState = {
  loadingStatus: 'not loaded',
  error: null,
  application: {
    id: '',
    created_at: '',
  },
}

export const applicationSlice = createSlice({
  name: APPLICATION_FEATURE_KEY,
  initialState: initialApplicationState,
  reducers: {
    add(state, action) {
      return action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplication.pending, (state: ApplicationState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchApplication.fulfilled, (state: ApplicationState, action: PayloadAction<Application>) => {
        state.application = action.payload
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchApplication.rejected, (state: ApplicationState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
  },
})

export const application = applicationSlice.reducer

export const applicationActions = applicationSlice.actions

export const getApplicationState = (rootState: any): ApplicationState => rootState[APPLICATION_FEATURE_KEY]

export const selectApplication = createSelector(getApplicationState, (state) => state.application)
