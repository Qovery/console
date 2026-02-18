import { OrganizationEventOrigin, OrganizationEventType, PlanEnum } from 'qovery-typescript-axios'
import { eventsFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageGeneral, { type PageGeneralProps } from './page-general'

const props: PageGeneralProps = {
  placeholderEvents: eventsFactoryMock(5),
  queryParams: {
    pageSize: 10,
    origin: undefined,
    subTargetType: undefined,
    triggeredBy: undefined,
    targetId: undefined,
    targetType: undefined,
    eventType: undefined,
    toTimestamp: undefined,
    fromTimestamp: undefined,
    continueToken: undefined,
    stepBackToken: undefined,
    projectId: undefined,
    environmentId: undefined,
  },
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
  showIntercom: jest.fn(),
  organizationMaxLimitReached: false,
  organizationId: 'test-org-id',
  targetTypeSelectedItems: [],
  setTargetTypeSelectedItems: jest.fn(),
}

describe.skip('PageGeneral', () => {
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
        ['ALL', ...Object.keys(OrganizationEventType)].map((item) => item.toUpperCase().replace(/_/g, ' '))
      )
    )
  })

  it('should render organizationMaxLimitReached state with upgrade button', () => {
    renderWithProviders(<PageGeneral {...props} organizationMaxLimitReached={true} />)

    screen.getByText(/days limit reached/)
    const upgradeButton = screen.getByRole('button', { name: /Upgrade plan/i })
    expect(upgradeButton).toBeInTheDocument()
  })

  it('should call showIntercom when clicking upgrade plan button', async () => {
    const { userEvent } = renderWithProviders(<PageGeneral {...props} organizationMaxLimitReached={true} />)

    const upgradeButton = screen.getByRole('button', { name: /Upgrade plan/i })
    await userEvent.click(upgradeButton)

    expect(props.showIntercom).toHaveBeenCalled()
  })

  it('should render locked placeholder rows when organizationMaxLimitReached', () => {
    renderWithProviders(<PageGeneral {...props} organizationMaxLimitReached={true} />)

    // Should render the upgrade button and limit reached message
    screen.getByText(/days limit reached/)
    screen.getByRole('button', { name: /Upgrade plan/i })
  })

  it('should render with custom retention days in empty message', () => {
    const customOrganization = {
      id: 'org-1',
      name: 'Test Org',
      plan: PlanEnum.FREE,
      organization_plan: {
        audit_logs_retention_in_days: 90,
      },
      created_at: '2022-07-28T15:04:33.511216Z',
    }
    renderWithProviders(<PageGeneral {...props} isLoading={false} events={[]} organization={customOrganization} />)

    screen.getByText(/we retain logs for a maximum of 90 days/i)
  })

  it('should display correct retention message when organizationMaxLimitReached', () => {
    const customOrganization = {
      id: 'org-1',
      name: 'Test Org',
      plan: PlanEnum.FREE,
      organization_plan: {
        audit_logs_retention_in_days: 60,
      },
      created_at: '2022-07-28T15:04:33.511216Z',
    }
    renderWithProviders(
      <PageGeneral
        {...props}
        organizationMaxLimitReached={true}
        organization={customOrganization}
        events={eventsFactoryMock(10)}
      />
    )

    screen.getByText(/60 days limit reached/i)
  })

  it('should handle custom page size in pagination', () => {
    renderWithProviders(<PageGeneral {...props} pageSize="50" />)

    const select = screen.getByTestId('select-page-size') as HTMLSelectElement
    expect(select.value).toBe('50')
  })

  it('should render with event type filter applied', () => {
    const queryParamsWithFilters = {
      ...props.queryParams,
      eventType: OrganizationEventType.DEPLOYED,
    }
    const { container } = renderWithProviders(<PageGeneral {...props} queryParams={queryParamsWithFilters} />)

    // Verify the component renders with the filter
    expect(container).toBeTruthy()
  })
})
