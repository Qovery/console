import { render, screen } from '__tests__/utils/setup-jest'
import { ClusterLogsStepEnum } from 'qovery-typescript-axios'
import TabsClusterLogs, { type TabsClusterLogsProps, TabsClusterLogsSection } from './tabs-cluster-logs'

describe('TabsClusterLogs', () => {
  const props: TabsClusterLogsProps = {
    tabInformation: <div>hello</div>,
    scrollToError: jest.fn(),
    errors: [
      {
        index: 1,
        step: ClusterLogsStepEnum.RETRIEVE_CLUSTER_CONFIG,
        timeAgo: '10',
        error: {
          user_log_message: 'user-log-message',
          hint_message: 'hint-message',
          event_details: {
            transmitter: {
              name: 'transmitter-name',
            },
          },
          underlying_error: {
            message: 'underlying-error',
          },
        },
      },
    ],
  }

  it('should render successfully', () => {
    const { baseElement } = render(<TabsClusterLogs {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should display error line', () => {
    props.errors = [
      {
        index: 44,
        step: ClusterLogsStepEnum.RETRIEVE_CLUSTER_CONFIG,
        timeAgo: '10',
        error: {},
      },
    ]
    props.defaultSection = TabsClusterLogsSection.ERROR

    render(<TabsClusterLogs {...props} />)

    const errorLine = screen.getByTestId('error-line')

    expect(errorLine).toHaveTextContent('Line 44 - After 10 minutes')
  })

  it('should have error message', () => {
    props.errors = [
      {
        index: 0,
        step: ClusterLogsStepEnum.DELETE_ERROR,
        timeAgo: '10',
        error: {
          event_details: {
            transmitter: {
              name: 'transmitter-name',
            },
          },
          underlying_error: {
            message: 'underlying-error',
          },
        },
      },
    ]
    props.defaultSection = TabsClusterLogsSection.ERROR

    render(<TabsClusterLogs {...props} />)

    const errorMsg = screen.getByTestId('error-msg')

    const msg = `Transmitter: ${props.errors[0].error.event_details?.transmitter?.name} - ${props.errors[0].error?.underlying_error?.message}`

    expect(errorMsg).toHaveTextContent(msg)
  })

  it('should have solution message', () => {
    props.errors = [
      {
        index: 0,
        step: ClusterLogsStepEnum.DELETE_ERROR,
        timeAgo: '10',
        error: {
          hint_message: 'my-solution',
        },
      },
    ]
    props.defaultSection = TabsClusterLogsSection.ERROR

    render(<TabsClusterLogs {...props} />)

    const solutionMsg = screen.getByTestId('solution-msg')

    expect(solutionMsg).toHaveTextContent(props.errors[0].error.hint_message)
  })

  it('should have no error message screen', () => {
    props.errors = []
    props.defaultSection = TabsClusterLogsSection.ERROR

    render(<TabsClusterLogs {...props} />)

    const noErrorScreen = screen.getByTestId('no-error-screen')

    expect(noErrorScreen).toBeInTheDocument()
  })

  it('should have information section', () => {
    props.tabInformation = <div>hello</div>

    props.defaultSection = TabsClusterLogsSection.INFORMATION

    render(<TabsClusterLogs {...props} />)

    const sections = screen.getByTestId('sections')

    expect(sections.querySelector('div')?.textContent).toBe('hello')
  })
})
