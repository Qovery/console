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
import { RouterProvider, createRouter } from '@tanstack/react-router'
import axios from 'axios'
import posthog from 'posthog-js'
import { StrictMode } from 'react'
import * as ReactDOM from 'react-dom/client'
import { FlatProviders, makeProvider } from 'react-flat-providers'
import { LoaderSpinner, ModalProvider, ToastEnum, toast, toastError } from '@qovery/shared/ui'
import { POSTHOG, POSTHOG_APIHOST, QOVERY_API } from '@qovery/shared/util-node-env'
import { useAuthInterceptor } from '@qovery/shared/utils'
// TODO: Improve this import to use the shared/ui package
// eslint-disable-next-line @nx/enforce-module-boundaries
import '../../../libs/shared/ui/src/lib/styles/main.scss'
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

function InnerApp() {
  const auth = useAuth0Context()

  // Create a new router instance
  const router = createRouter({ routeTree, context: { auth, queryClient } })

  useAuthInterceptor(axios, QOVERY_API)

  if (auth.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderSpinner />
      </div>
    )
  }

  return <RouterProvider router={router} context={{ auth, queryClient }} />
}

function App() {
  return (
    <Auth0Wrapper>
      <InnerApp />
    </Auth0Wrapper>
  )
}

export default App

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <StrictMode>
    <FlatProviders providers={[makeProvider(QueryClientProvider, { client: queryClient })]}>
      <ThemeProvider>
        <TooltipProvider>
          <ModalProvider>
            <App />
          </ModalProvider>
        </TooltipProvider>
      </ThemeProvider>
    </FlatProviders>
  </StrictMode>
)
