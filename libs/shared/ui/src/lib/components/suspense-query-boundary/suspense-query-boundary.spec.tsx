import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { SuspenseQueryBoundary } from './suspense-query-boundary'

const pendingPromise = new Promise(() => {
  // Keep this promise pending so Suspense renders the fallback.
})

function SuspendedContent() {
  throw pendingPromise
}

function ErrorContent() {
  throw new Error('Unable to fetch')
}

function MaybeErrorContent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Unable to fetch')

  return <div>Loaded content</div>
}

describe('SuspenseQueryBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('should render the default suspense fallback', () => {
    const { container } = renderWithProviders(
      <SuspenseQueryBoundary resetKeys={[]} title="catalog">
        <SuspendedContent />
      </SuspenseQueryBoundary>
    )

    expect(screen.getByText('Loading catalog...')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('should render a custom suspense fallback', () => {
    const { container } = renderWithProviders(
      <SuspenseQueryBoundary fallback={<div>Loading blueprints</div>} resetKeys={[]} title="catalog">
        <SuspendedContent />
      </SuspenseQueryBoundary>
    )

    expect(screen.getByText('Loading blueprints')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('should render the default error fallback', () => {
    const { container } = renderWithProviders(
      <SuspenseQueryBoundary resetKeys={[]} title="catalog">
        <ErrorContent />
      </SuspenseQueryBoundary>
    )

    expect(screen.getByText('Unable to load catalog.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('should render a custom error fallback', () => {
    const { container } = renderWithProviders(
      <SuspenseQueryBoundary
        errorFallback={({ resetErrorBoundary }) => (
          <button type="button" onClick={resetErrorBoundary}>
            Try again
          </button>
        )}
        resetKeys={[]}
        title="catalog"
      >
        <ErrorContent />
      </SuspenseQueryBoundary>
    )

    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('should reset the error boundary when reset keys change', () => {
    const { rerender } = renderWithProviders(
      <SuspenseQueryBoundary resetKeys={['error']} title="catalog">
        <MaybeErrorContent shouldThrow />
      </SuspenseQueryBoundary>
    )

    expect(screen.getByText('Unable to load catalog.')).toBeInTheDocument()

    rerender(
      <SuspenseQueryBoundary resetKeys={['loaded']} title="catalog">
        <MaybeErrorContent shouldThrow={false} />
      </SuspenseQueryBoundary>
    )

    expect(screen.getByText('Loaded content')).toBeInTheDocument()
  })
})
