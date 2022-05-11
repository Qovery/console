import { User } from '@auth0/auth0-spa-js'

export interface UserInterface extends User {
  name?: string
  email?: string
  sub?: string
  picture?: string
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
