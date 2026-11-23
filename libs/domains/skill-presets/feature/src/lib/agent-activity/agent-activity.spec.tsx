import { useParams } from '@tanstack/react-router'
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
import { type ActivitySearch } from './activity-search'
import { AgentActivity } from './agent-activity'

// The page goes through the real hooks and the in-browser mock API.
jest.mock('@qovery/shared/util-node-env', () => ({
  ...jest.requireActual('@qovery/shared/util-node-env'),
  SKILL_PRESETS_MOCK: 'true',
}))

// The pages run against the in-memory mock API with its latency: shared CI runners need longer waits.
configure({ asyncUtilTimeout: 5000 })

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
  resetSkillPresetsMock()
}

const CI_DEPLOYER = '3f1c9a2e-0000-4000-8000-00000000c1d0'

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
  resetSkillPresetsMock()
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
    const { userEvent } = renderWithProviders(<AgentActivity />)

    await userEvent.click(await screen.findByRole('tab', { name: 'Breakdown' }))
    expect(screen.getByRole('heading', { name: 'Breakdown' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Activity', level: 1 })).toBeInTheDocument()
    expect(screen.queryByTestId('coverage-note')).not.toBeInTheDocument()
    await userEvent.hover(screen.getByLabelText('About activity attribution'))
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Actions are matched to people by username and to skills by the agent’s user agent; treat them as indicative.'
    )
    await userEvent.unhover(screen.getByLabelText('About activity attribution'))
    expect(screen.queryByText('Policy tokens with activity')).not.toBeInTheDocument()
    expect(screen.getByTestId('chart-summary')).toHaveTextContent(/\d+ allowed and \d+ denied actions/)
    expect(within(screen.getByTestId('denied-actions')).getAllByText(/payments-production/).length).toBeGreaterThan(0)
    // Denied rows stand out, and both kinds of actors appear in the feed.
    await userEvent.click(screen.getByRole('tab', { name: 'Recent actions' }))
    expect(document.querySelectorAll('tr[data-outcome="DENIED"]').length).toBeGreaterThan(0)
    expect(document.querySelectorAll('[data-actor-kind="policy-token"]').length).toBeGreaterThan(0)
    const suggestions = screen.getByTestId('activity-suggestions')
    expect(within(suggestions).getByText(/actions denied in/)).toBeInTheDocument()
    expect(within(suggestions).getAllByRole('listitem')).toHaveLength(3)
  })

  it('switches the breakdown between members, tokens and skills', async () => {
    useScenario('agent-activity')
    const { userEvent } = renderWithProviders(<AgentActivity />)
    await userEvent.click(await screen.findByRole('tab', { name: 'Breakdown' }))
    await screen.findByTestId('breakdown-member')

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Breakdown' }), 'token')
    const tokens = within(screen.getByTestId('breakdown-token'))
    expect(tokens.getByRole('button', { name: 'Policy token ci-deployer' })).toBeInTheDocument()
    expect(tokens.getByText('Deleted')).toBeInTheDocument()
    // Older records with no token id: named, not drillable.
    expect(tokens.getByText('Unknown policy token (older records)')).toBeInTheDocument()
    expect(tokens.queryByRole('button', { name: /Unknown policy token/ })).not.toBeInTheDocument()

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Breakdown' }), 'skill')
    expect(
      within(screen.getByTestId('breakdown-skill')).getByRole('button', { name: 'No skill (MCP or API)' })
    ).toBeInTheDocument()
  })

  it('filters the whole page to a token from its row, in the URL', async () => {
    useScenario('agent-activity')
    const { userEvent } = renderWithProviders(<AgentActivity />)
    await userEvent.click(await screen.findByRole('tab', { name: 'Breakdown' }))
    await screen.findByTestId('breakdown-member')

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Breakdown' }), 'token')
    await userEvent.click(screen.getByRole('button', { name: 'Policy token ci-deployer' }))

    expect(mockNavigate).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: expect.objectContaining({ actor: `token:${CI_DEPLOYER}` }), replace: true })
    )
    expect(screen.getByRole('combobox', { name: 'Actor' })).toHaveValue(`token:${CI_DEPLOYER}`)
    await waitFor(() => {
      const chips = Array.from(document.querySelectorAll('[data-actor-kind]'))
      expect(chips.length).toBeGreaterThan(0)
      expect(chips.every((chip) => chip.getAttribute('data-actor-kind') === 'policy-token')).toBe(true)
    })
  })

  it('reads its filters from the URL, and clears them from the filter bar', async () => {
    useScenario('agent-activity')
    mockUrl.search = { outcome: 'DENIED', range: '7d' }
    const { userEvent } = renderWithProviders(<AgentActivity />)

    expect(await screen.findByRole('combobox', { name: 'Authorization' })).toHaveValue('DENIED')
    expect(screen.queryByTestId('activity-drill')).not.toBeInTheDocument()
    await waitFor(() => expect(document.querySelectorAll('tr[data-outcome="ALLOWED"]')).toHaveLength(0))

    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(mockNavigate).toHaveBeenLastCalledWith(expect.objectContaining({ search: { range: '7d' } }))
  })

  it('pages the recent actions, with counts that match what is shown, in the URL', async () => {
    useScenario('agent-activity')
    const { userEvent } = renderWithProviders(<AgentActivity />)

    const count = await screen.findByTestId('recent-count', undefined, { timeout: 5000 })
    expect(count).toHaveTextContent(/^Showing 1 to 10 of 100 actions in this period/)
    // The time is not a tab stop on every row.
    expect(document.querySelector('time[datetime]')).not.toHaveAttribute('tabindex')

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(mockNavigate).toHaveBeenLastCalledWith(expect.objectContaining({ search: { page: 2 } }))
    expect(await screen.findByTestId('recent-count')).toHaveTextContent(/^Showing 11 to 20 of 100/)
  })

  it('filters recent actions from the Action column and resets pagination', async () => {
    useScenario('agent-activity')
    mockUrl.search = { page: 2 }
    const { userEvent } = renderWithProviders(<AgentActivity />)
    const recent = within(await screen.findByRole('region', { name: 'Recent actions' }))
    await userEvent.click(recent.getByRole('button', { name: 'Action' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: /^Deploy/ }))
    expect(mockNavigate).toHaveBeenLastCalledWith(expect.objectContaining({ search: {} }))
    const rows = recent.getAllByRole('row').slice(1)
    expect(rows.length).toBeGreaterThan(0)
    rows.forEach((row) => expect(within(row).getAllByRole('cell')[0]).toHaveTextContent('Deploy'))
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

    expect(await screen.findByRole('heading', { name: 'Activity', level: 1 })).toBeInTheDocument()
    await screen.findByRole('heading', { name: 'Recent actions' })
    expect(screen.queryByRole('combobox', { name: 'Breakdown' })).not.toBeInTheDocument()
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

  it('changes the period from the filter row, back to the first page, and clears the other filters at once', async () => {
    useScenario('agent-activity')
    mockUrl.search = { outcome: 'DENIED', skill: 'qovery-deploy', page: 2 }
    const { userEvent } = renderWithProviders(<AgentActivity />)
    const toolbar = within(await screen.findByRole('toolbar', { name: 'Filters' }))

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Period' }), '7d')
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
      /^Showing 11 to 20 of 100/
    )

    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(mockNavigate).toHaveBeenLastCalledWith(expect.objectContaining({ search: {} }))
  })

  it('shows every denied action from the blocked list', async () => {
    useScenario('agent-activity')
    const { userEvent } = renderWithProviders(<AgentActivity />)
    const count = await screen.findByTestId('denied-count', undefined, { timeout: 5000 })
    expect(count).toHaveTextContent('Show all denied')

    await userEvent.click(within(count).getByRole('button', { name: 'Show all denied' }))
    expect(mockNavigate).toHaveBeenLastCalledWith(expect.objectContaining({ search: { outcome: 'DENIED' } }))
  })

  it('does not say nothing was denied when the denials are older than the recent actions', async () => {
    useScenario('agent-activity')
    const getAgentActivity = skillPresetsApi.getAgentActivity.bind(skillPresetsApi)
    jest.spyOn(skillPresetsApi, 'getAgentActivity').mockImplementation(async (...args) => {
      const response = await getAgentActivity(...args)
      return { ...response, recent: response.recent.filter(({ outcome }) => outcome === 'ALLOWED') }
    })
    renderWithProviders(<AgentActivity />)

    expect(await screen.findByTestId('no-recent-denial')).toHaveTextContent(
      'Denied actions in this period are not among the 100 most recent shown.'
    )
    expect(screen.getByRole('button', { name: 'Show all denied' })).toBeInTheDocument()
  })

  it('loads again when Try again is clicked', async () => {
    useScenario('agent-activity')
    const getActivity = jest
      .spyOn(skillPresetsApi, 'getAgentActivity')
      .mockRejectedValue(buildSkillPresetApiError(500, 'Internal server error'))
    const { userEvent } = renderWithProviders(<AgentActivity />)
    await screen.findByText('Agent activity could not be loaded')
    const calls = getActivity.mock.calls.length

    await userEvent.click(screen.getByRole('button', { name: /Try again/ }))
    await waitFor(() => expect(getActivity.mock.calls.length).toBeGreaterThan(calls))
  })

  it('asks for a shorter period when the range takes too long to read', async () => {
    useScenario('agent-activity-timeout')
    mockUrl.search = { range: '30d' }
    const { userEvent } = renderWithProviders(<AgentActivity />)

    const notice = await screen.findByTestId('activity-timed-out', undefined, { timeout: 5000 })
    expect(notice).toHaveTextContent('This range took too long. Pick a shorter period.')
    // The toolbar stays, so a shorter period is one click away.
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Period' }), '7d')
    expect(mockNavigate).toHaveBeenLastCalledWith(expect.objectContaining({ search: { range: '7d' } }))
  })

  it('sends the actor filter as actorKind', async () => {
    useScenario('agent-activity')
    const getActivity = jest.spyOn(skillPresetsApi, 'getAgentActivity')
    mockUrl.search = { actor: 'tokens' }
    renderWithProviders(<AgentActivity />)
    await waitFor(() =>
      expect(getActivity).toHaveBeenCalledWith('organization-1', expect.objectContaining({ actorKind: 'POLICY_TOKEN' }))
    )
  })
})
