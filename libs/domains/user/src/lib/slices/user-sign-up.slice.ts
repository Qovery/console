import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'

export const USERSIGNUP_KEY = 'userSignUp'

export interface UserSignUpInterface {
  first_name?: string
  last_name?: string
  company_name?: string
  company_size?: string
  current_step?: string
  dx_auth?: boolean
  qovery_usage?: string
  type_of_use?: string
  user_email?: string
  user_questions?: string
  user_role?: string
}

export interface UserSignUpState extends UserSignUpInterface {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error' | undefined
  error: string | null | undefined
}

export const Adapter = createEntityAdapter<UserSignUpInterface>()

export const fetchUserSignUp = createAsyncThunk('userSignUp/get', async () => {
  const response = await axios.get('/admin/userSignUp').then((response) => response.data)
  return response
})

export const postUserSignUp = createAsyncThunk<any, UserSignUpState>(
  'userSignUp/post',
  async (data: UserSignUpState) => {
    // remove useless field for post request
    delete data['error']
    delete data['loadingStatus']

    await axios.post('/admin/userSignUp', data).then((response) => response)
    return data
  }
)

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
      // get action
      .addCase(fetchUserSignUp.pending, (state: UserSignUpState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(fetchUserSignUp.fulfilled, (state: UserSignUpState, action: PayloadAction<UserSignUpInterface>) => {
        state.loadingStatus = 'loaded'
        state = Object.assign(state, action.payload)
      })
      .addCase(fetchUserSignUp.rejected, (state: UserSignUpState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
      // post action
      .addCase(postUserSignUp.pending, (state: UserSignUpState) => {
        state.loadingStatus = 'loading'
      })
      .addCase(postUserSignUp.fulfilled, (state: UserSignUpState, action: PayloadAction<UserSignUpInterface>) => {
        state.loadingStatus = 'loaded'
        state = Object.assign(state, action.payload)
      })
      .addCase(postUserSignUp.rejected, (state: UserSignUpState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
  },
})

export const userSignUp = userSignUpSlice.reducer

export const userSignUpActions = userSignUpSlice.actions

export const getUserSignUpState = (rootState: any): UserSignUpState => rootState[USERSIGNUP_KEY]

export const selectUserSignUp = createSelector(getUserSignUpState, (state) => state)
