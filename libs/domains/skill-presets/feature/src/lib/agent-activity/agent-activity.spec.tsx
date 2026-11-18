import { useParams } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import {
  type SkillPresetsMockScenario,
  buildSkillPresetApiError,
  resetSkillPresetsMockApi,
  skillPresetsApi,
} from '@qovery/domains/skill-presets/data-access'
import { renderWithProviders, screen, waitFor, within } from '@qovery/shared/util-tests'
import { type ActivitySearch } from './activity-search'
import { AgentActivity } from './agent-activity'

// The page goes through the real hooks and the in-browser mock API.
jest.mock('@qovery/shared/util-node-env', () => ({
  ...jest.requireActual('@qovery/shared/util-node-env'),
  SKILL_PRESETS_MOCK: 'true',
}))

// A small in-memory URL: the filters live in the search params.
const mockUrl = {
  search: {} as ActivitySearch,
  listeners: new Set<() => void>(),
  set(search: ActivitySearch) {
    mockUrl.search = search
    mockUrl.listeners.forEach((listener) => listener())
  },
}
const mockNavigate = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: jest.fn(),
  useSearch: () =>
    jest.requireActual('react').useSyncExternalStore(
      (listener: () => void) => {
        mockUrl.listeners.add(listener)
        return () => mockUrl.listeners.delete(listener)
      },
      () => mockUrl.search
    ),
  useNavigate: () => mockNavigate,
  Link: ({ children, search }: { children: ReactNode; search?: object }) => (
    <a href={`/?${new URLSearchParams(search as Record<string, string>).toString()}`}>{children}</a>
  ),
}))

const useScenario = (scenario: SkillPresetsMockScenario) => {
  window.sessionStorage.setItem('qovery-mock-skill-presets', scenario)
  resetSkillPresetsMockApi()
}

const CI_DEPLOYER = '3f1c9a2e-0000-4000-8000-00000000c1d0'

beforeEach(() => {
  window.sessionStorage.clear()
  resetSkillPresetsMockApi()
  mockUrl.search = {}
  // Set in each test: restoreAllMocks clears implementations between tests.
  mockNavigate.mockReset().mockImplementation(({ search }: { search: ActivitySearch }) => mockUrl.set(search))
  jest.mocked(useParams).mockReturnValue({ organizationId: 'organization-1' })
})

afterEach(() => jest.restoreAllMocks())

