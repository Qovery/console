import { render, waitFor } from '__tests__/utils/setup-jest'
import { applicationFactoryMock } from '@qovery/shared/factories'
import PodLogs, { type PodLogsProps } from './pod-logs'

window.HTMLElement.prototype.scroll = function () {}

describe('PodLogs', () => {
  const props: PodLogsProps = {
    logs: [
      {
        id: '0',
        pod_name: 'pod-1',
        created_at: '2023-04-09T20:30:00.000Z',
        message: 'Log message 1',
        version: 'abcdefg',
      },
      {
        id: '1',
        pod_name: 'pod-2',
        created_at: '2023-05-09T20:30:00.000Z',
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
    const { baseElement } = render(<PodLogs {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should displays the correct number of logs', () => {
    const { getAllByTestId } = render(<PodLogs {...props} />)
    const logRows = getAllByTestId('pod-log-row')
    expect(logRows.length).toBe(props.logs.length)
  })

  it('should filters logs by pod name', () => {
    const { getByText, getAllByTestId } = render(<PodLogs {...props} />)
    const podFilter = getByText('Pod name')
    podFilter.click()

    const filterPod1 = getAllByTestId('menuItem')[0]
    filterPod1.click()

    waitFor(() => {
      const logRows = getAllByTestId('pod-log-row')
      expect(logRows.length).toBe(1)
    })
  })
})
