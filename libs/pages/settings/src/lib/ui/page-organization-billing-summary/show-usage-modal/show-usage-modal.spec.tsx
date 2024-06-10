import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { organizationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ShowUsageModal, { type ShowUsageModalProps, getReportPeriods } from './show-usage-modal'

const useOrganizationsSpy: SpyInstance = jest.spyOn(organizationsDomain, 'useOrganizations')

const props: ShowUsageModalProps = {
  organizationId: '0',
  renewalAt: '2022-01-01T00:00:00Z',
  onClose: jest.fn(),
  onSubmit: jest.fn(),
  loading: true,
}

describe('ShowUsageModal', () => {
  beforeEach(() => {
    useOrganizationsSpy.mockReturnValue({
      data: organizationFactoryMock(1)[0],
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm<{ code: string }>(<ShowUsageModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should call on submit', async () => {
    const spy = jest.fn()
    props.loading = false
    props.onSubmit = spy

    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<ShowUsageModal {...props} onSubmit={spy} />, {
        defaultValues: {
          expires: 24,
        },
      })
    )

    const button = screen.getByTestId('submit-button')
    await userEvent.click(button)

    expect(spy).toHaveBeenCalled()
  })
})

describe('getReportPeriods', () => {
  beforeEach(() => {
    const now = new Date('2024-04-23T12:00:00Z')
    jest.useFakeTimers()
    jest.setSystemTime(now)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should compute periods given no renewal date', () => {
    const organization = organizationFactoryMock(1)[0]
    organization.created_at = '2023-06-16T14:34:04Z'
    expect(getReportPeriods({ organization })).toEqual([
      {
        label: 'Apr 16, 2024 to now',
        value: '{"from":"2024-04-16T00:00:00.000Z"}',
      },
      {
        label: 'Mar 16, 2024 to Apr 16, 2024',
        value: '{"from":"2024-03-16T00:00:00.000Z","to":"2024-04-16T00:00:00.000Z"}',
      },
      {
        label: 'Feb 16, 2024 to Mar 16, 2024',
        value: '{"from":"2024-02-16T00:00:00.000Z","to":"2024-03-16T00:00:00.000Z"}',
      },
      {
        label: 'Jan 16, 2024 to Feb 16, 2024',
        value: '{"from":"2024-01-16T00:00:00.000Z","to":"2024-02-16T00:00:00.000Z"}',
      },
      {
        label: 'Dec 16, 2023 to Jan 16, 2024',
        value: '{"from":"2023-12-16T00:00:00.000Z","to":"2024-01-16T00:00:00.000Z"}',
      },
      {
        label: 'Nov 16, 2023 to Dec 16, 2023',
        value: '{"from":"2023-11-16T00:00:00.000Z","to":"2023-12-16T00:00:00.000Z"}',
      },
      {
        label: 'Oct 16, 2023 to Nov 16, 2023',
        value: '{"from":"2023-10-16T00:00:00.000Z","to":"2023-11-16T00:00:00.000Z"}',
      },
      {
        label: 'Sep 16, 2023 to Oct 16, 2023',
        value: '{"from":"2023-09-16T00:00:00.000Z","to":"2023-10-16T00:00:00.000Z"}',
      },
      {
        label: 'Aug 16, 2023 to Sep 16, 2023',
        value: '{"from":"2023-08-16T00:00:00.000Z","to":"2023-09-16T00:00:00.000Z"}',
      },
      {
        label: 'Jul 16, 2023 to Aug 16, 2023',
        value: '{"from":"2023-07-16T00:00:00.000Z","to":"2023-08-16T00:00:00.000Z"}',
      },
      {
        label: 'Jun 16, 2023 to Jul 16, 2023',
        value: '{"from":"2023-06-16T00:00:00.000Z","to":"2023-07-16T00:00:00.000Z"}',
      },
    ])
  })

  it('should compute periods given a renewal date with a day in month before creation date', () => {
    const organization = organizationFactoryMock(1)[0]
    organization.created_at = '2023-06-16T14:34:04Z'
    const orgRenewalAt = '2023-07-10T14:34:04Z'
    expect(getReportPeriods({ organization, orgRenewalAt })).toEqual([
      {
        label: 'Apr 10, 2024 to now',
        value: '{"from":"2024-04-10T00:00:00.000Z"}',
      },
      {
        label: 'Mar 10, 2024 to Apr 10, 2024',
        value: '{"from":"2024-03-10T00:00:00.000Z","to":"2024-04-10T00:00:00.000Z"}',
      },
      {
        label: 'Feb 10, 2024 to Mar 10, 2024',
        value: '{"from":"2024-02-10T00:00:00.000Z","to":"2024-03-10T00:00:00.000Z"}',
      },
      {
        label: 'Jan 10, 2024 to Feb 10, 2024',
        value: '{"from":"2024-01-10T00:00:00.000Z","to":"2024-02-10T00:00:00.000Z"}',
      },
      {
        label: 'Dec 10, 2023 to Jan 10, 2024',
        value: '{"from":"2023-12-10T00:00:00.000Z","to":"2024-01-10T00:00:00.000Z"}',
      },
      {
        label: 'Nov 10, 2023 to Dec 10, 2023',
        value: '{"from":"2023-11-10T00:00:00.000Z","to":"2023-12-10T00:00:00.000Z"}',
      },
      {
        label: 'Oct 10, 2023 to Nov 10, 2023',
        value: '{"from":"2023-10-10T00:00:00.000Z","to":"2023-11-10T00:00:00.000Z"}',
      },
      {
        label: 'Sep 10, 2023 to Oct 10, 2023',
        value: '{"from":"2023-09-10T00:00:00.000Z","to":"2023-10-10T00:00:00.000Z"}',
      },
      {
        label: 'Aug 10, 2023 to Sep 10, 2023',
        value: '{"from":"2023-08-10T00:00:00.000Z","to":"2023-09-10T00:00:00.000Z"}',
      },
      {
        label: 'Jul 10, 2023 to Aug 10, 2023',
        value: '{"from":"2023-07-10T00:00:00.000Z","to":"2023-08-10T00:00:00.000Z"}',
      },
    ])
  })

  it('should compute periods given a renewal date with a day in month after creation date', () => {
    const organization = organizationFactoryMock(1)[0]
    organization.created_at = '2023-06-16T14:34:04Z'
    const orgRenewalAt = '2023-07-21T14:34:04Z'
    expect(getReportPeriods({ organization, orgRenewalAt })).toEqual([
      {
        label: 'Apr 21, 2024 to now',
        value: '{"from":"2024-04-21T00:00:00.000Z"}',
      },
      {
        label: 'Mar 21, 2024 to Apr 21, 2024',
        value: '{"from":"2024-03-21T00:00:00.000Z","to":"2024-04-21T00:00:00.000Z"}',
      },
      {
        label: 'Feb 21, 2024 to Mar 21, 2024',
        value: '{"from":"2024-02-21T00:00:00.000Z","to":"2024-03-21T00:00:00.000Z"}',
      },
      {
        label: 'Jan 21, 2024 to Feb 21, 2024',
        value: '{"from":"2024-01-21T00:00:00.000Z","to":"2024-02-21T00:00:00.000Z"}',
      },
      {
        label: 'Dec 21, 2023 to Jan 21, 2024',
        value: '{"from":"2023-12-21T00:00:00.000Z","to":"2024-01-21T00:00:00.000Z"}',
      },
      {
        label: 'Nov 21, 2023 to Dec 21, 2023',
        value: '{"from":"2023-11-21T00:00:00.000Z","to":"2023-12-21T00:00:00.000Z"}',
      },
      {
        label: 'Oct 21, 2023 to Nov 21, 2023',
        value: '{"from":"2023-10-21T00:00:00.000Z","to":"2023-11-21T00:00:00.000Z"}',
      },
      {
        label: 'Sep 21, 2023 to Oct 21, 2023',
        value: '{"from":"2023-09-21T00:00:00.000Z","to":"2023-10-21T00:00:00.000Z"}',
      },
      {
        label: 'Aug 21, 2023 to Sep 21, 2023',
        value: '{"from":"2023-08-21T00:00:00.000Z","to":"2023-09-21T00:00:00.000Z"}',
      },
      {
        label: 'Jul 21, 2023 to Aug 21, 2023',
        value: '{"from":"2023-07-21T00:00:00.000Z","to":"2023-08-21T00:00:00.000Z"}',
      },
      {
        label: 'Jun 21, 2023 to Jul 21, 2023',
        value: '{"from":"2023-06-21T00:00:00.000Z","to":"2023-07-21T00:00:00.000Z"}',
      },
    ])
  })

  it('should compute periods given a renewal date next year', () => {
    const organization = organizationFactoryMock(1)[0]
    organization.created_at = '2023-12-16T14:34:04Z'
    const orgRenewalAt = '2024-01-21T14:34:04Z'
    expect(getReportPeriods({ organization, orgRenewalAt })).toEqual([
      {
        label: 'Apr 21, 2024 to now',
        value: '{"from":"2024-04-21T00:00:00.000Z"}',
      },
      {
        label: 'Mar 21, 2024 to Apr 21, 2024',
        value: '{"from":"2024-03-21T00:00:00.000Z","to":"2024-04-21T00:00:00.000Z"}',
      },
      {
        label: 'Feb 21, 2024 to Mar 21, 2024',
        value: '{"from":"2024-02-21T00:00:00.000Z","to":"2024-03-21T00:00:00.000Z"}',
      },
      {
        label: 'Jan 21, 2024 to Feb 21, 2024',
        value: '{"from":"2024-01-21T00:00:00.000Z","to":"2024-02-21T00:00:00.000Z"}',
      },
      {
        label: 'Dec 21, 2023 to Jan 21, 2024',
        value: '{"from":"2023-12-21T00:00:00.000Z","to":"2024-01-21T00:00:00.000Z"}',
      },
    ])
  })
})
