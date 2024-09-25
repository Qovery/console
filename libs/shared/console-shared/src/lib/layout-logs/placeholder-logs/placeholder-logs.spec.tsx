import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PlaceholderLogs, { type PlaceholderLogsProps } from './placeholder-logs'

describe('PlaceholderLogs', () => {
  const props: PlaceholderLogsProps = {
    type: 'infra',
    loadingStatus: 'not loaded',
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PlaceholderLogs {...props} />)
    expect(baseElement).toBeTruthy()
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
