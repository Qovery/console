import { Auth0Provider, type User, useAuth0 } from '@auth0/auth0-react'
import { createContext, useContext } from 'react'
import { OAUTH_AUDIENCE, OAUTH_DOMAIN, OAUTH_KEY } from '@qovery/shared/util-node-env'

export interface Auth0ContextType {
  isAuthenticated: boolean
  user: User | undefined
  login: () => void
  logout: () => void
  isLoading: boolean
}

const Auth0Context = createContext<Auth0ContextType | undefined>(undefined)

export function Auth0Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <Auth0Provider
      domain={OAUTH_DOMAIN}
      clientId={OAUTH_KEY}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/login/auth0-callback`,
        audience: OAUTH_AUDIENCE,
      }}
      useRefreshTokensFallback={true}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      skipRedirectCallback={window.location.pathname !== '/login/auth0-callback'}
    >
      <Auth0ContextProvider>{children}</Auth0ContextProvider>
    </Auth0Provider>
  )
}

function Auth0ContextProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, loginWithRedirect, logout, isLoading } = useAuth0()

  const contextValue = {
    isAuthenticated,
    user,
    login: loginWithRedirect,
    logout: () => logout({ logoutParams: { returnTo: window.location.origin } }),
    isLoading,
  }

  return <Auth0Context.Provider value={contextValue}>{children}</Auth0Context.Provider>
}

export function useAuth0Context() {
  const context = useContext(Auth0Context)
  if (context === undefined) {
    throw new Error('useAuth0Context must be used within Auth0Wrapper')
  }
  return context
}
