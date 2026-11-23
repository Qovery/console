import { useLocation, useParams } from '@tanstack/react-router'
import { configure } from '@testing-library/react'
import { type ReactNode } from 'react'
import { type SkillPresetsMockScenario, resetSkillPresetsMockApi } from '@qovery/domains/skill-presets/data-access'
import { renderWithProviders, screen, waitFor, within } from '@qovery/shared/util-tests'
import * as useCanManageSkillPresetsModule from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
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

// The pages run against the in-memory mock API with its latency: shared CI runners need longer waits.
configure({ asyncUtilTimeout: 5000 })

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

afterEach(() => jest.restoreAllMocks())

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
    expect(screen.getAllByRole('button', { name: /Create policy token/ }).length).toBeGreaterThan(0)
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
