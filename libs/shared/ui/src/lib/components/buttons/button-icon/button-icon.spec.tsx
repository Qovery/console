import { render, screen } from '@testing-library/react'
import { ButtonIcon, ButtonIconProps, ButtonIconSize, ButtonIconStyle } from './button-icon'
import { Chance } from 'chance'
import { BrowserRouter } from 'react-router-dom'

const props: ButtonIconProps = {
  icon: 'icon-solid-star'
}

const chance = new Chance()

describe('ButtonIcon', () => {

  it('should render successfully', () => {
    const { baseElement } = render(<ButtonIcon {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should apply the accurate classes', () => {
    props.size = ButtonIconSize.NORMAL
    props.style = ButtonIconStyle.BASIC
    props.className = 'some-class-name'

    render(<ButtonIcon {...props} />)

    const button = screen.getByRole('button')

    expect(button.className).toBe('btn btn-icon btn--normal btn--basic some-class-name')
  })

  it('should apply the disabled class', () => {
    props.disabled = true

    render(<ButtonIcon {...props} />)

    const button = screen.getByRole('button')

    expect(button.className).toBe('btn btn-icon btn--normal btn--basic btn--disabled')
  })

  it('should have a notification', () => {
    props.notification = true

    render(<ButtonIcon {...props} />)

    const notification = screen.getByRole('button').querySelector('.btn-notification')

    expect(notification).toBeTruthy()
  })

  it('should return a link instead of a button', () => {
    props.link = chance.url()

    render(
      <BrowserRouter>
        <ButtonIcon {...props} />
      </BrowserRouter>
    )

    const link = screen.getByRole('link')

    expect(link).toBeTruthy()
  })
})
