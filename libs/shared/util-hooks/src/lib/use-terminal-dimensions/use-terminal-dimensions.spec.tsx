import { render, screen } from '@qovery/shared/util-tests'
import { useTerminalDimensions } from './use-terminal-dimensions'

// jsdom does not lay out elements, so we stub the geometry the hook reads. The
// returned box lets a test mutate the size after mount to simulate a resize.
function mockElementBox(width: number, height: number, padding = 0) {
  const box = { width, height }
  jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => box.width)
  jest.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => box.height)
  jest.spyOn(window, 'getComputedStyle').mockReturnValue({
    paddingLeft: `${padding}px`,
    paddingRight: `${padding}px`,
    paddingTop: `${padding}px`,
    paddingBottom: `${padding}px`,
  } as CSSStyleDeclaration)
  return box
}

function TestComponent(props: Parameters<typeof useTerminalDimensions>[0]) {
  const { ref, cols, rows } = useTerminalDimensions(props)
  return (
    <div ref={ref} data-testid="terminal-container">
      <span data-testid="cols">{cols}</span>
      <span data-testid="rows">{rows}</span>
    </div>
  )
}

function readDimensions() {
  return {
    cols: Number(screen.getByTestId('cols').textContent),
    rows: Number(screen.getByTestId('rows').textContent),
  }
}

function renderDimensions(props: Parameters<typeof useTerminalDimensions>[0]) {
  const { rerender } = render(<TestComponent {...props} />)
  return { ...readDimensions(), rerender: () => rerender(<TestComponent {...props} />) }
}

describe('useTerminalDimensions', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('computes cols and rows from the measured container box', () => {
    mockElementBox(800, 400)

    // 800 / 8 = 100 cols, 400 / 16 = 25 rows
    const { cols, rows } = renderDimensions({ cellWidth: 8, cellHeight: 16 })
    expect({ cols, rows }).toEqual({ cols: 100, rows: 25 })
  })

  it('subtracts container padding before dividing by the cell size', () => {
    mockElementBox(800, 400, 20)

    // (800 - 40) / 8 = 95 cols, (400 - 40) / 16 = 22.5 -> 22 rows
    const { cols, rows } = renderDimensions({ cellWidth: 8, cellHeight: 16 })
    expect({ cols, rows }).toEqual({ cols: 95, rows: 22 })
  })

  it('respects the configured minimum columns and rows', () => {
    mockElementBox(100, 8)

    // 100 / 9 = 11 cols but min is 80; 8 / 14 = 0 rows but min is 1
    const { cols, rows } = renderDimensions({ cellWidth: 9, cellHeight: 14, minCols: 80, minRows: 1 })
    expect({ cols, rows }).toEqual({ cols: 80, rows: 1 })
  })

  it('does not re-measure after the initial capture, so a resize keeps the socket dimensions stable', () => {
    // The returned cols/rows feed the websocket connect params; the subscription
    // reconnects when they change. Latching on capture is what keeps a running
    // shell alive across window/panel resizes.
    const box = mockElementBox(800, 400)

    const { cols, rows, rerender } = renderDimensions({ cellWidth: 8, cellHeight: 16 })
    expect({ cols, rows }).toEqual({ cols: 100, rows: 25 })

    // Simulate a resize + re-render: the reported dimensions must not change.
    box.width = 400
    box.height = 200
    rerender()

    expect(readDimensions()).toEqual({ cols: 100, rows: 25 })
  })

  it('keeps the min defaults when the container is not laid out yet (0x0)', () => {
    // A 0x0 box means layout has not resolved; we must not latch a bogus size.
    mockElementBox(0, 0)

    const { cols, rows } = renderDimensions({ cellWidth: 8, cellHeight: 16, minCols: 80, minRows: 1 })
    expect({ cols, rows }).toEqual({ cols: 80, rows: 1 })
  })
})
