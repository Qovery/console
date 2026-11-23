import * as Dialog from '@radix-ui/react-dialog'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useLocation, useParams } from '@tanstack/react-router'
import { configure } from '@testing-library/react'
import axios from 'axios'
import { type ReactNode } from 'react'
import { AGENT_ACTIVITY_LIMITS } from '@qovery/domains/skill-presets/data-access'
import {
  type SkillPresetsMockScenario,
  installSkillPresetsMock,
  setSkillPresetsMockScenario,
} from '@qovery/domains/skill-presets/mock'
import { devopsCopilotAxios } from '@qovery/shared/devops-copilot/data-access'
import * as iamModule from '@qovery/shared/iam/feature'
import { act, renderWithProviders, screen, waitFor, within } from '@qovery/shared/util-tests'
import { queries } from '@qovery/state/util-queries'
import * as useAgentActivityModule from '../hooks/use-agent-activity/use-agent-activity'
import * as copilotStatus from '../hooks/use-copilot-status/use-copilot-status'
import { AgentExperienceCopilot, OnOffBadge, aiStatusLabel, copilotStateLabel } from './agent-experience-copilot'
import { AgentExperienceNav } from './agent-experience-nav'
import { AgentExperiencePolicyTokens } from './agent-experience-policy-tokens'
import { ConnectAgentModal } from './connect-agent-modal'

