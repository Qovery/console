import { getByText, queryByText } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { PlanEnum } from 'qovery-typescript-axios'
import { creditCardsFactoryMock, organizationFactoryMock } from '@qovery/shared/factories'
import PageOrganizationBillingSummary, {
  PageOrganizationBillingSummaryProps,
} from './page-organization-billing-summary'

const mockOrganization = organizationFactoryMock(1)[0]
mockOrganization.currentCost = {
  loadingStatus: 'loaded',
  value: {
    plan: PlanEnum.ENTERPRISE,
    cost: { total: 10, currency_code: 'USD', total_in_cents: 10000 },
    paid_usage: {
      renewal_at: '2021-01-01',
      remaining_deployments: 10,
      consumed_deployments: 10,
      max_deployments_per_month: 10,
      deployments_exceeded: true,
      monthly_plan_cost: 10,
      monthly_plan_cost_in_cents: 10000,
    },
  },
}
const props: PageOrganizationBillingSummaryProps = {
  creditCard: creditCardsFactoryMock(1)[0],
  numberOfClusters: 1,
  numberOfRunningClusters: 1,
  organization: mockOrganization,
}

describe('PageOrganizationBillingSummary', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationBillingSummary {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should display 6 boxes', () => {
    const { baseElement } = render(<PageOrganizationBillingSummary {...props} />)
    getByText(baseElement, 'Current plan')
    getByText(baseElement, 'Current monthly bill')
    getByText(baseElement, 'Payment method')
    getByText(baseElement, 'Seats')
    getByText(baseElement, 'Cluster')
    getByText(baseElement, 'Deployments')
  })

  it('should display not display the payment method box', () => {
    const organization = { ...mockOrganization }

    // @ts-ignore
    organization.currentCost.value.plan = PlanEnum.FREE

    const { baseElement } = render(<PageOrganizationBillingSummary {...props} />)
    getByText(baseElement, 'Current plan')
    getByText(baseElement, 'Current monthly bill')
    expect(queryByText(baseElement, 'Payment method')).toBeNull()
    getByText(baseElement, 'Seats')
    getByText(baseElement, 'Cluster')
    getByText(baseElement, 'Deployments')
  })
})
