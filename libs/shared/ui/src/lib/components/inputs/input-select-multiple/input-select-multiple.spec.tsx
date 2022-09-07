import { act, getByDisplayValue, screen } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import selectEvent from 'react-select-event'
import InputSelectMultiple, { InputSelectMultipleProps } from './input-select-multiple'

let props: InputSelectMultipleProps

beforeEach(() => {
  props = {
    label: 'Select Multiple',
    options: [
      { label: 'Test 1', value: 'test1' },
      { label: 'Test 2', value: 'test2' },
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

  it('should select second item in a single select', async () => {
    render(<InputSelectMultiple {...props} />)
    const realSelect = screen.getByLabelText('Select Multiple')

    await act(() => {
      selectEvent.select(realSelect, 'Test 2')
    })

    expect(screen.getByText('Test 2')).toBeInTheDocument()
  })

  it('should select second item and first item in a multiple select', async () => {
    const { baseElement } = render(<InputSelectMultiple isMulti={true} {...props} />)
    const realSelect = screen.getByLabelText('Select Multiple')

    await act(() => {
      selectEvent.select(realSelect, ['Test 2', 'Test 1'])
    })

    getByDisplayValue(baseElement, 'test2,test1')
  })

  it('should be disabled', () => {
    props.disabled = true
    render(<InputSelectMultiple {...props} />)
    const select = screen.getByTestId('select-multiple')
    expect(select.classList.contains('!bg-element-light-lighter-200')).toBeTruthy()
  })
})
