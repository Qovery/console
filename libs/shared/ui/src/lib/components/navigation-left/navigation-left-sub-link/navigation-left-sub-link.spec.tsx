import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import NavigationLeftSubLink, { type NavigationLeftSubLinkProps } from './navigation-left-sub-link'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: '/general-second',
  }),
}))

describe('NavigationLeftSubLink', () => {
  const props: NavigationLeftSubLinkProps = {
    link: {
      title: 'my-title',
      icon: 'icon-solid-play',
      url: '/general',
      subLinks: [
        {
          title: 'title',
          url: '/general-second',
        },
      ],
    },
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<NavigationLeftSubLink {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should open sub links', async () => {
    const { userEvent } = renderWithProviders(<NavigationLeftSubLink {...props} />)

    const trigger = screen.getByTestId('link')

    await userEvent.click(trigger)

    const subLinks = screen.getByTestId('sub-links')

    expect(subLinks).toBeInTheDocument()
  })

  it('should have rotate the arrow', async () => {
    const { userEvent } = renderWithProviders(<NavigationLeftSubLink {...props} />)

    const trigger = screen.getByTestId('link')

    expect(trigger.querySelector('.icon-solid-angle-down')?.classList.contains('rotate-180')).toBeTruthy()

    await userEvent.click(trigger)

    expect(trigger.querySelector('.icon-solid-angle-down')?.classList.contains('rotate-180')).toBeFalsy()
  })
})
