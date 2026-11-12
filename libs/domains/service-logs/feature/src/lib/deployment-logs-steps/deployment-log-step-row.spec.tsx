import { Provider as TooltipProvider } from '@radix-ui/react-tooltip'
import { act, render, renderWithProviders, screen } from '@qovery/shared/util-tests'
import { type EnvironmentLogIds } from '../hooks/use-deployment-logs/use-deployment-logs'
import {
  DeploymentLogStatusIcon,
  DeploymentLogStepRow,
  type DeploymentLogStepRowProps,
} from './deployment-log-step-row'

function createLines(count: number): EnvironmentLogIds[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    type: 'info',
    timestamp: '2026-10-26T08:38:30Z',
    details: { stage: { step: 'Build' }, step_name: 'BUILD' },
    message: { safe_message: `Building layer ${index + 1}` },
  }))
}

function renderRow(linesCount: number, overrides: Partial<DeploymentLogStepRowProps> = {}) {
  const props: DeploymentLogStepRowProps = {
    step: { name: 'BUILD', status: 'ONGOING', isLive: true, lines: createLines(linesCount) },
    label: 'Building image',
    isOpen: true,
    searchQuery: '',
    onToggle: jest.fn(),
    onSelectLine: jest.fn(),
    onScrolledToLine: jest.fn(),
    ...overrides,
  }

  return <DeploymentLogStepRow {...props} />
}

function pauseViewer(container: HTMLElement) {
  const viewer = container.querySelector('[data-line-id]')?.parentElement as HTMLElement
  Object.defineProperties(viewer, {
    scrollHeight: { configurable: true, value: 20000 },
    clientHeight: { configurable: true, value: 400 },
  })
  viewer.scrollTop = 200
  // userEvent cannot dispatch scrolling; jsdom has no layout or native scroll events.
  act(() => viewer.dispatchEvent(new Event('scroll', { bubbles: true })))
  return viewer
}

describe('DeploymentLogStepRow', () => {
  it('does not expand a skipped step even when it has logs and is marked open', async () => {
    const onToggle = jest.fn()
    const { userEvent } = renderWithProviders(
      renderRow(1, {
        step: { name: 'BUILD', status: 'SKIP', isLive: false, lines: createLines(1) },
        onToggle,
      })
    )
    const row = screen.getByRole('button', { name: 'Building image' })

    await userEvent.click(row)

    expect(row).toBeDisabled()
    expect(row).not.toHaveAttribute('aria-expanded')
    expect(onToggle).not.toHaveBeenCalled()
    expect(screen.queryByText('Building layer 1')).not.toBeInTheDocument()
  })

  it('labels the skipped status as Skipped', async () => {
    const { container, userEvent } = renderWithProviders(<DeploymentLogStatusIcon status="SKIP" />)

    await userEvent.hover(container.firstElementChild as HTMLElement)

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Skipped')
  })

  it('keeps the paused window when selecting a line that is already visible', () => {
    const { container, rerender } = render(renderRow(1001), { wrapper: TooltipProvider })
    const viewer = pauseViewer(container)
    rerender(renderRow(1003))

    rerender(renderRow(1003, { selectedLineRange: { start: 2, end: 2 } }))

    expect(screen.queryByText('Building layer 1')).not.toBeInTheDocument()
    expect(screen.getByText('Building layer 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show 1 previous line' })).toBeInTheDocument()
    expect(viewer.scrollTop).toBe(200)
  })

  it('reveals a selected line that is actually hidden by the paused window', () => {
    const { container, rerender } = render(renderRow(1001), { wrapper: TooltipProvider })
    pauseViewer(container)
    rerender(renderRow(1003))

    rerender(renderRow(1003, { selectedLineRange: { start: 1, end: 1 } }))

    expect(screen.getByText('Building layer 1')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /previous line/ })).not.toBeInTheDocument()
  })

  it.each([1, 1001])('keeps matches visible when filtering a paused viewer down to %i lines', (matchesCount) => {
    const { container, rerender } = render(renderRow(2000), { wrapper: TooltipProvider })
    pauseViewer(container)
    const matches = createLines(2000).slice(-matchesCount)

    rerender(
      renderRow(2000, {
        searchQuery: 'Building layer',
        step: { name: 'BUILD', status: 'ONGOING', isLive: true, lines: matches },
      })
    )

    expect(container.querySelector('[data-line-id="2000"]')).toHaveTextContent('Building layer 2000')
    expect(container.querySelectorAll('[data-line-id]')).toHaveLength(Math.min(matchesCount, 1000))
  })

  it('keeps the rendered window while reading older output and resumes the cap at the bottom', () => {
    const { container, rerender } = render(renderRow(1001), { wrapper: TooltipProvider })
    const viewer = pauseViewer(container)

    rerender(renderRow(1003))

    expect(screen.getByText('Building layer 2')).toBeInTheDocument()
    expect(screen.getByText('Building layer 1003')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show 1 previous line' })).toBeInTheDocument()
    expect(viewer.scrollTop).toBe(200)

    viewer.scrollTop = 19600
    act(() => viewer.dispatchEvent(new Event('scroll', { bubbles: true })))

    expect(screen.queryByText('Building layer 2')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show 3 previous lines' })).toBeInTheDocument()
  })

  it('keeps following the streamed lines once older ones are hidden', () => {
    // jsdom doesn't scroll: the setter tells when the lines scroll to the bottom
    let scrollTop = 0
    const setScrollTop = jest.fn((value: number) => {
      scrollTop = value
    })
    const getScrollTopSpy = jest.spyOn(HTMLElement.prototype, 'scrollTop', 'get').mockImplementation(() => scrollTop)
    const setScrollTopSpy = jest.spyOn(HTMLElement.prototype, 'scrollTop', 'set').mockImplementation(setScrollTop)

    const { rerender } = render(renderRow(1001), { wrapper: TooltipProvider })
    expect(screen.getByRole('button', { name: 'Show 1 previous line' })).toBeInTheDocument()
    setScrollTop.mockClear()

    rerender(renderRow(1002))

    expect(screen.getByRole('button', { name: 'Show 2 previous lines' })).toBeInTheDocument()
    expect(screen.getByText('Building layer 1002')).toBeInTheDocument()
    expect(setScrollTop).toHaveBeenCalled()

    getScrollTopSpy.mockRestore()
    setScrollTopSpy.mockRestore()
  })
})
