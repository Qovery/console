import { ClusterLogsStepEnum } from 'qovery-typescript-axios'
import { createRef } from 'react'
import { clusterLogFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ClusterLogsList from './cluster-logs-list'

describe('ClusterLogsList', () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scroll = jest.fn()
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 100 })
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, value: 500 })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully', () => {
    const refScrollSection = createRef<HTMLDivElement>()
    const { baseElement } = renderWithProviders(
      <ClusterLogsList
        logs={clusterLogFactoryMock(3, true)}
        firstDate={new Date('2026-02-13T16:16:19.000Z')}
        refScrollSection={refScrollSection}
      />
    )

    expect(baseElement).toBeTruthy()
  })

  it('aligns every step using the longest label in the deployment', () => {
    const logs = clusterLogFactoryMock(2, true).map((log, index) => ({
      ...log,
      step: index === 0 ? ClusterLogsStepEnum.CREATE : ClusterLogsStepEnum.LOAD_CONFIGURATION,
    }))

    renderWithProviders(<ClusterLogsList logs={logs} refScrollSection={createRef<HTMLDivElement>()} />)

    const labels = screen.getAllByTestId('cell-step').map((element) => element.textContent)
    expect(labels).toEqual(['Create            - ', 'LoadConfiguration - '])
  })

  it('realigns existing rows when a longer step arrives', () => {
    const logs = clusterLogFactoryMock(2, true).map((log) => ({ ...log, step: ClusterLogsStepEnum.CREATE }))
    const refScrollSection = createRef<HTMLDivElement>()
    const { rerender } = renderWithProviders(<ClusterLogsList logs={logs} refScrollSection={refScrollSection} />)

    expect(screen.getAllByTestId('cell-step')[0]).toHaveTextContent('Create - ', { normalizeWhitespace: false })

    rerender(
      <ClusterLogsList
        logs={[...logs, { ...logs[0], step: ClusterLogsStepEnum.LOAD_CONFIGURATION }]}
        refScrollSection={refScrollSection}
      />
    )

    expect(screen.getAllByTestId('cell-step').map((element) => element.textContent)).toEqual([
      'Create            - ',
      'Create            - ',
      'LoadConfiguration - ',
    ])
  })

  it('should render only the latest 500 logs by default', () => {
    const refScrollSection = createRef<HTMLDivElement>()

    renderWithProviders(
      <ClusterLogsList
        logs={clusterLogFactoryMock(501, true).map((log, index) => ({
          ...log,
          step: index === 0 ? ClusterLogsStepEnum.LOAD_CONFIGURATION : ClusterLogsStepEnum.CREATE,
        }))}
        firstDate={new Date('2026-02-13T16:16:19.000Z')}
        refScrollSection={refScrollSection}
      />
    )

    expect(screen.getAllByTestId('index')).toHaveLength(500)
    expect(screen.getByRole('button', { name: /load previous logs/i })).toBeInTheDocument()
    expect(screen.getAllByTestId('index')[0]).toHaveTextContent('2')
    expect(screen.getAllByTestId('cell-step')[0]).toHaveTextContent('Create            - ', {
      normalizeWhitespace: false,
    })
  })

  it('should render all logs when previous logs are requested', async () => {
    const refScrollSection = createRef<HTMLDivElement>()

    const { userEvent } = renderWithProviders(
      <ClusterLogsList
        logs={clusterLogFactoryMock(501, true)}
        firstDate={new Date('2026-02-13T16:16:19.000Z')}
        refScrollSection={refScrollSection}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /load previous logs/i }))

    expect(screen.getAllByTestId('index')).toHaveLength(501)
    expect(screen.getAllByTestId('index')[0]).toHaveTextContent('1')
  })
})
