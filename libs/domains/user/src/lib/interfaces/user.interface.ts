import { User } from '@auth0/auth0-spa-js'

export interface UserInterface extends User {
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
