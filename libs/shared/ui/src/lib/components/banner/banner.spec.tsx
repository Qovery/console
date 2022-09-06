import { act, fireEvent, getByRole, getByTestId } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import Banner, { BannerStyle } from './banner'

describe('Banner', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Banner bannerStyle={BannerStyle.WARNING}>Hello</Banner>)
    expect(baseElement).toBeTruthy()
  })

  it('should render in orange', () => {
    const { baseElement } = render(<Banner bannerStyle={BannerStyle.WARNING}>Hello</Banner>)
    const banner = getByTestId(baseElement, 'banner')
    expect(banner).toHaveClass('bg-warning-500')
    expect(banner).toHaveClass('text-warning-900')
  })

  it('should render in brand color', () => {
    const { baseElement } = render(<Banner bannerStyle={BannerStyle.PRIMARY}>Hello</Banner>)
    const banner = getByTestId(baseElement, 'banner')
    expect(banner).toHaveClass('bg-brand-500')
    expect(banner).toHaveClass('text-white')
  })

  it('should render a button and handle click', async () => {
    const onClickSpy = jest.fn()
    const { baseElement } = render(
      <Banner bannerStyle={BannerStyle.PRIMARY} onClickButton={onClickSpy} buttonLabel="Click me!">
        Hello
      </Banner>
    )
    const button = getByRole(baseElement, 'button', { name: 'Click me!' })

    await act(() => {
      fireEvent.click(button)
    })

    expect(onClickSpy).toHaveBeenCalled()
  })
})
