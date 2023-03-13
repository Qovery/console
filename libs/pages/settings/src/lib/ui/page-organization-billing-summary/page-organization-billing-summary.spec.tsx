import { act, getByTestId, getByText, queryByText } from '@testing-library/react'
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
    cost: { total: 56000, currency_code: 'USD', total_in_cents: 5600000 },
    paid_usage: {
      renewal_at: '2021-01-01',
      remaining_deployments: 10,
      consumed_deployments: 999,
      max_deployments_per_month: 1345,
      deployments_exceeded: true,
      monthly_plan_cost: 10,
      monthly_plan_cost_in_cents: 10000,
    },
  },
}
const props: PageOrganizationBillingSummaryProps = {
  creditCard: creditCardsFactoryMock(1)[0],
  numberOfClusters: 130,
  numberOfRunningClusters: 88,
  organization: mockOrganization,
  onPromoCodeClick: jest.fn(),
  openIntercom: jest.fn(),
}

describe('PageOrganizationBillingSummary', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationBillingSummary {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should display 6 boxes', () => {
    const { baseElement } = render(<PageOrganizationBillingSummary {...props} />)
    getByText(baseElement, 'Current plan')
    getByText(baseElement, 'Enterprise plan')

    getByText(baseElement, 'Current monthly bill')
    getByText(baseElement, '$56,000')

    getByText(baseElement, 'Seats')
    getByText(baseElement, 'N/A')

    getByText(baseElement, 'Cluster')
    getByText(baseElement, '88')
    getByText(baseElement, '/ 130')

    getByText(baseElement, 'Deployments')
    getByText(baseElement, '999')
    getByText(baseElement, '/ 1345')
  })

  it('should say that no cluster was found', () => {
    const { baseElement } = render(<PageOrganizationBillingSummary {...props} numberOfClusters={0} />)
    getByText(baseElement, 'No cluster found')
  })

  it('should say that no credit card was found', () => {
    const { baseElement } = render(
      <PageOrganizationBillingSummary {...props} creditCardLoading={false} creditCard={undefined} />
    )
    getByText(baseElement, 'No credit card provided')
  })

  it('should say call intercom on click on upgrade', async () => {
    const { baseElement } = render(<PageOrganizationBillingSummary {...props} />)
    const button = getByTestId(baseElement, 'upgrade-button')
    await act(() => {
      button.click()
    })
    expect(props.openIntercom).toHaveBeenCalled()
  })

  it('should say call onPromoCodeClick on click on add promo code', async () => {
    const { baseElement } = render(<PageOrganizationBillingSummary {...props} />)
    const button = getByTestId(baseElement, 'promo-code-button')
    await act(() => {
      button.click()
    })
    expect(props.onPromoCodeClick).toHaveBeenCalled()
  })

  it('should display not display the payment method box', () => {
    const organization = { ...mockOrganization }

    // @ts-ignore
    organization.currentCost.value.plan = PlanEnum.FREE

    const { baseElement } = render(<PageOrganizationBillingSummary {...props} />)
    getByText(baseElement, 'Current plan')
    getByText(baseElement, 'Current monthly bill')
    expect(queryByText(baseElement, 'Payment method')).toBeNull()

    getByText(baseElement, 'Deployments')
  })
})
