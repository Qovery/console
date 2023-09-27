import { render, screen } from '__tests__/utils/setup-jest'
import { Chance } from 'chance'
import { createElement } from 'react'
import ButtonLegacy, { ButtonLegacySize, ButtonLegacyStyle, type ButtonProps } from './button-legacy'

describe('Button', () => {
  let props: ButtonProps

  const chance = new Chance('123')

  beforeEach(() => {
    props = {
      children: createElement('div'),
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<ButtonLegacy {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should apply the accurate classes', () => {
    props.size = ButtonLegacySize.SMALL
    props.style = ButtonLegacyStyle.BASIC
    props.className = 'some-class-name'

    render(<ButtonLegacy {...props} />)

    const button = screen.getByRole('button')

    expect(button.className).toBe('btn btn--small btn--basic some-class-name ')
  })

  it('should apply the disabled class', () => {
    props.disabled = true

    render(<ButtonLegacy {...props} />)

    const button = screen.getByRole('button')

    expect(button.className).toBe('btn btn--regular btn--basic btn--disabled ')
  })

  it('should apply the loading class', () => {
    props.loading = true

    render(<ButtonLegacy {...props} />)

    const button = screen.getByRole('button')

    expect(button.className).toBe('btn btn--regular btn--basic pointer-events-none cursor-default')
  })

  it('should return a link instead of a button', () => {
    props.link = chance.url()

    render(<ButtonLegacy {...props} />)

    const link = screen.getByRole('link')

    expect(link).toBeTruthy()
  })
})
