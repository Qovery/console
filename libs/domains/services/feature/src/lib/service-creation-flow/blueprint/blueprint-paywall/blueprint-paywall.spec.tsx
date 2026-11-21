import { type Gate } from '@qovery/shared/billing-kit'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BlueprintPaywall } from './blueprint-paywall'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1' }),
}))
const mockShowChat = jest.fn()
jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useSupportChat: () => ({ showChat: mockShowChat }),
}))
// The gates pricing-api answers (the billing-paywall flag on): none by default, nothing locked.
const mockGates: { current: Gate[] | undefined } = { current: undefined }
const mockGatesCall = jest.fn()
jest.mock('@qovery/shared/billing-kit', () => {
  const actual = jest.requireActual('@qovery/shared/billing-kit')
  const client = {
    mode: 'live',
    publicPlans: () => Promise.resolve(),
    billingUsage: () => Promise.resolve(),
    spendLimits: () => Promise.resolve(),
    gateEvent: () => Promise.resolve(),
    get gates() {
      return mockGates.current
        ? (organizationId: string, keys: object) => {
            mockGatesCall(keys)
            return Promise.resolve({ organization_id: organizationId, access: 'billing', gates: mockGates.current })
          }
        : undefined
    },
  }
  return {
    ...actual,
    usePricingClient: () => client,
    useBillingPaywall: (organizationId: string, keys: object, options: object) =>
      actual.usePaywall(client, organizationId, keys, options),
  }
})

const lockedBlueprints: Gate = {
  action: 'blueprint.create',
  sku: 'service_catalog',
  name: 'Service catalog (blueprints)',
  allowed: false,
  reason: 'not_in_plan',
  limit: false,
  used: 0,
  requested: 1,
  paywall: {
    sku: 'service_catalog',
    title: 'Blueprints',
    message: 'Service catalog (blueprints) is not included in your Starter plan.',
    headline: 'Create databases, caches and storage from a catalog',
    benefits: [],
    audience: 'billing',
    options: [
      { type: 'start_trial', label: 'Try it free for 14 days', days: 14, includes: 'Blueprints' },
      { type: 'contact_sales', label: 'Talk to us' },
    ],
  },
}

describe('BlueprintPaywall', () => {
  beforeEach(() => {
    mockGates.current = undefined
    mockGatesCall.mockClear()
  })

  it('shows the full-page paywall instead of the blueprint flow when blueprints are not in the plan', async () => {
    mockGates.current = [lockedBlueprints]
    renderWithProviders(
      <BlueprintPaywall onExit={jest.fn()}>
        <p>Blueprint flow</p>
      </BlueprintPaywall>
    )

    expect(await screen.findByRole('heading', { level: 1, name: 'Blueprints' })).toBeInTheDocument()
    expect(screen.queryByText('Blueprint flow')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start a 14-day trial' })).toBeInTheDocument()
    expect(mockGatesCall).toHaveBeenCalledWith({ actions: ['blueprint.create'] })
  })

  it('goes back to the catalog from "Not now", and opens the chat from "Talk to us"', async () => {
    mockGates.current = [lockedBlueprints]
    const onExit = jest.fn()
    const { userEvent } = renderWithProviders(
      <BlueprintPaywall onExit={onExit}>
        <p>Blueprint flow</p>
      </BlueprintPaywall>
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Talk to us' }))
    expect(mockShowChat).toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Not now' }))
    expect(onExit).toHaveBeenCalled()
  })

  it('goes straight into the blueprint when blueprints are in the plan', async () => {
    mockGates.current = [{ ...lockedBlueprints, allowed: true, reason: '', paywall: undefined }]
    renderWithProviders(
      <BlueprintPaywall onExit={jest.fn()}>
        <p>Blueprint flow</p>
      </BlueprintPaywall>
    )

    expect(screen.getByText('Blueprint flow')).toBeInTheDocument()
    await screen.findByText('Blueprint flow')
    expect(mockGatesCall).toHaveBeenCalled()
    expect(screen.queryByRole('heading', { level: 1, name: 'Blueprints' })).not.toBeInTheDocument()
  })

  it('never gates without the billing-paywall flag (no gates read)', () => {
    renderWithProviders(
      <BlueprintPaywall onExit={jest.fn()}>
        <p>Blueprint flow</p>
      </BlueprintPaywall>
    )

    expect(screen.getByText('Blueprint flow')).toBeInTheDocument()
  })
})
