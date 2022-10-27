import { fireEvent } from '@testing-library/react'
import { render, screen } from '__tests__/utils/setup-jest'
import { NavigationLeft, NavigationLeftProps, linkClassName } from './navigation-left'

describe('NavigationLeft', () => {
  const props: NavigationLeftProps = {
    links: [
      {
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
    ],
  }

  it('should render successfully', () => {
    const { baseElement } = render(<NavigationLeft {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have active class', () => {
    props.links = [
      {
        title: 'General',
        url: '/general',
        onClick: jest.fn(),
        icon: 'icon-solid-angle-down',
      },
    ]

    expect(
      linkClassName('/general', props.links[0].url) ===
        'py-2 px-3 text-ssm rounded font-medium cursor-pointer mt-0.5 transition ease-out duration-300 truncate is-active text-brand-500 bg-brand-50 hover:text-brand-600 hover:bg-brand-100'
    ).toBe(true)
  })

  it('should have an icon', () => {
    props.links = [
      {
        title: 'General',
        onClick: jest.fn(),
        icon: 'icon-solid-angle-down',
      },
    ]

    render(<NavigationLeft {...props} />)

    const link = screen.getByTestId('link')

    expect(link.querySelector('span')?.classList.contains('icon-solid-angle-down')).toBe(true)
  })

  it('should have an title', () => {
    props.links = [
      {
        title: 'General',
      },
    ]

    render(<NavigationLeft {...props} />)

    const link = screen.getByTestId('link')

    expect(link.textContent).toBe(props.links[0].title)
  })

  it('should have a click emitted', () => {
    const onClick = jest.fn()

    props.links = [
      {
        title: 'General',
        onClick: onClick,
      },
    ]

    render(<NavigationLeft {...props} />)

    const link = screen.getByTestId('link')

    fireEvent.click(link)

    expect(onClick.mock.calls.length).toEqual(1)
  })
})
