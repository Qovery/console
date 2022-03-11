import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'

export const USERSIGNUP_KEY = 'userSignUp'

export interface UserSignUpInterface {
  first_name?: string
  last_name?: string
  company_name?: string
  company_size?: string
  current_step?: string
  dx_auth?: false
  qovery_usage?: string
  type_of_use?: string
  user_email?: string
  user_questions?: string
  user_role?: string
}

export interface UserSignUpState extends UserSignUpInterface {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error'
  error: string | null | undefined
}

export const fetchUserSignUp = createAsyncThunk('userSignUp/get', async () => {
  const response = await axios.get('/admin/userSignUp').then((response) => response.data)
  return response.results
})

export const postUserSignUp = createAsyncThunk<any, UserSignUpInterface>('userSignUp/post', async (data) => {
  console.log(data)
  const response = await axios.post('/admin/userSignUp', data).then((response) => response.data)
  return response.results
})

export const initialUserSignUpState: UserSignUpState = {
  loadingStatus: 'not loaded',
  error: null,
}

export const userSignUpSlice = createSlice({
  name: USERSIGNUP_KEY,
  initialState: initialUserSignUpState,
  reducers: {
    add(state, action) {
      return action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserSignUp.pending, (state: UserSignUpState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchUserSignUp.fulfilled, (state: UserSignUpState, action: PayloadAction<UserSignUpInterface[]>) => {
        // initialUserSignUpState.add(state, action.payload)
        // state = action.payload
        console.log(action)
        state.loadingStatus = 'loaded'
      })
      .addCase(fetchUserSignUp.rejected, (state: UserSignUpState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      .addCase(postUserSignUp.fulfilled, (state: UserSignUpState, action: PayloadAction<UserSignUpInterface[]>) => {
        console.log(state)
        // state = action.payload
      })
  },
})

export const userSignUp = userSignUpSlice.reducer

export const userSignUpActions = userSignUpSlice.actions

export const getUserSignUpState = (rootState: any): UserSignUpState => rootState[USERSIGNUP_KEY]

export const selectUserSignUp = createSelector(getUserSignUpState, (state) => state)
