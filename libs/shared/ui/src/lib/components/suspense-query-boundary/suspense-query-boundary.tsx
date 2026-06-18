import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { type PropsWithChildren, type ReactNode, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Button } from '../button/button'
import { Icon } from '../icon/icon'

function SuspenseQueryFallback({ title }: { title: string }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center gap-2 text-sm text-neutral-subtle">
      <Icon iconName="loader" className="animate-spin" />
      Loading {title}…
    </div>
  )
}

function SuspenseQueryErrorFallback({ resetErrorBoundary, title }: { resetErrorBoundary: () => void; title: string }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-sm text-neutral-subtle">
      <span>Unable to load {title}.</span>
      <Button type="button" variant="plain" color="neutral" size="md" onClick={resetErrorBoundary}>
        <Icon iconName="rotate-right" className="text-xs" />
        Retry
      </Button>
    </div>
  )
}

export interface SuspenseQueryBoundaryProps extends PropsWithChildren {
  fallback?: ReactNode
  errorFallback?: (props: { resetErrorBoundary: () => void; title: string }) => ReactNode
  resetKeys: unknown[]
  title: string
}

export function SuspenseQueryBoundary({
  children,
  fallback,
  errorFallback,
  resetKeys,
  title,
}: SuspenseQueryBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          fallbackRender={({ resetErrorBoundary }) => (
            errorFallback ? (
              errorFallback({ resetErrorBoundary, title })
            ) : (
              <SuspenseQueryErrorFallback resetErrorBoundary={resetErrorBoundary} title={title} />
            )
          )}
          onReset={reset}
          resetKeys={resetKeys}
        >
          <Suspense fallback={fallback ?? <SuspenseQueryFallback title={title} />}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

export default SuspenseQueryBoundary