describe('AgentActivity', () => {
  it('shows a loading state first', () => {
    useScenario('agent-activity')
    renderWithProviders(<AgentActivity />)
    expect(screen.getByLabelText('Loading agent activity')).toBeInTheDocument()
  })

  it('shows members, skills and policy tokens in one view, with what was blocked', async () => {
    useScenario('agent-activity')
    renderWithProviders(<AgentActivity />)

    expect(await screen.findByRole('heading', { name: 'Breakdown' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Activity', level: 1 })).toBeInTheDocument()
    expect(screen.getByTestId('coverage-note')).toHaveTextContent('Prompts and code are never collected.')
    expect(
      screen.getByText(
        'Actions are matched to people by username and to skills by the agent’s user agent; treat them as indicative.'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Policy tokens with activity')).toBeInTheDocument()
    expect(screen.getByTestId('chart-summary')).toHaveTextContent(/\d+ allowed and \d+ denied actions/)
    expect(within(screen.getByTestId('denied-actions')).getAllByText(/payments-production/).length).toBeGreaterThan(0)
    // Denied rows stand out, and both kinds of actors appear in the feed.
    expect(document.querySelectorAll('tr[data-outcome="DENIED"]').length).toBeGreaterThan(0)
    expect(document.querySelectorAll('[data-actor-kind="policy-token"]').length).toBeGreaterThan(0)
    const suggestions = screen.getByTestId('activity-suggestions')
    expect(within(suggestions).getByText(/actions were denied in/)).toBeInTheDocument()
    expect(within(suggestions).getByText(/calls\s+denied by its policy/)).toBeInTheDocument()
  })

  it('switches the breakdown between members, tokens and skills', async () => {
    useScenario('agent-activity')
    const { userEvent } = renderWithProviders(<AgentActivity />)
    await screen.findByTestId('breakdown-member')

    await userEvent.click(screen.getByRole('radio', { name: /By token/ }))
    const tokens = within(screen.getByTestId('breakdown-token'))
    expect(tokens.getByRole('button', { name: 'Policy token ci-deployer' })).toBeInTheDocument()
    expect(tokens.getByText('Deleted')).toBeInTheDocument()
    // Older records with no token id: named, not drillable.
    expect(tokens.getByText('Unknown policy token (older records)')).toBeInTheDocument()
    expect(tokens.queryByRole('button', { name: /Unknown policy token/ })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('radio', { name: /By skill/ }))
    expect(
      within(screen.getByTestId('breakdown-skill')).getByRole('button', { name: 'No skill (MCP or API)' })
    ).toBeInTheDocument()
  })

  it('filters the whole page to a token from its row, in the URL', async () => {
    useScenario('agent-activity')
    const { userEvent } = renderWithProviders(<AgentActivity />)
    await screen.findByTestId('breakdown-member')

    await userEvent.click(screen.getByRole('radio', { name: /By token/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Policy token ci-deployer' }))

    expect(mockNavigate).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: expect.objectContaining({ actor: `token:${CI_DEPLOYER}` }), replace: true })
    )
    expect(await screen.findByTestId('activity-drill')).toHaveTextContent('Policy token ci-deployer')
    await waitFor(() =>
      expect(
        Array.from(document.querySelectorAll('[data-actor-kind]')).every(
          (chip) => chip.getAttribute('data-actor-kind') === 'policy-token'
        )
      ).toBe(true)
    )
  })

  it('reads its filters from the URL, and removes one from its chip', async () => {
    useScenario('agent-activity')
    mockUrl.search = { outcome: 'DENIED', range: '7d' }
    const { userEvent } = renderWithProviders(<AgentActivity />)

    expect(await screen.findByTestId('activity-drill')).toHaveTextContent('Denied')
    await waitFor(() => expect(document.querySelectorAll('tr[data-outcome="ALLOWED"]')).toHaveLength(0))

    await userEvent.click(screen.getByRole('button', { name: 'Remove the outcome filter' }))
    expect(mockNavigate).toHaveBeenLastCalledWith(expect.objectContaining({ search: { range: '7d' } }))
  })

  it('pages the recent actions, with counts that match what is shown, in the URL', async () => {
    useScenario('agent-activity')
    const { userEvent } = renderWithProviders(<AgentActivity />)

    const count = await screen.findByTestId('recent-count', undefined, { timeout: 5000 })
    expect(count).toHaveTextContent(/^Showing 1 to 30 of 100 actions in this period/)
    // The time is not a tab stop on every row.
    expect(document.querySelector('time[datetime]')).not.toHaveAttribute('tabindex')

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(mockNavigate).toHaveBeenLastCalledWith(expect.objectContaining({ search: { page: 2 } }))
    expect(await screen.findByTestId('recent-count')).toHaveTextContent(/^Showing 31 to 60 of 100/)
  })

  it('keeps the breakdown in the URL', async () => {
    useScenario('agent-activity')
    mockUrl.search = { view: 'skill' }
    renderWithProviders(<AgentActivity />)

    expect(await screen.findByTestId('breakdown-skill')).toBeInTheDocument()
  })

  it('shows a member only their own activity', async () => {
    useScenario('member')
    renderWithProviders(<AgentActivity />)

    expect(await screen.findByRole('heading', { name: 'Your activity', level: 1 })).toBeInTheDocument()
    await screen.findByRole('heading', { name: 'Recent actions' })
    expect(screen.queryByRole('radio', { name: /By token/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Suggestions' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Actor')).not.toBeInTheDocument()
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

  it('changes the period from the toolbar, back to the first page, and clears the other filters at once', async () => {
    useScenario('agent-activity')
    mockUrl.search = { outcome: 'DENIED', skill: 'qovery-deploy', page: 2 }
    const { userEvent } = renderWithProviders(<AgentActivity />)
    const toolbar = within(await screen.findByRole('toolbar', { name: 'Filters' }))

    await userEvent.click(toolbar.getByRole('radio', { name: /7 days/ }))
    expect(mockNavigate).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: { outcome: 'DENIED', skill: 'qovery-deploy', range: '7d' } })
    )

    await userEvent.click(toolbar.getByRole('button', { name: 'Clear filters' }))
    expect(mockNavigate).toHaveBeenLastCalledWith(expect.objectContaining({ search: { range: '7d' } }))
  })

  it('goes back a page, and drops the page from the URL on the first one', async () => {
    useScenario('agent-activity')
    mockUrl.search = { page: 2 }
    const { userEvent } = renderWithProviders(<AgentActivity />)
    expect(await screen.findByTestId('recent-count', undefined, { timeout: 5000 })).toHaveTextContent(
      /^Showing 31 to 60 of 100/
    )

    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(mockNavigate).toHaveBeenLastCalledWith(expect.objectContaining({ search: {} }))
  })

  it('shows every denied action from the blocked list', async () => {
    useScenario('agent-activity')
    const { userEvent } = renderWithProviders(<AgentActivity />)
    const count = await screen.findByTestId('denied-count', undefined, { timeout: 5000 })
    expect(count).toHaveTextContent(/^6 of \d+ shown\./)

    await userEvent.click(within(count).getByRole('button', { name: 'Show all denied' }))
    expect(mockNavigate).toHaveBeenLastCalledWith(expect.objectContaining({ search: { outcome: 'DENIED' } }))
  })

  it('loads again when Try again is clicked', async () => {
    useScenario('agent-activity')
    const getActivity = jest
      .spyOn(skillPresetsApi, 'getAgentActivity')
      .mockRejectedValue(buildSkillPresetApiError(503, 'Unavailable'))
    const { userEvent } = renderWithProviders(<AgentActivity />)
    await screen.findByText('Agent activity could not be loaded')
    const calls = getActivity.mock.calls.length

    await userEvent.click(screen.getByRole('button', { name: /Try again/ }))
    await waitFor(() => expect(getActivity.mock.calls.length).toBeGreaterThan(calls))
  })
})
