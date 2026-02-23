import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useServiceImport from '../hooks/use-service/use-service'
import { ServiceOverviewFeature } from './service-overview-feature'

jest.mock('@qovery/shared/util-web-sockets', () => ({
  MetricsWebSocketListener: () => null,
}))

jest.mock('./service-overview', () => ({
  ServiceOverview: () => <div data-testid="service-overview">ServiceOverview</div>,
}))

describe('ServiceOverviewFeature', () => {
  it('should render nothing when service is not loaded', () => {
    jest.spyOn(useServiceImport, 'useService').mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
    })
    renderWithProviders(
      <ServiceOverviewFeature organizationId="org-1" projectId="proj-1" environmentId="env-1" serviceId="svc-1" />
    )
    expect(screen.queryByTestId('service-overview')).not.toBeInTheDocument()
  })

  it('should render ServiceOverview when service is loaded', () => {
    jest.spyOn(useServiceImport, 'useService').mockReturnValue({
      data: {
        id: 'svc-1',
        serviceType: 'APPLICATION',
        name: 'my-app',
      },
      isLoading: false,
      error: null,
      isError: false,
    })
    renderWithProviders(
      <ServiceOverviewFeature organizationId="org-1" projectId="proj-1" environmentId="env-1" serviceId="svc-1" />
    )
    expect(screen.getByTestId('service-overview')).toBeInTheDocument()
  })

  it('should render nothing when serviceId is empty', () => {
    jest.spyOn(useServiceImport, 'useService').mockReturnValue({
      data: { id: 'svc-1', serviceType: 'APPLICATION', name: 'my-app' },
      isLoading: false,
      error: null,
      isError: false,
    })
    renderWithProviders(
      <ServiceOverviewFeature organizationId="org-1" projectId="proj-1" environmentId="env-1" serviceId="" />
    )
    expect(screen.queryByTestId('service-overview')).not.toBeInTheDocument()
  })
})
