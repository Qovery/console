import { useLocation, useParams } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { AgentExperienceNav } from './agent-experience-nav'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: jest.fn(),
  useLocation: jest.fn(),
  useRouterState: () => ({ location: { pathname: '/organization/organization-1/agent-experience/skill-presets' } }),
  Link: ({ children, className, ...props }: { children: ReactNode; className?: string; 'aria-current'?: 'page' }) => (
    <a href="/" className={className} aria-current={props['aria-current']}>
      {children}
    </a>
  ),
}))

jest.mock('../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets')

beforeEach(() => {
  jest.mocked(useCanManageSkillPresets).mockReturnValue({ canManage: true, isLoading: false })
  jest.mocked(useParams).mockReturnValue({ organizationId: 'organization-1' })
})

describe('AgentExperienceNav, Skills registry', () => {
  it.each(['', '/preset-1', '/preset-1/history', '/new'])('shows one Skills registry entry, current on %s', (path) => {
    jest.mocked(useLocation).mockReturnValue({
      pathname: `/organization/organization-1/agent-experience/skill-presets${path}`,
    } as never)
    renderWithProviders(<AgentExperienceNav />)
    expect(screen.getByRole('link', { name: 'Skills registry' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(screen.queryByRole('link', { name: /Assignments|Skill loads|Usage/ })).not.toBeInTheDocument()
  })
})
