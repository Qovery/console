import React from 'react'
import { render } from '__tests__/utils/setup-jest'
import { screen } from '@testing-library/react'

import Button, { ButtonType } from './button'
import { ButtonProps, ButtonSize } from './button'

import { Chance } from 'chance'

describe('Button', () => {
  let props: ButtonProps

  const chance = new Chance()

  beforeEach(() => {
    props = {
      children: React.createElement('div'),
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<Button {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should apply the accurate classes', () => {
    props.size = ButtonSize.SMALL
    props.type = ButtonType.BASIC
    props.className = 'some-class-name'

    render(<Button {...props} />)

    const button = screen.getByRole('button')

    expect(button.className).toBe('btn btn--small btn--basic some-class-name')
  })

  it('should apply the disabled class', () => {
    props.disabled = true

    render(<Button {...props} />)

    const button = screen.getByRole('button')

    expect(button.className).toBe('btn btn--normal btn--basic btn--disabled')
  })

  it('should return a link instead of a button', () => {
    props.link = chance.url()

    render(<Button {...props} />)

    const link = screen.getByRole('link')

    expect(link).toBeTruthy()
  })
})
