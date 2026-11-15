import { useParams, useSearch } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { SettingsSkillPresets } from './settings-skill-presets/settings-skill-presets'
import { SkillPresetEditor } from './skill-preset-editor/skill-preset-editor'
import { SkillPresetHistory } from './skill-preset-history/skill-preset-history'

/*
 * Who sees what, decided from the organization role in the user's token (mock mode off). Admin hooks
 * are spies: for non-admins they must never run, so no admin request is sent and nothing flashes.
 */

const ORGANIZATION_ID = 'organization-1'
const mockUserRole = jest.fn()
const mockUseSkillPresets = jest.fn()
const mockUseSkillPreset = jest.fn()
const mockUseRevisions = jest.fn()
const mockAiFeaturesEnabled = jest.fn()

jest.mock('./hooks/use-ai-features-enabled/use-ai-features-enabled', () => ({
  useAiFeaturesEnabled: () => mockAiFeaturesEnabled(),
}))

jest.mock('@qovery/shared/iam/feature', () => ({ useUserRole: () => mockUserRole() }))
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: jest.fn(),
  useNavigate: () => jest.fn(),
  useSearch: jest.fn(),
  useBlocker: jest.fn(),
  Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}))
jest.mock('./hooks/use-skill-presets/use-skill-presets', () => ({
  useSkillPresets: () => mockUseSkillPresets(),
}))
jest.mock('./hooks/use-skill-preset/use-skill-preset', () => ({ useSkillPreset: () => mockUseSkillPreset() }))
jest.mock('./hooks/use-skill-preset-revisions/use-skill-preset-revisions', () => ({
  useSkillPresetRevisions: () => mockUseRevisions(),
}))
jest.mock('./hooks/use-skill-preset-assignees/use-skill-preset-assignees', () => ({
  useSkillPresetAssignees: () => ({
    data: {
      roles: [
        { id: 'role-owner', name: 'Owner' },
        { id: 'role-admin', name: 'Admin' },
        { id: 'role-devops', name: 'Devops' },
      ],
      members: [
        { id: 'user-alex', name: 'Alex Martin', email: 'alex.martin@example.com', role_id: 'role-owner' },
        { id: 'user-sam', name: 'Sam Lee', email: 'sam.lee@example.com', role_id: 'role-admin' },
        { id: 'user-priya', name: 'Priya Shah', email: 'priya.shah@example.com', role_id: 'role-devops' },
      ],
    },
  }),
}))
jest.mock('./hooks/use-resolved-skill-preset/use-resolved-skill-preset', () => ({
  useResolvedSkillPreset: () => ({ data: { source: 'QOVERY_DEFAULT', skill_preset: null }, isLoading: false }),
}))
jest.mock('./hooks/use-delete-skill-preset/use-delete-skill-preset', () => ({
  useDeleteSkillPreset: () => ({ mutateAsync: jest.fn() }),
}))
jest.mock('@monaco-editor/react', () => ({ Editor: () => <textarea aria-label="editor" /> }))

const asRole = (role: string | null, loading = false) =>
  mockUserRole.mockReturnValue({
    roles: role ? [`organization:${ORGANIZATION_ID}:${role}`] : [],
    loading,
    isQoveryAdminUser: false,
  })

const memberNote = /Only organization owners and admins can change skill presets/

beforeEach(() => {
  jest.mocked(useParams).mockReturnValue({ organizationId: ORGANIZATION_ID })
  jest.mocked(useSearch).mockReturnValue({})
  mockUseSkillPresets.mockReset().mockReturnValue({ data: [], isLoading: false })
  mockUseSkillPreset.mockReset().mockReturnValue({ data: undefined, isLoading: false })
  mockUseRevisions.mockReset().mockReturnValue({ data: [], isLoading: false })
  mockAiFeaturesEnabled.mockReset().mockReturnValue(true)
})

describe('skill presets access', () => {
  it.each(['owner', 'admin'])('gives the full page to an organization %s', (role) => {
    asRole(role)
    renderWithProviders(<SettingsSkillPresets />)

    expect(screen.getByRole('button', { name: /Create preset/ })).toBeInTheDocument()
    expect(screen.getByText('Assignments')).toBeInTheDocument()
    expect(screen.queryByText(memberNote)).not.toBeInTheDocument()
  })

  it.each(['devops', 'viewer', 'billing', '0b5e2c4a-6a51-4d1e-9a0f-1f3c2a7b9e10'])(
    'gives the read-only view to the %s role, without admin controls or admin requests',
    (role) => {
      asRole(role)
      renderWithProviders(<SettingsSkillPresets />)

      expect(screen.getByText(memberNote)).toBeInTheDocument()
      expect(screen.getByText(/Owners and admins: Alex Martin, Sam Lee\./)).toBeInTheDocument()
      expect(screen.getByText('No preset applies. Your agent uses the Qovery skills as published.')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Create preset/ })).not.toBeInTheDocument()
      ;['Assignments', 'Skill loads', 'Usage'].forEach((tab) => expect(screen.queryByText(tab)).not.toBeInTheDocument())
      expect(mockUseSkillPresets).not.toHaveBeenCalled()
    }
  )

  it('shows no admin control while the role is loading', () => {
    asRole('admin', true)
    renderWithProviders(<SettingsSkillPresets />)

    expect(screen.getByLabelText('Loading skill presets')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Create preset/ })).not.toBeInTheDocument()
    expect(screen.queryByText('Assignments')).not.toBeInTheDocument()
    expect(mockUseSkillPresets).not.toHaveBeenCalled()
  })

  it('opens the editor for an admin', () => {
    asRole('admin')
    renderWithProviders(<SkillPresetEditor />)

    expect(screen.getByRole('heading', { name: 'Create preset' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create preset' })).toBeInTheDocument()
  })

  it.each([
    ['editor', <SkillPresetEditor key="editor" />],
    ['history', <SkillPresetHistory key="history" />],
  ])('shows the read-only view instead of the %s to a member', (_, page) => {
    asRole('viewer')
    renderWithProviders(page)

    expect(screen.getByText(memberNote)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Create preset|Save changes|Restore/ })).not.toBeInTheDocument()
    expect(mockUseSkillPreset).not.toHaveBeenCalled()
    expect(mockUseRevisions).not.toHaveBeenCalled()
  })

  it.each(['owner', 'admin'])('offers an organization %s to turn AI features on', (role) => {
    asRole(role)
    mockAiFeaturesEnabled.mockReturnValue(false)
    renderWithProviders(<SettingsSkillPresets />)

    expect(screen.getByRole('button', { name: 'Turn on AI features' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create preset/ })).toBeDisabled()
  })

  it.each(['devops', 'viewer'])('never shows the AI features button to the %s role', (role) => {
    asRole(role)
    mockAiFeaturesEnabled.mockReturnValue(false)
    renderWithProviders(<SettingsSkillPresets />)

    expect(screen.queryByRole('button', { name: 'Turn on AI features' })).not.toBeInTheDocument()
    expect(screen.queryByTestId('ai-features-notice')).not.toBeInTheDocument()
  })
})
