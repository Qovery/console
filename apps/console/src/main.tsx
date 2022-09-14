import { AppState, Auth0Provider } from '@auth0/auth0-react'
import { createBrowserHistory } from 'history'
import posthog from 'posthog-js'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { IntercomProvider } from 'react-use-intercom'
import { LOGIN_AUTH_REDIRECT_URL, LOGIN_URL } from '@qovery/shared/router'
import { ModalProvider, ToastBehavior } from '@qovery/shared/ui'
import { store } from '@qovery/store/data'
import App from './app/app'
import { environment } from './environments/environment'

export const history = createBrowserHistory()

// posthog init
posthog.init(environment.posthog, {
  api_host: environment.posthog_apihost,
})

const onRedirectCallback = (appState: AppState | undefined) => {
  // use the router's history module to replace the url
  //history.replace(appState?.returnTo || window.location.pathname)
}

const container = document.getElementById('root') || document.createElement('div')
const root = createRoot(container)

root.render(
  // <IntercomProvider appId={environment.intercom} autoBoot={process.env['NODE_ENV'] === 'production'
  <IntercomProvider appId={environment.intercom} autoBoot>
    <Auth0Provider
      domain={environment.oauth_domain}
      clientId={environment.oauth_key}
      redirectUri={`${window.location.origin}${LOGIN_URL}${LOGIN_AUTH_REDIRECT_URL}`}
      audience={environment.oauth_audience}
      useRefreshTokens={true}
      onRedirectCallback={onRedirectCallback}
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
