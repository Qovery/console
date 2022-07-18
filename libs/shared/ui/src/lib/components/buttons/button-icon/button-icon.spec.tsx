import { screen } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { ButtonIcon, ButtonIconProps, ButtonIconStyle } from './button-icon'
import { ButtonSize } from '../button/button'
import { Chance } from 'chance'

const props: ButtonIconProps = {
  icon: 'icon-solid-star',
}

const chance = new Chance()

describe('ButtonIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ButtonIcon {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should apply the accurate classes', () => {
    props.size = ButtonSize.REGULAR
    props.style = ButtonIconStyle.BASIC
    props.className = 'some-class-name'

    render(<ButtonIcon {...props} />)

    const button = screen.getByRole('button')

    expect(button.classList.contains('btn--regular')).toBe(true)
    expect(button.classList.contains('btn-icon--basic')).toBe(true)
    expect(button.classList.contains('some-class-name')).toBe(true)
  })

  it('should apply the disabled class', () => {
    props.disabled = true

    render(<ButtonIcon {...props} />)

    const button = screen.getByRole('button')

    expect(button.classList.contains('btn--disabled')).toBe(true)
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

    expect(link).toBeTruthy()
  })
})
