import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { SectionProductionHealth } from './section-production-health'

const mockUseClusters = jest.fn()
const mockUseClusterStatuses = jest.fn()

jest.mock('../hooks/use-clusters/use-clusters', () => ({
  __esModule: true,
  default: () => mockUseClusters(),
}))

jest.mock('../hooks/use-cluster-statuses/use-cluster-statuses', () => ({
  __esModule: true,
  default: () => mockUseClusterStatuses(),
}))

const mockUseParams = jest.fn((_options?: { strict?: boolean }) => ({ organizationId: 'test-org-id' }))

jest.mock('@tanstack/react-router', () => {
  const React = jest.requireActual('react')
  return {
    ...jest.requireActual('@tanstack/react-router'),
    useParams: (options?: { strict?: boolean }) => mockUseParams(options),
    Link: React.forwardRef(
      (
        {
          children,
          to,
          params,
          ...props
        }: { children?: React.ReactNode; to?: string; params?: Record<string, string>; [key: string]: unknown },
        ref: React.Ref<HTMLAnchorElement>
      ) =>
        React.createElement(
          'a',
          {
            ref,
            'data-to': to,
            'data-params': params ? JSON.stringify(params) : undefined,
            ...props,
          },
          children
        )
    ),
  }
})

describe('SectionProductionHealth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseParams.mockReturnValue({ organizationId: 'test-org-id' })
    mockUseClusters.mockReturnValue({ data: [], isLoading: false })
    mockUseClusterStatuses.mockReturnValue({ data: [], isLoading: false })
  })

  it('should render the empty state when no production cluster exists', () => {
    renderWithProviders(<SectionProductionHealth />)

    expect(screen.getByRole('heading', { name: 'Production health' })).toBeInTheDocument()
    expect(screen.getByText('No production cluster created yet')).toBeInTheDocument()
    expect(screen.getByText('Create cluster')).toBeInTheDocument()
  })

  it('should keep the create cluster button linked to cluster creation', () => {
    renderWithProviders(<SectionProductionHealth />)

    const createLink = screen.getByText('Create cluster').closest('a')
    expect(createLink).toBeInTheDocument()
    expect(createLink).toHaveAttribute('data-to', '/organization/$organizationId/cluster/new')
    expect(createLink).toHaveAttribute('data-params', JSON.stringify({ organizationId: 'test-org-id' }))
  })

  it('should keep the all clusters link pointing to the clusters list', () => {
    renderWithProviders(<SectionProductionHealth />)

    const allClustersLink = screen.getByText('All clusters').closest('a')
    expect(allClustersLink).toBeInTheDocument()
    expect(allClustersLink).toHaveAttribute('data-to', '/organization/$organizationId/clusters')
    expect(allClustersLink).toHaveAttribute('data-params', JSON.stringify({ organizationId: 'test-org-id' }))
  })
})
