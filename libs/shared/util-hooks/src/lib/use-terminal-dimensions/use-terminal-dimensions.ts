import { useLayoutEffect, useRef, useState } from 'react'

export interface UseTerminalDimensionsOptions {
  /** Width of a single character cell in pixels (matches the terminal font). */
  cellWidth: number
  /** Height of a single character cell in pixels (matches the terminal font). */
  cellHeight: number
  /** Minimum number of columns, useful to keep TUIs (e.g. k9s) usable on narrow layouts. */
  minCols?: number
  /** Minimum number of rows. */
  minRows?: number
}

export interface TerminalDimensions {
  cols: number
  rows: number
}

function computeDimensions(
  element: HTMLElement,
  { cellWidth, cellHeight, minCols = 2, minRows = 1 }: UseTerminalDimensionsOptions
): TerminalDimensions {
  const styles = window.getComputedStyle(element)
  const paddingX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)
  const paddingY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom)
  const availableWidth = Math.max(0, element.clientWidth - paddingX)
  const availableHeight = Math.max(0, element.clientHeight - paddingY)

  return {
    cols: Math.max(minCols, Math.floor(availableWidth / cellWidth)),
    rows: Math.max(minRows, Math.floor(availableHeight / cellHeight)),
  }
}

/**
 * Measures the terminal container element to derive the TTY `cols`/`rows` that
 * actually fit, instead of guessing from `document.body`. The value is sent to
 * the backend at websocket connect time as `tty_width`/`tty_height`.
 *
 * The dimensions are latched from the first non-zero measurement and then stay
 * stable for the lifetime of the mount. This is intentional: the returned
 * `cols`/`rows` feed the websocket connect params, and the subscription hook
 * reconnects whenever those params change. If we kept re-measuring on every
 * resize we would tear down the live socket — and the user's running shell —
 * every time the window or a panel crossed a cell boundary. So we measure once
 * the layout has settled and let subsequent resizes be handled client-side by
 * the xterm fit addon. A genuinely new session (remount) re-measures.
 *
 * Returns a `ref` to attach to the element wrapping the terminal, and the
 * captured dimensions.
 */
export function useTerminalDimensions(options: UseTerminalDimensionsOptions) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [dimensions, setDimensions] = useState<TerminalDimensions>({
    cols: options.minCols ?? 2,
    rows: options.minRows ?? 1,
  })
  // Keep the latest options without re-subscribing the observer on every render.
  const optionsRef = useRef(options)
  optionsRef.current = options

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }

    // Latch the first measurement that reflects a laid-out container. The box can
    // start at 0x0 before flex/layout resolves, which would otherwise freeze a
    // bogus (min) size for the whole session.
    const capture = () => {
      if (element.clientWidth === 0 && element.clientHeight === 0) {
        return false
      }
      setDimensions(computeDimensions(element, optionsRef.current))
      return true
    }

    if (capture()) {
      return
    }

    // Not laid out yet: wait for the first resize that gives it a real size,
    // capture it, then stop observing so later resizes don't churn the socket.
    if (typeof ResizeObserver === 'undefined') {
      return
    }
    const resizeObserver = new ResizeObserver(() => {
      if (capture()) {
        resizeObserver.disconnect()
      }
    })
    resizeObserver.observe(element)

    return () => resizeObserver.disconnect()
  }, [])

  return { ref, ...dimensions }
}

export default useTerminalDimensions
