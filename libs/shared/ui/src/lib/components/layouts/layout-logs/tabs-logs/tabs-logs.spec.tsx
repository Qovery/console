import { screen, render } from '__tests__/utils/setup-jest'

import TabsLogs, { TabsLogsProps, TabsLogsSection } from './tabs-logs'

describe('TabsLogs', () => {
  const props: TabsLogsProps = {
    tabInformation: <div>hello</div>,
    errors: [
      {
        index: 1,
        error: {
          user_log_message: 'user-log-message',
          hint_message: 'hint-message',
          event_details: {
            transmitter: {
              name: 'transmitter-name',
            },
            underlying_error: {
              message: 'underlying-error',
            },
          },
        },
      },
    ],
  }

  it('should render successfully', () => {
    const { baseElement } = render(<TabsLogs {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should display error line', () => {
    props.errors = [
      {
        index: 44,
        error: {},
      },
    ]
    props.defaultSection = TabsLogsSection.ERROR

    render(<TabsLogs {...props} />)

    const errorLine = screen.getByTestId('error-line')

    expect(errorLine.textContent).toBe('Line 44 ')
  })

  it('should have error message', () => {
    props.errors = [
      {
        index: 0,
        error: {
          event_details: {
            transmitter: {
              name: 'transmitter-name',
            },
            underlying_error: {
              message: 'underlying-error',
            },
          },
        },
      },
    ]
    props.defaultSection = TabsLogsSection.ERROR

    render(<TabsLogs {...props} />)

    const errorMsg = screen.getByTestId('error-msg')

    const msg = `Transmitter: ${props.errors[0].error.event_details?.transmitter?.name} - ${props.errors[0].error.event_details?.underlying_error?.message}`

    expect(errorMsg.textContent).toBe(msg)
  })

  it('should have solution message', () => {
    props.errors = [
      {
        index: 0,
        error: {
          hint_message: 'my-solution',
        },
      },
    ]
    props.defaultSection = TabsLogsSection.ERROR

    render(<TabsLogs {...props} />)

    const solutionMsg = screen.getByTestId('solution-msg')

    expect(solutionMsg.textContent).toBe(props.errors[0].error.hint_message)
  })

  it('should have no error message screen', () => {
    props.errors = []
    props.defaultSection = TabsLogsSection.ERROR

    render(<TabsLogs {...props} />)

    const noErrorScreen = screen.getByTestId('no-error-screen')

    expect(noErrorScreen).toBeTruthy()
  })

  it('should have information section', () => {
    props.tabInformation = <div>hello</div>

    props.defaultSection = TabsLogsSection.INFORMATION

    render(<TabsLogs {...props} />)

    const sections = screen.getByTestId('sections')

    expect(sections.querySelector('div')?.textContent).toBe('hello')
  })
})
