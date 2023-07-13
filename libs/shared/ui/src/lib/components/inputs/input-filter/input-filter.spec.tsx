import { fireEvent, render } from '__tests__/utils/setup-jest'
import InputFilter from './input-filter'

describe('InputFilter', () => {
  const options = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
  ]

  it('renders the button with the provided name', () => {
    const { getByText } = render(<InputFilter name="Filter" nameKey="filter" options={options} onChange={() => {}} />)

    expect(getByText('Filter')).toBeInTheDocument()
  })

  it('opens the select input on button click', () => {
    const { getByText } = render(<InputFilter name="Filter" nameKey="filter" options={options} onChange={() => {}} />)

    const button = getByText('Filter')
    fireEvent.click(button)

    expect(getByText('Filter')).toBeInTheDocument()
  })

  it('selects an option and triggers onChange callback', async () => {
    const handleChange = jest.fn()
    const { getByText, getByTestId } = render(
      <InputFilter name="Filter" nameKey="filter" options={options} onChange={handleChange} />
    )

    const button = getByText('Filter')
    fireEvent.click(button)

    const option2 = getByText('Option 2')
    fireEvent.click(option2)

    expect(handleChange).toHaveBeenCalledWith('filter', 'option2')
    expect(getByTestId('clear-timestamp')).toBeInTheDocument()
  })

  it('clears the selection on clear button click', () => {
    const handleChange = jest.fn()
    const { getByText, getByTestId, queryByTestId } = render(
      <InputFilter name="Filter" nameKey="filter" options={options} onChange={handleChange} defaultValue="option1" />
    )

    const button = getByText('Option 1')
    fireEvent.click(button)

    const clearButton = getByTestId('clear-timestamp')
    fireEvent.click(clearButton)

    expect(handleChange).toHaveBeenCalledWith('filter', undefined)
    expect(queryByTestId('clear-timestamp')).not.toBeInTheDocument()
  })
})
