import { Auth0Provider } from '@auth0/auth0-react'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { createRoot } from 'react-dom/client'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { IntercomProvider } from 'react-use-intercom'
import { LOGIN_AUTH_REDIRECT_URL, LOGIN_URL } from '@qovery/shared/routes'
import { ModalProvider, ToastBehavior, toastError } from '@qovery/shared/ui'
import { ToastEnum, toast } from '@qovery/shared/ui'
import { setupStore } from '@qovery/state/store'
import App from './app/app'
import { environment } from './environments/environment'

interface Meta {
  notifyOnSuccess?: boolean | { title: string; description?: string }
  notifyOnError?: boolean | { title: string; description?: string }
}

declare module '@tanstack/react-query' {
  interface MutationMeta extends Meta {}
  interface QueryMeta extends Meta {}
}

// posthog init
posthog.init(environment.posthog, {
  api_host: environment.posthog_apihost,
})

const container = document.getElementById('root') || document.createElement('div')
const root = createRoot(container)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
    },
  },
  mutationCache: new MutationCache({
    onSuccess(data, _variables, _context, mutation) {
      if (mutation.meta?.notifyOnSuccess) {
        if (mutation.meta.notifyOnSuccess === true) {
          toast(ToastEnum.SUCCESS, JSON.stringify(data))
        } else {
          toast(ToastEnum.SUCCESS, mutation.meta.notifyOnSuccess.title, mutation.meta.notifyOnSuccess.description)
        }
      }
    },
    onError(error, _variables, _context, mutation) {
      if (mutation.meta?.notifyOnError) {
        if (mutation.meta.notifyOnError === true) {
          toastError(error as Error)
        } else {
          toastError(error as Error, mutation.meta.notifyOnError.title, mutation.meta.notifyOnError.description)
        }
      }
    },
  }),
  queryCache: new QueryCache({
    onSuccess(data, query) {
      if (query.meta?.notifyOnSuccess) {
        if (query.meta.notifyOnSuccess === true) {
          toast(ToastEnum.SUCCESS, JSON.stringify(data))
        } else {
          toast(ToastEnum.SUCCESS, query.meta.notifyOnSuccess.title, query.meta.notifyOnSuccess.description)
        }
      }
    },
    onError(error, query) {
      if (query.meta?.notifyOnError) {
        if (query.meta.notifyOnError === true) {
          toastError(error as Error)
        } else {
          toastError(error as Error, query.meta.notifyOnError.title, query.meta.notifyOnError.description)
        }
      }
    },
  }),
})

const store = setupStore()

root.render(
  <IntercomProvider appId={environment.intercom} autoBoot>
    <Auth0Provider
      domain={environment.oauth_domain}
      clientId={environment.oauth_key}
      redirectUri={`${window.location.origin}${LOGIN_URL}${LOGIN_AUTH_REDIRECT_URL}`}
      audience={environment.oauth_audience}
      useRefreshTokens={true}
      cacheLocation={'localstorage'}
      skipRedirectCallback={window.location.pathname !== LOGIN_URL + LOGIN_AUTH_REDIRECT_URL}
    >
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <BrowserRouter>
            <ModalProvider>
              <App />
              <ToastBehavior />
            </ModalProvider>
          </BrowserRouter>
        </Provider>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </Auth0Provider>
  </IntercomProvider>
)
