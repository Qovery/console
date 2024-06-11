import { render, screen } from '__tests__/utils/setup-jest'
import { Chance } from 'chance'
import { ButtonLegacySize } from '../button-legacy/button-legacy'
import { ButtonIcon, type ButtonIconProps, ButtonIconStyle } from './button-icon'

const props: ButtonIconProps = {
  icon: 'icon-solid-star',
}

const chance = new Chance('123')

describe('ButtonIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ButtonIcon {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should apply the accurate classes', () => {
    props.size = ButtonLegacySize.REGULAR
    props.style = ButtonIconStyle.BASIC
    props.className = 'some-class-name'

    render(<ButtonIcon {...props} />)

    const button = screen.getByRole('button')

    expect(button).toHaveClass('btn--regular')
    expect(button).toHaveClass('btn-icon--basic')
    expect(button).toHaveClass('some-class-name')
  })

  it('should apply the disabled class', () => {
    props.disabled = true

    render(<ButtonIcon {...props} />)

    const button = screen.getByRole('button')

    expect(button).toHaveClass('btn--disabled')
  })

  it('should have a notification', () => {
    props.notification = true

    render(<ButtonIcon {...props} />)

    const notification = screen.getByRole('button').querySelector('.btn__notification')

    expect(notification).toBeTruthy()
  })

  it('should return a link instead of a button', () => {
    props.link = chance.url()

    render(<ButtonIcon {...props} />)

    const link = screen.getByRole('link')

    expect(link).toBeInTheDocument()
  })
})
