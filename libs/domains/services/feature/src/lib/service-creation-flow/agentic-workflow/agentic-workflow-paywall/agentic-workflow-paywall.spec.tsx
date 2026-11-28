import { BillingApi, type Gate } from 'qovery-pricing-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowPaywall } from './agentic-workflow-paywall'

// An intro shown is remembered for the session per organization: each intro test uses its own.
const mockOrg = { id: 'org-1' }
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: mockOrg.id }),
}))
const mockShowChat = jest.fn()
jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useSupportChat: () => ({ showChat: mockShowChat }),
}))
const mockGates: { current: Gate[] } = { current: [] }
const mockGatesCall = jest.fn()
const mockGateIntro = jest.fn()
const mockBillingFlag = jest.fn(() => false)
jest.mock('posthog-js/react', () => ({
  useFeatureFlagEnabled: (flag: string) => flag === 'billing-paywall' && mockBillingFlag(),
}))

const lockedAgentTasks: Gate = {
  action: 'agentic_workflow.create',
  sku: 'agents',
  name: 'Agent tasks',
  allowed: false,
  reason: 'not_in_plan',
  limit: false,
  used: 0,
  requested: 1,
  paywall: {
    sku: 'agents',
    title: 'Agent tasks',
    message: 'Agent tasks is not included in your Starter plan.',
    headline: 'Hand recurring jobs to AI agents that run in your environments.',
    benefits: [],
    audience: 'billing',
    options: [
      {
        type: 'addon',
        label: 'Add Agent tasks',
        addon: 'agents',
        addon_name: 'Agent tasks',
        amount: 10000,
        currency: 'USD',
        period: 'month',
      },
      { type: 'contact_sales', label: 'Talk to us' },
    ],
  },
}

const included: Gate = {
  ...lockedAgentTasks,
  allowed: true,
  reason: '',
  paywall: undefined,
  intro: {
    sku: 'agents',
    title: 'Agent tasks',
    headline: 'Included in your plan',
    benefits: ['Runs on a schedule, a webhook or by hand'],
    plan: { code: 'GROWTH_2026', name: 'Growth' },
    cta: 'Continue',
  },
}

function renderPaywall(onExit = jest.fn()) {
  return renderWithProviders(
    <AgenticWorkflowPaywall onExit={onExit}>
      <p>Agent task flow</p>
    </AgenticWorkflowPaywall>
  )
}

describe('AgenticWorkflowPaywall', () => {
  beforeEach(() => {
    mockGates.current = []
    mockBillingFlag.mockReturnValue(true)
    mockGatesCall.mockClear()
    mockGateIntro.mockClear()
    jest.spyOn(BillingApi.prototype, 'gates').mockImplementation(async (request) => {
      mockGatesCall(request)
      return { data: { gates: mockGates.current }, status: 200 } as Awaited<ReturnType<BillingApi['gates']>>
    })
    jest.spyOn(BillingApi.prototype, 'gateIntro').mockImplementation(async ({ organizationId, gateIntroRequest }) => {
      mockGateIntro(organizationId, gateIntroRequest)
      return { status: 204 } as Awaited<ReturnType<BillingApi['gateIntro']>>
    })
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('shows the full-page paywall with the add-on instead of the flow when agent tasks are not in the plan', async () => {
    mockGates.current = [lockedAgentTasks]
    renderPaywall()

    expect(await screen.findByRole('heading', { level: 1, name: 'Agent tasks' })).toBeInTheDocument()
    expect(screen.queryByText('Agent task flow')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add agent tasks for $100/month' })).toBeInTheDocument()
    expect(mockGatesCall).toHaveBeenCalledWith(expect.objectContaining({ actions: 'agentic_workflow.create' }))
  })

  it('goes back to Automations from "Talk to us", with the chat open', async () => {
    mockGates.current = [lockedAgentTasks]
    const onExit = jest.fn()
    const { userEvent } = renderPaywall(onExit)

    await userEvent.click(await screen.findByRole('button', { name: 'Talk to us' }))
    expect(mockShowChat).toHaveBeenCalled()
    expect(onExit).toHaveBeenCalled()
  })

  it('goes straight into the flow when agent tasks are in the plan', async () => {
    mockGates.current = [{ ...lockedAgentTasks, allowed: true, reason: '', paywall: undefined }]
    renderPaywall()

    expect(await screen.findByText('Agent task flow')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1, name: 'Agent tasks' })).not.toBeInTheDocument()
  })

  it('shows the intro once when agent tasks are in the plan, then Continue opens the flow', async () => {
    mockOrg.id = 'org-intro-continue'
    mockGates.current = [included]
    const onExit = jest.fn()
    const { userEvent } = renderPaywall(onExit)

    expect(await screen.findByText('Included in your Growth plan')).toBeInTheDocument()
    expect(screen.queryByText('Agent task flow')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(screen.getByText('Agent task flow')).toBeInTheDocument()
    expect(mockGateIntro).toHaveBeenCalledWith('org-intro-continue', { sku: 'agents', action: 'continued' })
    expect(onExit).not.toHaveBeenCalled()
  })

  it('goes back to Automations from the intro\'s "Not now"', async () => {
    mockOrg.id = 'org-intro-dismiss'
    mockGates.current = [included]
    const onExit = jest.fn()
    const { userEvent } = renderPaywall(onExit)

    await userEvent.click(await screen.findByRole('button', { name: 'Not now' }))
    expect(onExit).toHaveBeenCalled()
  })

  it('never gates without the billing-paywall flag (no gates read)', () => {
    mockBillingFlag.mockReturnValue(false)
    mockGates.current = [lockedAgentTasks]
    renderPaywall()

    expect(screen.getByText('Agent task flow')).toBeInTheDocument()
    expect(mockGatesCall).not.toHaveBeenCalled()
  })
})
