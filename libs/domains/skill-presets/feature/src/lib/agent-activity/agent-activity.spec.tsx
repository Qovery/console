import { useParams } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import {
  type SkillPresetsMockScenario,
  buildSkillPresetApiError,
  resetSkillPresetsMockApi,
  skillPresetsApi,
} from '@qovery/domains/skill-presets/data-access'
import { renderWithProviders, screen, waitFor, within } from '@qovery/shared/util-tests'
import { AgentActivity } from './agent-activity'

// The page goes through the real hooks and the in-browser mock API.
jest.mock('@qovery/shared/util-node-env', () => ({
  ...jest.requireActual('@qovery/shared/util-node-env'),
  SKILL_PRESETS_MOCK: 'true',
}))
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: jest.fn(),
  Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}))

const useScenario = (scenario: SkillPresetsMockScenario) => {
  window.sessionStorage.setItem('qovery-mock-skill-presets', scenario)
  resetSkillPresetsMockApi()
}

beforeEach(() => {
  window.sessionStorage.clear()
  resetSkillPresetsMockApi()
  jest.mocked(useParams).mockReturnValue({ organizationId: 'organization-1' })
})

afterEach(() => jest.restoreAllMocks())

describe('AgentActivity', () => {
  it('shows a loading state first', () => {
    useScenario('agent-activity')
    renderWithProviders(<AgentActivity />)
    expect(screen.getByLabelText('Loading agent activity')).toBeInTheDocument()
  })

  it('answers what agents did, which skills led to it, who, and what was blocked', async () => {
    useScenario('agent-activity')
    renderWithProviders(<AgentActivity />)

    expect(await screen.findByRole('heading', { name: 'Skills and what followed' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Agent activity', level: 1 })).toBeInTheDocument()
    expect(screen.getByTestId('coverage-note')).toHaveTextContent(
      'such as in a shell, in git or in a cloud console, is not. Prompts and code are never collected.'
    )
    expect(screen.getByTestId('coverage-sources')).toHaveTextContent(
      'Sources: skill loads, API calls from skills, MCP tool calls, refused requests.'
    )
    expect(
      screen.getByText(
        'Actions are matched to people by username and to skills by the agent’s user agent; treat them as indicative.'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Allowed actions')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'No skill (MCP or API)' })).toBeInTheDocument()
    expect(screen.getByText('Deploy (service)')).toBeInTheDocument()
    expect(screen.getByTestId('never-loaded')).toHaveTextContent('Consider turning them off in the preset')
    expect(screen.getByRole('heading', { name: 'By member' })).toBeInTheDocument()
    expect(within(screen.getByTestId('denied-actions')).getAllByText(/payments-production/).length).toBeGreaterThan(0)
    const suggestions = screen.getByTestId('activity-suggestions')
    expect(within(suggestions).getByText(/actions were denied in/)).toBeInTheDocument()
    expect(within(suggestions).getAllByRole('link', { name: 'Review policy tokens' }).length).toBeGreaterThan(0)
    expect(screen.getAllByText('MCP').length).toBeGreaterThan(0)
  })

  it('names a policy token, without letting it be drilled into', async () => {
    useScenario('agent-activity')
    renderWithProviders(<AgentActivity />)
    const members = (await screen.findByRole('heading', { name: 'By member' })).parentElement as HTMLElement

    expect(within(members).getByText('Policy token ci-deployer')).toBeInTheDocument()
    expect(within(members).queryByRole('button', { name: /ci-deployer/ })).not.toBeInTheDocument()
    expect(within(screen.getByTestId('activity-suggestions')).getByText(/had 3 actions denied/)).toBeInTheDocument()
  })

  it('drills into one member from the table', async () => {
    useScenario('agent-activity')
    const { userEvent } = renderWithProviders(<AgentActivity />)
    const members = (await screen.findByRole('heading', { name: 'By member' })).parentElement as HTMLElement

    await userEvent.click(within(members).getByRole('button', { name: 'Jordan Kim' }))

    expect(await screen.findByTestId('activity-drill')).toHaveTextContent('Jordan Kim')
    await waitFor(() =>
      expect(
        within(screen.getByRole('heading', { name: 'By member' }).parentElement as HTMLElement).getAllByRole('row')
      ).toHaveLength(2)
    )
    expect(screen.queryByTestId('never-loaded')).not.toBeInTheDocument()
  })

  it('shows a member only their own activity', async () => {
    useScenario('member')
    renderWithProviders(<AgentActivity />)

    expect(await screen.findByRole('heading', { name: 'Your agent activity', level: 1 })).toBeInTheDocument()
    await screen.findByRole('heading', { name: 'Recent actions' })
    expect(screen.queryByRole('heading', { name: 'By member' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Suggestions' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Member')).not.toBeInTheDocument()
    expect(screen.queryByText('Jordan Kim')).not.toBeInTheDocument()
  })

  it('explains an empty period', async () => {
    useScenario('agent-activity-empty')
    renderWithProviders(<AgentActivity />)
    expect(await screen.findByText('No agent activity yet')).toBeInTheDocument()
  })

  it('shows an error with a retry', async () => {
    useScenario('agent-activity')
    jest
      .spyOn(skillPresetsApi, 'getAgentActivity')
      .mockRejectedValue(buildSkillPresetApiError(500, 'Internal server error'))
    renderWithProviders(<AgentActivity />)

    expect(await screen.findByText('Agent activity could not be loaded')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Try again/ })).toBeInTheDocument()
  })
})
