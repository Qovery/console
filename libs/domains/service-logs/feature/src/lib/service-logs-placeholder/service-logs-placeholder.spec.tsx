import { DatabaseModeEnum, StateEnum } from 'qovery-typescript-axios'
import { useDeploymentStatus } from '@qovery/domains/services/feature'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { ServiceLogsPlaceholder } from './service-logs-placeholder'

jest.mock('@qovery/domains/services/feature', () => ({
  useDeploymentStatus: jest.fn(),
}))

const mockUseDeploymentStatus = useDeploymentStatus as jest.Mock

describe('ServiceLogsPlaceholder', () => {
  it('renders LoaderPlaceholder when not fetched', () => {
    mockUseDeploymentStatus.mockReturnValue({
      data: { state: StateEnum.READY, execution_id: 'exec-123' },
    })

    renderWithProviders(
      <ServiceLogsPlaceholder
        type="live"
        serviceName="my-app"
        databaseMode={DatabaseModeEnum.CONTAINER}
        itemsLength={0}
        isFetched={false}
      />
    )

    expect(screen.getByText('Service logs are loading…')).toBeInTheDocument()
  })

  it('renders no logs message when fetched', async () => {
    mockUseDeploymentStatus.mockReturnValue({
      data: { state: StateEnum.READY, execution_id: 'exec-123' },
    })

    renderWithProviders(
      <ServiceLogsPlaceholder
        type="live"
        serviceName="my-app"
        databaseMode={DatabaseModeEnum.CONTAINER}
        itemsLength={10}
        isFetched={true}
      />
    )

    // Wait for the expected content to appear
    await waitFor(
      () => {
        expect(screen.getByText(/No logs are available for/)).toBeInTheDocument()
        expect(screen.getByText(/my-app/)).toBeInTheDocument()
      },
      { timeout: 10000 }
    )
  })

  it('renders managed database message', async () => {
    mockUseDeploymentStatus.mockReturnValue({
      data: { state: StateEnum.READY, execution_id: 'exec-123' },
    })

    renderWithProviders(
      <ServiceLogsPlaceholder
        type="live"
        serviceName="my-db"
        databaseMode={DatabaseModeEnum.MANAGED}
        itemsLength={10}
        isFetched={true}
      />
    )

    // Wait for the expected content to appear
    await waitFor(
      () => {
        expect(screen.getByText(/Managed databases are handled by your cloud provider/)).toBeInTheDocument()
      },
      { timeout: 10000 }
    )
  })
})
