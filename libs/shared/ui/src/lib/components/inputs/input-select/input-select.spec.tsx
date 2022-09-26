import { act, getByDisplayValue, screen } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import selectEvent from 'react-select-event'
import { IconEnum } from '@qovery/shared/enums'
import Icon from '../../icon/icon'
import InputSelect, { InputSelectProps } from './input-select'

let props: InputSelectProps

beforeEach(() => {
  props = {
    label: 'Select Multiple',
    options: [
      { label: 'Test 1', value: 'test1', icon: <Icon name={IconEnum.GITLAB} className="w-4" /> },
      { label: 'Test 2', value: 'test2', icon: <Icon name={IconEnum.GITHUB} className="w-4" /> },
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

  it('should display the icon for the selected option on single only', async () => {
    render(<InputSelect {...props} />)
    const realSelect = screen.getByLabelText('Select Multiple')

    await act(() => {
      selectEvent.select(realSelect, 'Test 2')
    })

    screen.getByTestId('selected-icon')
  })

  it('should not display the icon for the selected option in a multi', async () => {
    render(<InputSelect {...props} isMulti />)
    const realSelect = screen.getByLabelText('Select Multiple')

    await act(() => {
      selectEvent.select(realSelect, 'Test 2')
    })

    expect(screen.queryByTestId('selected-icon')).not.toBeTruthy()
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
