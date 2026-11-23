import { useLocation, useParams } from '@tanstack/react-router'
import { configure } from '@testing-library/react'
import { type ReactNode } from 'react'
import { type SkillPresetsMockScenario, resetSkillPresetsMockApi } from '@qovery/domains/skill-presets/data-access'
import { renderWithProviders, screen, waitFor, within } from '@qovery/shared/util-tests'
import * as copilotStatus from '../hooks/use-copilot-status/use-copilot-status'
import { AgentExperienceAutomate } from './agent-experience-automate'
import { AgentExperienceCopilot, OnOffBadge, aiStatusLabel, copilotStateLabel } from './agent-experience-copilot'
import { AgentExperiencePolicyTokens } from './agent-experience-policy-tokens'
import { ConnectAgentModal } from './connect-agent-modal'

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

// The pages run against the in-memory mock API with its latency: shared CI runners need longer waits.
configure({ asyncUtilTimeout: 5000 })

jest.mock('posthog-js/react', () => ({
  ...jest.requireActual('posthog-js/react'),
  useFeatureFlagEnabled: () => true,
}))

const useScenario = (scenario: SkillPresetsMockScenario) => {
  window.sessionStorage.setItem('qovery-mock-skill-presets', scenario)
  resetSkillPresetsMockApi()
}

beforeEach(() => {
  window.sessionStorage.clear()
  window.localStorage.clear()
  resetSkillPresetsMockApi()
  jest.mocked(useParams).mockReturnValue({ organizationId: 'organization-1' })
  jest.mocked(useLocation).mockReturnValue({ pathname: '/organization/organization-1/agent-experience' } as never)
})

describe('AgentExperienceCopilot', () => {
  it('shows one combined status and the Copilot settings to admins', async () => {
    useScenario('agent-experience-active')
    renderWithProviders(<AgentExperienceCopilot />)

    expect(screen.getByRole('heading', { name: 'What the Copilot does' })).toBeInTheDocument()
    expect(screen.getByText('Preview')).toBeInTheDocument()
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

  it('names a partial state on the off badge', () => {
    renderWithProviders(<OnOffBadge on={false} label={aiStatusLabel(true, false, true)} />)
    expect(screen.getByText('AI features on, Copilot off')).toBeInTheDocument()
  })

  it('says the status is unknown and offers no switch when the Copilot config fails to load', async () => {
    useScenario('ai-features-off')
    const spy = jest.spyOn(copilotStatus, 'useCopilotStatus').mockReturnValue({
      ready: true,
      enabled: false,
      readOnly: true,
      isLoading: false,
      error: new Error('Network Error'),
    } as ReturnType<typeof copilotStatus.useCopilotStatus>)
    renderWithProviders(<AgentExperienceCopilot />)

    expect(await screen.findByTestId('copilot-error')).toHaveTextContent('Unable to load the Copilot status.')
    expect(within(screen.getByTestId('copilot-state')).getByText('Unknown')).toBeInTheDocument()
    expect(within(screen.getByTestId('copilot-state')).queryByText('Off')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Turn on AI' })).not.toBeInTheDocument()
    spy.mockRestore()
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

describe('ConnectAgentModal', () => {
  it('gives the commands to copy for the skills, the CLI and the MCP server, in tabs', async () => {
    useScenario('agent-experience-active')
    const { userEvent } = renderWithProviders(<ConnectAgentModal onClose={jest.fn()} />)
    expect(screen.getByRole('heading', { name: 'Connect an agent' })).toBeInTheDocument()
    expect(screen.getByText('curl -fsSL https://skill.qovery.com/install.sh | bash')).toBeInTheDocument()
    expect(
      within(screen.getByRole('group', { name: 'Copy the skills install command' })).getByRole('button', {
        name: 'Copy',
      })
    ).toBeInTheDocument()

    await userEvent.click(screen.getByText('CLI'))
    expect(screen.getByText('curl -fsSL https://get.qovery.com | bash')).toBeInTheDocument()
    expect(screen.getByText('qovery auth')).toBeInTheDocument()

    await userEvent.click(screen.getByText('MCP server'))
    expect(screen.getByText(/claude mcp add --transport http qovery/)).toBeInTheDocument()

    // A top-level TOML key below a [section] header would belong to that section and be ignored.
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Coding agent' }), 'codex')
    expect(
      screen.getByText('Add this line at the top of ~/.codex/config.toml, above any [section]')
    ).toBeInTheDocument()
  })

  it('closes on Close', async () => {
    const onClose = jest.fn()
    const { userEvent } = renderWithProviders(<ConnectAgentModal onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
  })
})
