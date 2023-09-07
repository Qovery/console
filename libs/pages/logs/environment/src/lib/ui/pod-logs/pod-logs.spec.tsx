import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PodLogs, { type PodLogsProps } from './pod-logs'

window.HTMLElement.prototype.scroll = function () {}

describe('PodLogs', () => {
  const props: PodLogsProps = {
    logs: [
      {
        id: 0,
        pod_name: 'pod-1',
        created_at: 1667834316521,
        message: 'Log message 1',
        version: 'abcdefg',
      },
      {
        id: 1,
        pod_name: 'pod-2',
        created_at: 1667834316621,
        message: 'Log message 2',
        version: 'bcddefg',
      },
    ],
    loadingStatus: 'loaded',
    pauseStatusLogs: false,
    setPauseStatusLogs: jest.fn(),
    service: applicationFactoryMock(1)[0],
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PodLogs {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should displays the correct number of logs', () => {
    renderWithProviders(<PodLogs {...props} />)
    const logRows = screen.getAllByTestId('pod-log-row')
    expect(logRows.length).toBe(props.logs.length)
  })

  it('should filters logs by pod name', async () => {
    const { userEvent } = renderWithProviders(<PodLogs {...props} />)
    const podFilter = screen.getByText('Pod name')
    await userEvent.click(podFilter)

    const filterPod1 = screen.getAllByTestId('menuItem')[0]
    await userEvent.click(filterPod1)

    const logRows = screen.getAllByTestId('pod-log-row')
    expect(logRows.length).toBe(1)
  })
})
