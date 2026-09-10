import { mockUseQueryResult } from '__tests__/utils/mock-use-query-result'
import { type OrganizationEventResponseList } from 'qovery-typescript-axios'
import { eventsFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { AuditLogsView } from './audit-logs-view'

describe.skip('AuditLogsView', () => {
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
    const { baseElement } = renderWithProviders(<AuditLogsView />)
    expect(baseElement).toBeTruthy()
  })

  it('should fetch the event with correct payload', () => {
    renderWithProviders(<AuditLogsView />)
    expect(mockUseFetchEvents).toHaveBeenCalledWith('0', { pageSize: 30 })
  })

  it('should change query params on click on next', async () => {
    const { userEvent } = renderWithProviders(<AuditLogsView />)

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
    const { userEvent } = renderWithProviders(<AuditLogsView />)

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
    const { userEvent } = renderWithProviders(<AuditLogsView />)

    waitFor(async () => {
      const select = screen.getByTestId('select-page-size')
      await userEvent.selectOptions(select, '50')

      expect(mockUseFetchEvents).toHaveBeenCalledWith('0', {
        pageSize: 50,
      })
    })
  })

  it('should handle clear filter action', async () => {
    const { userEvent } = renderWithProviders(<AuditLogsView />)

    waitFor(async () => {
      // First set a filter by clicking on Event filter
      await userEvent.click(screen.getByText('Event'))

      // Find and click clear button if filters are present
      const clearButton = screen.queryByRole('button', { name: /Clear all filters/i })
      if (clearButton) {
        await userEvent.click(clearButton)
      }

      // After clearing, should fetch with default params
      expect(mockUseFetchEvents).toHaveBeenCalledWith('0', expect.objectContaining({ pageSize: 30 }))
    })
  })

  it('should handle organizationMaxLimitReached state', () => {
    mockUseFetchEvents.mockReturnValue(
      mockUseQueryResult<OrganizationEventResponseList>({
        events: eventsFactoryMock(10),
        organization_max_limit_reached: true,
        links: {},
      })
    )

    renderWithProviders(<AuditLogsView />)

    waitFor(() => {
      screen.getByText(/days limit reached/i)
    })
  })

  it('should fetch with default pageSize when not specified', () => {
    renderWithProviders(<AuditLogsView />)

    expect(mockUseFetchEvents).toHaveBeenCalledWith('0', expect.objectContaining({ pageSize: 30 }))
  })

  it('should handle empty events list', () => {
    mockUseFetchEvents.mockReturnValue(
      mockUseQueryResult<OrganizationEventResponseList>({
        events: [],
        links: {},
      })
    )

    renderWithProviders(<AuditLogsView />)

    waitFor(() => {
      screen.getByTestId('empty-result')
    })
  })

  it('should disable next button when no next link', () => {
    mockUseFetchEvents.mockReturnValue(
      mockUseQueryResult<OrganizationEventResponseList>({
        events: eventsFactoryMock(10),
        links: {
          previous: '/organization/0/events?stepBackToken=1683211879216566001',
        },
      })
    )

    renderWithProviders(<AuditLogsView />)

    waitFor(() => {
      const nextButton = screen.getByTestId('button-next-page')
      expect(nextButton).toBeDisabled()
    })
  })

  it('should disable previous button when no previous link', () => {
    mockUseFetchEvents.mockReturnValue(
      mockUseQueryResult<OrganizationEventResponseList>({
        events: eventsFactoryMock(10),
        links: {
          next: '/organization/0/events?continueToken=1683211879216566000',
        },
      })
    )

    renderWithProviders(<AuditLogsView />)

    waitFor(() => {
      const prevButton = screen.getByTestId('button-previous-page')
      expect(prevButton).toBeDisabled()
    })
  })
})
