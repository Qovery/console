import { ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
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

  it('Infra - should render a placeholder with spinner if logs not loaded', () => {
    props.type = 'infra'
    props.loadingStatus = 'not loaded'
    renderWithProviders(<PlaceholderLogs {...props} />)

    screen.getByTestId('spinner')
  })

  it('Infra - should render a placeholder with empty state', () => {
    props.type = 'infra'
    props.loadingStatus = 'loaded'
    renderWithProviders(<PlaceholderLogs {...props} />)

    screen.getByText('No logs available (yet).')
  })
})
