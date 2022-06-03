import { render } from '__tests__/utils/setup-jest'
import { screen } from '@testing-library/react'

import InputSelectMultiple, { InputSelectMultipleProps } from './input-select-multiple'

let props: InputSelectMultipleProps

beforeEach(() => {
  props = {
    label: 'Select Multiple',
    options: [
      { label: 'Test 1', value: 'test1' },
      { label: 'Test 2', value: 'test3' },
    ],
  }
})

describe('InputSelectMultiple', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputSelectMultiple {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have a label', () => {
    render(<InputSelectMultiple {...props} />)
    const label = screen.getByTestId('select-multiple').querySelector('label')
    expect(label).toBeTruthy()
  })

  it('should display an error', () => {
    props.error = 'Error'
    render(<InputSelectMultiple {...props} />)
    const select = screen.getByTestId('select-multiple')
    expect(select.classList.contains('input--error')).toBeTruthy()
  })

  it('should be disabled', () => {
    props.disabled = true
    render(<InputSelectMultiple {...props} />)
    const select = screen.getByTestId('select-multiple')
    expect(select.classList.contains('!bg-element-light-lighter-200')).toBeTruthy()
  })
})
