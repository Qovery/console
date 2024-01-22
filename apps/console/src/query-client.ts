import { type Mutation, MutationCache, type Query, QueryCache, QueryClient } from '@tanstack/react-query'
import { ToastEnum, toast, toastError } from '@qovery/shared/ui'

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

export const queryClient = new QueryClient({
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
