import { SignUp } from 'qovery-typescript-axios'
import { DefaultUiState } from './default-ui-state.interface'

export interface UserSignUpState extends DefaultUiState {
  signup: SignUp
}
