import { createSelector, createSlice } from '@reduxjs/toolkit'
import { UserInterface } from '../interfaces'
import { RootState } from '@console/store/data'

export const USER_KEY = 'user'

export const initialUserState: UserInterface = {
  isLoading: false,
  isAuthenticated: false,
  token: null,
}

export const userSlice = createSlice({
  name: USER_KEY,
  initialState: initialUserState,
  reducers: {
    add(state, action) {
      return action.payload
    },
    remove() {
      return initialUserState
    },
  },
})

export const user = userSlice.reducer

export const userActions = userSlice.actions

export const getUserState = (rootState: RootState): UserInterface => rootState.ui[USER_KEY]

export const selectUser = createSelector(getUserState, (state) => state)
