import { act, getAllByTestId, getByTestId, getByText, queryByTestId, render } from '__tests__/utils/setup-jest'
import { OrganizationEventResponse } from 'qovery-typescript-axios'
import { eventsFactoryMock } from '@qovery/shared/factories'
import { dateYearMonthDayHourMinuteSecond, upperCaseFirstLetter } from '@qovery/shared/utils'
import RowEvent, { RowEventProps } from './row-event'

const mockEvent: OrganizationEventResponse = eventsFactoryMock(1)[0]
const props: RowEventProps = {
  event: mockEvent,
  isPlaceholder: false,
  expanded: false,
  setExpanded: jest.fn(),
  columnsWidth: '',
}

describe('RowEvent', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RowEvent {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render 7 skeletons while loading', () => {
    const { baseElement } = render(<RowEvent {...props} isPlaceholder />)
    expect(getAllByTestId(baseElement, 'skeleton')).toHaveLength(7)
  })

  it('should render 7 skeletons while loading', () => {
    const { baseElement } = render(<RowEvent {...props} isPlaceholder />)
    expect(getAllByTestId(baseElement, 'skeleton')).toHaveLength(7)
  })

  it('should render 7 cells with good content', () => {
    const { baseElement } = render(<RowEvent {...props} />)

    getByText(baseElement, dateYearMonthDayHourMinuteSecond(new Date(mockEvent.timestamp || '')))
    getByTestId(baseElement, 'tag')
    getByText(baseElement, upperCaseFirstLetter(mockEvent.target_type)!)
    getByText(baseElement, mockEvent.target_name)
    getByText(baseElement, upperCaseFirstLetter(mockEvent.sub_target_type)?.replace('_', ' '))
    getByText(baseElement, mockEvent.triggered_by!)
    getByText(baseElement, upperCaseFirstLetter(mockEvent.origin)!)
  })

  it('should show expanded panel on click', async () => {
    const { baseElement } = render(<RowEvent {...props} />)

    expect(queryByTestId(baseElement, 'expanded-panel')).toBeNull()
    const button = getByTestId(baseElement, 'row-event')

    await act(() => {
      button.click()
    })
    expect(props.setExpanded).toHaveBeenCalledWith(true)
  })
})
