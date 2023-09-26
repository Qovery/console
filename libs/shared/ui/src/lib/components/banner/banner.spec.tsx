import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import Banner from './banner'

describe('Banner', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<Banner color="yellow">Hello</Banner>)
    expect(baseElement).toBeTruthy()
  })

  it('should render in yellow', () => {
    const { baseElement } = renderWithProviders(<Banner color="yellow">Hello</Banner>)
    expect(baseElement).toMatchSnapshot()
  })

  it('should render in brand color', () => {
    const { baseElement } = renderWithProviders(<Banner color="brand">Hello</Banner>)
    expect(baseElement).toMatchSnapshot()
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
