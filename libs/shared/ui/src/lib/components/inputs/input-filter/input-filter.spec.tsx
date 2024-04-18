import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import InputFilter from './input-filter'

describe('InputFilter', () => {
  const options = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
  ]

  it('renders the button with the provided name', () => {
    renderWithProviders(<InputFilter name="Filter" nameKey="filter" options={options} onChange={jest.fn()} />)

    expect(screen.getByText('Filter')).toBeInTheDocument()
  })

  it('opens the select input on button click', async () => {
    const { userEvent } = renderWithProviders(
      <InputFilter name="Filter" nameKey="filter" options={options} onChange={jest.fn()} />
    )

    const button = screen.getByText('Filter')
    await userEvent.click(button)

    expect(screen.getByText('Filter')).toBeInTheDocument()
  })

  it('selects an option and triggers onChange callback', async () => {
    const handleChange = jest.fn()
    const { userEvent } = renderWithProviders(
      <InputFilter name="Filter" nameKey="filter" options={options} onChange={handleChange} />
    )

    const button = screen.getByText('Filter')
    await userEvent.click(button)

    const option2 = screen.getByText('Option 2')
    await userEvent.click(option2)

    expect(handleChange).toHaveBeenCalledWith('filter', 'option2')
    expect(screen.getByTestId('clear-btn')).toBeInTheDocument()
  })

  it('clears the selection on clear button click', async () => {
    const handleChange = jest.fn()
    const { userEvent } = renderWithProviders(
      <InputFilter name="Filter" nameKey="filter" options={options} onChange={handleChange} defaultValue="option1" />
    )

    const button = screen.getByText('Option 1')
    await userEvent.click(button)

    const clearButton = screen.getByTestId('clear-btn')
    await userEvent.click(clearButton)

    expect(handleChange).toHaveBeenCalledWith('filter', undefined)
    expect(screen.queryByTestId('clear-btn')).not.toBeInTheDocument()
  })

  it('should match input filter without value', () => {
    const handleChange = jest.fn()

    const { container } = renderWithProviders(
      <InputFilter name="Filter" nameKey="filter" options={options} onChange={handleChange} />
    )

    expect(container).toMatchSnapshot()
  })

  it('should match input filter with value', () => {
    const handleChange = jest.fn()

    const { container } = renderWithProviders(
      <InputFilter name="Filter" nameKey="filter" options={options} onChange={handleChange} defaultValue="option1" />
    )

    expect(container).toMatchSnapshot()
  })

  it('should match input filter with loading', () => {
    const handleChange = jest.fn()

    const { container } = renderWithProviders(
      <InputFilter
        name="Filter"
        nameKey="filter"
        options={options}
        onChange={handleChange}
        defaultValue="option1"
        isLoading={true}
      />
    )

    expect(container).toMatchSnapshot()
  })
})
