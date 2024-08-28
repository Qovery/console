import { type OrganizationEventResponse } from 'qovery-typescript-axios'
import { eventsFactoryMock } from '@qovery/shared/factories'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import RowEvent, { type RowEventProps } from './row-event'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1' }),
}))

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
    const { baseElement } = renderWithProviders(<RowEvent {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render 7 skeletons while loading', () => {
    renderWithProviders(<RowEvent {...props} isPlaceholder />)
    expect(screen.getAllByRole('generic', { busy: true })).toHaveLength(7)
  })

  it('should render 7 cells with good content', () => {
    renderWithProviders(<RowEvent {...props} />)

    screen.getByText(dateFullFormat(mockEvent.timestamp!))
    screen.getByTestId('tag')
    screen.getByText(upperCaseFirstLetter(mockEvent.target_type))
    screen.getByText(mockEvent.target_name!)
    screen.getByText(upperCaseFirstLetter(mockEvent.sub_target_type!)?.replace('_', ' '))
    screen.getByText(mockEvent.triggered_by!)
    screen.getByText(upperCaseFirstLetter(mockEvent.origin)!)
  })

  it('should show expanded panel on click', async () => {
    const { userEvent } = renderWithProviders(<RowEvent {...props} />)

    expect(screen.queryByTestId('expanded-panel')).not.toBeInTheDocument()
    const button = screen.getByTestId('row-event')

    await userEvent.click(button)
    expect(props.setExpanded).toHaveBeenCalledWith(true)
  })

  it('should render link for target', () => {
    renderWithProviders(<RowEvent {...props} />)
    const target = screen.getByText(props.event?.target_name || '')

    expect(target).toHaveAttribute('href', '/organization/1/settings')
  })
})
