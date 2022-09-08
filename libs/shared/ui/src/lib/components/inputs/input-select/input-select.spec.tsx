import { act, getByDisplayValue, screen } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import selectEvent from 'react-select-event'
import InputSelect, { InputSelectProps } from './input-select'

let props: InputSelectProps

beforeEach(() => {
  props = {
    label: 'Select Multiple',
    options: [
      { label: 'Test 1', value: 'test1' },
      { label: 'Test 2', value: 'test2' },
    ],
  }
})

describe('InputSelect', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputSelect {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have a label', () => {
    render(<InputSelect {...props} />)
    const label = screen.getByTestId('select').querySelector('label')
    expect(label).toBeTruthy()
  })

  it('should display an error', () => {
    props.error = 'Error'
    render(<InputSelect {...props} />)
    const select = screen.getByTestId('select')
    expect(select.classList.contains('input--error')).toBeTruthy()
  })

  it('should select second item in a single select', async () => {
    render(<InputSelect {...props} />)
    const realSelect = screen.getByLabelText('Select Multiple')

    await act(() => {
      selectEvent.select(realSelect, 'Test 2')
    })

    expect(screen.getByText('Test 2')).toBeInTheDocument()
  })

  it('should select second item and first item in a multiple select', async () => {
    const { baseElement } = render(<InputSelect isMulti={true} {...props} />)
    const realSelect = screen.getByLabelText('Select Multiple')

    await act(() => {
      selectEvent.select(realSelect, ['Test 2', 'Test 1'])
    })

    getByDisplayValue(baseElement, 'test2,test1')
  })

  it('should be disabled', () => {
    props.disabled = true
    render(<InputSelect {...props} />)
    const select = screen.getByTestId('select')
    expect(select.classList.contains('!bg-element-light-lighter-200')).toBeTruthy()
  })
})
