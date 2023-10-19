import { Auth0Provider } from '@auth0/auth0-react'
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip'
import {
  type Mutation,
  MutationCache,
  type Query,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import algoliasearch from 'algoliasearch/lite'
import posthog from 'posthog-js'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Configure, InstantSearch } from 'react-instantsearch'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'
import { IntercomProvider } from 'react-use-intercom'
import { LOGIN_AUTH_REDIRECT_URL, LOGIN_URL } from '@qovery/shared/routes'
import { ModalProvider, ToastBehavior, toastError } from '@qovery/shared/ui'
import { ToastEnum, toast } from '@qovery/shared/ui'
import App from './app/app'
import { environment } from './environments/environment'

type ToastArgs = {
  status?: ToastEnum
  title: string
  description?: string
  callback?: () => void
  iconAction?: string
  labelAction?: string
  externalLink?: string
}

interface _QueryMeta {
  notifyOnSuccess?: boolean | ((data: unknown, query: Query<unknown, unknown, unknown>) => ToastArgs) | ToastArgs
  notifyOnError?: boolean | { title: string; description?: string }
}

interface _MutationMeta {
  notifyOnSuccess?:
    | boolean
    | ((
        data: unknown,
        variables: unknown,
        context: unknown,
        mutation: Mutation<unknown, unknown, unknown>
      ) => ToastArgs)
    | ToastArgs
  notifyOnError?: boolean | { title: string; description?: string }
}

declare module '@tanstack/react-query' {
  interface MutationMeta extends _MutationMeta {}
  interface QueryMeta extends _QueryMeta {}
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
    onSuccess(data, variables, context, mutation) {
      if (mutation.meta?.notifyOnSuccess) {
        if (mutation.meta.notifyOnSuccess === true) {
          toast(ToastEnum.SUCCESS, JSON.stringify(data))
        } else {
          const {
            status = ToastEnum.SUCCESS,
            title,
            description,
            callback,
            iconAction,
            labelAction,
            externalLink,
          } = typeof mutation.meta.notifyOnSuccess === 'function'
            ? mutation.meta.notifyOnSuccess(data, variables, context, mutation)
            : mutation.meta.notifyOnSuccess
          toast(status, title, description, callback, iconAction, labelAction, externalLink)
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
          const {
            status = ToastEnum.SUCCESS,
            title,
            description,
            callback,
            iconAction,
            labelAction,
            externalLink,
          } = typeof query.meta.notifyOnSuccess === 'function'
            ? query.meta.notifyOnSuccess(data, query)
            : query.meta.notifyOnSuccess
          toast(status, title, description, callback, iconAction, labelAction, externalLink)
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

const searchClient = algoliasearch('FT65SBJ2DA', '02604e8b2e0918e90edd1d9eb8e30f5e')

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
          <InstantSearch searchClient={searchClient} indexName="qovery">
            <Configure
              maxValuesPerFacet={10}
              attributesToRetrieve={[
                'hierarchy.lvl0',
                'hierarchy.lvl1',
                'hierarchy.lvl2',
                'hierarchy.lvl3',
                'hierarchy.lvl4',
                'hierarchy.lvl5',
                'hierarchy.lvl6',
                'content',
                'type',
                'url',
              ]}
              attributesToSnippet={[
                `hierarchy.lvl1:10`,
                `hierarchy.lvl2:10`,
                `hierarchy.lvl3:10`,
                `hierarchy.lvl4:10`,
                `hierarchy.lvl5:10`,
                `hierarchy.lvl6:10`,
                `content:10`,
              ]}
            />
            <BrowserRouter>
              <TooltipProvider>
                <ModalProvider>
                  <App />
                  <ToastBehavior />
                </ModalProvider>
              </TooltipProvider>
            </BrowserRouter>
          </InstantSearch>
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </QueryClientProvider>
      </Auth0Provider>
    </IntercomProvider>
  </StrictMode>
)
