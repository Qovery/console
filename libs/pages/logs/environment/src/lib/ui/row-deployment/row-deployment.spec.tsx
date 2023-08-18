import { render, screen } from '__tests__/utils/setup-jest'
import { LogsType } from '@qovery/shared/enums'
import { deploymentLogFactoryMock } from '@qovery/shared/factories'
import RowDeployment, { RowDeploymentProps } from './row-deployment'

jest.mock('date-fns-tz', () => ({
  format: jest.fn(() => '20 Sept, 19:44:44:44'),
  utcToZonedTime: jest.fn(),
}))

describe('RowDeployment', () => {
  const props: RowDeploymentProps = {
    data: deploymentLogFactoryMock(1)[0],
    index: 1,
  }

  it('should render successfully', () => {
    const { baseElement } = render(<RowDeployment {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have success index color', () => {
    props.data = {
      type: LogsType.INFO,
      timestamp: new Date().toString(),
      details: {
        stage: {
          step: 'Deployed',
        },
      },
    }

    render(<RowDeployment {...props} />)

    const index = screen.getByTestId('index')

    expect(index).toHaveClass('text-green-500 bg-element-light-darker-200 group-hover:bg-element-light-darker-400')
  })

  it('should have error index color', () => {
    props.data = {
      type: LogsType.ERROR,
      timestamp: new Date().toString(),
      details: {
        stage: {
          step: 'DeployedError',
        },
      },
    }

    render(<RowDeployment {...props} />)

    const index = screen.getByTestId('index')

    expect(index).toHaveClass('text-red-500 bg-element-light-darker-200 group-hover:bg-element-light-darker-400')
  })

  it('should have error cell date color', () => {
    props.data = {
      type: LogsType.ERROR,
      timestamp: new Date().toString(),
      details: {
        stage: {
          step: 'DeployedError',
        },
      },
    }

    render(<RowDeployment {...props} />)

    const cellDate = screen.getByTestId('cell-date')

    expect(cellDate).toHaveClass('py-1 pl-2 pr-3 font-code shrink-0 w-[158px] text-red-500')
  })

  it('should have success cell date color', () => {
    props.data = {
      type: LogsType.INFO,
      timestamp: new Date().toString(),
      details: {
        stage: {
          step: 'Deployed',
        },
      },
    }

    render(<RowDeployment {...props} />)

    const cellDate = screen.getByTestId('cell-date')

    expect(cellDate).toHaveClass('py-1 pl-2 pr-3 font-code shrink-0 w-[158px] text-green-500')
  })

  it('should have cell success message', () => {
    props.data = {
      type: LogsType.INFO,
      timestamp: new Date().toString(),
      details: {
        stage: {
          step: 'Deployed',
        },
        transmitter: {
          name: 'message',
        },
      },
      message: {
        safe_message: 'message',
      },
    }

    render(<RowDeployment {...props} />)

    const cellMsg = screen.getByTestId('cell-msg')

    expect(cellMsg).toHaveClass('py-1 pr-6 font-code relative w-full overflow-hidden text-green-500')
    expect(cellMsg?.textContent).toBe(props.data.message?.safe_message)
  })

  it('should have cell error message', () => {
    props.data = {
      type: LogsType.ERROR,
      timestamp: new Date().toString(),
      details: {
        stage: {
          step: 'DeployedError',
        },
      },
      error: {
        user_log_message: 'error message',
      },
    }

    render(<RowDeployment {...props} />)

    const cellMsg = screen.getByTestId('cell-msg')

    expect(cellMsg).toHaveClass('py-1 pr-6 font-code relative w-full overflow-hidden text-red-500')
    expect(cellMsg?.textContent).toBe(props.data.error?.user_log_message)
  })

  it('should have cell message with ANSI colors and links', () => {
    props.data = {
      type: LogsType.INFO,
      timestamp: new Date().toString(),
      details: {
        stage: {
          step: 'Deployed',
        },
        transmitter: {
          name: 'message',
        },
      },
      message: {
        safe_message: '\x1b[F\x1b[31;1mmy message https://qovery.com\x1b[m\x1b[E',
      },
    }

    render(<RowDeployment {...props} />)

    const cellMsg = screen.getByTestId('cell-msg')

    expect(cellMsg?.textContent).toBe('my message https://qovery.com')
    expect(cellMsg.innerHTML.toString()).toContain('style="color: rgb(187, 0, 0);"')
    expect(cellMsg.innerHTML.toString()).toContain(
      '<a href="https://qovery.com" target="_blank">https://qovery.com</a>'
    )
  })
})
