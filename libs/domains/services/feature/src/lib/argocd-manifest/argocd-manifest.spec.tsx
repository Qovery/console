import { type UseQueryResult } from '@tanstack/react-query'
import { type ArgoCdManifestResponse } from '@qovery/domains/services/data-access'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { useArgoCdManifest } from '../hooks/use-argocd-manifest/use-argocd-manifest'
import { ArgoCdManifest, formatLiveState, toManifestResources } from './argocd-manifest'

jest.mock('../hooks/use-argocd-manifest/use-argocd-manifest')

jest.mock('@qovery/shared/ui', () => {
  const actual = jest.requireActual('@qovery/shared/ui')

  return {
    ...actual,
    CodeEditor: ({ value }: { value?: string }) => <pre data-testid="code-editor">{value}</pre>,
  }
})

const mockUseArgoCdManifest = useArgoCdManifest as jest.MockedFunction<typeof useArgoCdManifest>

const createUseArgoCdManifestResult = (
  result: Partial<UseQueryResult<ArgoCdManifestResponse>>
): UseQueryResult<ArgoCdManifestResponse> =>
  ({
    data: undefined,
    isLoading: false,
    isError: false,
    ...result,
  }) as unknown as UseQueryResult<ArgoCdManifestResponse>

const manifestResponse: ArgoCdManifestResponse = {
  managed_resources: [
    {
      kind: 'Service',
      name: 'api',
      liveState: JSON.stringify({ kind: 'Service', metadata: { name: 'api' } }),
    },
    {
      kind: 'ConfigMap',
      name: 'settings',
      liveState: 'not-json',
    },
  ],
}

describe('ArgoCdManifest', () => {
  beforeEach(() => {
    mockUseArgoCdManifest.mockReturnValue(createUseArgoCdManifestResult({ data: manifestResponse }))
  })

  it('should adapt ArgoCD resources to tree resources with stable ids', () => {
    expect(toManifestResources(manifestResponse.managed_resources)).toEqual([
      expect.objectContaining({
        id: 'Service:api:0',
        resourceType: 'Service',
        displayName: 'Service',
        name: 'api',
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
    renderWithProviders(<ArgoCdManifest serviceId="service-id" />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /api/ })).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /settings/ })).toBeInTheDocument()
    expect(screen.getByTestId('code-editor')).toHaveTextContent('"kind": "Service"')
  })

  it('should display selected resource liveState', async () => {
    const { userEvent } = renderWithProviders(<ArgoCdManifest serviceId="service-id" />)

    await userEvent.click(await screen.findByRole('button', { name: /settings/ }))

    expect(screen.getByTestId('code-editor')).toHaveTextContent('not-json')
  })

  it('should display an empty state when there are no managed resources', () => {
    mockUseArgoCdManifest.mockReturnValue(
      createUseArgoCdManifestResult({
        data: {
          managed_resources: [],
        },
      })
    )

    renderWithProviders(<ArgoCdManifest serviceId="service-id" />)

    expect(screen.getByText('No managed resources')).toBeInTheDocument()
  })

  it('should display an error state when manifest loading fails', () => {
    mockUseArgoCdManifest.mockReturnValue(
      createUseArgoCdManifestResult({
        isError: true,
      })
    )

    renderWithProviders(<ArgoCdManifest serviceId="service-id" />)

    expect(screen.getByText('Unable to load manifest')).toBeInTheDocument()
  })
})
