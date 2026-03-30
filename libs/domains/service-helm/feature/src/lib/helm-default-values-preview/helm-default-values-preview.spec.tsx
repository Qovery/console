import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { HelmDefaultValuesPreviewBase } from './helm-default-values-preview'

jest.mock('../hooks/use-helm-default-values/use-helm-default-values', () => {
  return {
    ...jest.requireActual('../hooks/use-helm-default-values/use-helm-default-values'),
    useHelmDefaultValues: () => ({
      data: 'my-yaml-content',
      isLoading: false,
    }),
  }
})

describe('HelmDefaultValuesPreviewBase', () => {
  it('navigates to the preview page when the default values are loaded', async () => {
    renderWithProviders(
      <HelmDefaultValuesPreviewBase
        payload='{"environmentId":"env-1","helmDefaultValuesRequest":{"source":{}}}'
        navigate={(state) => <div data-testid="preview-state">{JSON.stringify(state)}</div>}
      />
    )

    expect(screen.getByTestId('preview-state')).toHaveTextContent('"code":"my-yaml-content"')
    expect(screen.getByTestId('preview-state')).toHaveTextContent('"language":"yaml"')
    expect(screen.getByTestId('preview-state')).toHaveTextContent('"title":"Default values.yaml"')
  })

  it('renders an empty state when the payload is invalid', async () => {
    renderWithProviders(<HelmDefaultValuesPreviewBase payload="not-json" navigate={() => null} />)

    expect(screen.getByText('Unable to load default values.yaml')).toBeInTheDocument()
  })

  it('accepts a TanStack-parsed object payload', async () => {
    renderWithProviders(
      <HelmDefaultValuesPreviewBase
        payload={{ environmentId: 'env-1', helmDefaultValuesRequest: { source: {} } }}
        navigate={(state) => <div data-testid="preview-state-object">{JSON.stringify(state)}</div>}
      />
    )

    expect(screen.getByTestId('preview-state-object')).toHaveTextContent('"code":"my-yaml-content"')
  })
})
