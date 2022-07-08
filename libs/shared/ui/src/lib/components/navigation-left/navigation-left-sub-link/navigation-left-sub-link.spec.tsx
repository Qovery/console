import { screen, render } from '__tests__/utils/setup-jest'
import { fireEvent } from '@testing-library/react'
import NavigationLeftSubLink, { NavigationLeftSubLinkProps } from './navigation-left-sub-link'

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
})
