import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import Banner, { BannerNavigation } from './banner'

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

describe('BannerNavigation', () => {
  it.each([0, 1])('hides navigation when there are %i banners', (count) => {
    renderWithProviders(<BannerNavigation currentIndex={0} count={count} onPrevious={jest.fn()} onNext={jest.fn()} />)

    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
  })

  it('shows the selected position and lets users navigate in both directions', async () => {
    const onPrevious = jest.fn()
    const onNext = jest.fn()
    const { userEvent } = renderWithProviders(
      <BannerNavigation currentIndex={1} count={3} onPrevious={onPrevious} onNext={onNext} />
    )

    expect(screen.getByText('2/3')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Previous' }))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(onPrevious).toHaveBeenCalledTimes(1)
    expect(onNext).toHaveBeenCalledTimes(1)
  })
})
