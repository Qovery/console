import { DatabaseModeEnum, type Environment, StateEnum } from 'qovery-typescript-axios'
import { useDeploymentStatus } from '@qovery/domains/services/feature'
import { act, renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { useServiceDeploymentId } from '../hooks/use-service-deployment-id/use-service-deployment-id'
import { LoaderPlaceholder, ServiceLogsPlaceholder } from './service-logs-placeholder'

jest.mock('@qovery/domains/services/feature', () => ({
  useDeploymentStatus: jest.fn(),
}))

jest.mock('../hooks/use-service-deployment-id/use-service-deployment-id', () => ({
  useServiceDeploymentId: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    organizationId: 'org-123',
    projectId: 'proj-123',
    environmentId: 'env-123',
    serviceId: 'svc-123',
  }),
}))

const mockUseDeploymentStatus = useDeploymentStatus as jest.Mock
const mockUseServiceDeploymentId = useServiceDeploymentId as jest.Mock

const environmentMock = {
  id: 'env-123',
  cluster_id: 'cluster-123',
} as Environment

describe('LoaderPlaceholder', () => {
  it('renders with default title', () => {
    renderWithProviders(<LoaderPlaceholder />)
    expect(screen.getByText('Service logs are loading…')).toBeInTheDocument()
  })

  it('renders with custom title', () => {
    renderWithProviders(<LoaderPlaceholder title="Custom loading message" />)
    expect(screen.getByText('Custom loading message')).toBeInTheDocument()
  })

  it('renders with description', () => {
    renderWithProviders(<LoaderPlaceholder title="Loading..." description="Please wait" />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByText('Please wait')).toBeInTheDocument()
  })
})

