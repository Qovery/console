import { act, getAllByTestId, getByTestId, getByText, queryByTestId } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { OrganizationEventResponse } from 'qovery-typescript-axios'
import { eventsFactoryMock } from '@qovery/shared/factories'
import { dateYearMonthDayHourMinuteSecond, upperCaseFirstLetter } from '@qovery/shared/utils'
import RowEvent, { RowEventProps } from './row-event'

const mockEvent: OrganizationEventResponse = eventsFactoryMock(1)[0]
const props: RowEventProps = {
  event: mockEvent,
  isPlaceholder: false,
  expanded: false,
  nbCols: 7,
  setExpanded: jest.fn(),
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

    expect(getByTestId(baseElement, 'row-event')).toHaveClass('grid-cols-7')

    getByText(baseElement, dateYearMonthDayHourMinuteSecond(new Date(mockEvent.timestamp || '')))
    getByTestId(baseElement, 'tag')
    getByText(baseElement, upperCaseFirstLetter(mockEvent.target_type)!)
    getByText(baseElement, `${mockEvent.target_name}::${mockEvent.sub_target_type}`)
    getByText(baseElement, 'API Request')
    getByText(baseElement, mockEvent.triggered_by!)
    getByText(baseElement, upperCaseFirstLetter(mockEvent.origin)!)
  })

  it('should show expanded panel on click', async () => {
    const { baseElement } = render(<RowEvent {...props} />)

    expect(queryByTestId(baseElement, 'expanded-panel')).toBeNull()
    const button = getByTestId(baseElement, 'expand-button')

    await act(() => {
      button.click()
    })
    expect(props.setExpanded).toHaveBeenCalledWith(true)

    const render2 = render(<RowEvent {...props} expanded />)

    const panel = getByTestId(render2.baseElement, 'expanded-panel')
    expect(panel).toHaveClass('col-span-7')
  })
})
