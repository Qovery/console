import { type Cluster, type Project } from 'qovery-typescript-axios'
import { useProjects } from '@qovery/domains/projects/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ClusterDeploymentProgressCard, {
  type ClusterDeploymentProgressCardProps,
} from './cluster-deployment-progress-card'
import { useDeploymentProgress } from './use-deployment-progress'

jest.mock('@qovery/domains/projects/feature', () => ({
  ...jest.requireActual('@qovery/domains/projects/feature'),
  useProjects: jest.fn(),
}))

jest.mock('./use-deployment-progress', () => ({
  ...jest.requireActual('./use-deployment-progress'),
  useDeploymentProgress: jest.fn(),
}))

const mockUseProjects = useProjects as jest.MockedFunction<typeof useProjects>
const mockUseDeploymentProgress = useDeploymentProgress as jest.MockedFunction<typeof useDeploymentProgress>

describe('ClusterDeploymentProgressCard', () => {
  const mockProject: Project = {
    id: 'project-1',
    name: 'Test Project',
    organization: { id: 'org-1' },
  } as Project

  const mockCluster: Cluster = {
    id: 'cluster-1',
    name: 'Test Cluster',
    organization: { id: 'org-1' },
    cloud_provider: 'AWS',
  } as Cluster

  const props: ClusterDeploymentProgressCardProps = {
    organizationId: 'org-1',
    clusters: [mockCluster],
  }

  beforeEach(() => {
    mockUseProjects.mockReturnValue({
      data: [mockProject],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useProjects>)

    mockUseDeploymentProgress.mockReturnValue({
      steps: [
        { label: 'Validating configuration', status: 'done' },
        { label: 'Providing infrastructure (on provider side)', status: 'current' },
        { label: 'Verifying provided infrastructure', status: 'pending' },
        { label: 'Installing Qovery stack', status: 'pending' },
        { label: 'Verifying kube deprecation API calls', status: 'pending' },
      ],
      progressValue: 0.4,
      currentStepLabel: 'Providing infrastructure (on provider side)',
      state: 'installing',
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ClusterDeploymentProgressCard {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render cluster name when installing', () => {
    renderWithProviders(<ClusterDeploymentProgressCard {...props} />)
    expect(screen.getByText('Test Cluster')).toBeInTheDocument()
  })

  it('should render current step label when installing', () => {
    renderWithProviders(<ClusterDeploymentProgressCard {...props} />)
    expect(screen.getByText('Providing infrastructure (on provider side)')).toBeInTheDocument()
  })

  it('should render success state', () => {
    mockUseDeploymentProgress.mockReturnValue({
      steps: [
        { label: 'Validating configuration', status: 'done' },
        { label: 'Providing infrastructure (on provider side)', status: 'done' },
        { label: 'Verifying provided infrastructure', status: 'done' },
        { label: 'Installing Qovery stack', status: 'done' },
        { label: 'Verifying kube deprecation API calls', status: 'done' },
      ],
      progressValue: 1,
      currentStepLabel: 'Verifying kube deprecation API calls',
      state: 'succeeded',
    })

    renderWithProviders(<ClusterDeploymentProgressCard {...props} />)
    expect(screen.getByText(/Test Cluster.*created/)).toBeInTheDocument()
    expect(screen.getByText('Start deploying')).toBeInTheDocument()
  })

  it('should render failed state', () => {
    mockUseDeploymentProgress.mockReturnValue({
      steps: [
        { label: 'Validating configuration', status: 'done' },
        { label: 'Providing infrastructure (on provider side)', status: 'done' },
        { label: 'Verifying provided infrastructure', status: 'current' },
        { label: 'Installing Qovery stack', status: 'pending' },
        { label: 'Verifying kube deprecation API calls', status: 'pending' },
      ],
      progressValue: 0.6,
      currentStepLabel: 'Verifying provided infrastructure',
      state: 'failed',
    })

    renderWithProviders(<ClusterDeploymentProgressCard {...props} />)
    expect(screen.getByText(/Test Cluster.*creation failed/)).toBeInTheDocument()
    expect(screen.getByText('See logs')).toBeInTheDocument()
  })

  it('should return null when clusters array is empty', () => {
    const { container } = renderWithProviders(<ClusterDeploymentProgressCard {...props} clusters={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
