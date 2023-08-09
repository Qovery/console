import { render, screen } from '__tests__/utils/setup-jest'
import { Chance } from 'chance'
import { createElement } from 'react'
import Button, { ButtonProps, ButtonSize, ButtonStyle } from './button'

describe('Button', () => {
  let props: ButtonProps

  const chance = new Chance('123')

  beforeEach(() => {
    props = {
      children: createElement('div'),
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<Button {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should apply the accurate classes', () => {
    props.size = ButtonSize.SMALL
    props.style = ButtonStyle.BASIC
    props.className = 'some-class-name'

    render(<Button {...props} />)

    const button = screen.getByRole('button')

    expect(button.className).toBe('btn btn--small btn--basic some-class-name ')
  })

  it('should apply the disabled class', () => {
    props.disabled = true

    render(<Button {...props} />)

    const button = screen.getByRole('button')

    expect(button.className).toBe('btn btn--regular btn--basic btn--disabled ')
  })

  it('should apply the loading class', () => {
    props.loading = true

    render(<Button {...props} />)

    const button = screen.getByRole('button')

    expect(button.className).toBe('btn btn--regular btn--basic pointer-events-none cursor-default')
  })

  it('should return a link instead of a button', () => {
    props.link = chance.url()

    render(<Button {...props} />)

    const link = screen.getByRole('link')

    expect(link).toBeTruthy()
  })
})
