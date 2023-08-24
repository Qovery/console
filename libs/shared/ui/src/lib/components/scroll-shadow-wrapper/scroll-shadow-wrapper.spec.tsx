import { act, fireEvent, getByTestId, getByText, render, waitFor } from '__tests__/utils/setup-jest'
import ScrollShadowWrapper, { type ScrollShadowWrapperProps } from './scroll-shadow-wrapper'

const props: ScrollShadowWrapperProps = {
  children: <div>test</div>,
}

describe('ScrollShadowWrapper', () => {
  beforeEach(() => {
    // mocking scrollbar size and client size since jsdom does not support it
    // https://github.com/testing-library/react-testing-library/issues/353#issuecomment-510046921
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 440 })
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, value: 1000 })
  })

  it('should render successfully', () => {
    const { baseElement } = render(<ScrollShadowWrapper {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render both shadows', async () => {
    const { baseElement } = render(<ScrollShadowWrapper {...props} />)
    const scrollzone = getByTestId(baseElement, 'scroll-shadow-wrapper')
    const shadowTop = getByTestId(baseElement, 'scroll-shadow-top')
    const shadowBottom = getByTestId(baseElement, 'scroll-shadow-bottom')

    await act(() => {
      fireEvent.scroll(scrollzone, { target: { scrollTop: 100 } })
    })

    await waitFor(() => {
      expect(shadowTop).toHaveClass('opacity-100')
      expect(shadowBottom).toHaveClass('opacity-100')
    })
  })

  it('should show only shadow top', async () => {
    const { baseElement } = render(<ScrollShadowWrapper {...props} />)
    const scrollzone = getByTestId(baseElement, 'scroll-shadow-wrapper')
    const shadowTop = getByTestId(baseElement, 'scroll-shadow-top')
    const shadowBottom = getByTestId(baseElement, 'scroll-shadow-bottom')

    await act(() => {
      fireEvent.scroll(scrollzone, { target: { scrollTop: 560 } })
    })

    await waitFor(() => {
      expect(shadowTop).toHaveClass('opacity-100')
      expect(shadowBottom).toHaveClass('opacity-0')
    })
  })

  it('should show only shadow bottom', async () => {
    const { baseElement } = render(<ScrollShadowWrapper {...props} />)
    const scrollzone = getByTestId(baseElement, 'scroll-shadow-wrapper')
    const shadowTop = getByTestId(baseElement, 'scroll-shadow-top')
    const shadowBottom = getByTestId(baseElement, 'scroll-shadow-bottom')

    await act(() => {
      fireEvent.scroll(scrollzone, { target: { scrollTop: 0 } })
    })

    await waitFor(() => {
      expect(shadowTop).toHaveClass('opacity-0')
      expect(shadowBottom).toHaveClass('opacity-100')
    })
  })

  it('should display children', async () => {
    const { baseElement } = render(<ScrollShadowWrapper {...props} />)
    getByText(baseElement, 'test')
  })
})
