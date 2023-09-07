import { ClusterLogsStepEnum } from 'qovery-typescript-axios'
import { LogsType } from '@qovery/shared/enums'
import { clusterLogFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import Row, { type RowProps } from './row'

describe('Row', () => {
  const props: RowProps = {
    data: clusterLogFactoryMock(1, true)[0],
    index: 1,
    firstDate: new Date(),
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<Row {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have warning index color', () => {
    props.data = {
      type: LogsType.WARNING,
    }

    renderWithProviders(<Row {...props} />)

    const index = screen.getByTestId('index')

    expect(index).toHaveClass('bg-neutral-600 text-neutral-350 group-hover:bg-neutral-550')
  })

  it('should have error index color', () => {
    props.data = {
      type: LogsType.ERROR,
    }

    renderWithProviders(<Row {...props} />)

    const index = screen.getByTestId('index')

    expect(index).toHaveClass('bg-neutral-600 text-neutral-350 group-hover:bg-neutral-550')
  })

  it('should have real error index color', () => {
    props.data = {
      type: LogsType.ERROR,
      step: ClusterLogsStepEnum.DELETE_ERROR,
    }

    renderWithProviders(<Row {...props} />)

    const index = screen.getByTestId('index')

    expect(index).toHaveClass('bg-red-500 text-neutral-800 group-hover:bg-red-600')
  })

  it('should have success index color', () => {
    props.data = {
      step: ClusterLogsStepEnum.CREATED,
    }

    renderWithProviders(<Row {...props} />)

    const index = screen.getByTestId('index')

    expect(index).toHaveClass('bg-green-500 text-neutral-800 group-hover:bg-green-600')
  })

  it('should have warning cell date color', () => {
    props.data = {
      type: LogsType.WARNING,
    }

    renderWithProviders(<Row {...props} />)

    const cellDate = screen.getByTestId('cell-date')

    expect(cellDate).toHaveClass('py-1 px-2 text-yellow-500')
  })

  it('should have error cell date color', () => {
    props.data = {
      type: LogsType.ERROR,
    }

    renderWithProviders(<Row {...props} />)

    const cellDate = screen.getByTestId('cell-date')

    expect(cellDate).toHaveClass('py-1 px-2 text-red-500')
  })

  it('should have success cell date color', () => {
    props.data = {
      step: ClusterLogsStepEnum.CREATED,
    }

    renderWithProviders(<Row {...props} />)

    const cellDate = screen.getByTestId('cell-date')

    expect(cellDate).toHaveClass('py-1 px-2 text-green-500')
  })

  it('should have cell message', () => {
    props.data = {
      step: ClusterLogsStepEnum.CREATED,
      message: {
        safe_message: 'hello world',
      },
    }

    const { container } = renderWithProviders(<Row {...props} />)
    expect(container).toMatchSnapshot()
  })

  it('should have cell error message', () => {
    props.data = {
      type: LogsType.ERROR,
      step: ClusterLogsStepEnum.DELETE_ERROR,
      error: {
        user_log_message: 'error message',
      },
    }

    const { container } = renderWithProviders(<Row {...props} />)
    expect(container).toMatchSnapshot()
  })
})
