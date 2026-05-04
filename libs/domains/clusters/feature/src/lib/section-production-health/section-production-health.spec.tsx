import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { SectionProductionHealth } from './section-production-health'

const mockUseClusterCreationRestriction = jest.fn(() => ({
  isNoCreditCardRestriction: false,
}))
const mockUseClusters = jest.fn(() => ({ data: [] }))
const mockUseClusterStatuses = jest.fn(() => ({ data: [] }))

jest.mock('../hooks/use-cluster-creation-restriction/use-cluster-creation-restriction', () => ({
  useClusterCreationRestriction: (params: { organizationId: string }) => mockUseClusterCreationRestriction(params),
}))

jest.mock('../hooks/use-clusters/use-clusters', () => ({
  __esModule: true,
  default: (params: { organizationId: string }) => mockUseClusters(params),
}))

jest.mock('../hooks/use-cluster-statuses/use-cluster-statuses', () => ({
  __esModule: true,
  default: (params: { organizationId: string }) => mockUseClusterStatuses(params),
}))

const mockOpenModal = jest.fn()
const mockCloseModal = jest.fn()

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
  }),
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
    mockUseClusterCreationRestriction.mockReturnValue({ isNoCreditCardRestriction: false })
    mockUseClusters.mockReturnValue({ data: [] })
    mockUseClusterStatuses.mockReturnValue({ data: [] })
  })

  it('should render the cluster option cards when no cluster exists', () => {
    renderWithProviders(<SectionProductionHealth />)

    expect(screen.getByRole('heading', { name: 'Production health' })).toBeInTheDocument()
    expect(screen.getByText('Qovery managed')).toBeInTheDocument()
    expect(screen.getByText('Bring your own cluster')).toBeInTheDocument()
    expect(screen.getByText('Local machine (demo)')).toBeInTheDocument()
  })

  it('should keep the Qovery managed card linked to cluster creation', () => {
    renderWithProviders(<SectionProductionHealth />)

    const managedLink = screen.getByText('Qovery managed').closest('a')
    expect(managedLink).toBeInTheDocument()
    expect(managedLink).toHaveAttribute('data-to', '/organization/$organizationId/cluster/new')
    expect(managedLink).toHaveAttribute('data-params', JSON.stringify({ organizationId: 'test-org-id' }))
  })

  it('should keep the all clusters link pointing to the clusters list', () => {
    renderWithProviders(<SectionProductionHealth />)

    const allClustersLink = screen.getByText('All clusters').closest('a')
    expect(allClustersLink).toBeInTheDocument()
    expect(allClustersLink).toHaveAttribute('data-to', '/organization/$organizationId/clusters')
    expect(allClustersLink).toHaveAttribute('data-params', JSON.stringify({ organizationId: 'test-org-id' }))
  })

  it('should open the add credit card modal from self-managed during free trial restriction', async () => {
    mockUseClusterCreationRestriction.mockReturnValue({ isNoCreditCardRestriction: true })
    const { userEvent } = renderWithProviders(<SectionProductionHealth />)

    const selfManagedButton = screen.getByText('Bring your own cluster').closest('button')
    expect(selfManagedButton).toBeInTheDocument()

    await userEvent.click(selfManagedButton as Element)

    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          props: expect.objectContaining({ organizationId: 'test-org-id' }),
        }),
      })
    )
  })

  it('should keep the local machine card opening the installation guide modal', async () => {
    mockUseClusterCreationRestriction.mockReturnValue({ isNoCreditCardRestriction: true })
    const { userEvent } = renderWithProviders(<SectionProductionHealth />)

    const demoButton = screen.getByText('Local machine (demo)').closest('button')
    expect(demoButton).toBeInTheDocument()

    await userEvent.click(demoButton as Element)

    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          props: expect.objectContaining({ isDemo: true, type: 'ON_PREMISE' }),
        }),
      })
    )
  })
})
