import { fireEvent, render, screen } from '__tests__/utils/setup-jest'
import { addMonths } from 'date-fns'
import { dateYearMonthDayHourMinuteSecond } from '@qovery/shared/util-dates'
import CustomFilter, { type CustomFilterProps } from './custom-filter'

describe('CustomFilter', () => {
  const props: CustomFilterProps = {
    clearFilter: jest.fn(),
    onChangeClearTimestamp: jest.fn(),
    onChangeTimestamp: jest.fn(),
    setIsOpenTimestamp: jest.fn(),
    isOpenTimestamp: false,
    timestamps: {
      fromTimestamp: undefined,
      toTimestamp: undefined,
      automaticallySelected: false,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully', () => {
    render(<CustomFilter {...props} />)
    expect(screen.getByTestId('timeframe-button')).toBeInTheDocument()
  })

  it('should render timeframe button when timestamps are not provided', () => {
    render(<CustomFilter {...props} />)
    expect(screen.getByTestId('timeframe-button')).toBeInTheDocument()
  })

  it('should render timeframe values when timestamps are provided', () => {
    const fromDate = new Date()
    const toDate = addMonths(new Date(), -1)
    const updatedProps: CustomFilterProps = {
      ...props,
      timestamps: {
        fromTimestamp: fromDate,
        toTimestamp: toDate,
        automaticallySelected: false,
      },
    }
    render(<CustomFilter {...updatedProps} />)
    expect(screen.getByTestId('timeframe-values')).toBeInTheDocument()
  })

  it('should call onChangeClearTimestamp when clicking clear timestamp icon', () => {
    const fromDate = new Date()
    const toDate = addMonths(new Date(), -1)
    const updatedProps: CustomFilterProps = {
      ...props,
      timestamps: {
        fromTimestamp: fromDate,
        toTimestamp: toDate,
        automaticallySelected: false,
      },
    }
    render(<CustomFilter {...updatedProps} />)
    fireEvent.click(screen.getByTestId('clear-timestamp'))
    expect(updatedProps.onChangeClearTimestamp).toHaveBeenCalled()
  })

  it('should call onChangeClearTimestamp when clearing the timeframe', async () => {
    const fromDate = new Date()
    const toDate = new Date()
    const updatedProps: CustomFilterProps = {
      ...props,
      timestamps: {
        fromTimestamp: fromDate,
        toTimestamp: toDate,
        automaticallySelected: false,
      },
    }

    render(<CustomFilter {...updatedProps} />)
    expect(screen.getByTestId('timeframe-values')).toHaveTextContent(
      `from: ${dateYearMonthDayHourMinuteSecond(
        fromDate,
        true,
        false
      )} - to: ${dateYearMonthDayHourMinuteSecond(toDate, true, false)}`
    )
    screen.getByTestId('clear-timestamp').click()
    expect(updatedProps.onChangeClearTimestamp).toHaveBeenCalled()
  })

  it('should render correct timeframe button label if timestamps are provided', () => {
    const fromDate = new Date()
    const toDate = new Date()
    const updatedProps: CustomFilterProps = {
      ...props,
      timestamps: {
        fromTimestamp: fromDate,
        toTimestamp: toDate,
        automaticallySelected: false,
      },
    }

    render(<CustomFilter {...updatedProps} />)
    expect(screen.getByTestId('timeframe-values')).toHaveTextContent(
      `from: ${dateYearMonthDayHourMinuteSecond(
        fromDate,
        true,
        false
      )} - to: ${dateYearMonthDayHourMinuteSecond(toDate, true, false)}`
    )
  })

  it('should render 30d label when timestamps are automatically selected', () => {
    const fromDate = new Date()
    const toDate = addMonths(new Date(), -1)
    const updatedProps: CustomFilterProps = {
      ...props,
      timestamps: {
        fromTimestamp: fromDate,
        toTimestamp: toDate,
        automaticallySelected: true,
      },
    }
    render(<CustomFilter {...updatedProps} />)
    expect(screen.getByTestId('timeframe-values')).toHaveTextContent('30d')
  })
})
