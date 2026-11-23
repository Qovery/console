import { useNavigate, useParams } from '@tanstack/react-router'
import { renderWithProviders, screen, within } from '@qovery/shared/util-tests'
import { SettingsSkillPresets } from './settings-skill-presets'

const mockUseSkillPresets = jest.fn()
const mockNavigate = jest.fn()
const mockUseSkillPresetRevisions = jest.fn()
let mockRevisionData: { skill_preset_id: string; edited_by: string; edited_at: string }[] = []

// An organization admin: the role gate is covered by skill-presets-access.spec.tsx.
jest.mock('@qovery/shared/iam/feature', () => ({
  useUserRole: () => ({ roles: ['organization:organization-1:admin'], loading: false, isQoveryAdminUser: false }),
}))

jest.mock('../hooks/use-skill-presets/use-skill-presets', () => ({
  useSkillPresets: () => mockUseSkillPresets(),
}))
jest.mock('../hooks/use-skill-preset-revisions/use-skill-preset-revisions', () => ({
  useSkillPresetRevisions: (props: unknown) => {
    mockUseSkillPresetRevisions(props)
    return { data: mockRevisionData }
  },
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
  base: 'LEAN',
  team_context: 'Ask before deleting anything.',
  skills: [],
  revision: 2,
  is_template: false,
  creator_name: 'Priya Shah',
  assigned_to: { organization_default: true, role_ids: ['role-devops'], user_ids: ['user-jamie'] },
}

beforeEach(() => {
  jest.mocked(useNavigate).mockReturnValue(mockNavigate)
  jest.mocked(useParams).mockReturnValue({ organizationId: 'organization-1' })
})

describe('SettingsSkillPresets', () => {
  it('explains presets and offers to create one when there is none', () => {
    mockUseSkillPresets.mockReturnValue({ data: [], isLoading: false })
    renderWithProviders(<SettingsSkillPresets />)

    expect(screen.getByText('No presets yet')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Start from a template/ })).toBeInTheDocument()
  })

  it('lists presets with their base and assignments', () => {
    mockUseSkillPresets.mockReturnValue({ data: [preset], isLoading: false })
    renderWithProviders(<SettingsSkillPresets />)

    const row = screen.getByTestId('skill-preset-preset-1')
    expect(within(row).getByText('Lean (CLI-first)')).toBeInTheDocument()
    const chips = within(row).getByRole('list', { name: 'Assigned to' })
    expect(within(chips).getByText('Organization default')).toBeInTheDocument()
    expect(within(chips).getByText('Role: Devops')).toBeInTheDocument()
    expect(within(chips).getByText('Jamie Rossi')).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Revision' })).not.toBeInTheDocument()
  })

  it('opens a preset from its row with a click or Enter', async () => {
    mockUseSkillPresets.mockReturnValue({ data: [preset], isLoading: false })
    const { userEvent } = renderWithProviders(<SettingsSkillPresets />)
    const navigate = mockNavigate
    navigate.mockClear()
    const row = screen.getByTestId('skill-preset-preset-1')

    await userEvent.click(within(row).getByText('Lean (CLI-first)'))
    expect(navigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/agent-experience/skill-presets/$skillPresetId',
      params: { organizationId: 'organization-1', skillPresetId: 'preset-1' },
    })
    navigate.mockClear()
    row.focus()
    await userEvent.keyboard('{Enter}')
    expect(navigate).toHaveBeenCalledTimes(1)
  })

  it('keeps description and row actions independent from row navigation', async () => {
    mockUseSkillPresets.mockReturnValue({ data: [preset], isLoading: false })
    const { userEvent } = renderWithProviders(<SettingsSkillPresets />)
    const navigate = mockNavigate
    navigate.mockClear()
    const row = screen.getByTestId('skill-preset-preset-1')

    await userEvent.click(within(row).getByLabelText('Description of Platform (CLI-first)'))
    await userEvent.keyboard('{Enter}')
    expect(navigate).not.toHaveBeenCalled()
    await userEvent.click(within(row).getByRole('button', { name: 'Actions for Platform (CLI-first)' }))
    expect(await screen.findByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('shows the last editor avatar and identifies them in a tooltip', async () => {
    mockUseSkillPresets.mockReturnValue({ data: [preset], isLoading: false })
    mockRevisionData = [
      { skill_preset_id: 'preset-1', edited_by: 'jamie.rossi@example.com', edited_at: '2026-11-01T10:00:00Z' },
      { skill_preset_id: 'preset-1', edited_by: 'priya.shah@example.com', edited_at: '2026-10-01T10:00:00Z' },
      { skill_preset_id: 'other-preset', edited_by: 'alex.martin@example.com', edited_at: '2026-11-02T10:00:00Z' },
    ]
    const { userEvent } = renderWithProviders(<SettingsSkillPresets />)
    mockRevisionData = []

    const row = screen.getByTestId('skill-preset-preset-1')
    const editor = within(row).getByLabelText('Jamie Rossi')
    expect(editor).toBeInTheDocument()
    expect(within(row).getByText(/ago$/)).toBeInTheDocument()
    await userEvent.hover(editor)
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Jamie Rossi (jamie.rossi@example.com)')
  })

  it('reads the last editors of every preset from one request', () => {
    mockUseSkillPresetRevisions.mockClear()
    mockUseSkillPresets.mockReturnValue({
      data: [preset, { ...preset, id: 'preset-2', name: 'Second' }, { ...preset, id: 'preset-3', name: 'Third' }],
      isLoading: false,
    })
    renderWithProviders(<SettingsSkillPresets />)

    expect(screen.getAllByTestId(/^skill-preset-/)).toHaveLength(3)
    const calls = mockUseSkillPresetRevisions.mock.calls.map(([props]) => props)
    expect(calls.length).toBeGreaterThan(0)
    calls.forEach((props) => expect(props).toEqual({ organizationId: 'organization-1' }))
  })

  it('falls back to the preset when its last revision is not in the latest revisions', () => {
    mockUseSkillPresets.mockReturnValue({ data: [preset], isLoading: false })
    renderWithProviders(<SettingsSkillPresets />)

    expect(within(screen.getByTestId('skill-preset-preset-1')).getByLabelText('Priya Shah')).toBeInTheDocument()
  })

  it('sorts names and edit dates in both directions, and filters bases', async () => {
    mockUseSkillPresets.mockReturnValue({
      data: [
        { ...preset, id: 'a', name: 'Alpha', revision: 2, updated_at: '2026-11-01T00:00:00Z' },
        {
          ...preset,
          id: 'z',
          name: 'Zulu',
          revision: 10,
          base: 'FULL',
          updated_at: '2026-11-03T00:00:00Z',
          is_template: true,
        },
        { ...preset, id: 'm', name: 'Middle', revision: 3, base: 'NONE', updated_at: '2026-11-02T00:00:00Z' },
      ],
      isLoading: false,
    })
    const { userEvent } = renderWithProviders(<SettingsSkillPresets />)
    const rowIds = () => screen.getAllByTestId(/^skill-preset-/).map((row) => row.dataset.testid)
    expect(rowIds()).toEqual(['skill-preset-z', 'skill-preset-m', 'skill-preset-a'])
    await userEvent.click(screen.getByRole('button', { name: 'Last edited' }))
    expect(rowIds()).toEqual(['skill-preset-a', 'skill-preset-m', 'skill-preset-z'])
    await userEvent.click(screen.getByRole('button', { name: 'Preset', exact: true }))
    expect(rowIds()).toEqual(['skill-preset-a', 'skill-preset-m', 'skill-preset-z'])
    await userEvent.click(screen.getByRole('button', { name: 'Preset', exact: true }))
    expect(rowIds()).toEqual(['skill-preset-z', 'skill-preset-m', 'skill-preset-a'])
    await userEvent.click(screen.getByRole('button', { name: 'Starts from' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: /Full Qovery skills/ }))
    expect(rowIds()).toEqual(['skill-preset-z'])
  })

  it('opens the selected preset preview from its actions and closes it', async () => {
    mockUseSkillPresets.mockReturnValue({ data: [preset], isLoading: false })
    const { userEvent } = renderWithProviders(<SettingsSkillPresets />)
    await userEvent.click(screen.getByRole('button', { name: 'Actions for Platform (CLI-first)' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Preview' }))
    expect(screen.getByRole('dialog', { name: 'Preview: Platform (CLI-first)' })).toBeInTheDocument()
    expect(screen.queryByText('Preview as member')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Close preview' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
