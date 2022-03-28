import { render } from '__tests__/utils/setup-jest'
import { screen } from '@testing-library/react'

import InputToggle, { InputToggleProps } from './input-toggle'

describe('InputToggle', () => {
  let props: InputToggleProps

  beforeEach(() => {
    props = {
      small: false,
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<InputToggle />)
    expect(baseElement).toBeTruthy()
  })

  it('should apply the accurate class given the size', () => {
    const { rerender } = render(<InputToggle {...props} />)

    let bg = screen.getByLabelText('bg')
    let circle = screen.getByLabelText('circle')

    expect(bg.className).toContain('w-12 h-6')
    expect(circle.className).toContain('w-5 h-5')

    props.small = true

    rerender(<InputToggle {...props} />)

    bg = screen.getByLabelText('bg')
    circle = screen.getByLabelText('circle')

    expect(bg.className).toContain('w-6 h-3.5')
    expect(circle.className).toContain('w-2.5 h-2.5')
  })

  it('should apply the accurate classes when toggling', () => {
    const { rerender } = render(<InputToggle {...props} />)

    const toggleBtn = screen.getByLabelText('toggle-btn')

    toggleBtn.click()

    let bg = screen.getByLabelText('bg')
    let circle = screen.getByLabelText('circle')

    expect(bg.className).toContain('bg-brand-500')
    expect(circle.className).toContain('translate-x-6')

    props.small = true

    rerender(<InputToggle {...props} />)

    bg = screen.getByLabelText('bg')
    circle = screen.getByLabelText('circle')

    expect(bg.className).toContain('bg-success-500')
    expect(circle.className).toContain('translate-x-2.5')
  })
})
