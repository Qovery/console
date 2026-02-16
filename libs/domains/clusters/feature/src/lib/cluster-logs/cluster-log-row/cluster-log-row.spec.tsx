import { ClusterLogsStepEnum } from 'qovery-typescript-axios'
import { LogsType } from '@qovery/shared/enums'
import { clusterLogFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ClusterLogRow, { type ClusterLogRowProps } from './cluster-log-row'

describe('ClusterLogRow', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-02-13T16:15:10.000Z'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  const baseData = {
    ...clusterLogFactoryMock(1, true)[0],
    timestamp: '2026-02-13T16:16:19.000Z',
  }
  const firstDate = new Date('2026-02-13T16:16:19.000Z')

  it('should render successfully', () => {
    const props: ClusterLogRowProps = {
      data: baseData,
      index: 1,
      firstDate,
    }
    const { baseElement } = renderWithProviders(<ClusterLogRow {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should display the correct index', () => {
    renderWithProviders(<ClusterLogRow data={baseData} index={5} firstDate={firstDate} />)
    expect(screen.getByTestId('index')).toHaveTextContent('6')
  })

  it('should have warning index color', () => {
    const data = { ...baseData, type: LogsType.WARNING }
    renderWithProviders(<ClusterLogRow data={data} index={1} firstDate={firstDate} />)
    const index = screen.getByTestId('index')
    expect(index).toHaveClass('bg-surface-neutral-subtle', 'text-neutral-subtle')
  })

  it('should have error index color', () => {
    const data = { ...baseData, type: LogsType.ERROR }
    renderWithProviders(<ClusterLogRow data={data} index={1} firstDate={firstDate} />)
    const index = screen.getByTestId('index')
    expect(index).toHaveClass('bg-surface-neutral-subtle', 'text-neutral-subtle')
  })

  it('should have real error index color', () => {
    const data = { ...baseData, type: LogsType.ERROR, step: ClusterLogsStepEnum.DELETE_ERROR }
    renderWithProviders(<ClusterLogRow data={data} index={1} firstDate={firstDate} />)
    const index = screen.getByTestId('index')
    expect(index).toHaveClass('bg-surface-negative-component', 'text-neutral')
  })

  it('should have success index color', () => {
    const data = { ...baseData, step: ClusterLogsStepEnum.CREATED }
    renderWithProviders(<ClusterLogRow data={data} index={1} firstDate={firstDate} />)
    const index = screen.getByTestId('index')
    expect(index).toHaveClass('bg-surface-positive-component', 'text-neutral')
  })

  it('should have warning cell date color', () => {
    const data = { ...baseData, type: LogsType.WARNING }
    renderWithProviders(<ClusterLogRow data={data} index={1} firstDate={firstDate} />)
    expect(screen.getByTestId('cell-date')).toHaveClass('text-warning')
  })

  it('should have error cell date color', () => {
    const data = { ...baseData, type: LogsType.ERROR }
    renderWithProviders(<ClusterLogRow data={data} index={1} firstDate={firstDate} />)
    expect(screen.getByTestId('cell-date')).toHaveClass('text-negative')
  })

  it('should have success cell date color', () => {
    const data = { ...baseData, step: ClusterLogsStepEnum.CREATED }
    renderWithProviders(<ClusterLogRow data={data} index={1} firstDate={firstDate} />)
    expect(screen.getByTestId('cell-date')).toHaveClass('text-positive')
  })

  it('should display cell message', () => {
    const data = {
      ...baseData,
      step: ClusterLogsStepEnum.CREATED,
      message: { safe_message: 'hello world' },
    }
    renderWithProviders(<ClusterLogRow data={data} index={1} firstDate={firstDate} />)
    expect(screen.getByTestId('cell-msg')).toHaveTextContent('hello world')
    expect(screen.getByTitle('Fri, 13 Feb 2026 16:16:19 GMT')).toBeInTheDocument()
  })

  it('should display cell error message', () => {
    const data = {
      ...baseData,
      type: LogsType.ERROR,
      step: ClusterLogsStepEnum.DELETE_ERROR,
      error: { user_log_message: 'error message' },
    }
    renderWithProviders(<ClusterLogRow data={data} index={1} firstDate={firstDate} />)
    expect(screen.getByTestId('cell-msg')).toHaveTextContent('error message')
    expect(screen.getByTitle('Fri, 13 Feb 2026 16:16:19 GMT')).toBeInTheDocument()
  })

  it('should display message when type is not ERROR', () => {
    const data = { ...baseData, type: LogsType.INFO, message: { safe_message: 'info message' } }
    renderWithProviders(<ClusterLogRow data={data} index={1} firstDate={firstDate} />)
    expect(screen.getByTestId('cell-msg')).toHaveTextContent('info message')
  })

  it('should display error message when type is ERROR', () => {
    const data = { ...baseData, type: LogsType.ERROR, error: { user_log_message: 'error occurred' } }
    renderWithProviders(<ClusterLogRow data={data} index={1} firstDate={firstDate} />)
    expect(screen.getByTestId('cell-msg')).toHaveTextContent('error occurred')
  })

  it('should render without firstDate', () => {
    renderWithProviders(<ClusterLogRow data={baseData} index={1} />)
    expect(screen.getByTestId('cell-date')).toBeInTheDocument()
  })
})
