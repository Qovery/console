import { PlanEnum } from 'qovery-typescript-axios'
import { creditCardsFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageOrganizationBillingSummary, {
  type PageOrganizationBillingSummaryProps,
} from '../../../../../../pages/settings/src/lib/ui/page-organization-billing-summary/page-organization-billing-summary'

const props: PageOrganizationBillingSummaryProps = {
  creditCard: creditCardsFactoryMock(1)[0],
  creditCardLoading: false,
  currentCost: {
    plan: PlanEnum.ENTERPRISE,
    cost: { total: 56000, currency_code: 'USD', total_in_cents: 5600000 },
    renewal_at: '2021-01-01',
  },
  onPromoCodeClick: jest.fn(),
  onShowUsageClick: jest.fn(),
  onChangePlanClick: jest.fn(),
}

describe('PageOrganizationBillingSummary', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationBillingSummary {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should display 6 boxes', () => {
    renderWithProviders(<PageOrganizationBillingSummary {...props} />)
    screen.getByText('Current plan')
    screen.getByText('Enterprise plan (Legacy)')

    screen.getByText('Current bill')
    screen.getByText('$56,000')
  })

  it('should say that no credit card was found', () => {
    renderWithProviders(<PageOrganizationBillingSummary {...props} creditCardLoading={false} creditCard={undefined} />)
    screen.getByText('No credit card provided')
  })

  it('should say call show usage modal on click', async () => {
    const { userEvent } = renderWithProviders(<PageOrganizationBillingSummary {...props} />)
    const button = screen.getByText(/show usage/i)
    await userEvent.click(button)

    expect(props.onShowUsageClick).toHaveBeenCalled()
  })

  it('should call onChangePlanClick on click on change plan', async () => {
    const { userEvent } = renderWithProviders(<PageOrganizationBillingSummary {...props} />)
    const button = screen.getByText('Change plan')
    await userEvent.click(button)

    expect(props.onChangePlanClick).toHaveBeenCalled()
  })

  it('should say call onPromoCodeClick on click on add promo code', async () => {
    const { userEvent } = renderWithProviders(<PageOrganizationBillingSummary {...props} />)
    const button = screen.getByText(/promo code/i)
    await userEvent.click(button)

    expect(props.onPromoCodeClick).toHaveBeenCalled()
  })

  it('should display not display the payment method box', () => {
    props.currentCost = {
      plan: PlanEnum.FREE,
      renewal_at: '2021-01-01',
      cost: { total: 56000, currency_code: 'USD', total_in_cents: 5600000 },
    }

    renderWithProviders(<PageOrganizationBillingSummary {...props} />)
    screen.getByText('Current plan')
    screen.getByText('Current bill')
    expect(screen.queryByText('Payment method')).not.toBeInTheDocument()
  })
})
