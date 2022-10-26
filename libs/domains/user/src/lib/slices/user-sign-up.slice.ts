import { PayloadAction, createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import { SignUp, SignUpRequest, TypeOfUseEnum, UserSignUpApi } from 'qovery-typescript-axios'
import { UserSignUpState } from '@qovery/shared/interfaces'

export const USER_SIGNUP_KEY = 'userSignUp'

const userSignUpApi = new UserSignUpApi()

export const fetchUserSignUp = createAsyncThunk<SignUp>('userSignUp/get', async () => {
  const response = await userSignUpApi.getUserSignUp()
  return response.data
})

export const postUserSignUp = createAsyncThunk<any, SignUpRequest>(
  'userSignUp/post',
  async (data: SignUpRequest, { rejectWithValue }) => {
    try {
      const result = await userSignUpApi.createUserSignUp(data)

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
  signup: {
    first_name: '',
    id: '',
    created_at: '',
    user_email: '',
    last_name: '',
    qovery_usage: '',
    type_of_use: TypeOfUseEnum.PERSONAL,
  },
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
        state.signup = action.payload
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
        state.signup = action.payload
      })
      .addCase(postUserSignUp.rejected, (state: UserSignUpState, action) => {
        state.loadingStatus = 'error'
        state.error = action.error.message
      })
  },
})

export const userSignUp = userSignUpSlice.reducer

export const userSignUpActions = userSignUpSlice.actions

export const getUserSignUpState = (rootState: any): UserSignUpState => {
  return rootState[USER_SIGNUP_KEY]
}

export const selectUserSignUp = createSelector(getUserSignUpState, (state) => state.signup)
export const selectUserLoadingStatus = createSelector(getUserSignUpState, (state) => state.loadingStatus)
