import { act, renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useHorizontalOverflowFade } from './use-horizontal-overflow-fade'

const FADE_END = 'max-md:[mask-image:linear-gradient(to_left,transparent,black_24px)]'
const FADE_START = 'max-md:[mask-image:linear-gradient(to_right,transparent,black_24px)]'
const FADE_BOTH =
  'max-md:[mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]'

function Scroller({ scrollLeft = 0 }: { scrollLeft?: number }) {
  const { ref, update, fadeClassName } = useHorizontalOverflowFade<HTMLDivElement>()
  return (
    <div
      data-testid="scroller"
      data-scroll-left={scrollLeft}
      ref={(node) => {
        if (node) {
          Object.defineProperty(node, 'clientWidth', { configurable: true, value: 100 })
          Object.defineProperty(node, 'scrollWidth', { configurable: true, value: 300 })
          node.scrollLeft = scrollLeft
        }
        ref.current = node
      }}
      onScroll={update}
      className={fadeClassName}
    />
  )
}

describe('useHorizontalOverflowFade', () => {
  it('fades the end when content overflows to the right', () => {
    renderWithProviders(<Scroller />)
    expect(screen.getByTestId('scroller')).toHaveClass(FADE_END, { exact: true })
  })

  it('fades both edges when scrolled to the middle', () => {
    renderWithProviders(<Scroller scrollLeft={100} />)
    expect(screen.getByTestId('scroller')).toHaveClass(FADE_BOTH, { exact: true })
  })

  it('fades only the start once scrolled to the end', () => {
    renderWithProviders(<Scroller />)
    const scroller = screen.getByTestId('scroller')
    act(() => {
      scroller.scrollLeft = 200
      scroller.dispatchEvent(new Event('scroll'))
    })
    expect(scroller).toHaveClass(FADE_START, { exact: true })
  })

  it('applies nothing when the content fits', () => {
    function Fits() {
      const { ref, fadeClassName } = useHorizontalOverflowFade<HTMLDivElement>()
      return <div data-testid="fits" ref={ref} className={fadeClassName} />
    }
    renderWithProviders(<Fits />)
    expect(screen.getByTestId('fits')).not.toHaveAttribute('class', expect.stringContaining('mask-image'))
  })
})
