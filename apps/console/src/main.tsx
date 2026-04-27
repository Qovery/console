import { GTMProvider } from '@elgorditosalsero/react-gtm-hook'
import { type IconName } from '@fortawesome/fontawesome-common-types'
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip'
import * as Sentry from '@sentry/react'
import {
  type Mutation,
  MutationCache,
  type Query,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import axios from 'axios'
import posthog from 'posthog-js'
import { StrictMode, useEffect, useRef } from 'react'
import * as ReactDOM from 'react-dom/client'
import { FlatProviders, makeProvider } from 'react-flat-providers'
import { IntercomProvider } from 'react-use-intercom'
import { devopsCopilotAxios } from '@qovery/shared/devops-copilot/data-access'
import { LoaderSpinner, ToastEnum, toast, toastError } from '@qovery/shared/ui'
import {
  DEVOPS_COPILOT_API_BASE_URL,
  GIT_SHA,
  GTM,
  INTERCOM,
  NODE_ENV,
  POSTHOG,
  POSTHOG_APIHOST,
  QOVERY_API,
} from '@qovery/shared/util-node-env'
import { useAuthInterceptor } from '@qovery/shared/utils'
// TODO: Improve this import to use the shared/ui package
// eslint-disable-next-line @nx/enforce-module-boundaries
import '../../../libs/shared/ui/src/lib/styles/main.scss'
import { NotFoundPage } from './app/components/not-found-page/not-found-page'
import { ThemeProvider } from './app/components/theme-provider/theme-provider'
import { Auth0Wrapper, useAuth0Context } from './auth/auth0'
// Import the generated route tree
import { routeTree } from './routeTree.gen'

type ToastArgs = {
  status?: ToastEnum
  title: string
  description?: string
  callback?: () => void
  iconAction?: IconName
  labelAction?: string
  externalLink?: string
}

const SENTRY_DSN = 'https://666b0bd18086c3b730597ee1b8c97eb0@o471935.ingest.us.sentry.io/4507661194625024'

let isSentryInitialized = false

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
  capture_pageview: 'history_change',
})

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

function App() {
  const auth = useAuth0Context()
  const routerRef = useRef<ReturnType<typeof createRouter> | null>(null)

  if (!routerRef.current) {
    routerRef.current = createRouter({
      routeTree,
      context: { auth, queryClient },
      defaultNotFoundComponent: NotFoundPage,
    })

    if (!isSentryInitialized && NODE_ENV === 'production') {
      Sentry.init({
        release: GIT_SHA,
        dsn: SENTRY_DSN,
        integrations: [Sentry.tanstackRouterBrowserTracingIntegration(routerRef.current), Sentry.replayIntegration()],
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      })

      isSentryInitialized = true
    }
  }

  const router = routerRef.current

  // Keep PostHog's identified user in sync once Auth0 resolves the session
  useEffect(() => {
    if (!auth.user?.sub) {
      Sentry.setUser(null)
      return
    }

    posthog.identify(auth.user.sub, {
      ...auth.user,
    })

    Sentry.setUser({
      id: auth.user.sub,
      email: auth.user.email,
      username: auth.user.name,
    })
  }, [auth.user])

  useAuthInterceptor(axios, QOVERY_API)
  useAuthInterceptor(devopsCopilotAxios, DEVOPS_COPILOT_API_BASE_URL)

  if (auth.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderSpinner />
      </div>
    )
  }

  return <RouterProvider router={router} context={{ auth, queryClient }} />
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
const gtmParams = { id: GTM }

root.render(
  <StrictMode>
    <GTMProvider state={gtmParams}>
      <FlatProviders
        providers={[
          ThemeProvider,
          TooltipProvider,
          Auth0Wrapper,
          makeProvider(QueryClientProvider, { client: queryClient }),
          makeProvider(IntercomProvider, { appId: INTERCOM }),
        ]}
      >
        <App />
      </FlatProviders>
    </GTMProvider>
  </StrictMode>
)