describe('ServiceLogsPlaceholder', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    mockUseServiceDeploymentId.mockReturnValue({
      data: [],
    })
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.useRealTimers()
  })

  describe('Managed Database', () => {
    it('renders managed database message immediately', () => {
      mockUseDeploymentStatus.mockReturnValue({
        data: { state: StateEnum.READY, execution_id: 'exec-123' },
      })

      renderWithProviders(
        <ServiceLogsPlaceholder
          environment={environmentMock}
          type="live"
          serviceName="my-db"
          databaseMode={DatabaseModeEnum.MANAGED}
          itemsLength={0}
          isFetched={true}
        />
      )

      expect(screen.getByText('No logs are available for your service my-db')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Managed databases are handled by your cloud provider. Logs are accessible in your cloud provider console'
        )
      ).toBeInTheDocument()
    })
  })

  describe('Live Logs - Deploying State', () => {
    it('shows loader initially when deploying with no logs', () => {
      mockUseDeploymentStatus.mockReturnValue({
        data: { state: StateEnum.DEPLOYING, execution_id: 'exec-123' },
      })

      renderWithProviders(
        <ServiceLogsPlaceholder
          environment={environmentMock}
          type="live"
          serviceName="my-app"
          databaseMode={DatabaseModeEnum.CONTAINER}
          itemsLength={0}
          isFetched={false}
        />
      )

      expect(screen.getByText('Service logs are loading…')).toBeInTheDocument()
    })

    it('shows placeholder after timeout when deploying with no logs', async () => {
      mockUseDeploymentStatus.mockReturnValue({
        data: { state: StateEnum.DEPLOYING, execution_id: 'exec-123' },
      })

      renderWithProviders(
        <ServiceLogsPlaceholder
          environment={environmentMock}
          type="live"
          serviceName="my-app"
          databaseMode={DatabaseModeEnum.CONTAINER}
          itemsLength={0}
          isFetched={false}
        />
      )

      act(() => {
        jest.advanceTimersByTime(4000)
      })

      await waitFor(() => {
        expect(screen.getByText('No logs are available for your service my-app')).toBeInTheDocument()
        expect(screen.getByText('Please check the service configuration')).toBeInTheDocument()
      })
    })
  })

  describe('Live Logs - Ready/Stopped State', () => {
    it('shows loader initially when READY with no logs', () => {
      mockUseDeploymentStatus.mockReturnValue({
        data: { state: StateEnum.READY, execution_id: 'exec-123' },
      })

      renderWithProviders(
        <ServiceLogsPlaceholder
          environment={environmentMock}
          type="live"
          serviceName="my-app"
          databaseMode={DatabaseModeEnum.CONTAINER}
          itemsLength={0}
          isFetched={false}
        />
      )

      expect(screen.getByText('Service logs are loading…')).toBeInTheDocument()
    })

    it('shows deployment link after timeout when READY with no logs', async () => {
      mockUseDeploymentStatus.mockReturnValue({
        data: { state: StateEnum.READY, execution_id: 'exec-123' },
      })

      renderWithProviders(
        <ServiceLogsPlaceholder
          environment={environmentMock}
          type="live"
          serviceName="my-app"
          databaseMode={DatabaseModeEnum.CONTAINER}
          itemsLength={0}
          isFetched={false}
        />
      )

      act(() => {
        jest.advanceTimersByTime(4000)
      })

      await waitFor(() => {
        expect(screen.getByText('No service logs available for my-app')).toBeInTheDocument()
        expect(screen.getByText('Please check if the service is up and running')).toBeInTheDocument()
        expect(screen.getByText('Go to latest deployment')).toBeInTheDocument()
      })
    })

    it('shows deployment link after timeout when STOPPED with no logs', async () => {
      mockUseDeploymentStatus.mockReturnValue({
        data: { state: StateEnum.STOPPED, execution_id: 'exec-456' },
      })

      renderWithProviders(
        <ServiceLogsPlaceholder
          environment={environmentMock}
          type="live"
          serviceName="my-service"
          databaseMode={DatabaseModeEnum.CONTAINER}
          itemsLength={0}
          isFetched={false}
        />
      )

      act(() => {
        jest.advanceTimersByTime(4000)
      })

      await waitFor(() => {
        expect(screen.getByText('No service logs available for my-service')).toBeInTheDocument()
        expect(screen.getByText('Go to latest deployment')).toBeInTheDocument()
      })
    })
  })

  describe('History Logs', () => {
    it('shows loader when not fetched', () => {
      mockUseDeploymentStatus.mockReturnValue({
        data: { state: StateEnum.READY, execution_id: 'exec-123' },
      })

      renderWithProviders(
        <ServiceLogsPlaceholder
          environment={environmentMock}
          type="history"
          serviceName="my-app"
          databaseMode={DatabaseModeEnum.CONTAINER}
          itemsLength={0}
          isFetched={false}
        />
      )

      expect(screen.getByText('Service logs are loading…')).toBeInTheDocument()
    })

    it('shows no logs message when fetched and loading timeout passed', async () => {
      mockUseDeploymentStatus.mockReturnValue({
        data: { state: StateEnum.DEPLOYING, execution_id: 'exec-123' },
      })

      renderWithProviders(
        <ServiceLogsPlaceholder
          environment={environmentMock}
          type="history"
          serviceName="my-app"
          databaseMode={DatabaseModeEnum.CONTAINER}
          itemsLength={5}
          isFetched={true}
        />
      )

      act(() => {
        jest.advanceTimersByTime(4000)
      })

      await waitFor(() => {
        expect(screen.getByText('No logs are available for your service my-app')).toBeInTheDocument()
      })
    })
  })

  describe('LoaderPlaceholder when not fetched', () => {
    it('renders LoaderPlaceholder when isFetched is false', () => {
      mockUseDeploymentStatus.mockReturnValue({
        data: { state: StateEnum.READY, execution_id: 'exec-123' },
      })

      renderWithProviders(
        <ServiceLogsPlaceholder
          environment={environmentMock}
          type="live"
          serviceName="my-app"
          databaseMode={DatabaseModeEnum.CONTAINER}
          itemsLength={0}
          isFetched={false}
        />
      )

      expect(screen.getByText('Service logs are loading…')).toBeInTheDocument()
    })
  })
})
