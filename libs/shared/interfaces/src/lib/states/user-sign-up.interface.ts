import { SignUp } from 'qovery-typescript-axios'

export interface UserSignUpState {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error' | undefined
  error: string | null | undefined
  signup: SignUp
}
