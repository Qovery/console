import { useLocation, useParams } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import {
  type SkillPresetsMockScenario,
  buildSkillPresetApiError,
  resetSkillPresetsMockApi,
  skillPresetsApi,
} from '@qovery/domains/skill-presets/data-access'
import { renderWithProviders, screen, waitFor, within } from '@qovery/shared/util-tests'
import { AgentExperienceAutomate } from './agent-experience-automate'
import { AgentExperienceConnect } from './agent-experience-connect'
import { AgentExperienceCopilot, aiStatusLabel, copilotStateLabel } from './agent-experience-copilot'
import { AGENT_EXPERIENCE_ENTRY_DISMISSED_KEY, AgentExperienceEntryCard } from './agent-experience-entry-card'
import { AgentExperienceNav } from './agent-experience-nav'
import { AgentExperienceOverview } from './agent-experience-overview'
import { AgentExperiencePolicyTokens } from './agent-experience-policy-tokens'

// The pages go through the real hooks and the in-browser mock API.
jest.mock('@qovery/shared/util-node-env', () => ({
  ...jest.requireActual('@qovery/shared/util-node-env'),
  SKILL_PRESETS_MOCK: 'true',
}))
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: jest.fn(),
  useLocation: jest.fn(),
  useNavigate: () => jest.fn(),
  useRouterState: () => ({ location: { pathname: '/organization/organization-1/agent-experience' } }),
  Link: ({ children, className }: { children: ReactNode; className?: string }) => (
    <a href="/" className={className}>
      {children}
    </a>
  ),
}))

jest.mock('posthog-js/react', () => ({
  ...jest.requireActual('posthog-js/react'),
  useFeatureFlagEnabled: () => true,
}))

const useScenario = (scenario: SkillPresetsMockScenario) => {
  window.sessionStorage.setItem('qovery-mock-skill-presets', scenario)
  resetSkillPresetsMockApi()
}

const stepState = (id: string) => screen.getByTestId(`setup-step-${id}`).getAttribute('data-state')

beforeEach(() => {
  window.sessionStorage.clear()
  window.localStorage.clear()
  resetSkillPresetsMockApi()
  jest.mocked(useParams).mockReturnValue({ organizationId: 'organization-1' })
  jest.mocked(useLocation).mockReturnValue({ pathname: '/organization/organization-1/agent-experience' } as never)
})

