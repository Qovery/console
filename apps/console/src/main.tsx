import { Auth0Provider } from '@auth0/auth0-react'
import { type IconName } from '@fortawesome/fontawesome-common-types'
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip'
import {
  type Mutation,
  MutationCache,
  type Query,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import posthog from 'posthog-js'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { FlatProviders, makeProvider } from 'react-flat-providers'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'
import { IntercomProvider } from 'react-use-intercom'
import { QueryParamProvider } from 'use-query-params'
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6'
import { InstantSearchProvider } from '@qovery/shared/assistant/feature'
import { LOGIN_AUTH_REDIRECT_URL, LOGIN_URL } from '@qovery/shared/routes'
import { ErrorFallback, ModalProvider, ToastBehavior, toastError } from '@qovery/shared/ui'
import { ToastEnum, toast } from '@qovery/shared/ui'
import {
  INTERCOM,
  OAUTH_AUDIENCE,
  OAUTH_DOMAIN,
  OAUTH_KEY,
  POSTHOG,
  POSTHOG_APIHOST,
} from '@qovery/shared/util-node-env'
import App from './app/app'

type ToastArgs = {
  status?: ToastEnum
  title: string
  description?: string
  callback?: () => void
  iconAction?: IconName
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
posthog.init(POSTHOG, {
  api_host: POSTHOG_APIHOST,
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

function fallbackRender({ error, resetErrorBoundary }: FallbackProps) {
  return <ErrorFallback className="h-screen" error={error} resetErrorBoundary={resetErrorBoundary} />
}

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
        <QueryParamProvider adapter={ReactRouter6Adapter}>
          <ErrorBoundary fallbackRender={fallbackRender}>
            <TooltipProvider>
              <ModalProvider>
                <App />
                <ToastBehavior />
              </ModalProvider>
            </TooltipProvider>
          </ErrorBoundary>
        </QueryParamProvider>
      </BrowserRouter>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </FlatProviders>
  </StrictMode>
)
