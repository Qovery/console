import { useLocation, useParams } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useAgentActivity } from '../hooks/use-agent-activity/use-agent-activity'
import { useCanManagePolicyTokens } from '../hooks/use-can-manage-policy-tokens/use-can-manage-policy-tokens'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { AgentExperienceNav } from './agent-experience-nav'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: jest.fn(),
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

beforeEach(() => {
  jest.mocked(useAgentActivity).mockReturnValue({ data: undefined } as never)
  jest.mocked(useCanManageSkillPresets).mockReturnValue({ canManage: true, isLoading: false })
  jest.mocked(useCanManagePolicyTokens).mockReturnValue({ canManage: true, isLoading: false })
  jest.mocked(useParams).mockReturnValue({ organizationId: 'organization-1' })
})

describe('AgentExperienceNav', () => {
  it.each(['', '/preset-1', '/preset-1/history', '/new'])('shows one Skills registry entry, current on %s', (path) => {
    jest.mocked(useLocation).mockReturnValue({
      pathname: `/organization/organization-1/agent-experience/skill-presets${path}`,
    } as never)
    renderWithProviders(<AgentExperienceNav />)
    expect(screen.getByRole('link', { name: 'Skills registry' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Activity' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Assignments|Skill loads|Usage/ })).not.toBeInTheDocument()
  })

  it('keeps Settings away from members', () => {
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
    jest.mocked(useAgentActivity).mockReturnValue({ data: { totals: { denials } } } as never)
    jest.mocked(useLocation).mockReturnValue({
      pathname: '/organization/organization-1/agent-experience/skill-presets',
    } as never)
    renderWithProviders(<AgentExperienceNav />)
    expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
  })
})
