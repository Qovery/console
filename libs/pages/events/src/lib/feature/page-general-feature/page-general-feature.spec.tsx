import { act, fireEvent, getByTestId, waitFor } from '@testing-library/react'
import { mockUseQueryResult } from '__tests__/utils/mock-use-query-result'
import { render } from '__tests__/utils/setup-jest'
import { OrganizationEventResponseList } from 'qovery-typescript-axios'
import { EventQueryParams } from '@qovery/domains/event'
import { eventsFactoryMock } from '@qovery/shared/factories'
import PageGeneralFeature from './page-general-feature'

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: () => ({ organizationId: '0' }),
}))

const mockUseFetchEvents: jest.Mock = jest.fn()
jest.mock('@qovery/domains/event', () => ({
  ...jest.requireActual('@qovery/domains/event'),
  useFetchEvents: (organizationId: string, queryParams: EventQueryParams) =>
    mockUseFetchEvents(organizationId, queryParams),
}))

describe('PageGeneralFeature', () => {
  beforeEach(() => {
    mockUseFetchEvents.mockReturnValue(
      mockUseQueryResult<OrganizationEventResponseList>({
        events: eventsFactoryMock(10),
        links: {
          next: '/organization/0/events?continueToken=1683211879216566000',
          previous: '/organization/0/events?stepBackToken=1683211879216566001',
        },
      })
    )
  })

  it('should render successfully', () => {
    const { baseElement } = render(<PageGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should fetch the event with correct payload', () => {
    render(<PageGeneralFeature />)
    expect(mockUseFetchEvents).toHaveBeenCalledWith('0', {})
  })

  it('should change query params on click on next', async () => {
    const { baseElement } = render(<PageGeneralFeature />)

    const button = getByTestId(baseElement, 'button-next-page')

    await act(() => {
      button.click()
    })

    await waitFor(() => {
      expect(mockUseFetchEvents).toHaveBeenCalledWith('0', {
        continueToken: '1683211879216566000',
      })
    })
  })

  it('should change query params on click on previous', async () => {
    const { baseElement } = render(<PageGeneralFeature />)
    const button = getByTestId(baseElement, 'button-previous-page')

    await act(() => {
      button.click()
    })

    await waitFor(() => {
      expect(mockUseFetchEvents).toHaveBeenCalledWith('0', {
        stepBackToken: '1683211879216566001',
      })
    })
  })

  it('should change query params on click on pageSize', async () => {
    const { baseElement } = render(<PageGeneralFeature />)

    const select = getByTestId(baseElement, 'select-page-size')

    await act(() => {
      fireEvent.change(select, { target: { value: '50' } })
    })

    await waitFor(() => {
      expect(mockUseFetchEvents).toHaveBeenCalledWith('0', {
        pageSize: 50,
      })
    })
  })
})
