import { mockUseQueryResult } from '__tests__/utils/mock-use-query-result'
import { type OrganizationEventResponseList } from 'qovery-typescript-axios'
import { IntercomProvider } from 'react-use-intercom'
import { type EventQueryParams } from '@qovery/domains/event'
import { eventsFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import PageGeneralFeature from './page-general-feature'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
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
    const { baseElement } = renderWithProviders(
      <IntercomProvider appId="__test__app__id__">
        <PageGeneralFeature />
      </IntercomProvider>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should fetch the event with correct payload', () => {
    renderWithProviders(
      <IntercomProvider appId="__test__app__id__">
        <PageGeneralFeature />
      </IntercomProvider>
    )
    expect(mockUseFetchEvents).toHaveBeenCalledWith('0', { pageSize: 30 })
  })

  it('should change query params on click on next', async () => {
    const { userEvent } = renderWithProviders(
      <IntercomProvider appId="__test__app__id__">
        <PageGeneralFeature />
      </IntercomProvider>
    )

    // `waitFor` is necessary because `IntercomProvider` provides somes rendering
    waitFor(async () => {
      const button = screen.getByTestId('button-next-page')
      await userEvent.click(button)

      expect(mockUseFetchEvents).toHaveBeenCalledWith('0', {
        pageSize: 30,
        continueToken: '1683211879216566000',
      })
    })
  })

  it('should change query params on click on previous', async () => {
    const { userEvent } = renderWithProviders(
      <IntercomProvider appId="__test__app__id__">
        <PageGeneralFeature />
      </IntercomProvider>
    )

    // `waitFor` is necessary because `IntercomProvider` provides somes rendering
    waitFor(async () => {
      const button = screen.getByTestId('button-previous-page')
      await userEvent.click(button)

      expect(mockUseFetchEvents).toHaveBeenCalledWith('0', {
        pageSize: 30,
        stepBackToken: '1683211879216566001',
      })
    })
  })

  it('should change query params on click on pageSize', async () => {
    const { userEvent } = renderWithProviders(
      <IntercomProvider appId="__test__app__id__">
        <PageGeneralFeature />
      </IntercomProvider>
    )

    // `waitFor` is necessary because `IntercomProvider` provides somes rendering
    waitFor(async () => {
      const select = screen.getByTestId('select-page-size')
      await userEvent.selectOptions(select, '50')

      expect(mockUseFetchEvents).toHaveBeenCalledWith('0', {
        pageSize: 50,
      })
    })
  })
})
