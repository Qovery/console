import { createRef } from 'react'
import { clusterLogFactoryMock } from '@qovery/shared/factories'
import { act, fireEvent, renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
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

  it('should render only the latest 500 logs by default', () => {
    const refScrollSection = createRef<HTMLDivElement>()

    renderWithProviders(
      <ClusterLogsList
        logs={clusterLogFactoryMock(501, true)}
        firstDate={new Date('2026-02-13T16:16:19.000Z')}
        refScrollSection={refScrollSection}
      />
    )

    expect(screen.getAllByTestId('index')).toHaveLength(500)
    expect(screen.getByRole('button', { name: /load previous logs/i })).toBeInTheDocument()
    expect(screen.getAllByTestId('index')[0]).toHaveTextContent('2')
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

  it('should not auto-scroll when the user is no longer near the bottom', async () => {
    const refScrollSection = createRef<HTMLDivElement>()
    const initialLogs = clusterLogFactoryMock(2, true)
    const nextLogs = [...initialLogs, ...clusterLogFactoryMock(1, true)]

    const { rerender } = renderWithProviders(
      <ClusterLogsList
        logs={initialLogs}
        firstDate={new Date('2026-02-13T16:16:19.000Z')}
        refScrollSection={refScrollSection}
      />
    )

    const scrollSection = screen.getByTestId('cluster-logs-scroll-section')

    Object.defineProperty(scrollSection, 'scrollTop', { configurable: true, writable: true, value: 0 })

    await waitFor(() => {
      expect(window.HTMLElement.prototype.scroll).toHaveBeenCalledTimes(1)
    })

    act(() => {
      fireEvent.scroll(scrollSection, { target: { scrollTop: 0 } })
    })
    ;(window.HTMLElement.prototype.scroll as jest.Mock).mockClear()

    rerender(
      <ClusterLogsList
        logs={nextLogs}
        firstDate={new Date('2026-02-13T16:16:19.000Z')}
        refScrollSection={refScrollSection}
      />
    )

    expect(window.HTMLElement.prototype.scroll).not.toHaveBeenCalled()
  })
})
