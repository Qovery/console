import { Auth0Provider } from '@auth0/auth0-react'
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip'
import { QueryClientProvider } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'
import { IntercomProvider } from 'react-use-intercom'
import { LOGIN_AUTH_REDIRECT_URL, LOGIN_URL } from '@qovery/shared/routes'
import { ModalProvider, ToastBehavior } from '@qovery/shared/ui'
import App from './app/app'
import { environment } from './environments/environment'
import { queryClient } from './query-client'

// posthog init
posthog.init(environment.posthog, {
  api_host: environment.posthog_apihost,
})

const container = document.getElementById('root') || document.createElement('div')
const root = createRoot(container)

root.render(
  <StrictMode>
    <IntercomProvider appId={environment.intercom} autoBoot>
      <Auth0Provider
        domain={environment.oauth_domain}
        clientId={environment.oauth_key}
        redirectUri={`${window.location.origin}${LOGIN_URL}${LOGIN_AUTH_REDIRECT_URL}`}
        audience={environment.oauth_audience}
        useRefreshTokens={true}
        cacheLocation="localstorage"
        skipRedirectCallback={window.location.pathname !== LOGIN_URL + LOGIN_AUTH_REDIRECT_URL}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <TooltipProvider>
              <ModalProvider>
                <App />
                <ToastBehavior />
              </ModalProvider>
            </TooltipProvider>
          </BrowserRouter>
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </QueryClientProvider>
      </Auth0Provider>
    </IntercomProvider>
  </StrictMode>
)
