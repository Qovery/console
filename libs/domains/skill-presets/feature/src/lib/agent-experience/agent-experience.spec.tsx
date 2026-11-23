import { useLocation, useParams } from '@tanstack/react-router'
import { configure } from '@testing-library/react'
import axios from 'axios'
import { type ReactNode } from 'react'
import { buildSkillPresetApiError, skillPresetsApi } from '@qovery/domains/skill-presets/data-access'
import {
  type SkillPresetsMockScenario,
  installSkillPresetsMock,
  resetSkillPresetsMock,
} from '@qovery/domains/skill-presets/mock'
import { devopsCopilotAxios } from '@qovery/shared/devops-copilot/data-access'
import { renderWithProviders, screen, waitFor, within } from '@qovery/shared/util-tests'
import { AgentsSetupSection } from '../agents-setup/agents-setup-section'
import * as useAgentActivityModule from '../hooks/use-agent-activity/use-agent-activity'
import * as useCanManageSkillPresetsModule from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import * as copilotStatus from '../hooks/use-copilot-status/use-copilot-status'
import * as skillPresetAssignees from '../hooks/use-skill-preset-assignees/use-skill-preset-assignees'
import { AgentExperienceAutomate } from './agent-experience-automate'
import { AgentExperienceCopilot, OnOffBadge, aiStatusLabel, copilotStateLabel } from './agent-experience-copilot'
import { AgentExperienceNav } from './agent-experience-nav'
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

// One copy function for the whole file, to check what reaches the clipboard.
const mockCopyToClipboard = jest.fn()
jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useCopyToClipboard: () => [null, mockCopyToClipboard],
}))

// The pages run against the in-memory mock API with its latency: shared CI runners need longer waits.
configure({ asyncUtilTimeout: 5000 })

jest.mock('posthog-js/react', () => ({
  ...jest.requireActual('posthog-js/react'),
  useFeatureFlagEnabled: () => true,
}))

const useScenario = (scenario: SkillPresetsMockScenario) => {
  window.sessionStorage.setItem('qovery-mock-skill-presets', scenario)
  resetSkillPresetsMock()
}

const stepState = (id: string) => screen.getByTestId(`setup-step-${id}`).getAttribute('data-state')

let uninstallMocks: Array<() => void> = []
beforeAll(() => {
  uninstallMocks = [
    installSkillPresetsMock(axios, 'api', { passthrough: false }),
    installSkillPresetsMock(devopsCopilotAxios, 'copilot', { passthrough: false }),
  ]
})
afterAll(() => uninstallMocks.forEach((uninstall) => uninstall()))

beforeEach(() => {
  window.sessionStorage.clear()
  window.localStorage.clear()
  resetSkillPresetsMock()
  jest.mocked(useParams).mockReturnValue({ organizationId: 'organization-1' })
  jest.mocked(useLocation).mockReturnValue({ pathname: '/organization/organization-1/agent-experience' } as never)
})

