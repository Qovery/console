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

jest.mock('../hooks/use-agent-activity/use-agent-activity', () => ({ useAgentActivity: () => ({ data: undefined }) }))

jest.mock('../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets')

beforeEach(() => {
  jest.mocked(useCanManageSkillPresets).mockReturnValue({ canManage: true, isLoading: false })
  jest.mocked(useParams).mockReturnValue({ organizationId: 'organization-1' })
})

describe('AgentExperienceNav, Skills registry group', () => {
  it.each(['assignments', 'usage', 'loads', 'preset-1', 'preset-1/history', 'new'])(
    'highlights the correct nested page for %s',
    (path) => {
      jest.mocked(useLocation).mockReturnValue({
        pathname: `/organization/organization-1/agent-experience/skill-presets/${path}`,
      } as never)
      renderWithProviders(<AgentExperienceNav />)
      const titles: Record<string, string> = { assignments: 'Assignments', loads: 'Skill loads', usage: 'Usage' }
      const title = titles[path] ?? 'Presets'
      expect(screen.getByRole('link', { name: title })).toHaveAttribute('aria-current', 'page')
      expect(screen.getByRole('link', { name: 'Activity' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Usage' })).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Preview' })).not.toBeInTheDocument()
    }
  )

  it('keeps member navigation read-only', () => {
    jest.mocked(useCanManageSkillPresets).mockReturnValue({ canManage: false, isLoading: false })
    jest.mocked(useLocation).mockReturnValue({
      pathname: '/organization/organization-1/agent-experience/skill-presets',
    } as never)
    renderWithProviders(<AgentExperienceNav />)
    expect(screen.getByRole('link', { name: 'Skills registry' })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('link', { name: 'Assignments' })).not.toBeInTheDocument()
  })
})
