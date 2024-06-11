import { OrganizationEventOrigin, OrganizationEventType } from 'qovery-typescript-axios'
import { eventsFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
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
    const { baseElement } = renderWithProviders(<PageGeneral {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render 5 placeholders if it is loading', () => {
    renderWithProviders(<PageGeneral {...props} isLoading={true} />)
    expect(screen.getAllByTestId('row-event')).toHaveLength(5)
  })

  it('should render empty result if not loading and no result', () => {
    renderWithProviders(<PageGeneral {...props} isLoading={false} events={[]} />)
    screen.getByTestId('empty-result')
  })

  it('should render 10 events if not loading and 10 events', () => {
    renderWithProviders(<PageGeneral {...props} isLoading={false} />)
    expect(screen.getAllByTestId('row-event')).toHaveLength(10)
  })

  it('should call onNext when clicking on next button', () => {
    renderWithProviders(<PageGeneral {...props} />)
    screen.getByTestId('button-next-page').click()
    expect(props.onNext).toHaveBeenCalled()
  })

  it('should call onPrevious when clicking on previous button', () => {
    renderWithProviders(<PageGeneral {...props} />)
    screen.getByTestId('button-previous-page').click()
    expect(props.onPrevious).toHaveBeenCalled()
  })

  it('should call onPageSizeChange when changing page size', async () => {
    const { userEvent } = renderWithProviders(<PageGeneral {...props} />)
    await userEvent.selectOptions(screen.getByTestId('select-page-size'), '100')
    expect(props.onPageSizeChange).toHaveBeenCalledWith('100')
  })

  it('should render a Tool filter on the table', async () => {
    const { userEvent } = renderWithProviders(<PageGeneral {...props} />)

    await userEvent.click(screen.getByText('Source'))

    // format uppercase and replace _ by space (auto format by menu component)
    expect(screen.getAllByTestId('menuItem').map((item) => item.textContent?.toUpperCase())).toEqual(
      expect.arrayContaining(
        ['ALL', ...Object.keys(OrganizationEventOrigin)].map((item) => item.toUpperCase().replace('_', ' '))
      )
    )
  })

  it('should render a Event filter on the table', async () => {
    const { userEvent } = renderWithProviders(<PageGeneral {...props} />)

    await userEvent.click(screen.getByText('Event'))

    // format uppercase and replace _ by space (auto format by menu component)
    expect(screen.getAllByTestId('menuItem').map((item) => item.textContent?.toUpperCase())).toEqual(
      expect.arrayContaining(
        ['ALL', ...Object.keys(OrganizationEventType)].map((item) => item.toUpperCase().replace('_', ' '))
      )
    )
  })
})
