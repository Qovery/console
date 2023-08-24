import { act, fireEvent, getAllByTestId, getByTestId, render } from '__tests__/utils/setup-jest'
import { OrganizationEventOrigin, OrganizationEventType } from 'qovery-typescript-axios'
import { eventsFactoryMock } from '@qovery/shared/factories'
import PageGeneral, { type PageGeneralProps } from './page-general'

const props: PageGeneralProps = {
  placeholderEvents: eventsFactoryMock(5),
  queryParams: {},
  pageSize: '10',
  handleClearFilter: jest.fn(),
  nextDisabled: false,
  previousDisabled: false,
  isLoading: false,
  onNext: jest.fn(),
  onPrevious: jest.fn(),
  onPageSizeChange: jest.fn(),
  events: eventsFactoryMock(10),
  setFilter: jest.fn(),
  filter: [{ key: 'origin', value: 'origin-1' }],
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

  it('should render a Tool filter on the table', () => {
    const { getByText, getAllByTestId } = render(<PageGeneral {...props} />)

    act(() => {
      getByText('Source').click()
    })

    // format uppercase and replace _ by space (auto format by menu component)
    expect(getAllByTestId('menuItem').map((item) => item.textContent?.toUpperCase())).toEqual(
      expect.arrayContaining(
        ['ALL', ...Object.keys(OrganizationEventOrigin)].map((item) => item.toUpperCase().replace('_', ' '))
      )
    )
  })

  it('should render a Event filter on the table', () => {
    const { getByText, getAllByTestId } = render(<PageGeneral {...props} />)

    act(() => {
      getByText('Event').click()
    })

    // format uppercase and replace _ by space (auto format by menu component)
    expect(getAllByTestId('menuItem').map((item) => item.textContent?.toUpperCase())).toEqual(
      expect.arrayContaining(
        ['ALL', ...Object.keys(OrganizationEventType)].map((item) => item.toUpperCase().replace('_', ' '))
      )
    )
  })
})
