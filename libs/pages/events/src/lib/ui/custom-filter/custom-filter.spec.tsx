import { fireEvent, render, screen } from '__tests__/utils/setup-jest'
import { addMonths } from 'date-fns'
import { dateYearMonthDayHourMinuteSecond } from '@qovery/shared/utils'
import CustomFilter, { CustomFilterProps } from './custom-filter'

describe('CustomFilter', () => {
  const props: CustomFilterProps = {
    onChangeType: jest.fn(),
    clearFilter: jest.fn(),
    onChangeClearTimestamp: jest.fn(),
    onChangeTimestamp: jest.fn(),
    setIsOpenTimestamp: jest.fn(),
    isOpenTimestamp: false,
    timestamps: undefined,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully', () => {
    render(<CustomFilter {...props} />)

    expect(screen.getByText('Select')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
  })

  it('should render timeframe button when timestamps are not provided', () => {
    render(<CustomFilter {...props} />)

    expect(screen.getByTestId('timeframe-button')).toBeInTheDocument()
  })

  it('should render timeframe values when timestamps are provided', () => {
    props.timestamps = [new Date(), addMonths(new Date(), -1)]
    render(<CustomFilter {...props} />)

    expect(screen.getByTestId('timeframe-values')).toBeInTheDocument()
  })

  it('should call onChangeClearTimestamp when clicking clear timestamp icon', () => {
    props.timestamps = [new Date(), addMonths(new Date(), -1)]
    render(<CustomFilter {...props} />)

    fireEvent.click(screen.getByTestId('clear-timestamp'))
    expect(props.onChangeClearTimestamp).toHaveBeenCalled()
  })

  it('should call onChangeClearTimestamp when clearing the timeframe', async () => {
    props.timestamps = [new Date(), new Date()]

    const { getByTestId } = render(<CustomFilter {...props} />)
    expect(getByTestId('timeframe-values')).toHaveTextContent(
      `from: ${dateYearMonthDayHourMinuteSecond(
        props.timestamps[0],
        true,
        false
      )} - to: ${dateYearMonthDayHourMinuteSecond(props.timestamps[1], true, false)}`
    )
    getByTestId('clear-timestamp').click()
    expect(props.onChangeClearTimestamp).toHaveBeenCalled()
  })

  it('should render correct timeframe button label if timestamps are provided', () => {
    props.timestamps = [new Date(), new Date()]

    const { getByTestId } = render(<CustomFilter {...props} />)
    expect(getByTestId('timeframe-values')).toHaveTextContent(
      `from: ${dateYearMonthDayHourMinuteSecond(
        props.timestamps[0],
        true,
        false
      )} - to: ${dateYearMonthDayHourMinuteSecond(props.timestamps[1], true, false)}`
    )
  })
})
