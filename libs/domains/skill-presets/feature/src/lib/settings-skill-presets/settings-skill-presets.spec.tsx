import { useParams } from '@tanstack/react-router'
import { renderWithProviders, screen, within } from '@qovery/shared/util-tests'
import { SkillPresetsPreview } from '../skill-presets-preview/skill-presets-preview'
import { SettingsSkillPresets } from './settings-skill-presets'

const mockUseSkillPresets = jest.fn()
let mockRevisionData: { edited_by: string; edited_at: string }[] = []

// An organization admin: the role gate is covered by skill-presets-access.spec.tsx.
jest.mock('@qovery/shared/iam/feature', () => ({
  useUserRole: () => ({ roles: ['organization:organization-1:admin'], loading: false, isQoveryAdminUser: false }),
}))

jest.mock('../hooks/use-skill-presets/use-skill-presets', () => ({
  useSkillPresets: () => mockUseSkillPresets(),
}))
jest.mock('../hooks/use-skill-preset-revisions/use-skill-preset-revisions', () => ({
  useSkillPresetRevisions: () => ({ data: mockRevisionData }),
}))
jest.mock('../hooks/use-skill-preset-assignees/use-skill-preset-assignees', () => ({
  useSkillPresetAssignees: () => ({
    data: {
      roles: [{ id: 'role-devops', name: 'Devops' }],
      members: [{ id: 'user-jamie', name: 'Jamie Rossi', email: 'jamie.rossi@example.com', role_id: 'role-devops' }],
    },
  }),
}))
jest.mock('../hooks/use-delete-skill-preset/use-delete-skill-preset', () => ({
  useDeleteSkillPreset: () => ({ mutateAsync: jest.fn() }),
}))
jest.mock('../hooks/use-resolved-skill-preset/use-resolved-skill-preset', () => ({
  useResolvedSkillPreset: () => ({ data: { source: 'QOVERY_DEFAULT', skill_preset: null } }),
}))

const preset = {
  id: 'preset-1',
  created_at: '2026-11-01T00:00:00Z',
  updated_at: '2026-11-02T00:00:00Z',
  name: 'Platform (CLI-first)',
  description: 'For the Devops role',
  base: 'QOVERY_LEAN',
  team_context: 'Ask before deleting anything.',
  skills: [],
  revision: 2,
  is_template: false,
  creator_name: 'Priya Shah',
  assigned_to: { organization_default: true, role_ids: ['role-devops'], user_ids: ['user-jamie'] },
}

beforeEach(() => {
  jest.mocked(useParams).mockReturnValue({ organizationId: 'organization-1' })
})

describe('SettingsSkillPresets', () => {
  it('explains presets and offers to create one when there is none', () => {
    mockUseSkillPresets.mockReturnValue({ data: [], isLoading: false })
    renderWithProviders(<SettingsSkillPresets />)

    expect(screen.getByText('No skill presets yet')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Start from a template/ })).toBeInTheDocument()
  })

  it('lists presets with their base, assignments and revision', () => {
    mockUseSkillPresets.mockReturnValue({ data: [preset], isLoading: false })
    renderWithProviders(<SettingsSkillPresets />)

    const row = screen.getByTestId('skill-preset-preset-1')
    expect(within(row).getByText('Lean (CLI-first)')).toBeInTheDocument()
    const chips = within(row).getByRole('list', { name: 'Assigned to' })
    expect(within(chips).getByText('Organization default')).toBeInTheDocument()
    expect(within(chips).getByText('Role: Devops')).toBeInTheDocument()
    expect(within(chips).getByText('Jamie Rossi')).toBeInTheDocument()
    expect(within(row).getByText('2')).toBeInTheDocument()
    expect(within(row).queryByText('Revision 2')).not.toBeInTheDocument()
  })

  it('names the last editor, with the email in a tooltip', () => {
    mockUseSkillPresets.mockReturnValue({ data: [preset], isLoading: false })
    mockRevisionData = [{ edited_by: 'jamie.rossi@example.com', edited_at: '2026-11-01T10:00:00Z' }]
    renderWithProviders(<SettingsSkillPresets />)
    mockRevisionData = []

    const row = screen.getByTestId('skill-preset-preset-1')
    expect(within(row).getByTitle('jamie.rossi@example.com')).toHaveTextContent('Jamie Rossi')
  })

  it('previews what a member gets, in its own tab', () => {
    mockUseSkillPresets.mockReturnValue({ data: [preset], isLoading: false })
    renderWithProviders(<SettingsSkillPresets />)
    expect(screen.queryByTestId('skill-presets-preview')).not.toBeInTheDocument()

    renderWithProviders(<SkillPresetsPreview />)

    expect(screen.getByText(/Platform \(CLI-first\) \(assigned to the member\)/)).toBeInTheDocument()
  })
})
