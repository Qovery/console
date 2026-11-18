import { useLocation, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type ReactNode } from 'react'
import { resetSkillPresetsMockApi } from '@qovery/domains/skill-presets/data-access'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { AgentExperienceNav, AgentTasksGate } from './agent-experience-nav'

jest.mock('@qovery/shared/util-node-env', () => ({
  ...jest.requireActual('@qovery/shared/util-node-env'),
  SKILL_PRESETS_MOCK: 'true',
}))
jest.mock('posthog-js/react', () => ({ useFeatureFlagEnabled: jest.fn() }))
const mockNavigate = jest.fn()
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: jest.fn(),
  useLocation: jest.fn(),
  useNavigate: () => mockNavigate,
  useRouterState: () => ({ location: { pathname: '/organization/organization-1/agent-experience/skill-presets' } }),
  Link: ({ children, className, ...props }: { children: ReactNode; className?: string; 'aria-current'?: 'page' }) => (
    <a href="/" className={className} aria-current={props['aria-current']}>
      {children}
    </a>
  ),
}))

const at = (path: string) =>
  jest
    .mocked(useLocation)
    .mockReturnValue({ pathname: `/organization/organization-1/agent-experience${path}` } as never)

beforeEach(() => {
  window.sessionStorage.setItem('qovery-mock-skill-presets', 'agent-experience-active')
  resetSkillPresetsMockApi()
  mockNavigate.mockReset()
  jest.mocked(useParams).mockReturnValue({ organizationId: 'organization-1' })
  jest.mocked(useFeatureFlagEnabled).mockReturnValue(false)
  at('/skill-presets')
})

describe('AgentExperienceNav, Skills Registry entry', () => {
  it('marks the Skills Registry as the current page on any of its pages', () => {
    at('/skill-presets/assignments')
    renderWithProviders(<AgentExperienceNav />)
    expect(screen.getByRole('link', { name: 'Skills Registry' })).toHaveAttribute('aria-current', 'page')
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
        expect.objectContaining({ to: '/organization/$organizationId/agent-experience', replace: true })
      )
    )
  })
})
