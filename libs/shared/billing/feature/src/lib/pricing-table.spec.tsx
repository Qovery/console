import type { PublicPlans } from 'qovery-pricing-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PricingTable } from './pricing-table'

const plans: PublicPlans = {
  currencies: ['USD'],
  plans: [
    {
      code: 'growth',
      name: 'Growth',
      description: '',
      rank: 1,
      version: 1,
      contact_sales: false,
      prices: [],
      yearly_saving: [],
      support: '',
      entitlements: [],
      addons: [],
    },
  ],
}

it('marks and disables the current public plan', () => {
  renderWithProviders(<PricingTable plans={plans} currentPlan="growth" details={false} onSelect={jest.fn()} />)
  expect(screen.getByRole('button', { name: 'Current plan' })).toBeDisabled()
  expect(screen.getByRole('heading', { name: 'Growth' }).closest('.border')).toHaveClass('border-brand-strong')
})

it('identifies a custom current plan without marking a public plan as current', () => {
  renderWithProviders(
    <PricingTable plans={plans} currentPlan="internal" currentPlanName="Qovery internal" details={false} />
  )
  expect(screen.getByText('Qovery internal')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Current plan' })).not.toBeInTheDocument()
})
