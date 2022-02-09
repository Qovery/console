import * as ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { AppState, Auth0Provider } from '@auth0/auth0-react'
import { createBrowserHistory } from 'history'
import { user } from '@console/domains/user'
import { organizations } from '@console/domains/organizations'
import { environment } from './environments/environment.prod'
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
  organizations: organizations,
})

export const store = configureStore({
  reducer: reducers,
})

ReactDOM.render(
  <Auth0Provider
    domain={environment.oauth_domain}
    clientId={environment.oauth_key}
    redirectUri={`${window.location.origin}${OAUTH_CALLBACK}`}
    audience={environment.oauth_audience}
    useRefreshTokens={true}
    onRedirectCallback={onRedirectCallback}
  >
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </Auth0Provider>,
  document.getElementById('root')
)
