import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { SignUp, SignUpRequest, UserSignUpApi } from 'qovery-typescript-axios'

export const USER_SIGNUP_KEY = 'userSignUp'

const userSignUpApi = new UserSignUpApi(undefined, '', axios)

export interface UserSignUpState {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error' | undefined
  error: string | null | undefined
  signup?: SignUp
}

export const fetchUserSignUp = createAsyncThunk<SignUp>('userSignUp/get', async () => {
  return await userSignUpApi.getUserSignUp().then((response) => response.data)
})

export const postUserSignUp = createAsyncThunk<any, SignUpRequest>(
  'userSignUp/post',
  async (data: SignUpRequest, { rejectWithValue }) => {
    try {
      const result = await userSignUpApi.createUserSignUp(data).then((response) => response)

      if (typeof result === 'object') {
        return data
      } else {
        return result
      }
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const initialUserSignUpState: UserSignUpState = {
  loadingStatus: 'not loaded',
  error: null,
}

export const userSignUpSlice = createSlice({
  name: USER_SIGNUP_KEY,
  initialState: initialUserSignUpState,
  reducers: {
    add(state, action) {
      return action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // get action
      .addCase(fetchUserSignUp.pending, (state: UserSignUpState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchUserSignUp.fulfilled, (state: UserSignUpState, action: PayloadAction<SignUp>) => {
        state.loadingStatus = 'loaded'
        state = { ...state, signup: action.payload }
      })
      .addCase(fetchUserSignUp.rejected, (state: UserSignUpState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      // post action
      .addCase(postUserSignUp.pending, (state: UserSignUpState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(postUserSignUp.fulfilled, (state: UserSignUpState, action: PayloadAction<SignUp>) => {
        state.loadingStatus = 'loaded'
        state = { ...state, signup: action.payload }
      })
      .addCase(postUserSignUp.rejected, (state: UserSignUpState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
  },
})

export const userSignUp = userSignUpSlice.reducer

export const userSignUpActions = userSignUpSlice.actions

export const getUserSignUpState = (rootState: any): UserSignUpState => rootState[USER_SIGNUP_KEY]

export const selectUserSignUp = createSelector(getUserSignUpState, (state) => state.signup)
export const selectUserLoadingStatus = createSelector(getUserSignUpState, (state) => state.loadingStatus)
