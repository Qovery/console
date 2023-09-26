import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import Banner from './banner'

describe('Banner', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<Banner color="yellow">Hello</Banner>)
    expect(baseElement).toBeTruthy()
  })

  it('should render in yellow', () => {
    renderWithProviders(<Banner color="yellow">Hello</Banner>)
    const banner = screen.getByTestId('banner')
    expect(banner).toHaveClass('bg-yellow-500')
    expect(banner).toHaveClass('text-yellow-900')
  })

  it('should render in brand color', () => {
    renderWithProviders(<Banner color="brand">Hello</Banner>)
    const banner = screen.getByTestId('banner')
    expect(banner).toHaveClass('bg-brand-500')
    expect(banner).toHaveClass('text-white')
  })

  it('should render a button and handle click', async () => {
    const onClickSpy = jest.fn()
    const { userEvent } = renderWithProviders(
      <Banner color="brand" onClickButton={onClickSpy} buttonLabel="Click me!">
        Hello
      </Banner>
    )
    const button = screen.getByRole('button', { name: 'Click me!' })

    await userEvent.click(button)

    expect(onClickSpy).toHaveBeenCalled()
  })
})
