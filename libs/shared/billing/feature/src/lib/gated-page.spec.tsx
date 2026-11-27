import type { PaywallInfo, PaywallOption } from 'qovery-pricing-typescript-axios'
import type { PricingClient } from '@qovery/shared/billing/data-access'
import { act, renderWithProviders, screen } from '@qovery/shared/util-tests'
import { GatedPage } from './gated-page'
import { Paywall } from './paywall'

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

const MEDIA = 'https://billing.qovery.com/paywall-media/v1'
const sources = (el: Element | null) =>
  Array.from(el?.querySelectorAll('source') ?? []).map((s) => s.getAttribute('src'))

describe('GatedPage previews', () => {
  const realMatchMedia = window.matchMedia
  afterEach(() => {
    window.matchMedia = realMatchMedia
  })

  it('plays the console loop with its poster, and switches to Coding Agent when both previews exist', async () => {
    const { userEvent } = renderWithProviders(
      <GatedPage organizationId="org-1" client={client} paywall={blueprints([trial])} />
    )

    expect(screen.getByTestId('gated-preview-switch')).toBeInTheDocument()
    const video = screen.getByTestId('gated-preview-video')
    expect(video).toHaveAttribute('poster', `${MEDIA}/blueprints/console-poster.webp`)
    expect(video).toHaveProperty('muted', true)
    expect(video).toHaveAttribute('loop')
    expect(sources(video)).toEqual([`${MEDIA}/blueprints/console.webm`, `${MEDIA}/blueprints/console.mp4`])

    await userEvent.click(screen.getByRole('button', { name: 'Pause preview' }))
    expect(screen.queryByTestId('gated-preview-video')).not.toBeInTheDocument()
    expect(screen.getByTestId('gated-preview-image')).toHaveAttribute('src', `${MEDIA}/blueprints/console-poster.webp`)
    await userEvent.click(screen.getByRole('button', { name: 'Play preview' }))
    expect(screen.getByTestId('gated-preview-video')).toBeInTheDocument()

    await userEvent.click(screen.getAllByText('Coding Agent')[0])
    expect(sources(screen.getByTestId('gated-preview-video'))).toEqual([
      `${MEDIA}/blueprints/claude.webm`,
      `${MEDIA}/blueprints/claude.mp4`,
    ])
    expect(screen.getByTestId('gated-preview')).toHaveAttribute('aria-hidden', 'true')
  })

  it('shows no switch with a single preview, and none for a feature drawn without media', () => {
    const { unmount } = renderWithProviders(
      <GatedPage
        organizationId="org-1"
        client={client}
        paywall={{
          ...blueprints([upgrade]),
          sku: 'dns.custom_provider',
          media: { url: 'https://www.qovery.com/dns.png', kind: 'image' },
        }}
      />
    )
    expect(screen.queryByTestId('gated-preview-switch')).not.toBeInTheDocument()
    expect(screen.getByTestId('gated-preview-image')).toHaveAttribute('src', 'https://www.qovery.com/dns.png')
    unmount()

    renderWithProviders(
      <GatedPage
        organizationId="org-1"
        client={client}
        paywall={{ ...blueprints([contact]), sku: 'sso', title: 'Single sign-on' }}
      />
    )
    expect(screen.queryByTestId('gated-preview-switch')).not.toBeInTheDocument()
    expect(screen.getByTestId('gated-preview')).toHaveTextContent('Okta')
  })

  it('shows the still instead of the loop under reduced motion', () => {
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })) as unknown as typeof window.matchMedia
    renderWithProviders(
      <GatedPage
        organizationId="org-1"
        client={client}
        paywall={{ ...blueprints([trial]), sku: 'observe.clusters', title: 'Qovery Observe' }}
      />
    )

    expect(screen.queryByTestId('gated-preview-video')).not.toBeInTheDocument()
    expect(screen.getByTestId('gated-preview-image')).toHaveAttribute('src', `${MEDIA}/observe/console.webp`)
  })

  it('plays the media staff set on the gate instead of the built-in console preview', () => {
    renderWithProviders(
      <GatedPage
        organizationId="org-1"
        client={client}
        paywall={{ ...blueprints([trial]), media: { url: 'https://www.qovery.com/blueprints.mp4', kind: 'video' } }}
      />
    )

    expect(sources(screen.getByTestId('gated-preview-video'))).toEqual(['https://www.qovery.com/blueprints.mp4'])
    expect(screen.getByTestId('gated-preview-switch')).toBeInTheDocument()
  })

  it('plays the loop in the overlay, whose content mounts after the page', () => {
    const observed: Element[] = []
    let report: IntersectionObserverCallback = () => undefined
    const realObserver = window.IntersectionObserver
    window.IntersectionObserver = jest.fn((cb: IntersectionObserverCallback) => {
      report = cb
      return { observe: (el: Element) => observed.push(el), disconnect: jest.fn(), unobserve: jest.fn() }
    }) as unknown as typeof IntersectionObserver
    try {
      renderWithProviders(<GatedPage organizationId="org-1" client={client} paywall={blueprints([trial])} overlay />)

      expect(observed).toEqual([screen.getByTestId('gated-preview')])
      act(() => report([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver))
      expect(screen.getByTestId('gated-preview-video')).toBeInTheDocument()
    } finally {
      window.IntersectionObserver = realObserver
    }
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

  it('shows the console still of a feature with previews', () => {
    renderWithProviders(
      <Paywall
        organizationId="org-1"
        client={client}
        paywall={{ ...blueprints([trial]), sku: 'observe.clusters', title: 'Qovery Observe' }}
        reason="not_in_plan"
        inline
        onClose={jest.fn()}
      />
    )

    expect(screen.getByRole('img', { name: 'Qovery Observe' })).toHaveAttribute('src', `${MEDIA}/observe/console.webp`)
  })
})
