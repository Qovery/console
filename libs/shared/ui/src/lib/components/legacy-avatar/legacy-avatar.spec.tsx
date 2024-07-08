import { render, screen } from '__tests__/utils/setup-jest'
import { IconEnum } from '@qovery/shared/enums'
import { LegacyAvatar, type LegacyAvatarProps } from './legacy-avatar'

let props: LegacyAvatarProps

let container

beforeEach(() => {
  props = {
    firstName: 'Rémi',
    lastName: 'Bonnet',
  }
  container = document.createElement('div')
  document.body.appendChild(container)
})

describe('LegacyAvatar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LegacyAvatar {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should apply the accurate classes', () => {
    props.className = 'some-class-name'

    render(<LegacyAvatar {...props} />)

    const avatar = screen.getByTestId('avatar')

    expect(avatar?.classList.contains('some-class-name')).toBe(true)
  })

  it('should have an icon', () => {
    props.icon = IconEnum.GITHUB

    render(<LegacyAvatar {...props} />)

    const icon = screen.getByTestId('avatar-icon')

    expect(icon).toBeInTheDocument()
  })

  it('should have an avatar logo with img', () => {
    props.logoUrl = 'https://qovery.com/image'

    render(<LegacyAvatar {...props} />)

    const logo = screen.getByTestId('avatar-logo')

    expect(logo.querySelector('img')).toBeDefined()
  })

  it('should have an avatar logo with placeholder', () => {
    props.logoText = 'Orga'

    render(<LegacyAvatar {...props} />)

    const logo = screen.getByTestId('avatar-logo')

    expect(logo.querySelector('span')).toBeDefined()
    expect(logo).toHaveTextContent('Orga')
  })
})
