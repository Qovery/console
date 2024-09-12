import { type PropsWithChildren } from 'react'
import { ErrorBoundary as ErrorBoundaryRaw, type FallbackProps } from 'react-error-boundary'
import { twMerge } from '@qovery/shared/util-js'
import { Button } from '../button/button'
import { Heading } from '../heading/heading'
import { Icon } from '../icon/icon'
import { Section } from '../section/section'

export function ErrorFallback({ className, error, resetErrorBoundary }: FallbackProps & { className?: string }) {
  return (
    <Section className={twMerge('max-h-screen flex-grow items-center justify-center rounded-sm bg-white', className)}>
      <div className="-mt-[100px] flex w-[500px] flex-col items-center justify-center gap-3 text-center">
        <Icon iconName="cloud-exclamation" className="text-8xl text-neutral-200" />
        <div>
          <Heading className="font-medium text-neutral-400">Something went wrong</Heading>
          <p className="text-sm text-neutral-350">{error.message}</p>
        </div>
        <Button onClick={resetErrorBoundary} size="md" className="flex gap-2">
          Try again
          <Icon iconName="refresh" />
        </Button>
      </div>
    </Section>
  )
}

interface ErrorBoundaryProps extends PropsWithChildren {}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryRaw FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      {children}
    </ErrorBoundaryRaw>
  )
}

export default ErrorBoundary
