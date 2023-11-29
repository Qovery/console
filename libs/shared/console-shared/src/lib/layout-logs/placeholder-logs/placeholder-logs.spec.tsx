import { DatabaseModeEnum, ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PlaceholderLogs, { type PlaceholderLogsProps } from './placeholder-logs'

describe('PlaceholderLogs', () => {
  const props: PlaceholderLogsProps = {
    type: 'deployment',
    serviceName: 'my-app',
    loadingStatus: 'not loaded',
    customPlaceholder: <div>custom placeholder</div>,
    itemsLength: 0,
    hideLogs: true,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PlaceholderLogs {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('Deployment - display loader screen', () => {
    renderWithProviders(<PlaceholderLogs {...props} />)
    screen.getByTestId('spinner')
  })

  it('Deployment - should render a custom placeholder', () => {
    props.loadingStatus = 'loaded'
    renderWithProviders(<PlaceholderLogs {...props} />)

    screen.getByText('custom placeholder')
  })

  it('Deployment - should render a no log placeholder', () => {
    props.loadingStatus = 'loaded'
    props.customPlaceholder = undefined
    props.serviceDeploymentStatus = ServiceDeploymentStatusEnum.NEVER_DEPLOYED
    renderWithProviders(<PlaceholderLogs {...props} />)

    screen.getByText(props.serviceName as string)
    screen.getByText(/No logs on this execution for/i)
  })

  it('Live - should render a placeholder with spinner if logs not loaded', () => {
    props.type = 'live'
    props.loadingStatus = 'not loaded'
    renderWithProviders(<PlaceholderLogs {...props} />)

    screen.getByTestId('spinner')
  })

  it('Live - should render a no log placeholder for Managed DB', () => {
    props.type = 'live'
    props.loadingStatus = 'loaded'
    props.databaseMode = DatabaseModeEnum.MANAGED
    renderWithProviders(<PlaceholderLogs {...props} />)

    screen.getByText(props.serviceName as string)
    screen.getByText(/No logs are available for/i)
    screen.getByText(
      /Managed Databases are managed by your cloud providers. Logs can be found within your cloud provider console./i
    )
  })

  it('Infra - should render a placeholder with spinner if logs not loaded', () => {
    props.type = 'infra'
    props.loadingStatus = 'not loaded'
    renderWithProviders(<PlaceholderLogs {...props} />)

    screen.getByTestId('spinner')
  })

  it('Infra - should render a placeholder with spinner if logs not loaded', () => {
    props.type = 'infra'
    props.loadingStatus = 'loaded'
    renderWithProviders(<PlaceholderLogs {...props} />)

    screen.getByText('No logs available.')
  })
})
