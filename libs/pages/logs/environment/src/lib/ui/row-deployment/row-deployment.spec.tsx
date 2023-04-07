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

    expect(index).toHaveClass('bg-success-500 text-text-800 group-hover:bg-success-600')
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

    expect(index).toHaveClass('bg-error-500 text-text-800 group-hover:bg-error-600')
  })

  it('should have cell status format text', () => {
    props.data = {
      type: LogsType.INFO,
      timestamp: new Date().toString(),
      details: {
        stage: {
          step: 'DeploymentInProgress',
        },
      },
    }

    render(<RowDeployment {...props} />)

    const cellDate = screen.getByTestId('cell-status')

    expect(cellDate.textContent).toBe('Deployment_In_Progress')
    expect(cellDate).toHaveClass(
      'py-1 pl-2.5 pr-2 text-2xs font-bold shrink-0 truncate uppercase w-[154px] text-accent2-400'
    )
  })

  it('should have error cell status color', () => {
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

    const cellDate = screen.getByTestId('cell-status')

    expect(cellDate).toHaveClass(
      'py-1 pl-2.5 pr-2 text-2xs font-bold shrink-0 truncate uppercase w-[154px] text-error-500'
    )
  })

  it('should have success cell status color', () => {
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

    const cellDate = screen.getByTestId('cell-status')

    expect(cellDate).toHaveClass(
      'py-1 pl-2.5 pr-2 text-2xs font-bold shrink-0 truncate uppercase w-[154px] text-success-400'
    )
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

    expect(cellDate).toHaveClass('py-1 px-2 font-code shrink-0 w-[154px] text-error-500')
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

    expect(cellDate).toHaveClass('py-1 px-2 font-code shrink-0 w-[154px] text-success-500')
  })

  it('should have cell with scope name', () => {
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
    }

    render(<RowDeployment {...props} />)

    const cellScope = screen.getByTestId('cell-scope')
    expect(cellScope.textContent).toBe(props.data.details.transmitter?.name)
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

    expect(cellMsg).toHaveClass(
      'py-1 pl-4 pr-6 font-code relative w-[calc(100%-502px)] overflow-hidden text-success-500'
    )
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

    expect(cellMsg).toHaveClass('py-1 pl-4 pr-6 font-code relative w-[calc(100%-502px)] overflow-hidden text-error-500')
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
