import { LogsType } from '@qovery/shared/enums'
import { deploymentLogFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import RowDeployment, { type RowDeploymentProps } from './row-deployment'

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
    const { baseElement } = renderWithProviders(<RowDeployment {...props} />)
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

    renderWithProviders(<RowDeployment {...props} />)

    const index = screen.getByTestId('index')

    expect(index).toHaveClass('text-green-500 bg-neutral-550 group-hover:bg-neutral-650')
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

    renderWithProviders(<RowDeployment {...props} />)

    const index = screen.getByTestId('index')

    expect(index).toHaveClass('text-red-500 bg-neutral-550 group-hover:bg-neutral-650')
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

    renderWithProviders(<RowDeployment {...props} />)

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

    renderWithProviders(<RowDeployment {...props} />)

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

    const { container } = renderWithProviders(<RowDeployment {...props} />)
    expect(container).toMatchSnapshot()
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

    const { container } = renderWithProviders(<RowDeployment {...props} />)
    expect(container).toMatchSnapshot()
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

    const { container } = renderWithProviders(<RowDeployment {...props} />)
    expect(container).toMatchSnapshot()
  })
})
