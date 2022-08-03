import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '@console/store/data'

export const ENVIRONMENT_VARIABLE_UI_FEATURE_KEY = 'environmentVariable'

export interface EnvironmentVariableUi {
  showAll: boolean
}

export const initialEnvironmentVariableUiState: EnvironmentVariableUi = {
  showAll: false,
}

export const environmentVariableUiSlice = createSlice({
  name: ENVIRONMENT_VARIABLE_UI_FEATURE_KEY,
  initialState: initialEnvironmentVariableUiState,
  reducers: {
    toggleShowAll: (state, action: { payload: boolean }) => {
      state.showAll = action.payload
    },
  },
})

export const environmentVariableUi = environmentVariableUiSlice.reducer

export const environmentVariableUiActions = environmentVariableUiSlice.actions

export const getEnvironmentVariableUiState = (rootState: RootState): EnvironmentVariableUi =>
  rootState.ui[ENVIRONMENT_VARIABLE_UI_FEATURE_KEY]
