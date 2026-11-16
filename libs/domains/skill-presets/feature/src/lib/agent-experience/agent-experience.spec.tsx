import { useLocation, useParams } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import { type SkillPresetsMockScenario, resetSkillPresetsMockApi } from '@qovery/domains/skill-presets/data-access'
import { renderWithProviders, screen, waitFor, within } from '@qovery/shared/util-tests'
import { AgentExperienceAutomate } from './agent-experience-automate'
import { AgentExperienceConnect } from './agent-experience-connect'
import { AgentExperienceCopilot } from './agent-experience-copilot'
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
  it('explains Agents the first time, leads with Turn on AI, and shows no numbers', async () => {
    useScenario('agent-experience-empty')
    renderWithProviders(<AgentExperienceOverview />)

    expect(await screen.findByTestId('setup-progress')).toHaveTextContent('0 of 4 done')
    expect(screen.getByTestId('agent-experience-state')).toHaveAttribute('data-state', 'empty')
    const intro = screen.getByTestId('agent-experience-hero')
    expect(within(intro).getByRole('heading', { name: 'The future of infrastructure is agentic' })).toBeInTheDocument()
    expect(within(intro).getByText(/every operation is checked at the API/)).toBeInTheDocument()
    expect(within(screen.getByTestId('hero-pillar-guide')).getByText('Install skills')).toBeInTheDocument()
    expect(within(screen.getByTestId('hero-pillar-control')).getByText(/Deny by default/)).toBeInTheDocument()
    expect(within(screen.getByTestId('hero-pillar-observe')).getByText('Audit logs')).toBeInTheDocument()
    expect(screen.queryByText(/two switches/)).not.toBeInTheDocument()
    // One "Turn on AI" button, on the Next row; none in the hero.
    expect(screen.getAllByRole('button', { name: 'Turn on AI' })).toHaveLength(1)
    expect(within(screen.getByTestId('setup-step-ai')).getByRole('button', { name: 'Turn on AI' })).toBeInTheDocument()
    expect(within(intro).queryByRole('button')).not.toBeInTheDocument()
    expect(stepState('ai')).toBe('next')
    expect(screen.queryByTestId('week-kpis')).not.toBeInTheDocument()
  })

  it('turns on AI features and the Copilot in one action, then leads to connecting an agent', async () => {
    useScenario('agent-experience-empty')
    const { userEvent } = renderWithProviders(<AgentExperienceOverview />)
    const aiStep = await screen.findByTestId('setup-step-ai')

    await userEvent.click(within(aiStep).getByRole('button', { name: 'Turn on AI' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(
      await within(dialog).findByRole('checkbox', { name: 'I have read and accept the Copilot Terms of Service' })
    )
    await userEvent.click(within(dialog).getByTestId('submit-button'))

    await waitFor(() => expect(stepState('ai')).toBe('done'))
    expect(stepState('connect')).toBe('next')
    expect(within(screen.getByTestId('setup-step-connect')).getByText('Connect your agent')).toBeInTheDocument()
  })

  it('keeps AI features on when the Copilot step fails, and Retry only turns on the Copilot', async () => {
    useScenario('agent-experience-copilot-error')
    const { userEvent } = renderWithProviders(<AgentExperienceOverview />)
    const aiStep = await screen.findByTestId('setup-step-ai')

    await userEvent.click(within(aiStep).getByRole('button', { name: 'Turn on AI' }))
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
    await waitFor(() => expect(stepState('ai')).toBe('done'))
  })

  it('highlights the next step when partly set up', async () => {
    useScenario('agent-experience-partial')
    renderWithProviders(<AgentExperienceOverview />)

    // The Copilot state arrives after the first render.
    await waitFor(() => expect(screen.getByTestId('setup-progress')).toHaveTextContent('2 of 4 done'))
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
    useScenario('agent-experience-empty')
    renderWithProviders(<AgentExperienceCopilot />)

    expect(await screen.findByRole('heading', { name: 'Turn on AI' })).toBeInTheDocument()
    expect(within(screen.getByTestId('copilot-state')).getByText('Off')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Turn on AI' })).toBeInTheDocument()
  })

  it('shows members the state only, with no switch', async () => {
    useScenario('member')
    renderWithProviders(<AgentExperienceCopilot />)

    expect(await screen.findByTestId('copilot-member-note')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Turn on AI' })).not.toBeInTheDocument()
    expect(screen.queryByText('Opt-in to Copilot')).not.toBeInTheDocument()
  })
})

describe('AgentExperienceAutomate', () => {
  it('lists the jobs as compact cards, safest first, with no actions in the list', () => {
    useScenario('agent-experience-active')
    renderWithProviders(<AgentExperienceAutomate />)

    const ladder = within(screen.getByTestId('agent-job-ladder'))
    expect(ladder.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual([
      'Investigate',
      'Hygiene',
      'Cost',
      'Reliability',
      'Change',
    ])
    expect(ladder.getAllByRole('button', { name: /: view details/ })).toHaveLength(9)
    expect(ladder.queryByText('It can never')).not.toBeInTheDocument()
    expect(ladder.queryByRole('button', { name: /Create policy token|Copy prompt/ })).not.toBeInTheDocument()
    expect(screen.getByText('Incident Analyzer with incident.io')).toBeInTheDocument()
    expect(screen.getByTestId('policy-token-skill-line')).toHaveTextContent(
      'qovery-policy-token skill writes and tests'
    )
  })

  it('filters the jobs with the search', async () => {
    useScenario('agent-experience-active')
    const { userEvent } = renderWithProviders(<AgentExperienceAutomate />)

    await userEvent.type(screen.getByRole('textbox', { name: 'Search jobs' }), 'preview')
    const cards = within(screen.getByTestId('agent-job-ladder')).getAllByRole('button', { name: /: view details/ })
    expect(cards.map((card) => card.getAttribute('data-testid'))).toEqual([
      'agent-job-fix-in-preview-environment',
      'agent-job-clean-up-preview-environments',
    ])
  })

  it('opens the details in a side sheet, with what it can never do, the prompt, the policy and the actions', async () => {
    useScenario('agent-experience-active')
    const { userEvent } = renderWithProviders(<AgentExperienceAutomate />)

    await userEvent.click(screen.getByTestId('agent-job-investigate-production-incident'))
    const details = within(await screen.findByRole('dialog'))
    expect(details.getByRole('heading', { name: 'Investigate an incident' })).toBeInTheDocument()
    expect(details.getByText('Level 1 of 5: Investigate')).toBeInTheDocument()
    expect(details.getByText('Deploy, redeploy, restart or stop anything')).toBeInTheDocument()
    expect(details.getByText(/Our production checkout service started failing/)).toBeInTheDocument()
    expect(
      details.getByText(/production_environment_id := "REPLACE_WITH_PRODUCTION_ENVIRONMENT_ID"/)
    ).toBeInTheDocument()
    expect(details.getByRole('link', { name: /Read the example/ })).toHaveAttribute(
      'href',
      'https://www.qovery.com/docs/configuration/organization/policy-examples/investigate-production-incident'
    )
    expect(details.getByRole('button', { name: /Copy prompt/ })).toBeInTheDocument()
    // In the run steps (step 1) and in the footer.
    expect(await details.findAllByRole('button', { name: /Create policy token/ })).toHaveLength(2)
  })

  it('shows members the same list and details, without Create policy token', async () => {
    useScenario('member')
    const { userEvent } = renderWithProviders(<AgentExperienceAutomate />)

    await userEvent.click(screen.getByTestId('agent-job-stop-idle-environments'))
    const details = within(await screen.findByRole('dialog'))
    expect(details.getByRole('button', { name: /Copy prompt/ })).toBeInTheDocument()
    expect(details.queryByRole('button', { name: /Create policy token/ })).not.toBeInTheDocument()
  })
})

describe('Automate, recurring agents', () => {
  it('shows each job’s suggested trigger on its card', () => {
    useScenario('agent-experience-active')
    renderWithProviders(<AgentExperienceAutomate />)

    expect(
      within(screen.getByTestId('agent-job-stop-idle-environments')).getByTestId('agent-job-trigger')
    ).toHaveTextContent('Weekdays at 8 PM and 8 AM')
    expect(
      within(screen.getByTestId('agent-job-investigate-production-incident')).getByTestId('agent-job-trigger')
    ).toHaveTextContent('When an incident fires')
  })

  it('leads the details with running the job on its own: token first, then a scheduler', async () => {
    useScenario('agent-experience-active')
    const { userEvent } = renderWithProviders(<AgentExperienceAutomate />)

    await userEvent.click(screen.getByTestId('agent-job-stop-idle-environments'))
    const run = within(await screen.findByTestId('agent-job-run'))
    expect(run.getByText('Create its policy token.')).toBeInTheDocument()
    expect(await run.findByRole('button', { name: /Create policy token/ })).toBeInTheDocument()
    // First and recommended: the coding agent the team already uses, with the supported agents' logos.
    const codingAgent = within(run.getByTestId('route-coding-agent'))
    expect(codingAgent.getByText('From your coding agent')).toBeInTheDocument()
    expect(codingAgent.queryByText('Recommended')).not.toBeInTheDocument()
    expect(codingAgent.getAllByTestId('coding-agent').map((item) => item.textContent)).toEqual([
      'Claude Code',
      'Codex',
      'Cursor',
      'OpenCode',
      'Gemini CLI',
      'VS Code Copilot',
    ])
    expect(codingAgent.getByText('QOVERY_CLI_ACCESS_TOKEN=<policy token>')).toBeInTheDocument()
    expect(codingAgent.getByText('Authorization: Token <policy token>')).toBeInTheDocument()
    expect(codingAgent.getByText('0 8,20 * * 1-5')).toBeInTheDocument()
    // Then the Agent Task on Qovery.
    const agentTask = within(run.getByTestId('route-agent-task'))
    expect(agentTask.getByText('As an Agent Task on Qovery')).toBeInTheDocument()
    expect(agentTask.getByText('Recommended')).toBeInTheDocument()
    expect(agentTask.getByText(/with no laptop or CI to keep running/)).toBeInTheDocument()
    expect(agentTask.getByText('https://mcp.qovery.com/mcp')).toBeInTheDocument()
    expect(run.getByTestId('route-coding-agent').compareDocumentPosition(run.getByTestId('route-agent-task'))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
  })

  it('points webhook jobs to the Agent Task’s webhook, and tells members who creates the token', async () => {
    useScenario('member')
    const { userEvent } = renderWithProviders(<AgentExperienceAutomate />)

    await userEvent.click(screen.getByTestId('agent-job-roll-back-bad-release'))
    const run = within(await screen.findByTestId('agent-job-run'))
    expect(run.getByText(/From a webhook: use the URL the Agent Task gets/)).toBeInTheDocument()
    expect(run.getByText('An organization owner or admin creates it.')).toBeInTheDocument()
    expect(run.queryByRole('button', { name: /Create policy token/ })).not.toBeInTheDocument()
  })
})

describe('Automate a new job', () => {
  it('turns an intent into a qovery-policy-token command, from the Automate header', async () => {
    useScenario('agent-experience-active')
    const { userEvent } = renderWithProviders(<AgentExperienceAutomate />)

    await userEvent.click(screen.getByRole('button', { name: 'Automate a new job' }))
    const modal = within(await screen.findByTestId('new-job-modal'))
    expect(modal.getByTestId('new-job-command')).toHaveTextContent('/qovery-policy-token <describe the job>')
    expect(screen.getByTestId('submit-button')).toBeDisabled()

    await userEvent.click(modal.getByRole('button', { name: /stop dev and QA environments/ }))
    expect(modal.getByTestId('new-job-command')).toHaveTextContent(
      '/qovery-policy-token Every weeknight at 8 PM, stop dev and QA environments nobody used today'
    )
    expect(screen.getByTestId('submit-button')).toBeEnabled()
    expect(modal.getByText(/refuses everything by default/)).toBeInTheDocument()
    expect(modal.getAllByTestId('coding-agent')).toHaveLength(6)
    expect(modal.getByText(/Works in these coding agents/)).toBeInTheDocument()
    expect(modal.getByTestId('new-job-schedule')).toHaveTextContent(
      'Then schedule it: as an Agent Task on Qovery (recommended), or from your coding agent, with that token.'
    )
    expect(modal.queryByTestId('new-job-member-note')).not.toBeInTheDocument()
  })

  it('puts a typed intent on one line', async () => {
    useScenario('agent-experience-active')
    const { userEvent } = renderWithProviders(<AgentExperienceAutomate />)

    await userEvent.click(screen.getByRole('button', { name: 'Automate a new job' }))
    await userEvent.type(screen.getByTestId('new-job-intent'), 'Scale the api{enter}before Black Friday')
    expect(screen.getByTestId('new-job-command')).toHaveTextContent(
      '/qovery-policy-token Scale the api before Black Friday'
    )
  })

  it('tells members an owner or admin must create the token', async () => {
    useScenario('member')
    const { userEvent } = renderWithProviders(<AgentExperienceAutomate />)

    await userEvent.click(screen.getByRole('button', { name: 'Automate a new job' }))
    expect(await screen.findByTestId('new-job-member-note')).toHaveTextContent(
      'Creating the token needs an organization owner or admin'
    )
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
  it('shows each token’s last 7 days, links to its activity, and the deleted tokens with history', async () => {
    useScenario('agent-experience-active')
    renderWithProviders(<AgentExperiencePolicyTokens />)

    const ciDeployer = await screen.findByTestId('policy-token-ci-deployer')
    expect(await within(ciDeployer).findByTestId('token-usage')).toHaveTextContent(/\d+ allowed/)
    expect(within(ciDeployer).getByText('See activity')).toBeInTheDocument()
    expect(await screen.findByTestId('deleted-tokens')).toHaveTextContent('cleanup-bot')
  })

  it('lists the organization’s tokens with their role, last use and expiry', async () => {
    useScenario('agent-experience-active')
    renderWithProviders(<AgentExperiencePolicyTokens />)

    expect(
      screen.getByText('Give each agent a token that can only do what its policy allows. A denied call never runs.')
    ).toBeInTheDocument()
    expect(await screen.findByText('ci-deployer')).toBeInTheDocument()
    expect(screen.getByText('review-agent')).toBeInTheDocument()
    expect(screen.getAllByText('Create policy token').length).toBeGreaterThan(0)
  })

  it('explains an empty list', async () => {
    useScenario('agent-experience-empty')
    renderWithProviders(<AgentExperiencePolicyTokens />)
    expect(await screen.findByText('No policy token yet')).toBeInTheDocument()
  })

  it('tells members only owners and admins manage tokens', async () => {
    useScenario('member')
    renderWithProviders(<AgentExperiencePolicyTokens />)
    expect(await screen.findByText('Only owners and admins manage policy tokens')).toBeInTheDocument()
    expect(screen.queryByText('Create policy token')).not.toBeInTheDocument()
  })
})

describe('AgentExperienceNav', () => {
  it('shows policy tokens to admins only', async () => {
    useScenario('agent-experience-active')
    const { unmount } = renderWithProviders(<AgentExperienceNav />)
    expect(await screen.findByText('Policy tokens')).toBeInTheDocument()
    expect(screen.getByText('Copilot')).toBeInTheDocument()
    unmount()

    useScenario('member')
    renderWithProviders(<AgentExperienceNav />)
    expect(await screen.findByText('Activity')).toBeInTheDocument()
    expect(screen.queryByText('Policy tokens')).not.toBeInTheDocument()
  })
})

describe('AgentExperienceConnect', () => {
  it('gives a command to copy for the skills, the CLI and the MCP server', () => {
    useScenario('agent-experience-active')
    renderWithProviders(<AgentExperienceConnect />)
    expect(screen.getByText('curl -fsSL https://skill.qovery.com/install.sh | bash')).toBeInTheDocument()
    expect(screen.getByText('curl -s https://get.qovery.com | bash')).toBeInTheDocument()
    expect(screen.getByText(/claude mcp add --transport http qovery/)).toBeInTheDocument()
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
