import { fireEvent, render, screen } from '__tests__/utils/setup-jest'
import NavigationLeftSubLink, { type NavigationLeftSubLinkProps } from './navigation-left-sub-link'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: '/general-second',
  }),
}))

describe('NavigationLeftSubLink', () => {
  const props: NavigationLeftSubLinkProps = {
    linkContent: jest.fn(),
    link: {
      title: 'my-title',
      icon: 'icon-solid-angle-down',
      url: '/general',
      onClick: jest.fn(),
      subLinks: [
        {
          title: 'title',
          url: '/general-second',
          onClick: jest.fn(),
        },
      ],
    },
    linkClassName: jest.fn(),
  }

  it('should render successfully', () => {
    const { baseElement } = render(<NavigationLeftSubLink {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should open sub links', () => {
    render(<NavigationLeftSubLink {...props} />)

    const trigger = screen.getByTestId('link')

    fireEvent.click(trigger)

    const subLinks = screen.getByTestId('sub-links')

    expect(subLinks).toBeTruthy()
  })

  it('should have rotate the arrow', () => {
    render(<NavigationLeftSubLink {...props} />)

    const trigger = screen.getByTestId('link')

    fireEvent.click(trigger)

    expect(trigger.querySelector('.icon-solid-angle-down')?.classList.contains('rotate-180')).toBeTruthy()
  })

  it('should have a click emitted', () => {
    const onClick = jest.fn()

    props.link = {
      title: 'my-title',
      icon: 'icon-solid-angle-down',
      url: '/general',
      subLinks: [
        {
          title: 'title',
          url: '/general-second',
          onClick: onClick,
        },
      ],
    }

    render(<NavigationLeftSubLink {...props} />)

    const link = screen.getByTestId('sub-link')

    fireEvent.click(link)

    expect(onClick.mock.calls.length).toEqual(1)
  })

  it('should have a badge for sub link', () => {
    props.link = {
      title: 'my-title',
      url: '/general',
      subLinks: [
        {
          title: 'title',
          url: '/general-second',
          badge: 'beta',
        },
      ],
    }

    render(<NavigationLeftSubLink {...props} />)

    expect(screen.getByTestId('sub-link-badge').textContent).toBe('beta')
  })
})
