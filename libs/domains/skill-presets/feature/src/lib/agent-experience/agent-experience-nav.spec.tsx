import { useLocation, useParams } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgentExperienceNav } from './agent-experience-nav'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: jest.fn(),
  useLocation: jest.fn(),
  useRouterState: () => ({ location: { pathname: '/organization/organization-1/agent-experience/skill-presets' } }),
  Link: ({ children, className, ...props }: { children: ReactNode; className?: string; 'aria-current'?: string }) => (
    <a href="/" className={className} aria-current={props['aria-current']}>
      {children}
    </a>
  ),
}))

beforeEach(() => {
  jest.mocked(useParams).mockReturnValue({ organizationId: 'organization-1' })
})

describe('AgentExperienceNav, Skills Registry entry', () => {
  it('marks the Skills Registry as the current page on any of its pages', () => {
    jest
      .mocked(useLocation)
      .mockReturnValue({ pathname: '/organization/organization-1/agent-experience/skill-presets/assignments' } as never)
    renderWithProviders(<AgentExperienceNav />)
    expect(screen.getByRole('link', { name: 'Skills Registry' })).toHaveAttribute('aria-current', 'page')
  })
})