describe('AgentsSetupSection', () => {
  it('lists the three steps in order the first time, with the preset step next', async () => {
    useScenario('agent-experience-empty')
    renderWithProviders(<AgentsSetupSection />)

    expect(await screen.findByTestId('agents-setup-progress')).toHaveTextContent('0 of 3 done')
    expect(
      within(screen.getByTestId('agents-setup-steps'))
        .getAllByRole('listitem')
        .map((item) => item.dataset.testid)
    ).toEqual(['agents-setup-step-preset', 'agents-setup-step-policy-token', 'agents-setup-step-connect'])
    expect(screen.getByTestId('agents-setup-step-preset')).toHaveAttribute('data-state', 'next')
    expect(screen.getByText('Create a preset in the Skills registry')).toBeInTheDocument()
    // New organizations have AI features on.
    expect(screen.queryByTestId('agents-setup-ai-off')).not.toBeInTheDocument()
  })

  it('opens the Connect an agent popup from its step', async () => {
    useScenario('agent-experience-empty')
    const { userEvent } = renderWithProviders(<AgentsSetupSection />)
    const step = await screen.findByTestId('agents-setup-step-connect')
    await userEvent.click(within(step).getByRole('button', { name: 'Connect an agent' }))
    expect(await screen.findByText('curl -fsSL https://skill.qovery.com/install.sh | bash')).toBeInTheDocument()
  })

  it('marks the connect step done only from what we have seen, and says so', async () => {
    useScenario('agent-experience-partial')
    renderWithProviders(<AgentsSetupSection />)
    const step = await screen.findByTestId('agents-setup-step-connect')
    expect(step).toHaveAttribute('data-state', 'done')
    expect(step).toHaveTextContent('We’ve seen agent activity in the last 30 days.')
  })

  it('offers Turn on AI when AI features are off, and keeps AI on when the Copilot step fails', async () => {
    useScenario('agent-experience-copilot-error')
    const { userEvent } = renderWithProviders(<AgentsSetupSection />)
    const notice = await screen.findByTestId('agents-setup-ai-off')

    await userEvent.click(within(notice).getByRole('button', { name: 'Turn on AI' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(
      await within(dialog).findByRole('checkbox', { name: 'I have read and accept the Copilot Terms of Service' })
    )
    // Submitting waits for the Copilot status, so an enabled Copilot is never reset to read-only.
    await waitFor(() => expect(within(dialog).getByTestId('submit-button')).toBeEnabled())
    await userEvent.click(within(dialog).getByTestId('submit-button'))

    expect(
      await within(dialog).findByText('AI features are on, but the Copilot could not be turned on')
    ).toBeInTheDocument()
    expect(within(dialog).getByTestId('submit-button')).toHaveTextContent('Retry')
    await userEvent.click(within(dialog).getByTestId('submit-button'))
    await waitFor(() => expect(screen.queryByTestId('agents-setup-ai-off')).not.toBeInTheDocument())
  })

  it('goes away once everything is set up', async () => {
    useScenario('agent-experience-active')
    renderWithProviders(<AgentsSetupSection />)
    await waitFor(() => expect(screen.queryByTestId('agents-setup')).not.toBeInTheDocument())
  })

  it('stays away from members', async () => {
    useScenario('member')
    renderWithProviders(<AgentsSetupSection />)
    await waitFor(() => expect(screen.queryByTestId('agents-setup')).not.toBeInTheDocument())
  })

  it('can be dismissed for good', async () => {
    useScenario('agent-experience-empty')
    const { userEvent, unmount } = renderWithProviders(<AgentsSetupSection />)
    await userEvent.click(await screen.findByRole('button', { name: 'Dismiss agents setup' }))
    expect(screen.queryByTestId('agents-setup')).not.toBeInTheDocument()
    unmount()
    renderWithProviders(<AgentsSetupSection />)
    expect(screen.queryByTestId('agents-setup')).not.toBeInTheDocument()
  })
})

describe('AgentExperienceCopilot', () => {
  it('shows one combined status and the Copilot settings to admins', async () => {
    useScenario('agent-experience-active')
    renderWithProviders(<AgentExperienceCopilot />)

    // The capabilities live in the docs, behind the header's help button.
    expect(screen.queryByRole('heading', { name: 'What the Copilot does' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Need help here?' })).toBeInTheDocument()
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
    expect(codingAgent.getByText('0 8,20 * * *')).toBeInTheDocument()
    // The prompt is written in Paris time: the cron says so.
    expect(codingAgent.getByText('Schedule (Europe/Paris):')).toBeInTheDocument()
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

  it('reads the members and roles only for members, not for owners and admins', async () => {
    useScenario('agent-experience-active')
    const spy = jest.spyOn(skillPresetAssignees, 'useSkillPresetAssignees')
    const { userEvent } = renderWithProviders(<AgentExperienceAutomate />)

    await userEvent.click(screen.getByTestId('agent-job-roll-back-bad-release'))
    expect(await screen.findByTestId('agent-job-run')).toBeInTheDocument()
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('shows members the catalog, with no action they cannot take, and who to ask', async () => {
    useScenario('member')
    const { userEvent } = renderWithProviders(<AgentExperienceAutomate />)

    expect(screen.queryByRole('button', { name: /Automate a new job/ })).not.toBeInTheDocument()
    await userEvent.click(screen.getByTestId('agent-job-roll-back-bad-release'))
    const details = within(await screen.findByRole('dialog'))
    expect(details.queryByRole('button', { name: /Create policy token/ })).not.toBeInTheDocument()
    expect(details.queryByRole('button', { name: 'Describe it' })).not.toBeInTheDocument()
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
    // The title says it prepares a command, and the docs sit next to the description.
    expect(screen.getByRole('heading', { name: 'Prepare a command for your agent' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Docs/ })).toHaveAttribute(
      'href',
      'https://www.qovery.com/docs/configuration/organization/api-policy-token'
    )
    // Empty to start with: the examples are offered, not filled in.
    expect(screen.getByRole('textbox', { name: 'The job' })).toHaveValue('')
    expect(modal.getByTestId('new-job-command')).toHaveTextContent('/qovery-policy-token <describe the job>')
    expect(screen.getByTestId('submit-button')).toBeDisabled()
    expect(modal.getByText('Or click an example to fill the field:')).toBeInTheDocument()

    await userEvent.click(modal.getByRole('button', { name: /stop dev and QA environments/ }))
    expect(screen.getByRole('textbox', { name: 'The job' })).toHaveValue(
      'Every weeknight at 8 PM, stop dev and QA environments nobody used today'
    )
    expect(modal.getByTestId('new-job-command')).toHaveTextContent(
      '/qovery-policy-token Every weeknight at 8 PM, stop dev and QA environments nobody used today'
    )
    expect(screen.getByTestId('submit-button')).toBeEnabled()
    expect(modal.getAllByTestId('coding-agent')).toHaveLength(6)
    // Scheduling is its own visible step, not folded away.
    expect(modal.getByRole('heading', { name: '1. Run this command in your coding agent' })).toBeInTheDocument()
    expect(modal.getByRole('heading', { name: '2. Schedule the job' })).toBeInTheDocument()
    expect(modal.getByTestId('new-job-schedule')).toHaveTextContent(
      'A separate step, once the token exists: schedule the job as an Agent Task on Qovery (recommended), or from your coding agent, with that token.'
    )
    // What the skill does is folded until asked for.
    expect(modal.queryByText(/refuses everything by default/)).not.toBeInTheDocument()
    await userEvent.click(modal.getByRole('button', { name: 'What your agent does with it' }))
    expect(await modal.findByText(/refuses everything by default/)).toBeInTheDocument()
  })

  it('offers the examples only while the field is empty, so they never replace typed text', async () => {
    useScenario('agent-experience-active')
    const { userEvent } = renderWithProviders(<AgentExperienceAutomate />)

    await userEvent.click(await screen.findByRole('button', { name: /Automate a new job/ }))
    expect(screen.getByTestId('new-job-examples')).toBeInTheDocument()
    await userEvent.type(screen.getByTestId('new-job-intent'), 'Restart the api')
    expect(screen.queryByTestId('new-job-examples')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /stop dev and QA environments/ })).not.toBeInTheDocument()

    await userEvent.clear(screen.getByRole('textbox', { name: 'The job' }))
    expect(screen.getByTestId('new-job-examples')).toBeInTheDocument()
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

    expect(mockCopyToClipboard).toHaveBeenCalledWith('/qovery-policy-token Restart the api when it stops answering')
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Copied')
    expect(screen.getByTestId('new-job-modal')).toBeInTheDocument()
  })

  it('shows Connect your agent in place, and keeps the typed job on the way back', async () => {
    useScenario('agent-experience-active')
    const { userEvent } = renderWithProviders(<AgentExperienceAutomate />)

    await userEvent.click(await screen.findByRole('button', { name: /Automate a new job/ }))
    await userEvent.type(screen.getByRole('textbox', { name: 'The job' }), 'Restart the api')
    await userEvent.click(screen.getByRole('button', { name: 'Connect your agent' }))
    expect(await screen.findByRole('heading', { name: 'Connect an agent' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(await screen.findByRole('textbox', { name: 'The job' })).toHaveValue('Restart the api')
  })

  it('opens from a job’s details', async () => {
    useScenario('agent-experience-active')
    const { userEvent } = renderWithProviders(<AgentExperienceAutomate />)

    await userEvent.click(screen.getByTestId('agent-job-stop-idle-environments'))
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Describe it' }))
    expect(await screen.findByTestId('new-job-modal')).toBeInTheDocument()
  })
})

afterEach(() => jest.restoreAllMocks())

describe('AgentExperiencePolicyTokens', () => {
  it('shows each token’s last 7 days, flags tokens with no expiry, and keeps deleted tokens as greyed rows', async () => {
    useScenario('agent-experience-active')
    renderWithProviders(<AgentExperiencePolicyTokens />)

    const ciDeployer = await screen.findByTestId('policy-token-ci-deployer')
    expect(screen.getByRole('columnheader', { name: 'Last 7 days' })).toBeInTheDocument()
    const usage = await within(ciDeployer).findByTestId('token-usage')
    expect(usage).toHaveTextContent(/\d+ allowed/)
    // One bar per day of the week.
    expect(usage.querySelectorAll('[aria-hidden="true"] > span').length).toBeGreaterThanOrEqual(7)
    expect(within(ciDeployer).queryByTestId('no-expiry')).not.toBeInTheDocument()
    expect(within(screen.getByTestId('policy-token-review-agent')).getByTestId('no-expiry')).toHaveTextContent(
      'No expiry'
    )
    const deleted = await screen.findByTestId('deleted-token-cleanup-bot')
    expect(within(deleted).getByText('Deleted', { selector: 'span' })).toBeInTheDocument()
    expect(within(deleted).getByText('See activity')).toBeInTheDocument()
    expect(within(deleted).queryByText('Calls in the last 30 days')).not.toBeInTheDocument()
    expect(deleted).toHaveTextContent(/No calls|\d+ allowed/)
  })

  it('never reads a failed usage request as no calls', async () => {
    useScenario('agent-experience-active')
    jest
      .spyOn(useAgentActivityModule, 'useAgentActivity')
      .mockReturnValue({ data: undefined, isInitialLoading: false, isError: true } as never)
    renderWithProviders(<AgentExperiencePolicyTokens />)

    const ciDeployer = await screen.findByTestId('policy-token-ci-deployer')
    expect(within(ciDeployer).getByText('Usage unavailable')).toBeInTheDocument()
    expect(screen.queryByText('No calls')).not.toBeInTheDocument()
    expect(screen.getByTestId('deleted-tokens-error')).toHaveTextContent('Deleted tokens could not be loaded.')
  })

  it('does not show no calls while the usage loads', async () => {
    useScenario('agent-experience-active')
    jest
      .spyOn(useAgentActivityModule, 'useAgentActivity')
      .mockReturnValue({ data: undefined, isInitialLoading: true, isError: false } as never)
    renderWithProviders(<AgentExperiencePolicyTokens />)

    expect(await screen.findByTestId('policy-token-ci-deployer')).toBeInTheDocument()
    expect(screen.queryByText('No calls')).not.toBeInTheDocument()
    expect(screen.queryByText('No policy token yet')).not.toBeInTheDocument()
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

  it('keeps the deleted-token history once the last active token is deleted', async () => {
    useScenario('agent-experience-active')
    const { userEvent } = renderWithProviders(<AgentExperiencePolicyTokens />)
    expect(await screen.findByTestId('deleted-token-cleanup-bot')).toBeInTheDocument()

    for (const name of ['ci-deployer', 'review-agent']) {
      await userEvent.click(await screen.findByRole('button', { name: `Actions for ${name}` }))
      await userEvent.click(await screen.findByRole('menuitem', { name: 'Delete token' }))
      await userEvent.type(await screen.findByRole('textbox'), name)
      await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))
      await waitFor(() => expect(screen.queryByTestId(`policy-token-${name}`)).not.toBeInTheDocument())
    }

    expect(screen.getByTestId('deleted-token-cleanup-bot')).toBeInTheDocument()
    expect(screen.queryByText('No policy token yet')).not.toBeInTheDocument()
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
    // The header action and the empty-state action.
    expect(screen.getAllByRole('button', { name: /Create policy token/ })).toHaveLength(2)
    expect(screen.getByText('Start from a job')).toBeInTheDocument()
  })

  it('tells other members who manages tokens', async () => {
    useScenario('member')
    renderWithProviders(<AgentExperiencePolicyTokens />)
    expect(await screen.findByText('Only owners, admins and DevOps members manage policy tokens')).toBeInTheDocument()
    expect(screen.queryByText('Create policy token')).not.toBeInTheDocument()
  })

  it('lets DevOps members manage tokens, without the organization activity', async () => {
    // A DevOps member: the mock organization's tokens, but no organization-wide activity.
    useScenario('agent-experience-active')
    jest.spyOn(useCanManageSkillPresetsModule, 'useCanManageSkillPresets').mockReturnValue({
      canManage: false,
      isLoading: false,
    })
    const { userEvent } = renderWithProviders(<AgentExperiencePolicyTokens />)

    expect(await screen.findByTestId('policy-token-ci-deployer')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create policy token/ })).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Last 7 days' })).not.toBeInTheDocument()
    expect(screen.queryByTestId('token-usage')).not.toBeInTheDocument()
    expect(screen.queryByTestId('deleted-token-cleanup-bot')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Actions for ci-deployer' }))
    expect(await screen.findByRole('menuitem', { name: 'View policy' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Delete token' })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'See activity' })).not.toBeInTheDocument()
  })
})

describe('AgentExperienceNav', () => {
  it('has three entries, then Settings with policy tokens, for admins only', async () => {
    useScenario('agent-experience-active')
    const { userEvent, unmount } = renderWithProviders(<AgentExperienceNav />)
    expect(await screen.findByText('Settings')).toBeInTheDocument()
    for (const label of ['Skills registry', 'Automate', 'Activity']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
    // Connect is a popup, not a menu entry, and there is no Agents overview. Policy tokens sit in Settings.
    expect(screen.queryByText('Connect')).not.toBeInTheDocument()
    expect(screen.queryByText('Overview')).not.toBeInTheDocument()
    expect(screen.queryByText('Policy tokens')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Settings' }))
    const settings = within(
      screen.getByText('Policy tokens').closest('[data-testid=sidebar-group-content]') as HTMLElement
    )
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
