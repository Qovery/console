import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { HelmDefaultValuesPreview } from './helm-default-values-preview'

const mockUseSearch = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  Navigate: ({ state, search }: { state?: Record<string, unknown>; search?: Record<string, unknown> }) => (
    <div data-testid="preview-state">{JSON.stringify({ ...search, ...state })}</div>
  ),
  useSearch: () => mockUseSearch(),
}))

jest.mock('../hooks/use-helm-default-values/use-helm-default-values', () => {
  return {
    ...jest.requireActual('../hooks/use-helm-default-values/use-helm-default-values'),
    useHelmDefaultValues: () => ({
      data: 'my-yaml-content',
      isLoading: false,
    }),
  }
})

describe('HelmDefaultValuesPreview', () => {
  beforeEach(() => {
    mockUseSearch.mockReset()
  })

  it('navigates to the preview page when the default values are loaded', async () => {
    mockUseSearch.mockReturnValue({
      payload: '{"environmentId":"env-1","helmDefaultValuesRequest":{"source":{}}}',
    })

    renderWithProviders(<HelmDefaultValuesPreview />)

    expect(screen.getByTestId('preview-state')).toHaveTextContent('"code":"my-yaml-content"')
    expect(screen.getByTestId('preview-state')).toHaveTextContent('"language":"yaml"')
    expect(screen.getByTestId('preview-state')).toHaveTextContent('"title":"Default values.yaml"')
  })

  it('renders an empty state when the payload is invalid', async () => {
    mockUseSearch.mockReturnValue({ payload: 'not-json' })

    renderWithProviders(<HelmDefaultValuesPreview />)

    expect(screen.getByText('Unable to load default values.yaml')).toBeInTheDocument()
  })

  it('accepts a TanStack-parsed object payload', async () => {
    mockUseSearch.mockReturnValue({
      payload: { environmentId: 'env-1', helmDefaultValuesRequest: { source: {} } },
    })

    renderWithProviders(<HelmDefaultValuesPreview />)

    expect(screen.getByTestId('preview-state')).toHaveTextContent('"code":"my-yaml-content"')
  })
})
