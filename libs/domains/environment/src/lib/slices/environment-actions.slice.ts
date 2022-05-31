import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit'
import { EnvironmentActionsApi } from 'qovery-typescript-axios'
// import { addOneToManyRelation, getEntitiesByIds } from '@console/shared/utils'
// import { RootState } from '@console/store/data'

export const ENVIRONMENT_ACTIONS_FEATURE_KEY = 'environmentActions'

const environmentActionApi = new EnvironmentActionsApi()

export interface EnvironmentActionsEntity {
  id: number
}

export interface EnvironmentActionsState extends EntityState<EnvironmentActionsEntity> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error'
  error: string | undefined | null
}

export const environmentActionsAdapter = createEntityAdapter<EnvironmentActionsEntity>()

export const postEnvironmentActionsRestart = createAsyncThunk<any, { environmentId: string }>(
  'environmentActions/restart',
  async (data, thunkAPI) => {
    const response = await environmentActionApi.restartEnvironment(data.environmentId).then((response) => response.data)
    console.log(response)

    // return Promise.resolve([])
  }
)

export const initialEnvironmentActionsState: EnvironmentActionsState = environmentActionsAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
})

export const environmentActionsSlice = createSlice({
  name: ENVIRONMENT_ACTIONS_FEATURE_KEY,
  initialState: initialEnvironmentActionsState,
  reducers: {
    add: environmentActionsAdapter.addOne,
    remove: environmentActionsAdapter.removeOne,
    // ...
  },
  extraReducers: (builder) => {
    builder
      .addCase(postEnvironmentActionsRestart.pending, (state: EnvironmentActionsState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(
        postEnvironmentActionsRestart.fulfilled,
        (state: EnvironmentActionsState, action: PayloadAction<EnvironmentActionsEntity[]>) => {
          environmentActionsAdapter.setAll(state, action.payload)
          state.loadingStatus = 'loaded'
        }
      )
      .addCase(postEnvironmentActionsRestart.rejected, (state: EnvironmentActionsState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
  },
})

/*
 * Export reducer for store configuration.
 */
export const environmentActionsReducer = environmentActionsSlice.reducer

/*
 * Export action creators to be dispatched. For use with the `useDispatch` hook.
 *
 * e.g.
 * ```
 * import React, { useEffect } from 'react';
 * import { useDispatch } from 'react-redux';
 *
 * // ...
 *
 * const dispatch = useDispatch();
 * useEffect(() => {
 *   dispatch(environmentActionsActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const environmentActionsActions = environmentActionsSlice.actions

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
 *
 * // ...
 *
 * const entities = useSelector(selectAllEnvironmentActions);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectAll, selectEntities } = environmentActionsAdapter.getSelectors()

// export const getEnvironmentActionsState = (rootState: RootState): EnvironmentActionsState =>
//   rootState[ENVIRONMENT_ACTIONS_FEATURE_KEY]

// export const selectAllEnvironmentActions = createSelector(getEnvironmentActionsState, selectAll)

// export const selectEnvironmentActionsEntities = createSelector(getEnvironmentActionsState, selectEntities)