describe('AgentExperienceOverview', () => {
  it('explains Agents the first time, starts with a custom preset, and shows no numbers', async () => {
    useScenario('agent-experience-empty')
    renderWithProviders(<AgentExperienceOverview />)

    expect(await screen.findByTestId('setup-progress')).toHaveTextContent('0 of 3 done')
    expect(screen.getByTestId('agent-experience-state')).toHaveAttribute('data-state', 'empty')
    const intro = screen.getByTestId('agent-experience-hero')
    expect(within(intro).getByRole('heading', { name: 'The future of infrastructure is agentic' })).toBeInTheDocument()
    expect(within(screen.getByTestId('hero-pillar-guide')).getByText('Skills Registry')).toBeInTheDocument()
    expect(within(screen.getByTestId('hero-pillar-control')).getByText(/Deny by default/)).toBeInTheDocument()
    expect(within(screen.getByTestId('hero-pillar-observe')).getByText('Audit logs')).toBeInTheDocument()
    // The steps in order: value first, connecting last.
    expect(
      within(screen.getByTestId('setup-steps'))
        .getAllByRole('listitem')
        .map((item) => item.dataset.testid)
    ).toEqual(['setup-step-preset', 'setup-step-policy-token', 'setup-step-connect'])
    expect(stepState('preset')).toBe('next')
    expect(within(screen.getByTestId('setup-step-preset')).getByText('Set up your Skills Registry')).toBeInTheDocument()
    // New organizations have AI features on: no Turn on AI anywhere.
    expect(screen.queryByTestId('overview-ai-off')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Turn on AI' })).not.toBeInTheDocument()
    expect(within(intro).queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByText('Connect an agent')).toBeInTheDocument()
    expect(screen.queryByTestId('week-kpis')).not.toBeInTheDocument()
  })

  it('shows Turn on AI as a notice when AI features are off, and keeps AI on when the Copilot step fails', async () => {
    useScenario('agent-experience-copilot-error')
    const { userEvent } = renderWithProviders(<AgentExperienceOverview />)
    const notice = await screen.findByTestId('overview-ai-off')
    expect(notice).toHaveTextContent('AI features are off for this organization')

    await userEvent.click(within(notice).getByRole('button', { name: 'Turn on AI' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(
      await within(dialog).findByRole('checkbox', { name: 'I have read and accept the Copilot Terms of Service' })
    )
    await userEvent.click(within(dialog).getByTestId('submit-button'))

    expect(
      await within(dialog).findByText('AI features are on, but the Copilot could not be turned on')
    ).toBeInTheDocument()
    expect(within(dialog).getByTestId('submit-button')).toHaveTextContent('Retry')
    await userEvent.click(within(dialog).getByTestId('submit-button'))
    await waitFor(() => expect(screen.queryByTestId('overview-ai-off')).not.toBeInTheDocument())
  })

  it('highlights the next step when partly set up', async () => {
    useScenario('agent-experience-partial')
    renderWithProviders(<AgentExperienceOverview />)

    await waitFor(() => expect(screen.getByTestId('setup-progress')).toHaveTextContent('1 of 3 done'))
    // The hero folds to one sentence once a step is done.
    expect(screen.getByTestId('agent-experience-hero')).toHaveAttribute('data-variant', 'sentence')
    expect(stepState('connect')).toBe('done')
    expect(stepState('preset')).toBe('next')
    expect(stepState('policy-token')).toBe('todo')
    expect(await screen.findByTestId('week-kpis')).toBeInTheDocument()
  })

  it('shows what agents did once everything is in place', async () => {
    useScenario('agent-experience-active')
    renderWithProviders(<AgentExperienceOverview />)

    expect(await screen.findByRole('heading', { name: 'Active presets' })).toBeInTheDocument()
    expect(screen.getByTestId('agent-experience-state')).toHaveAttribute('data-state', 'active')
    expect(screen.queryByTestId('setup-steps')).not.toBeInTheDocument()
    const kpis = await screen.findByTestId('week-kpis')
    expect(kpis).toHaveTextContent('Last 7 days')
    expect(kpis).toHaveTextContent('Members with agents')
    expect(within(kpis).getAllByRole('link')).toHaveLength(4)
    const tokens = screen.getByRole('heading', { name: 'Policy tokens in use' }).closest('section') as HTMLElement
    expect(within(tokens).getByText('ci-deployer')).toBeInTheDocument()
    expect(screen.getByTestId('overview-denied')).toHaveTextContent('payments-production')
    // No hero once in use: the numbers come first. Suggestions live on Activity, linked from here.
    expect(screen.queryByTestId('agent-experience-hero')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Suggestions' })).not.toBeInTheDocument()
    expect(screen.getByTestId('overview-copilot-state')).toHaveTextContent(/\d+ suggestions? in Activity/)
    expect(await screen.findByTestId('overview-copilot-state')).toHaveTextContent('On, read-only')
  })

  it('says when Agents cannot be loaded, and loads again on Try again', async () => {
    useScenario('agent-experience-active')
    const getActivity = jest
      .spyOn(skillPresetsApi, 'getAgentActivity')
      .mockRejectedValue(buildSkillPresetApiError(404, 'Not found'))
    const { userEvent } = renderWithProviders(<AgentExperienceOverview />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Agents could not be loaded')
    expect(alert).toHaveTextContent('HTTP 404')
    const calls = getActivity.mock.calls.length
    await userEvent.click(within(alert).getByRole('button', { name: /Try again/ }))
    await waitFor(() => expect(getActivity.mock.calls.length).toBeGreaterThan(calls))
    getActivity.mockRestore()
  })

  it('shows a member their own setup, with no admin actions', async () => {
    useScenario('member')
    renderWithProviders(<AgentExperienceOverview />)

    expect(await screen.findByRole('heading', { name: 'Your agent setup', level: 1 })).toBeInTheDocument()
    expect(await screen.findByTestId('preset-summary')).toHaveTextContent('Your agent gets the')
    expect(screen.queryByTestId('setup-steps')).not.toBeInTheDocument()
    expect(screen.queryByText('Members with agents')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Turn on AI' })).not.toBeInTheDocument()
    // Nothing that leads to a page a member cannot use.
    expect(screen.queryByTestId('agent-experience-hero')).not.toBeInTheDocument()
    expect(screen.queryByText('Policy tokens')).not.toBeInTheDocument()
    expect(screen.queryByText('What the Copilot does')).not.toBeInTheDocument()
  })
})

describe('AgentExperienceCopilot', () => {
  it('shows one combined status and the Copilot settings to admins', async () => {
    useScenario('agent-experience-active')
    renderWithProviders(<AgentExperienceCopilot />)

    expect(screen.getByRole('heading', { name: 'What the Copilot does' })).toBeInTheDocument()
    expect(await within(screen.getByTestId('copilot-state')).findByText('AI on, Copilot read-only')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Turn on AI' })).not.toBeInTheDocument()
  })

  it('offers Turn on AI when AI is off', async () => {
    useScenario('ai-features-off')
    renderWithProviders(<AgentExperienceCopilot />)

    expect(await screen.findByRole('heading', { name: 'Turn on AI' })).toBeInTheDocument()
    expect(within(screen.getByTestId('copilot-state')).getByText('Off')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Turn on AI' })).toBeInTheDocument()
  })

  it('opens the one-step Turn on AI dialog from the Copilot page', async () => {
    useScenario('ai-features-off')
    const { userEvent } = renderWithProviders(<AgentExperienceCopilot />)
    await userEvent.click(await screen.findByRole('button', { name: 'Turn on AI' }))
    const dialog = await screen.findByRole('dialog')
    expect(
      await within(dialog).findByRole('checkbox', { name: 'I have read and accept the Copilot Terms of Service' })
    ).toBeInTheDocument()
    expect(within(dialog).getByTestId('submit-button')).toBeDisabled()
  })

  it('names every state of AI features and the Copilot', () => {
    expect(aiStatusLabel(true, true, true)).toBe('AI on, Copilot read-only')
    expect(aiStatusLabel(true, true, false)).toBe('AI on, Copilot read-write')
    expect(aiStatusLabel(true, false, true)).toBe('AI features on, Copilot off')
    expect(aiStatusLabel(false, true, true)).toBe('AI features off, Copilot on')
    expect(aiStatusLabel(false, false, true)).toBe('Off')
    expect(copilotStateLabel(true, false)).toBe('On, read-write')
    expect(copilotStateLabel(false, true)).toBe('Off')
  })

  it('shows members the state only, with no switch', async () => {
    useScenario('member')
    renderWithProviders(<AgentExperienceCopilot />)

    expect(await screen.findByTestId('copilot-member-note')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Turn on AI' })).not.toBeInTheDocument()
    expect(screen.queryByText('Opt-in to Copilot')).not.toBeInTheDocument()
  })
})

const CODING_AGENT_NAMES = ['Claude Code', 'Codex', 'Cursor', 'OpenCode', 'Gemini CLI', 'VS Code Copilot']

describe('AgentExperienceAutomate', () => {
  it('shows the jobs in one grid, safest first, with safety levels and no trigger labels', async () => {
    useScenario('agent-experience-active')
    renderWithProviders(<AgentExperienceAutomate />)

    const grid = within(screen.getByTestId('agent-job-grid'))
    const cards = grid.getAllByRole('button', { name: /: view details/ })
    expect(cards).toHaveLength(9)
    expect(cards[0]).toHaveAttribute('data-testid', 'agent-job-investigate-production-incident')
    expect(cards[8]).toHaveAttribute('data-testid', 'agent-job-test-on-production-clone')
    expect(within(cards[8]).getByTestId('agent-job-level')).toHaveTextContent('Change')
    expect(
      within(screen.getByTestId('agent-job-stop-idle-environments')).queryByTestId('agent-job-trigger')
    ).not.toBeInTheDocument()
    // The safety promise stays whole on the card.
    expect(
      grid.getByText('Stops idle dev environments at night and starts them in the morning. Nothing else.')
    ).toBeInTheDocument()
    expect(grid.queryByRole('button', { name: /Create policy token/ })).not.toBeInTheDocument()
    expect(grid.queryByRole('group', { name: 'Copy prompt' })).not.toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /Automate a new job/ })).toBeInTheDocument()
    expect(screen.getByText('Incident Analyzer with incident.io')).toBeInTheDocument()
  })

  it('filters the jobs by safety level', async () => {
    useScenario('agent-experience-active')
    const { userEvent } = renderWithProviders(<AgentExperienceAutomate />)

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Safety level' }), 'hygiene')
    const cards = within(screen.getByTestId('agent-job-grid')).getAllByRole('button', { name: /: view details/ })
    expect(cards.map((card) => card.getAttribute('data-testid'))).toEqual([
      'agent-job-stop-idle-environments',
      'agent-job-clean-up-preview-environments',
    ])
  })

  it('opens the details with the prompt first, then what it can and can never do, then how to run it', async () => {
    useScenario('agent-experience-active')
    const { userEvent } = renderWithProviders(<AgentExperienceAutomate />)

    await userEvent.click(screen.getByTestId('agent-job-investigate-production-incident'))
    const details = within(await screen.findByRole('dialog'))
    expect(details.getByRole('heading', { name: 'Investigate an incident' })).toBeInTheDocument()
    const headings = details
      .getAllByRole('heading')
      .slice(1)
      .map((heading) => heading.textContent)
    expect(headings.slice(0, 4)).toEqual(['Prompt for the agent', 'The agent can', 'It can never', 'Run it on its own'])
    expect(details.getByText(/Our production checkout service started failing/)).toBeInTheDocument()
    expect(details.getByText('Deploy, redeploy, restart or stop anything')).toBeInTheDocument()
    expect(details.getByRole('link', { name: /Read the example/ })).toHaveAttribute(
      'href',
      'https://www.qovery.com/docs/configuration/organization/policy-examples/investigate-production-incident'
    )
    // One primary action, and copy buttons named after what they copy.
    expect(await details.findAllByRole('button', { name: /Create policy token/ })).toHaveLength(1)
    expect(
      within(details.getByRole('group', { name: 'Copy prompt' })).getByRole('button', { name: 'Copy' })
    ).toBeInTheDocument()
    expect(
      within(details.getByRole('group', { name: 'Copy policy' })).getByRole('button', { name: 'Copy' })
    ).toBeInTheDocument()
    expect(
      within(details.getByRole('group', { name: 'Copy the MCP server URL' })).getByRole('button', { name: 'Copy' })
    ).toBeInTheDocument()
  })
})

describe('Automate, recurring agents', () => {
  it('offers two ways to schedule it: the coding agent first, the Agent Task recommended', async () => {
    useScenario('agent-experience-active')
    const { userEvent } = renderWithProviders(<AgentExperienceAutomate />)

    await userEvent.click(screen.getByTestId('agent-job-stop-idle-environments'))
    const run = within(await screen.findByTestId('agent-job-run'))
    expect(run.getByText(/Use Create policy token at the bottom of this panel/)).toBeInTheDocument()
    const codingAgent = within(run.getByTestId('route-coding-agent'))
    expect(codingAgent.queryByText('Recommended')).not.toBeInTheDocument()
    expect(codingAgent.getAllByTestId('coding-agent').map((item) => item.textContent)).toEqual(CODING_AGENT_NAMES)
    // Full values, not cut with an ellipsis.
    expect(codingAgent.getByText('QOVERY_CLI_ACCESS_TOKEN=<policy token>')).toBeInTheDocument()
    expect(codingAgent.getByText('0 8,20 * * 1-5')).toBeInTheDocument()
    const agentTask = within(run.getByTestId('route-agent-task'))
    expect(agentTask.getByText('Recommended')).toBeInTheDocument()
    expect(agentTask.getByText(/with no laptop or CI to keep running/)).toBeInTheDocument()
    expect(agentTask.getByText('https://mcp.qovery.com/mcp')).toBeInTheDocument()
    // Nothing is created from here: the action opens the environment's Automations.
    expect(agentTask.getByText('Open Automations in an environment')).toBeInTheDocument()
    expect(agentTask.getByText(/This page creates nothing/)).toBeInTheDocument()

    expect(run.getByTestId('route-coding-agent').compareDocumentPosition(run.getByTestId('route-agent-task'))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
  })

  it('shows members the catalog, with no action they cannot take, and who to ask', async () => {
    useScenario('member')
    const { userEvent } = renderWithProviders(<AgentExperienceAutomate />)

    expect(screen.queryByRole('button', { name: /Automate a new job/ })).not.toBeInTheDocument()
    await userEvent.click(screen.getByTestId('agent-job-roll-back-bad-release'))
    const details = within(await screen.findByRole('dialog'))
    expect(details.queryByRole('button', { name: /Create policy token/ })).not.toBeInTheDocument()
    expect(details.queryByText('Add the MCP server')).not.toBeInTheDocument()
    await waitFor(() =>
      expect(details.getByTestId('agent-job-member-note')).toHaveTextContent(
        'Only owners and admins create policy tokens. Send this job to one of them: Alex Martin, Sam Lee.'
      )
    )
    expect(details.getByText(/From a webhook: use the URL the Agent Task gets/)).toBeInTheDocument()
    expect(
      within(details.getByRole('group', { name: 'Copy prompt' })).getByRole('button', { name: 'Copy' })
    ).toBeInTheDocument()
  })
})

describe('Automate a new job', () => {
  it('turns an intent into a qovery-policy-token command', async () => {
    useScenario('agent-experience-active')
    const { userEvent } = renderWithProviders(<AgentExperienceAutomate />)

    await userEvent.click(await screen.findByRole('button', { name: /Automate a new job/ }))
    const modal = within(await screen.findByTestId('new-job-modal'))
    // Empty to start with: the example is a hint, not a value.
    expect(screen.getByRole('textbox', { name: 'The job' })).toHaveValue('')
    expect(modal.getByTestId('new-job-command')).toHaveTextContent('/qovery-policy-token <describe the job>')
    expect(screen.getByTestId('submit-button')).toBeDisabled()

    await userEvent.click(modal.getByRole('button', { name: /stop dev and QA environments/ }))
    expect(modal.getByTestId('new-job-command')).toHaveTextContent(
      '/qovery-policy-token Every weeknight at 8 PM, stop dev and QA environments nobody used today'
    )
    expect(screen.getByTestId('submit-button')).toBeEnabled()
    expect(modal.getAllByTestId('coding-agent')).toHaveLength(6)
    // The steps are folded until asked for.
    await userEvent.click(modal.getByRole('button', { name: 'What happens next' }))
    expect(await modal.findByText(/refuses everything by default/)).toBeInTheDocument()
    expect(modal.getByTestId('new-job-schedule')).toHaveTextContent(
      'Then schedule it: as an Agent Task on Qovery (recommended), or from your coding agent, with that token.'
    )
  })

  it('puts a typed intent on one line', async () => {
    useScenario('agent-experience-active')
    const { userEvent } = renderWithProviders(<AgentExperienceAutomate />)

    await userEvent.click(await screen.findByRole('button', { name: /Automate a new job/ }))
    await userEvent.type(screen.getByTestId('new-job-intent'), 'Scale the api{enter}before Black Friday')
    expect(screen.getByTestId('new-job-command')).toHaveTextContent(
      '/qovery-policy-token Scale the api before Black Friday'
    )
  })

  it('copies the command, says Copied, and keeps the modal open', async () => {
    useScenario('agent-experience-active')
    const { userEvent } = renderWithProviders(<AgentExperienceAutomate />)

    await userEvent.click(await screen.findByRole('button', { name: /Automate a new job/ }))
    await userEvent.type(screen.getByTestId('new-job-intent'), 'Restart the api when it stops answering')
    await userEvent.click(screen.getByTestId('submit-button'))

    expect(screen.getByTestId('submit-button')).toHaveTextContent('Copied')
    expect(screen.getByTestId('new-job-modal')).toBeInTheDocument()
  })

  it('opens from a job’s details', async () => {
    useScenario('agent-experience-active')
    const { userEvent } = renderWithProviders(<AgentExperienceAutomate />)

    await userEvent.click(screen.getByTestId('agent-job-stop-idle-environments'))
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Describe it' }))
    expect(await screen.findByTestId('new-job-modal')).toBeInTheDocument()
  })
})

describe('AgentExperiencePolicyTokens', () => {
  it('shows each token’s last 7 days, flags tokens with no expiry, and keeps deleted tokens as greyed rows', async () => {
    useScenario('agent-experience-active')
    renderWithProviders(<AgentExperiencePolicyTokens />)

    const ciDeployer = await screen.findByTestId('policy-token-ci-deployer')
    expect(await within(ciDeployer).findByTestId('token-usage')).toHaveTextContent(/\d+ allowed/)
    expect(within(ciDeployer).queryByTestId('no-expiry')).not.toBeInTheDocument()
    expect(within(screen.getByTestId('policy-token-review-agent')).getByTestId('no-expiry')).toHaveTextContent(
      'No expiry'
    )
    const deleted = await screen.findByTestId('deleted-token-cleanup-bot')
    expect(within(deleted).getByText('Deleted', { selector: 'span' })).toBeInTheDocument()
    expect(within(deleted).getByText('See activity')).toBeInTheDocument()
  })

  it('manages each token from its row: see activity, view the policy, delete', async () => {
    useScenario('agent-experience-active')
    const { userEvent } = renderWithProviders(<AgentExperiencePolicyTokens />)

    await userEvent.click(await screen.findByRole('button', { name: 'Actions for review-agent' }, { timeout: 5000 }))
    expect(await screen.findByRole('menuitem', { name: 'See activity' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'View policy' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('menuitem', { name: 'Delete token' }))
    await userEvent.type(await screen.findByRole('textbox'), 'review-agent')
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => expect(screen.queryByTestId('policy-token-review-agent')).not.toBeInTheDocument())
    expect(screen.getByTestId('policy-token-ci-deployer')).toBeInTheDocument()
  })

  it('creates a token here, with the explanation once', async () => {
    useScenario('agent-experience-active')
    renderWithProviders(<AgentExperiencePolicyTokens />)

    expect(
      screen.getByText('Give each agent a token that can only do what its policy allows. A denied call never runs.')
    ).toBeInTheDocument()
    expect(await screen.findByText('ci-deployer')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Create policy token/ })).toHaveLength(1)
    expect(screen.queryByText(/policy token settings/)).not.toBeInTheDocument()
  })

  it('offers two ways to start when there is no token', async () => {
    useScenario('agent-experience-empty')
    renderWithProviders(<AgentExperiencePolicyTokens />)
    expect(await screen.findByText('No policy token yet')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Create policy token/ }).length).toBeGreaterThan(0)
    expect(screen.getByText('Start from a job')).toBeInTheDocument()
  })

  it('tells members only owners and admins manage tokens', async () => {
    useScenario('member')
    renderWithProviders(<AgentExperiencePolicyTokens />)
    expect(await screen.findByText('Only owners and admins manage policy tokens')).toBeInTheDocument()
    expect(screen.queryByText('Create policy token')).not.toBeInTheDocument()
  })
})

describe('AgentExperienceNav', () => {
  it('has four entries, then Settings with policy tokens, for admins only', async () => {
    useScenario('agent-experience-active')
    const { userEvent, unmount } = renderWithProviders(<AgentExperienceNav />)
    expect(await screen.findByText('Settings')).toBeInTheDocument()
    for (const label of ['Overview', 'Skills Registry', 'Automate', 'Optimize builds', 'Activity']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
    // Connect is reached from the Overview, not from the menu. Policy tokens sit in Settings.
    expect(screen.queryByText('Connect')).not.toBeInTheDocument()
    expect(screen.queryByText('Policy tokens')).not.toBeInTheDocument()
    await userEvent.click(screen.getByTestId('sidebar-group-trigger'))
    const settings = within(screen.getByTestId('sidebar-group-content'))
    expect(settings.getByText('Policy tokens')).toBeInTheDocument()
    expect(settings.getByText('Copilot settings')).toBeInTheDocument()
    unmount()

    useScenario('member')
    renderWithProviders(<AgentExperienceNav />)
    expect(await screen.findByText('Activity')).toBeInTheDocument()
    expect(screen.queryByText('Policy tokens')).not.toBeInTheDocument()
    expect(screen.queryByText('Settings')).not.toBeInTheDocument()
  })

  it('opens Settings by itself on the policy tokens page', async () => {
    useScenario('agent-experience-active')
    jest
      .mocked(useLocation)
      .mockReturnValue({ pathname: '/organization/organization-1/agent-experience/policy-tokens' } as never)
    renderWithProviders(<AgentExperienceNav />)
    expect(await screen.findByText('Policy tokens')).toBeInTheDocument()
  })
})

describe('AgentExperienceConnect', () => {
  it('gives a command to copy for the skills, the CLI and the MCP server', () => {
    useScenario('agent-experience-active')
    renderWithProviders(<AgentExperienceConnect />)
    expect(screen.getByText('curl -fsSL https://skill.qovery.com/install.sh | bash')).toBeInTheDocument()
    expect(screen.getByText('curl -s https://get.qovery.com | bash')).toBeInTheDocument()
    expect(screen.getByText(/claude mcp add --transport http qovery/)).toBeInTheDocument()
    expect(
      within(screen.getByRole('group', { name: 'Copy the skills install command' })).getByRole('button', {
        name: 'Copy',
      })
    ).toBeInTheDocument()
    expect(screen.getByText('Start here')).toBeInTheDocument()
  })

  it('has the MCP set-up of each coding agent in its own tab', async () => {
    useScenario('agent-experience-active')
    const { userEvent } = renderWithProviders(<AgentExperienceConnect />)
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Claude Code',
      'Codex',
      'Cursor',
      'Gemini CLI',
      'VS Code',
    ])
    await userEvent.click(screen.getByRole('tab', { name: 'Gemini CLI' }))
    expect(screen.getByText(/gemini mcp add --transport http/)).toBeInTheDocument()
    expect(
      within(screen.getByRole('group', { name: 'Copy the Gemini CLI command' })).getByRole('button', { name: 'Copy' })
    ).toBeInTheDocument()
  })

  it('says which preset the installed skills load', async () => {
    useScenario('agent-experience-active')
    const { unmount } = renderWithProviders(<AgentExperienceConnect />)
    expect(await screen.findByTestId('connect-your-preset')).toHaveTextContent(
      /^Your agent’s preset: .+Skills registry$/
    )
    unmount()

    useScenario('agent-experience-empty')
    renderWithProviders(<AgentExperienceConnect />)
    expect(await screen.findByTestId('connect-your-preset')).toHaveTextContent(
      'No preset applies to you: your agent gets the Qovery skills as published.Skills registry'
    )
  })

  it('says nothing about the preset when the presets cannot be loaded', async () => {
    useScenario('errors')
    renderWithProviders(<AgentExperienceConnect />)
    expect(await screen.findByText('curl -s https://get.qovery.com | bash')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByTestId('connect-your-preset')).not.toBeInTheDocument())
    expect(screen.queryByText(/No preset applies to you/)).not.toBeInTheDocument()
  })
})

describe('AgentExperienceEntryCard', () => {
  it('leads to Agents and can be dismissed for good', async () => {
    const { userEvent, unmount } = renderWithProviders(<AgentExperienceEntryCard />)
    expect(screen.getByText('Set up how coding agents work with Qovery')).toBeInTheDocument()
    expect(screen.getByText('Open Agents')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByTestId('agent-experience-entry')).not.toBeInTheDocument()
    expect(window.localStorage.getItem(AGENT_EXPERIENCE_ENTRY_DISMISSED_KEY)).toBe('true')
    unmount()

    renderWithProviders(<AgentExperienceEntryCard />)
    expect(screen.queryByTestId('agent-experience-entry')).not.toBeInTheDocument()
  })
})
