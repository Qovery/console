import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type ClusterGeneralData } from '@qovery/shared/interfaces'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ClusterCreationFlow, { defaultResourcesData, steps } from './cluster-creation-flow'

jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useDocumentTitle: jest.fn(),
}))

jest.mock('@qovery/shared/assistant/feature', () => ({
  AssistantTrigger: () => null,
}))

jest.mock('@tanstack/react-router', () => {
  const React = jest.requireActual('react')
  return {
    ...jest.requireActual('@tanstack/react-router'),
    useParams: () => ({ organizationId: 'org-123', slug: 'AWS' }),
    useNavigate: () => jest.fn(),
    useRouterState: () => ({ location: { pathname: '/' } }),
    useRouter: () => ({ buildLocation: jest.fn(() => ({ href: '/' })) }),
    Link: React.forwardRef(
      ({ children, ...props }: { children?: React.ReactNode }, ref: React.Ref<HTMLAnchorElement>) =>
        React.createElement('a', { ref, ...props }, children)
    ),
  }
})

describe('ClusterCreationFlow', () => {
  it('should render children', () => {
    renderWithProviders(
      <ClusterCreationFlow>
        <div data-testid="child">Child content</div>
      </ClusterCreationFlow>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('should have correct default resources data', () => {
    expect(defaultResourcesData.cluster_type).toBe('MANAGED')
    expect(defaultResourcesData.disk_size).toBe(50)
    expect(defaultResourcesData.nodes).toEqual([3, 10])
  })
})

describe('steps', () => {
  it('should return AWS managed steps', () => {
    const data: ClusterGeneralData = {
      installation_type: 'MANAGED',
      cloud_provider: CloudProviderEnum.AWS,
    } as ClusterGeneralData

    const result = steps(data)

    expect(result).toHaveLength(4)
    expect(result.map((s) => s.key)).toEqual(['general', 'resources', 'features', 'summary'])
  })

  it('should return GCP managed steps', () => {
    const data: ClusterGeneralData = {
      installation_type: 'MANAGED',
      cloud_provider: CloudProviderEnum.GCP,
    } as ClusterGeneralData

    const result = steps(data)

    expect(result).toHaveLength(3)
    expect(result.map((s) => s.key)).toEqual(['general', 'features', 'summary'])
  })

  it('should return self-managed steps', () => {
    const data: ClusterGeneralData = {
      installation_type: 'SELF_MANAGED',
    } as ClusterGeneralData

    const result = steps(data)

    expect(result).toHaveLength(3)
    expect(result.map((s) => s.key)).toEqual(['general', 'kubeconfig', 'summary'])
  })

  it('should return partially-managed steps', () => {
    const data: ClusterGeneralData = {
      installation_type: 'PARTIALLY_MANAGED',
    } as ClusterGeneralData

    const result = steps(data)

    expect(result).toHaveLength(4)
    expect(result.map((s) => s.key)).toEqual(['general', 'kubeconfig', 'eks', 'summary'])
  })
})
