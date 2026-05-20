import { type UseQueryResult } from '@tanstack/react-query'
import { type ArgocdAppManifestResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { useArgoCdManifest } from '../hooks/use-argocd-manifest/use-argocd-manifest'
import { ArgoCdManifest, formatLiveState, toManifestResources } from './argocd-manifest'

jest.mock('@tanstack/react-router', () => ({
  useParams: () => ({ serviceId: 'service-id' }),
}))

jest.mock('../hooks/use-argocd-manifest/use-argocd-manifest')

jest.mock('@qovery/shared/ui', () => {
  const actual = jest.requireActual('@qovery/shared/ui')

  return {
    ...actual,
    CodeEditor: ({ value }: { value?: string }) => <pre data-testid="code-editor">{value}</pre>,
    CodeDiffEditor: ({ original, modified }: { original: string; modified: string }) => (
      <div data-testid="code-diff-editor">
        <pre data-testid="code-diff-original">{original}</pre>
        <pre data-testid="code-diff-modified">{modified}</pre>
      </div>
    ),
  }
})

const mockUseArgoCdManifest = useArgoCdManifest as jest.MockedFunction<typeof useArgoCdManifest>

const createUseArgoCdManifestResult = (
  result: Partial<UseQueryResult<ArgocdAppManifestResponse>>
): UseQueryResult<ArgocdAppManifestResponse> =>
  ({
    data: undefined,
    isLoading: false,
    isError: false,
    ...result,
  }) as unknown as UseQueryResult<ArgocdAppManifestResponse>

const manifestResponse: ArgocdAppManifestResponse = {
  manifest_metadata: {
    managed_resources: [
      {
        kind: 'Service',
        name: 'api',
        liveState: JSON.stringify({ kind: 'Service', metadata: { name: 'api' } }),
        targetState: JSON.stringify({ kind: 'Service', metadata: { name: 'api-target' } }),
      },
      {
        kind: 'ConfigMap',
        name: 'settings',
        liveState: 'not-json',
        targetState: 'target-not-json',
      },
    ],
  },
}

describe('ArgoCdManifest', () => {
  beforeEach(() => {
    mockUseArgoCdManifest.mockReturnValue(createUseArgoCdManifestResult({ data: manifestResponse }))
  })

  it('should adapt ArgoCD resources to tree resources with stable ids', () => {
    expect(toManifestResources(manifestResponse.manifest_metadata.managed_resources ?? [])).toEqual([
      expect.objectContaining({
        id: 'Service:api:0',
        resourceType: 'Service',
        displayName: 'Service',
        name: 'api',
        targetState: JSON.stringify({ kind: 'Service', metadata: { name: 'api-target' } }),
      }),
      expect.objectContaining({
        id: 'ConfigMap:settings:1',
        resourceType: 'ConfigMap',
        displayName: 'ConfigMap',
        name: 'settings',
      }),
    ])
  })

  it('should format valid JSON liveState', () => {
    expect(formatLiveState(JSON.stringify({ kind: 'Service' }))).toBe('{\n  "kind": "Service"\n}')
  })

  it('should keep raw liveState when JSON parsing fails', () => {
    expect(formatLiveState('not-json')).toBe('not-json')
  })

  it('should display resources and select the first one by default', async () => {
    renderWithProviders(<ArgoCdManifest />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /api/ })).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /settings/ })).toBeInTheDocument()
    expect(screen.getByTestId('code-editor')).toHaveTextContent('"kind": "Service"')
  })

  it('should display selected resource liveState', async () => {
    const { userEvent } = renderWithProviders(<ArgoCdManifest />)

    await userEvent.click(await screen.findByRole('button', { name: /settings/ }))

    expect(screen.getByTestId('code-editor')).toHaveTextContent('not-json')
  })

  it('should display a diff between target and live state when diff is enabled', async () => {
    const { userEvent } = renderWithProviders(<ArgoCdManifest />)

    const toggle = screen.getByTestId('input-toggle-button')

    expect(toggle).toBeInTheDocument()

    await userEvent.click(toggle)

    expect(screen.getByTestId('code-diff-original')).toHaveTextContent('"name": "api-target"')
    expect(screen.getByTestId('code-diff-modified')).toHaveTextContent('"name": "api"')
    expect(screen.queryByTestId('code-editor')).not.toBeInTheDocument()
  })

  it('should toggle diff mode when clicking the diff label', async () => {
    const { userEvent } = renderWithProviders(<ArgoCdManifest />)

    await userEvent.click(await screen.findByText('Compare with target'))

    expect(screen.getByTestId('code-diff-editor')).toBeInTheDocument()
  })

  it('should display an empty state when there are no managed resources', () => {
    mockUseArgoCdManifest.mockReturnValue(
      createUseArgoCdManifestResult({
        data: {
          manifest_metadata: {
            managed_resources: [],
          },
        },
      })
    )

    renderWithProviders(<ArgoCdManifest />)

    expect(screen.getByText('No managed resources')).toBeInTheDocument()
  })

  it('should fallback optional resource fields in the UI adapter', () => {
    expect(toManifestResources([{}])).toEqual([
      expect.objectContaining({
        id: 'Unknown:Unnamed:0',
        resourceType: 'Unknown',
        displayName: 'Unknown',
        name: 'Unnamed',
        liveState: '',
        targetState: '',
      }),
    ])
  })

  it('should display an error state when manifest loading fails', () => {
    mockUseArgoCdManifest.mockReturnValue(
      createUseArgoCdManifestResult({
        isError: true,
      })
    )

    renderWithProviders(<ArgoCdManifest />)

    expect(screen.getByText('Unable to load manifest')).toBeInTheDocument()
  })
})
