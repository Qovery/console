import { type SignUp } from 'qovery-typescript-axios'
import { type DefaultUiState } from './default-ui-state.interface'

export interface UserSignUpState extends DefaultUiState {
  signup: SignUp
}
