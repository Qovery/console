import * as ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import { Toaster } from 'react-hot-toast'
import { Provider } from 'react-redux'
import { IntercomProvider } from 'react-use-intercom'
import { AppState, Auth0Provider } from '@auth0/auth0-react'
import { createBrowserHistory } from 'history'
import { user, userSignUp } from '@console/domains/user'
import { organization } from '@console/domains/organization'
import { projects } from '@console/domains/projects'
import posthog from 'posthog-js'
// import LogRocket from 'logrocket'
import { environment } from './environments/environment'
import App from './app/app'
import './styles.scss'

const OAUTH_CALLBACK = '/login/auth0-callback'

export const history = createBrowserHistory()

const onRedirectCallback = (appState: AppState) => {
  // use the router's history module to replace the url
  history.replace(appState?.returnTo || window.location.pathname)
}

const reducers = combineReducers({
  user: user,
  userSignUp: userSignUp,
  organization: organization,
  projects: projects,
})

export const store = configureStore({
  reducer: reducers,
})

if (environment.production === 'production') {
  // init posthug
  posthog.init(environment.posthog, {
    api_host: environment.posthog_apihost,
  })

  // init logrocket
  // LogRocket.init(environment.logrocket)
}

ReactDOM.render(
  <IntercomProvider appId={environment.intercom} autoBoot={environment.production === 'production'}>
    <Auth0Provider
      domain={environment.oauth_domain}
      clientId={environment.oauth_key}
      redirectUri={`${window.location.origin}${OAUTH_CALLBACK}`}
      audience={environment.oauth_audience}
      useRefreshTokens={true}
      onRedirectCallback={onRedirectCallback}
      cacheLocation={'localstorage'}
    >
      <Provider store={store}>
        <BrowserRouter>
          <App />
          <Toaster position="bottom-right" />
        </BrowserRouter>
      </Provider>
    </Auth0Provider>
  </IntercomProvider>,
  document.getElementById('root')
)
