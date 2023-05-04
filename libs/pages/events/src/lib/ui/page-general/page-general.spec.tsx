import { getAllByTestId, getByTestId } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { eventsFactoryMock } from '@qovery/shared/factories'
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
})
