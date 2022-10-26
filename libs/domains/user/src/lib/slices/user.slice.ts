import { createSelector, createSlice } from '@reduxjs/toolkit'
import { RootState } from '@qovery/store'
import { UserInterface } from '../interfaces'

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

export const getUserState = (rootState: RootState): UserInterface => rootState[USER_KEY]

export const selectUser = createSelector(getUserState, (state) => state)
