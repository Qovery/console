import { useLocation, useParams } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import { type SkillPresetsMockScenario, resetSkillPresetsMockApi } from '@qovery/domains/skill-presets/data-access'
import { renderWithProviders, screen, within } from '@qovery/shared/util-tests'
import { AgentExperienceConnect } from './agent-experience-connect'
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
  it('shows a setup checklist the first time, with no numbers', async () => {
    useScenario('agent-experience-empty')
    renderWithProviders(<AgentExperienceOverview />)

    expect(await screen.findByTestId('setup-progress')).toHaveTextContent('0 of 5 done')
    expect(screen.getByTestId('agent-experience-state')).toHaveAttribute('data-state', 'empty')
    expect(stepState('connect')).toBe('next')
    expect(stepState('ai-features')).toBe('todo')
    expect(screen.getByRole('button', { name: 'Turn on AI features' })).toBeInTheDocument()
    expect(screen.queryByTestId('week-kpis')).not.toBeInTheDocument()
  })

  it('highlights the next step when partly set up', async () => {
    useScenario('agent-experience-partial')
    renderWithProviders(<AgentExperienceOverview />)

    expect(await screen.findByTestId('setup-progress')).toHaveTextContent('3 of 5 done')
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
    expect(await screen.findByTestId('week-kpis')).toHaveTextContent('Members using agents')
    const tokens = screen.getByRole('heading', { name: 'Policy tokens in use' }).closest('section') as HTMLElement
    expect(within(tokens).getByText('ci-deployer')).toBeInTheDocument()
    expect(screen.getByTestId('overview-denied')).toHaveTextContent('payments-production')
    expect(screen.getByRole('heading', { name: 'Suggestions' })).toBeInTheDocument()
  })

  it('shows a member their own setup, with no admin actions', async () => {
    useScenario('member')
    renderWithProviders(<AgentExperienceOverview />)

    expect(await screen.findByRole('heading', { name: 'Your agent setup', level: 1 })).toBeInTheDocument()
    expect(await screen.findByTestId('preset-summary')).toHaveTextContent('Your agent gets the')
    expect(screen.queryByTestId('setup-steps')).not.toBeInTheDocument()
    expect(screen.queryByText('Members using agents')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Turn on AI features' })).not.toBeInTheDocument()
  })
})

describe('AgentExperiencePolicyTokens', () => {
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
    unmount()

    useScenario('member')
    renderWithProviders(<AgentExperienceNav />)
    expect(await screen.findByText('Agent activity')).toBeInTheDocument()
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
  it('leads to Agent Experience and can be dismissed for good', async () => {
    const { userEvent, unmount } = renderWithProviders(<AgentExperienceEntryCard />)
    expect(screen.getByText('Set up how coding agents work with Qovery')).toBeInTheDocument()
    expect(screen.getByText('Open Agent Experience')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByTestId('agent-experience-entry')).not.toBeInTheDocument()
    expect(window.localStorage.getItem(AGENT_EXPERIENCE_ENTRY_DISMISSED_KEY)).toBe('true')
    unmount()

    renderWithProviders(<AgentExperienceEntryCard />)
    expect(screen.queryByTestId('agent-experience-entry')).not.toBeInTheDocument()
  })
})
