import { useLocation, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type ReactNode } from 'react'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { AGENT_ACTIVITY_FLAG } from '../agent-activity/agent-activity-flag'
import { useAgentActivity } from '../hooks/use-agent-activity/use-agent-activity'
import { useCanManagePolicyTokens } from '../hooks/use-can-manage-policy-tokens/use-can-manage-policy-tokens'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { AgentExperienceNav, AgentTasksGate } from './agent-experience-nav'

const mockNavigate = jest.fn()
jest.mock('posthog-js/react', () => ({ useFeatureFlagEnabled: jest.fn() }))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: jest.fn(),
  useNavigate: () => mockNavigate,
  useLocation: jest.fn(),
  useRouterState: () => ({ location: { pathname: '/organization/organization-1/agent-experience/skill-presets' } }),
  Link: ({
    children,
    className,
    ...props
  }: {
    children: ReactNode
    className?: string
    'aria-current'?: 'page'
    'aria-label'?: string
  }) => (
    <a href="/" className={className} aria-current={props['aria-current']} aria-label={props['aria-label']}>
      {children}
    </a>
  ),
}))

jest.mock('../hooks/use-agent-activity/use-agent-activity')

jest.mock('../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets')
jest.mock('../hooks/use-can-manage-policy-tokens/use-can-manage-policy-tokens')

const at = (path: string) =>
  jest
    .mocked(useLocation)
    .mockReturnValue({ pathname: `/organization/organization-1/agent-experience${path}` } as never)

beforeEach(() => {
  mockNavigate.mockReset()
  jest.mocked(useFeatureFlagEnabled).mockReturnValue(false)
  at('/skill-presets')
  jest.mocked(useAgentActivity).mockReturnValue({ data: undefined } as never)
  jest.mocked(useCanManageSkillPresets).mockReturnValue({ canManage: true, isLoading: false })
  jest.mocked(useCanManagePolicyTokens).mockReturnValue({ canManage: true, isLoading: false })
  jest.mocked(useParams).mockReturnValue({ organizationId: 'organization-1' })
})

describe('AgentExperienceNav', () => {
  it('shows Automations only when Agent Tasks are enabled', () => {
    const { unmount } = renderWithProviders(<AgentExperienceNav />)
    expect(screen.queryByRole('link', { name: 'Automations' })).not.toBeInTheDocument()
    unmount()

    jest.mocked(useFeatureFlagEnabled).mockReturnValue(true)
    renderWithProviders(<AgentExperienceNav />)
    expect(screen.getByRole('link', { name: 'Automations' })).toBeInTheDocument()
  })

  it.each(['', '/preset-1', '/preset-1/history', '/new'])('shows one Skills registry entry, current on %s', (path) => {
    jest.mocked(useLocation).mockReturnValue({
      pathname: `/organization/organization-1/agent-experience/skill-presets${path}`,
    } as never)
    renderWithProviders(<AgentExperienceNav />)
    expect(screen.getByRole('link', { name: 'Skills registry' })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('link', { name: 'Activity' })).not.toBeInTheDocument()
    expect(useAgentActivity).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
    expect(screen.queryByRole('link', { name: /Assignments|Skill loads|Usage/ })).not.toBeInTheDocument()
  })

  it('hides Settings from members while Agent Tasks is disabled', () => {
    jest.mocked(useCanManageSkillPresets).mockReturnValue({ canManage: false, isLoading: false })
    jest.mocked(useCanManagePolicyTokens).mockReturnValue({ canManage: false, isLoading: false })
    jest.mocked(useLocation).mockReturnValue({
      pathname: '/organization/organization-1/agent-experience/skill-presets',
    } as never)
    renderWithProviders(<AgentExperienceNav />)
    expect(screen.getByRole('link', { name: 'Skills registry' })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByText('Settings')).not.toBeInTheDocument()
  })

  it('shows policy tokens to DevOps members, who manage them without the organization activity', () => {
    jest.mocked(useCanManageSkillPresets).mockReturnValue({ canManage: false, isLoading: false })
    jest.mocked(useLocation).mockReturnValue({
      pathname: '/organization/organization-1/agent-experience/policy-tokens',
    } as never)
    renderWithProviders(<AgentExperienceNav />)
    expect(screen.getByRole('link', { name: 'Policy tokens' })).toBeInTheDocument()
  })

  it.each([
    [1, 'Activity, 1 denied action in the last 7 days'],
    [3, 'Activity, 3 denied actions in the last 7 days'],
  ])('announces %i denied in the Activity badge', (denials, label) => {
    jest.mocked(useFeatureFlagEnabled).mockImplementation((flag) => flag === AGENT_ACTIVITY_FLAG)
    jest.mocked(useAgentActivity).mockReturnValue({ data: { totals: { denials } } } as never)
    jest.mocked(useLocation).mockReturnValue({
      pathname: '/organization/organization-1/agent-experience/skill-presets',
    } as never)
    renderWithProviders(<AgentExperienceNav />)
    expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
  })
})

describe('AgentExperienceNav, Settings', () => {
  it('opens Settings by itself on the Copilot settings page, with the Agent Tasks pages behind their flag', async () => {
    at('/copilot')
    const { unmount } = renderWithProviders(<AgentExperienceNav />)
    expect(await screen.findByText('Copilot settings')).toBeInTheDocument()
    expect(screen.queryByText('Model tokens')).not.toBeInTheDocument()
    unmount()

    jest.mocked(useFeatureFlagEnabled).mockReturnValue(true)
    renderWithProviders(<AgentExperienceNav />)
    expect(await screen.findByText('Model tokens')).toBeInTheDocument()
    expect(screen.getByText('MCP servers')).toBeInTheDocument()
  })
})

describe('AgentTasksGate', () => {
  it('shows the Agent Tasks pages with their flag, and leaves without it', async () => {
    jest.mocked(useFeatureFlagEnabled).mockReturnValue(true)
    const { unmount } = renderWithProviders(<AgentTasksGate>Model tokens page</AgentTasksGate>)
    expect(screen.getByText('Model tokens page')).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
    unmount()

    jest.mocked(useFeatureFlagEnabled).mockReturnValue(false)
    renderWithProviders(<AgentTasksGate>Model tokens page</AgentTasksGate>)
    expect(screen.queryByText('Model tokens page')).not.toBeInTheDocument()
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({ to: '/organization/$organizationId/agent-experience/skill-presets', replace: true })
      )
    )
  })

  it('waits while PostHog loads the flag', () => {
    jest.mocked(useFeatureFlagEnabled).mockReturnValue(undefined)
    renderWithProviders(<AgentTasksGate>Model tokens page</AgentTasksGate>)
    expect(screen.queryByText('Model tokens page')).not.toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('allows members to manage their own Model tokens when Agent Tasks is enabled', () => {
    jest.mocked(useFeatureFlagEnabled).mockReturnValue(true)
    jest.mocked(useCanManageSkillPresets).mockReturnValue({ canManage: false, isLoading: false })
    renderWithProviders(<AgentTasksGate>Model tokens page</AgentTasksGate>)
    expect(screen.getByText('Model tokens page')).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
