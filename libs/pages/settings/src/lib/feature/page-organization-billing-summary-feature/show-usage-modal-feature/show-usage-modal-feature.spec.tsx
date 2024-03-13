import { PlanEnum } from 'qovery-typescript-axios'
import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { organizationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ShowUsageModalFeature, { type ShowUsageModalFeatureProps } from './show-usage-modal-feature'

const useGenerateBillingUsageReportSpy = jest.spyOn(organizationsDomain, 'useGenerateBillingUsageReport') as jest.Mock
const useOrganizationSpy = jest.spyOn(organizationsDomain, 'useOrganization') as jest.Mock

const props: ShowUsageModalFeatureProps = {
  organizationId: '1',
  currentCost: {
    plan: PlanEnum.ENTERPRISE,
    renewal_at: '2023-03-03',
    remaining_trial_day: 1,
    cost: {
      total_in_cents: 10,
      total: 2,
      currency_code: 'USD',
    },
  },
}

describe('ShowUsageModalFeature', () => {
  beforeEach(() => {
    useGenerateBillingUsageReportSpy.mockReturnValue({
      mutateAsync: jest.fn(() => ({
        report_url: 'http://example.com',
      })),
      isLoading: false,
    })
    useOrganizationSpy.mockReturnValue({
      data: organizationFactoryMock(1)[0],
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ShowUsageModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should call useGenerateBillingUsageReport when onSubmit is called', async () => {
    const { userEvent } = renderWithProviders(<ShowUsageModalFeature {...props} />)
    const button = screen.getByRole('button', { name: /generate report/i })
    await userEvent.click(button)

    expect(useGenerateBillingUsageReportSpy).toHaveBeenCalled()
  })
})
