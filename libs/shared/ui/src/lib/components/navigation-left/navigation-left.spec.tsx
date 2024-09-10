import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { NavigationLeft, type NavigationLeftProps, linkClassName } from './navigation-left'

describe('NavigationLeft', () => {
  const props: NavigationLeftProps = {
    links: [
      {
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
    ],
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<NavigationLeft {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have active class', () => {
    props.links = [
      {
        title: 'General',
        url: '/general',
        icon: 'icon-solid-play',
      },
    ]

    expect(linkClassName('/general', props.links[0].url)).toContain(
      'flex items-center py-2 px-3 text-ssm rounded font-medium cursor-pointer mt-0.5 transition ease-out duration-300 truncate is-active text-brand-500 bg-brand-50 hover:text-brand-600 hover:bg-brand-100'
    )
  })

  it('should have an icon', () => {
    props.links = [
      {
        title: 'General',
        icon: 'icon-solid-play',
        url: '/general',
      },
    ]

    renderWithProviders(<NavigationLeft {...props} />)

    const link = screen.getByTestId('link')

    expect(link.querySelector('span')?.classList.contains('icon-solid-play')).toBe(true)
  })

  it('should have an title', () => {
    props.links = [
      {
        title: 'General',
        subLinks: [],
      },
    ]

    renderWithProviders(<NavigationLeft {...props} />)

    const link = screen.getByTestId('link')

    expect(link).toHaveTextContent(props.links[0].title)
  })

  it('should have a badge for sub link', () => {
    props.links = [
      {
        title: 'my-title',
        subLinks: [
          {
            title: 'title',
            url: '/general-second',
            badge: 'beta',
          },
        ],
      },
    ]

    renderWithProviders(<NavigationLeft {...props} />)

    expect(screen.getByTestId('sub-link-badge')).toHaveTextContent('beta')
  })
})
