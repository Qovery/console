import { fireEvent, render, screen } from '__tests__/utils/setup-jest'
import { addMonths } from 'date-fns'
import { environmentFactoryMock, projectsFactoryMock } from '@qovery/shared/factories'
import { type Option } from '@qovery/shared/ui'
import { dateYearMonthDayHourMinuteSecond } from '@qovery/shared/util-dates'
import CustomFilter, { type CustomFilterProps } from './custom-filter'

const mockProjects = projectsFactoryMock(2)
const mockEnvironments = environmentFactoryMock(2)

describe('CustomFilter', () => {
  const props: CustomFilterProps = {
    handleChange: (_: Option[]) => {
      console.log('')
    },
    options: [],
    selectedOptions: [],
    clearFilter: jest.fn(),
    onChangeClearTimestamp: jest.fn(),
    onChangeTimestamp: jest.fn(),
    setIsOpenTimestamp: jest.fn(),
    isOpenTimestamp: false,
    timestamps: {
      automaticallySelected: false,
      fromTimestamp: new Date(),
      toTimestamp: addMonths(new Date(), -1),
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully', () => {
    render(<CustomFilter {...props} />)

    expect(screen.getByTestId('timeframe-values')).toBeInTheDocument()
  })

  it('should render timeframe button when timestamps are not provided', () => {
    render(<CustomFilter {...props} />)

    expect(screen.getByTestId('timeframe-values')).toBeInTheDocument()
  })

  it('should render timeframe values when timestamps are provided', () => {
    props.timestamps = {
      automaticallySelected: false,
      fromTimestamp: new Date(),
      toTimestamp: addMonths(new Date(), -1),
    }
    render(<CustomFilter {...props} />)

    expect(screen.getByTestId('timeframe-values')).toBeInTheDocument()
  })

  it('should call onChangeClearTimestamp when clicking clear timestamp icon', () => {
    props.timestamps = {
      automaticallySelected: false,
      fromTimestamp: new Date(),
      toTimestamp: addMonths(new Date(), -1),
    }
    render(<CustomFilter {...props} />)

    fireEvent.click(screen.getByTestId('clear-timestamp'))
    expect(props.onChangeClearTimestamp).toHaveBeenCalled()
  })

  it('should call onChangeClearTimestamp when clearing the timeframe', async () => {
    props.timestamps = {
      automaticallySelected: false,
      fromTimestamp: new Date(),
      toTimestamp: new Date(),
    }

    if (!props.timestamps.fromTimestamp || !props.timestamps.toTimestamp) {
      throw new Error('Timestamps should be defined')
    }

    render(<CustomFilter {...props} />)
    expect(screen.getByTestId('timeframe-values')).toHaveTextContent(
      `from: ${dateYearMonthDayHourMinuteSecond(
        props.timestamps.fromTimestamp,
        true,
        false
      )} - to: ${dateYearMonthDayHourMinuteSecond(props.timestamps.toTimestamp, true, false)}`
    )
    screen.getByTestId('clear-timestamp').click()
    expect(props.onChangeClearTimestamp).toHaveBeenCalled()
  })

  it('should render correct timeframe button label if timestamps are provided', () => {
    props.timestamps = {
      automaticallySelected: false,
      fromTimestamp: new Date(),
      toTimestamp: new Date(),
    }

    if (!props.timestamps.fromTimestamp || !props.timestamps.toTimestamp) {
      throw new Error('Timestamps should be defined')
    }

    render(<CustomFilter {...props} />)
    expect(screen.getByTestId('timeframe-values')).toHaveTextContent(
      `from: ${dateYearMonthDayHourMinuteSecond(
        props.timestamps.fromTimestamp,
        true,
        false
      )} - to: ${dateYearMonthDayHourMinuteSecond(props.timestamps.toTimestamp, true, false)}`
    )
  })
})
