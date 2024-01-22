import { Auth0Provider } from '@auth0/auth0-react'
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip'
import { QueryClientProvider } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { FlatProviders, makeProvider } from 'react-flat-providers'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'
import { IntercomProvider } from 'react-use-intercom'
import { InstantSearchProvider } from '@qovery/shared/assistant/feature'
import { LOGIN_AUTH_REDIRECT_URL, LOGIN_URL } from '@qovery/shared/routes'
import { ModalProvider, ToastBehavior } from '@qovery/shared/ui'
import {
  INTERCOM,
  OAUTH_AUDIENCE,
  OAUTH_DOMAIN,
  OAUTH_KEY,
  POSTHOG,
  POSTHOG_APIHOST,
} from '@qovery/shared/util-node-env'
import App from './app/app'
import { queryClient } from './query-client'

// posthog init
posthog.init(POSTHOG, {
  api_host: POSTHOG_APIHOST,
})

const container = document.getElementById('root') || document.createElement('div')
const root = createRoot(container)

root.render(
  <StrictMode>
    <FlatProviders
      providers={[
        makeProvider(IntercomProvider, { appId: INTERCOM, autoBoot: true }),
        makeProvider(Auth0Provider, {
          domain: OAUTH_DOMAIN,
          clientId: OAUTH_KEY,
          authorizationParams: {
            redirect_uri: `${window.location.origin}${LOGIN_URL}${LOGIN_AUTH_REDIRECT_URL}`,
            audience: OAUTH_AUDIENCE,
          },
          useRefreshTokensFallback: true,
          useRefreshTokens: true,
          cacheLocation: 'localstorage',
          skipRedirectCallback: window.location.pathname !== LOGIN_URL + LOGIN_AUTH_REDIRECT_URL,
        }),
        makeProvider(QueryClientProvider, { client: queryClient }),
        InstantSearchProvider,
      ]}
    >
      <BrowserRouter>
        <TooltipProvider>
          <ModalProvider>
            <App />
            <ToastBehavior />
          </ModalProvider>
        </TooltipProvider>
      </BrowserRouter>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </FlatProviders>
  </StrictMode>
)
