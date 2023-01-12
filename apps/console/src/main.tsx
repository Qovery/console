import { Auth0Provider } from '@auth0/auth0-react'
import posthog from 'posthog-js'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { IntercomProvider } from 'react-use-intercom'
import { LOGIN_AUTH_REDIRECT_URL, LOGIN_URL } from '@qovery/shared/routes'
import { ModalProvider, ToastBehavior } from '@qovery/shared/ui'
import { store } from '@qovery/store'
import App from './app/app'
import { environment } from './environments/environment'

// posthog init
posthog.init(environment.posthog, {
  api_host: environment.posthog_apihost,
})

const container = document.getElementById('root') || document.createElement('div')
const root = createRoot(container)

root.render(
  <IntercomProvider appId={environment.intercom} autoBoot>
    <Auth0Provider
      domain={environment.oauth_domain}
      clientId={environment.oauth_key}
      redirectUri={`${window.location.origin}${LOGIN_URL}${LOGIN_AUTH_REDIRECT_URL}`}
      audience={environment.oauth_audience}
      useRefreshTokens={true}
      cacheLocation={'localstorage'}
    >
      <Provider store={store}>
        <BrowserRouter>
          <ModalProvider>
            <App />
            <ToastBehavior />
          </ModalProvider>
        </BrowserRouter>
      </Provider>
    </Auth0Provider>
  </IntercomProvider>
)
