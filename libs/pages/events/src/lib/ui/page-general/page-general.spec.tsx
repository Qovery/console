import { fireEvent, getAllByTestId, getByTestId } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { eventsFactoryMock } from '@qovery/shared/factories'
import { dateYearMonthDayHourMinuteSecond } from '@qovery/shared/utils'
import PageGeneral, { PageGeneralProps } from './page-general'

const props: PageGeneralProps = {
  placeholderEvents: eventsFactoryMock(5),
  pageSize: '10',
  nextDisabled: false,
  previousDisabled: false,
  isLoading: false,
  onNext: jest.fn(),
  onPrevious: jest.fn(),
  onPageSizeChange: jest.fn(),
  events: eventsFactoryMock(10),
  onChangeTimestamp: jest.fn(),
  onChangeClearTimestamp: jest.fn(),
  timestamps: [new Date(), new Date()],
  isOpenTimestamp: false,
  setIsOpenTimestamp: jest.fn(),
}

describe('PageGeneral', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageGeneral {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render 5 placeholders if it is loading', () => {
    const { baseElement } = render(<PageGeneral {...props} isLoading={true} />)
    expect(getAllByTestId(baseElement, 'row-event')).toHaveLength(5)
  })

  it('should render empty result if not loading and no result', () => {
    const { baseElement } = render(<PageGeneral {...props} isLoading={false} events={[]} />)
    getByTestId(baseElement, 'empty-result')
  })

  it('should render empty result if not loading and no result', () => {
    const { baseElement } = render(<PageGeneral {...props} isLoading={false} events={[]} />)
    getByTestId(baseElement, 'empty-result')
  })

  it('should render 10 events if not loading and 10 events', () => {
    const { baseElement } = render(<PageGeneral {...props} isLoading={false} />)
    expect(getAllByTestId(baseElement, 'row-event')).toHaveLength(10)
  })

  it('should call onNext when clicking on next button', () => {
    const { baseElement } = render(<PageGeneral {...props} />)
    getByTestId(baseElement, 'button-next-page').click()
    expect(props.onNext).toHaveBeenCalled()
  })

  it('should call onPrevious when clicking on previous button', () => {
    const { baseElement } = render(<PageGeneral {...props} />)
    getByTestId(baseElement, 'button-previous-page').click()
    expect(props.onPrevious).toHaveBeenCalled()
  })

  it('should call onPageSizeChange when changing page size', () => {
    const { getByTestId } = render(<PageGeneral {...props} />)
    fireEvent.change(getByTestId('select-page-size'), { target: { value: '100' } })
    expect(props.onPageSizeChange).toHaveBeenCalledWith('100')
  })

  it('should call onChangeClearTimestamp when clearing the timeframe', async () => {
    props.timestamps = [new Date(), new Date()]

    const { getByTestId } = render(<PageGeneral {...props} />)
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

    const { getByTestId } = render(<PageGeneral {...props} />)
    expect(getByTestId('timeframe-values')).toHaveTextContent(
      `from: ${dateYearMonthDayHourMinuteSecond(
        props.timestamps[0],
        true,
        false
      )} - to: ${dateYearMonthDayHourMinuteSecond(props.timestamps[1], true, false)}`
    )
  })
})