// The pages go through the real hooks and the mock API.
jest.mock('@qovery/shared/iam/feature', () => ({
  ...jest.requireActual('@qovery/shared/iam/feature'),
  useUserRole: () => ({
    roles: jest.requireActual('@qovery/domains/skill-presets/mock').isSkillPresetsMockMember()
      ? []
      : ['organization:organization-1:admin'],
    loading: false,
    isQoveryAdminUser: false,
  }),
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
  setSkillPresetsMockScenario(scenario)
}

let uninstallMocks: Array<() => void> = []
beforeAll(() => {
  uninstallMocks = [
    installSkillPresetsMock(axios, 'api', { passthrough: false }),
    installSkillPresetsMock(devopsCopilotAxios, 'copilot', { passthrough: false }),
  ]
})
afterAll(() => uninstallMocks.forEach((uninstall) => uninstall()))
afterEach(() => jest.restoreAllMocks())

beforeEach(() => {
  window.sessionStorage.clear()
  window.localStorage.clear()
  setSkillPresetsMockScenario()
  jest.mocked(useParams).mockReturnValue({ organizationId: 'organization-1' })
  jest.mocked(useLocation).mockReturnValue({ pathname: '/organization/organization-1/agent-experience' } as never)
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
      hasConfig: false,
      isLoading: false,
      error: new Error('Network Error'),
      refetch: jest.fn(),
    })
    renderWithProviders(<AgentExperienceCopilot />)

    expect(await screen.findByTestId('copilot-error')).toHaveTextContent('Unable to load the Copilot status.')
    expect(within(screen.getByTestId('copilot-state')).getByText('Unknown')).toBeInTheDocument()
    expect(within(screen.getByTestId('copilot-state')).queryByText('Off')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Turn on AI' })).not.toBeInTheDocument()
    spy.mockRestore()
  })

  it('keeps Copilot settings and the known status visible when a config refresh fails', async () => {
    useScenario('agent-experience-active')
    const refetch = jest.fn()
    jest.spyOn(copilotStatus, 'useCopilotStatus').mockReturnValue({
      enabled: true,
      readOnly: true,
      hasConfig: true,
      isLoading: false,
      error: new Error('Network Error'),
      refetch,
    })

    const { userEvent } = renderWithProviders(<AgentExperienceCopilot />)

    expect(await within(screen.getByTestId('copilot-state')).findByText('AI on, Copilot read-only')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Scheduled tasks' })).toBeInTheDocument()
    const alert = within(screen.getByTestId('copilot-error')).getByRole('alert')
    expect(alert).toHaveTextContent('Unable to refresh the Copilot status.')
    await userEvent.click(within(alert).getByRole('button', { name: 'Try again' }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('leaves the AI status unknown and hides the toggle after an organization request fails', async () => {
    useScenario('agent-experience-active')
    const interceptor = axios.interceptors.request.use((config) => {
      if (config.url?.endsWith('/organization/organization-1')) throw new Error('Network Error')
      return config
    })

    try {
      renderWithProviders(<AgentExperienceCopilot />)

      expect(await screen.findByText('Unable to load the AI features status.')).toBeInTheDocument()
      expect(await within(screen.getByTestId('copilot-state')).findByText('Unknown')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Turn on AI' })).not.toBeInTheDocument()
    } finally {
      axios.interceptors.request.eject(interceptor)
    }
  })

  it('only describes turning on the Copilot when AI features are already on', async () => {
    useScenario('agent-experience-active')
    jest.spyOn(copilotStatus, 'useCopilotStatus').mockReturnValue({
      enabled: false,
      readOnly: true,
      hasConfig: true,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })
    renderWithProviders(<AgentExperienceCopilot />)

    expect(
      await screen.findByText(/AI features are already on. This turns on the Copilot in read-only mode/)
    ).toBeInTheDocument()
  })

  it('shows members the state only, with no switch', async () => {
    useScenario('member')
    renderWithProviders(<AgentExperienceCopilot />)

    expect(await screen.findByTestId('copilot-member-note')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Turn on AI' })).not.toBeInTheDocument()
    expect(screen.queryByText('Opt-in to Copilot')).not.toBeInTheDocument()
  })
})

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
    expect(await within(deleted).findByText('No calls')).toBeInTheDocument()
  })

  it('keeps cached policy tokens visible when refreshing the list fails', async () => {
    useScenario('agent-experience-active')
    const queryClient = new QueryClient()
    renderWithProviders(
      <QueryClientProvider client={queryClient}>
        <AgentExperiencePolicyTokens />
      </QueryClientProvider>
    )
    expect(await screen.findByTestId('policy-token-ci-deployer')).toBeInTheDocument()

    const interceptor = axios.interceptors.request.use((config) => {
      if (config.url?.endsWith('/policyApiToken')) throw new Error('Network Error')
      return config
    })
    try {
      await act(() =>
        queryClient.refetchQueries(queries.organizations.policyApiTokens({ organizationId: 'organization-1' }))
      )

      expect(await screen.findByRole('alert')).toHaveTextContent('Policy tokens could not be refreshed')
      expect(screen.getByTestId('policy-token-ci-deployer')).toBeInTheDocument()
    } finally {
      axios.interceptors.request.eject(interceptor)
    }
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
  })

  it('offers a history retry instead of showing an empty list when history fails', async () => {
    useScenario('agent-experience-empty')
    const refetch = jest.fn()
    jest.spyOn(useAgentActivityModule, 'useAgentActivity').mockReturnValue({
      data: undefined,
      isInitialLoading: false,
      isError: true,
      error: new Error('Unavailable'),
      refetch,
    } as never)
    const { userEvent } = renderWithProviders(<AgentExperiencePolicyTokens />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Policy token history is unavailable')
    expect(screen.queryByText('No policy token yet')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(refetch).toHaveBeenCalledTimes(1)
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

  it('does not interpret missing usage at the activity response limit as zero calls', async () => {
    useScenario('agent-experience-active')
    jest.spyOn(useAgentActivityModule, 'useAgentActivity').mockReturnValue({
      data: {
        by_policy_token: Array.from({ length: AGENT_ACTIVITY_LIMITS.maxPolicyTokens }, (_, index) => ({
          policy_token_id: `other-token-${index}`,
        })),
      },
      isInitialLoading: false,
      isError: false,
    } as never)
    renderWithProviders(<AgentExperiencePolicyTokens />)

    const ciDeployer = await screen.findByTestId('policy-token-ci-deployer')
    expect(within(ciDeployer).getByText('Usage unavailable')).toBeInTheDocument()
    expect(within(ciDeployer).queryByText('No calls')).not.toBeInTheDocument()
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
    expect(screen.getByRole('link', { name: 'Policy examples' })).toBeInTheDocument()
  })

  it('tells other members who manages tokens', async () => {
    useScenario('member')
    renderWithProviders(<AgentExperiencePolicyTokens />)
    expect(await screen.findByText('Only owners, admins and DevOps members manage policy tokens')).toBeInTheDocument()
    expect(screen.queryByText('Create policy token')).not.toBeInTheDocument()
  })

  it('lets DevOps members manage tokens, without the organization activity', async () => {
    useScenario('agent-experience-active')
    const queryClient = new QueryClient()
    const view = () => (
      <QueryClientProvider client={queryClient}>
        <AgentExperiencePolicyTokens />
      </QueryClientProvider>
    )
    const { userEvent, rerender } = renderWithProviders(view())
    expect(await screen.findByTestId('deleted-token-cleanup-bot')).toBeInTheDocument()

    jest.spyOn(iamModule, 'useUserRole').mockReturnValue({
      roles: ['organization:organization-1:devops'],
      loading: false,
      isQoveryAdminUser: false,
    })
    rerender(view())

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
  it('limits policy tokens and Copilot settings by role', async () => {
    useScenario('agent-experience-active')
    const { userEvent, unmount } = renderWithProviders(<AgentExperienceNav />)
    expect(await screen.findByText('Settings')).toBeInTheDocument()
    for (const label of ['Skills registry', 'Automations', 'Activity']) {
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
    const { userEvent: memberUserEvent } = renderWithProviders(<AgentExperienceNav />)
    expect(await screen.findByText('Activity')).toBeInTheDocument()
    await memberUserEvent.click(screen.getByRole('button', { name: 'Settings' }))
    expect(screen.getByText('Model tokens')).toBeInTheDocument()
    expect(screen.getByText('MCP servers')).toBeInTheDocument()
    expect(screen.queryByText('Policy tokens')).not.toBeInTheDocument()
    expect(screen.queryByText('Copilot settings')).not.toBeInTheDocument()
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
    const { userEvent } = renderWithProviders(
      <Dialog.Root open>
        <Dialog.Content>
          <ConnectAgentModal onClose={jest.fn()} />
        </Dialog.Content>
      </Dialog.Root>
    )
    expect(screen.getByRole('heading', { name: 'Connect an agent' })).toBeInTheDocument()
    expect(screen.getByText('curl -fsSL https://skill.qovery.com/install.sh | bash')).toBeInTheDocument()
    expect(
      within(screen.getByRole('group', { name: 'Copy the skills install command' })).getByRole('button', {
        name: 'Copy',
      })
    ).toBeInTheDocument()

    screen.getByRole('tab', { name: 'Qovery skills' }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'CLI', selected: true })).toHaveFocus()
    expect(screen.getByText('curl -fsSL https://get.qovery.com | bash')).toBeInTheDocument()
    expect(screen.getByText('qovery auth')).toBeInTheDocument()

    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'MCP server', selected: true })).toHaveFocus()
    expect(screen.getByText(/claude mcp add --transport http qovery/)).toBeInTheDocument()

    // A top-level TOML key below a [section] header would belong to that section and be ignored.
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Coding agent' }), 'codex')
    expect(
      screen.getByText('Add this line at the top of ~/.codex/config.toml, above any [section]')
    ).toBeInTheDocument()
  })

  it('closes on Close', async () => {
    const onClose = jest.fn()
    const { userEvent } = renderWithProviders(
      <Dialog.Root open>
        <Dialog.Content>
          <ConnectAgentModal onClose={onClose} />
        </Dialog.Content>
      </Dialog.Root>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
  })
})
