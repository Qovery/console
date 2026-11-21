import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import type { PricingClient } from './client'
import { GatedPage } from './gated-page'
import { Paywall } from './paywall'
import type { PaywallInfo, PaywallOption } from './types'

const client: PricingClient = {
  mode: 'preview',
  publicPlans: jest.fn(),
  billingUsage: jest.fn(),
  spendLimits: jest.fn(),
} as unknown as PricingClient

const trial: PaywallOption = { type: 'start_trial', label: 'Try it free for 14 days', days: 14 }
const upgrade: PaywallOption = { type: 'upgrade', label: 'Upgrade to Growth', plan: 'GROWTH_2026', plan_name: 'Growth' }
const addon: PaywallOption = {
  type: 'addon',
  label: 'Add a managed cluster',
  addon: 'additional_managed_cluster',
  addon_name: 'Managed cluster',
  amount: 29900,
  period: 'month',
  currency: 'USD',
}
const contact: PaywallOption = { type: 'contact_sales', label: 'Talk to us' }

const blueprints = (options: PaywallOption[]): PaywallInfo => ({
  sku: 'service_catalog',
  title: 'Blueprints',
  message: 'Service catalog (blueprints) is not included in your Starter plan.',
  headline: 'Create databases, caches and storage from a catalog.',
  benefits: ['RDS, ElastiCache, S3, Kafka and more'],
  audience: 'billing',
  options,
})

describe('GatedPage', () => {
  it.each([
    [[trial, upgrade], 'Start a 14-day trial', 'Trial available'],
    [[upgrade], 'Upgrade to Growth', 'Included in Growth'],
    [[addon], 'Add a managed cluster for $299/month', 'Available as an add-on'],
    [[contact], 'Talk to us', 'Available on request'],
  ])('leads with the option the gate ranked first', (options, button, chip) => {
    renderWithProviders(<GatedPage organizationId="org-1" client={client} paywall={blueprints(options)} />)

    expect(screen.getByRole('heading', { name: 'Blueprints' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: button })).toBeInTheDocument()
    expect(screen.getByText(chip)).toBeInTheDocument()
  })

  it('keeps the other ways as small links: never the main action again, never Free', () => {
    const free: PaywallOption = { type: 'upgrade', label: 'Switch to Free', plan: 'FREE_2026', plan_name: 'Free' }
    renderWithProviders(
      <GatedPage
        organizationId="org-1"
        client={client}
        paywall={blueprints([trial, free, { ...trial }, upgrade, contact])}
      />
    )

    expect(screen.getAllByRole('button', { name: 'Start a 14-day trial' })).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Upgrade to Growth' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Talk to us' })).toBeInTheDocument()
    expect(screen.queryByText(/free/i)).not.toBeInTheDocument()
  })

  it('draws the sign-in preview for single sign-on', () => {
    renderWithProviders(
      <GatedPage
        organizationId="org-1"
        client={client}
        paywall={{ ...blueprints([contact]), sku: 'sso', title: 'Single sign-on' }}
      />
    )

    expect(screen.getByRole('heading', { name: 'Single sign-on' })).toBeInTheDocument()
    expect(screen.getByTestId('gated-preview')).toHaveTextContent('Okta')
    expect(screen.getByRole('link', { name: /learn more/i })).toHaveAttribute(
      'href',
      'https://www.qovery.com/docs/configuration/organization/sso'
    )
  })

  it('offers "Not now" only when the page can be left', async () => {
    const onClose = jest.fn()
    const { unmount, userEvent } = renderWithProviders(
      <GatedPage organizationId="org-1" client={client} paywall={blueprints([trial])} onClose={onClose} />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Not now' }))
    expect(onClose).toHaveBeenCalled()
    unmount()

    renderWithProviders(<GatedPage organizationId="org-1" client={client} paywall={blueprints([trial])} />)
    expect(screen.queryByRole('button', { name: 'Not now' })).not.toBeInTheDocument()
  })

  it('hides the product preview from assistive technology and links the docs', () => {
    renderWithProviders(<GatedPage organizationId="org-1" client={client} paywall={blueprints([trial])} />)

    expect(screen.getByTestId('gated-preview')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('link', { name: 'Learn more' })).toHaveAttribute(
      'href',
      'https://www.qovery.com/docs/configuration/blueprints'
    )
  })

  it('falls back to a generic preview with the gate text for a feature without an entry', () => {
    renderWithProviders(
      <GatedPage
        organizationId="org-1"
        client={client}
        paywall={{
          ...blueprints([upgrade]),
          sku: 'dns.custom_provider',
          title: 'Custom DNS provider',
          headline: 'Use your own DNS provider',
          benefits: ['Bring your provider'],
        }}
      />
    )

    expect(screen.getByRole('heading', { name: 'Custom DNS provider' })).toBeInTheDocument()
    expect(screen.getByText('Use your own DNS provider')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Learn more' })).not.toBeInTheDocument()
    expect(screen.getByTestId('gated-preview')).toHaveTextContent('Bring your provider')
  })
})

describe('Paywall dialog', () => {
  it.each([
    ['not_in_plan', 'Blueprints are not in your plan'],
    ['limit_reached', "You have reached your plan's limit"],
  ] as const)('has a short title that says why (%s), with the headline under it', (reason, title) => {
    renderWithProviders(
      <Paywall
        organizationId="org-1"
        client={client}
        paywall={blueprints([trial])}
        reason={reason}
        inline
        onClose={jest.fn()}
      />
    )

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    expect(screen.getByText('Create databases, caches and storage from a catalog.')).toBeInTheDocument()
  })

  it('names the add-on as an action on its confirm step', () => {
    renderWithProviders(
      <Paywall
        organizationId="org-1"
        client={client}
        paywall={blueprints([addon])}
        startWith={addon}
        inline
        onClose={jest.fn()}
      />
    )

    expect(screen.getByRole('heading', { name: 'Add a managed cluster' })).toBeInTheDocument()
  })
})
