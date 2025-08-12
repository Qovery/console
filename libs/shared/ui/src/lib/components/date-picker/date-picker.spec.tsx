import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import DatePicker from './date-picker'

describe('DatePicker', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('renders successfully when open', () => {
    const { baseElement } = renderWithProviders(<DatePicker onChange={mockOnChange} isOpen />)
    expect(baseElement).toBeTruthy()
    expect(screen.getByText('Apply')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    renderWithProviders(<DatePicker onChange={mockOnChange} isOpen={false} />)
    expect(screen.queryByText('Apply')).not.toBeInTheDocument()
  })

  it('initializes with default dates and times correctly', () => {
    const startDate = new Date('2023-12-01T10:30:00.000Z')
    const endDate = new Date('2023-12-02T15:45:00.000Z')

    renderWithProviders(<DatePicker onChange={mockOnChange} isOpen showTimeInput defaultDates={[startDate, endDate]} />)

    const inputs = screen.getAllByTestId('input-value')
    expect(inputs[0]).toHaveValue('2023-12-01')
    expect(inputs[1]).toHaveValue('10:30')
    expect(inputs[2]).toHaveValue('2023-12-02')
    expect(inputs[3]).toHaveValue('15:45')
  })

  it('calls onChange with default dates when Apply is clicked', async () => {
    const startDate = new Date('2023-12-01')
    const endDate = new Date('2023-12-02')

    const { userEvent } = renderWithProviders(<DatePicker onChange={mockOnChange} isOpen defaultDates={[startDate, endDate]} />)

    await userEvent.click(screen.getByText('Apply'))
    expect(mockOnChange).toHaveBeenCalledWith(startDate, endDate)
  })

  it('calls onChange when Apply is clicked with time inputs', async () => {
    const { userEvent } = renderWithProviders(<DatePicker onChange={mockOnChange} isOpen showTimeInput />)

    const inputs = screen.getAllByTestId('input-value')

    // Set date and time values
    await userEvent.clear(inputs[0])
    await userEvent.type(inputs[0], '2023-12-01')
    await userEvent.clear(inputs[1])
    await userEvent.type(inputs[1], '09:00')
    await userEvent.clear(inputs[2])
    await userEvent.type(inputs[2], '2023-12-02')
    await userEvent.clear(inputs[3])
    await userEvent.type(inputs[3], '18:30')

    await userEvent.click(screen.getByText('Apply'))

    expect(mockOnChange).toHaveBeenCalledWith(expect.any(Date), expect.any(Date))
  })

  it('shows time inputs when showTimeInput prop is true', () => {
    renderWithProviders(<DatePicker onChange={mockOnChange} isOpen showTimeInput />)

    // Check that we have 4 inputs (2 dates + 2 times)
    const inputs = screen.getAllByTestId('input-value')
    expect(inputs).toHaveLength(4)

    // Check labels are present
    expect(screen.getByText('Start')).toBeInTheDocument()
    expect(screen.getByText('End')).toBeInTheDocument()
  })

  it('handles useLocalTime prop for time display', () => {
    const startDate = new Date('2023-12-01T10:30:00.000Z')
    const endDate = new Date('2023-12-02T15:45:00.000Z')

    renderWithProviders(
      <DatePicker
        onChange={mockOnChange}
        isOpen
        showTimeInput
        defaultDates={[startDate, endDate]}
        useLocalTime={false}
      />
    )

    const inputs = screen.getAllByTestId('input-value')
    // UTC time should be displayed when useLocalTime=false
    expect(inputs[1]).toHaveValue('10:30')
    expect(inputs[3]).toHaveValue('15:45')
  })
})
