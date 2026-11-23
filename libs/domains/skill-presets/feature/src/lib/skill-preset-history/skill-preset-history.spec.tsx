import { useParams } from '@tanstack/react-router'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { SkillPresetHistory } from './skill-preset-history'

const mockEditSkillPreset = jest.fn()

jest.mock('@qovery/shared/iam/feature', () => ({
  useUserRole: () => ({ roles: ['organization:organization-1:admin'], loading: false, isQoveryAdminUser: false }),
}))

const REVISIONS = [
  {
    skill_preset_id: 'preset-1',
    revision: 1,
    change_type: 'CREATE',
    edited_by: 'alex.martin@example.com',
    edited_at: '2026-11-01T00:00:00Z',
    name: 'Backend team',
    description: '',
    base: 'FULL',
    team_context: 'Deploy to staging first.',
    skills: [],
    assigned_to: { organization_default: true, role_ids: [], user_ids: [] },
  },
  {
    skill_preset_id: 'preset-1',
    revision: 2,
    change_type: 'UPDATE',
    security_review: { verdict: 'ALLOW', model: 'example-model-id', prompt_version: 'v1', findings: [] },
    edited_by: 'sam.lee@example.com',
    edited_at: '2026-11-10T00:00:00Z',
    name: 'Backend team',
    description: '',
    base: 'FULL',
    team_context: 'Deploy to staging first.\nNever deploy to production.',
    skills: [{ skill_name: 'qovery-assess', mode: 'DISABLE' }],
    assigned_to: { organization_default: true, role_ids: [], user_ids: [] },
  },
]

let mockRevisions = REVISIONS
const PRESETS_LOADED = { isSuccess: true, data: [{ id: 'preset-1', name: 'Backend team' }] }
let mockPresets: { isSuccess: boolean; data?: { id: string; name: string }[] } = PRESETS_LOADED

jest.mock('../hooks/use-skill-preset-revisions/use-skill-preset-revisions', () => ({
  useSkillPresetRevisions: () => ({ isLoading: false, data: mockRevisions }),
}))
jest.mock('../hooks/use-skill-presets/use-skill-presets', () => ({
  useSkillPresets: () => mockPresets,
}))
jest.mock('../hooks/use-skill-preset-assignees/use-skill-preset-assignees', () => ({
  useSkillPresetAssignees: () => ({ data: { roles: [], members: [] } }),
}))
jest.mock('../hooks/use-edit-skill-preset/use-edit-skill-preset', () => ({
  useEditSkillPreset: () => ({ mutateAsync: mockEditSkillPreset, isLoading: false }),
}))
jest.mock('../hooks/use-create-skill-preset/use-create-skill-preset', () => ({
  useCreateSkillPreset: () => ({ mutateAsync: jest.fn() }),
}))
jest.mock('@monaco-editor/react', () => ({
  DiffEditor: ({ original, modified }: { original: string; modified: string }) => (
    <pre data-testid="diff">{`${original}=>${modified}`}</pre>
  ),
}))

beforeEach(() => {
  mockRevisions = REVISIONS
  mockPresets = PRESETS_LOADED
  jest.mocked(useParams).mockReturnValue({ organizationId: 'organization-1', skillPresetId: 'preset-1' })
})

describe('SkillPresetHistory', () => {
  it('shows the latest revision against the one before', () => {
    renderWithProviders(<SkillPresetHistory />)

    expect(screen.getByText('Team context · qovery-assess added')).toBeInTheDocument()
    expect(screen.getAllByTestId('diff')[0]).toHaveTextContent('Never deploy to production.')
    expect(screen.queryByRole('button', { name: /Restore this revision/ })).not.toBeInTheDocument()
  })

  it('restores an older revision as a new one after confirmation', async () => {
    const { userEvent } = renderWithProviders(<SkillPresetHistory />)

    await userEvent.click(screen.getByRole('button', { name: /Revision 1 · Created/ }))
    await userEvent.click(screen.getByRole('button', { name: /Restore this revision/ }))
    expect(screen.getByText(/as revision 3/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Restore revision 1' }))

    expect(mockEditSkillPreset).toHaveBeenCalledWith(
      expect.objectContaining({
        skillPresetId: 'preset-1',
        body: expect.objectContaining({ team_context: 'Deploy to staging first.', skills: [] }),
      })
    )
  })

  it('offers to recreate a preset the loaded list no longer has', async () => {
    mockPresets = { isSuccess: true, data: [] }
    renderWithProviders(<SkillPresetHistory />)

    expect(screen.getByRole('button', { name: /Recreate from this revision/ })).toBeInTheDocument()
  })

  it('does not treat a preset as deleted while the list is loading or failed', () => {
    mockPresets = { isSuccess: false, data: undefined }
    renderWithProviders(<SkillPresetHistory />)

    expect(screen.queryByRole('button', { name: /Recreate from this revision/ })).not.toBeInTheDocument()
  })

  it('shows a revision that only made the preset a template', () => {
    mockRevisions = [...REVISIONS, { ...REVISIONS[1], revision: 3, is_template: true, security_review: null }]
    renderWithProviders(<SkillPresetHistory />)

    expect(screen.getAllByText('Made a template')).toHaveLength(2)
    expect(screen.queryByText(/No change in content/)).not.toBeInTheDocument()
  })

  it('does not diff a revision whose previous one is not loaded', () => {
    mockRevisions = REVISIONS.filter(({ revision }) => revision === 2)
    renderWithProviders(<SkillPresetHistory />)

    expect(screen.getByText('Changes not shown: the revision before is not loaded')).toBeInTheDocument()
    expect(screen.queryByTestId('diff')).not.toBeInTheDocument()
  })

  it('names the review in plain words, with the model id in a tooltip', () => {
    renderWithProviders(<SkillPresetHistory />)
    expect(screen.getByText('Model review on AWS Bedrock, prompt v1: allowed')).toBeInTheDocument()
    expect(screen.queryByText(/example-model-id/)).not.toBeInTheDocument()
  })
})
