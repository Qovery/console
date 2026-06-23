import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BlueprintQueryBoundary } from './blueprint-query-boundary'

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

describe('BlueprintQueryBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('should render the default suspense fallback', () => {
    renderWithProviders(
      <BlueprintQueryBoundary resetKeys={[]} title="catalog">
        <SuspendedContent />
      </BlueprintQueryBoundary>
    )

    expect(screen.getByText('Loading catalog…')).toBeInTheDocument()
  })

  it('should render a custom suspense fallback', () => {
    renderWithProviders(
      <BlueprintQueryBoundary fallback={<div>Loading blueprints</div>} resetKeys={[]} title="catalog">
        <SuspendedContent />
      </BlueprintQueryBoundary>
    )

    expect(screen.getByText('Loading blueprints')).toBeInTheDocument()
  })

  it('should render the default error fallback', () => {
    renderWithProviders(
      <BlueprintQueryBoundary resetKeys={[]} title="catalog">
        <ErrorContent />
      </BlueprintQueryBoundary>
    )

    expect(screen.getByText('Unable to load catalog.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('should render a custom error fallback', () => {
    renderWithProviders(
      <BlueprintQueryBoundary
        errorFallback={({ resetErrorBoundary }) => (
          <button type="button" onClick={resetErrorBoundary}>
            Try again
          </button>
        )}
        resetKeys={[]}
        title="catalog"
      >
        <ErrorContent />
      </BlueprintQueryBoundary>
    )

    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('should reset the error boundary when reset keys change', () => {
    const { rerender } = renderWithProviders(
      <BlueprintQueryBoundary resetKeys={['error']} title="catalog">
        <MaybeErrorContent shouldThrow />
      </BlueprintQueryBoundary>
    )

    expect(screen.getByText('Unable to load catalog.')).toBeInTheDocument()

    rerender(
      <BlueprintQueryBoundary resetKeys={['loaded']} title="catalog">
        <MaybeErrorContent shouldThrow={false} />
      </BlueprintQueryBoundary>
    )

    expect(screen.getByText('Loaded content')).toBeInTheDocument()
  })
})
