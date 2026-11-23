import { useParams, useSearch } from '@tanstack/react-router'
import { type ReactNode, useState } from 'react'
import { buildSkillPresetApiError } from '@qovery/domains/skill-presets/data-access'
import { toast } from '@qovery/shared/ui'
import { renderWithProviders, screen, within } from '@qovery/shared/util-tests'
import { toSkillPresetFormValues } from '../utils/skill-preset-form'
import { SkillPresetEditor, SkillPresetEditorForm } from './skill-preset-editor'

jest.mock('@qovery/shared/ui', () => ({ ...jest.requireActual('@qovery/shared/ui'), toast: jest.fn() }))

const mockCreateSkillPreset = jest.fn()
const mockEditSkillPreset = jest.fn()
const mockUseBlocker = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: jest.fn(),
  useSearch: jest.fn(),
  useNavigate: () => jest.fn(),
  useBlocker: (options: unknown) => mockUseBlocker(options),
  Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}))

jest.mock('../hooks/use-create-skill-preset/use-create-skill-preset', () => ({
  useCreateSkillPreset: () => ({ mutateAsync: mockCreateSkillPreset, isLoading: false }),
}))
jest.mock('../hooks/use-edit-skill-preset/use-edit-skill-preset', () => ({
  useEditSkillPreset: () => ({ mutateAsync: mockEditSkillPreset, isLoading: false }),
}))
const mockUseSkillPreset = jest.fn()
const mockUseSkillPresets = jest.fn()
jest.mock('../hooks/use-skill-preset/use-skill-preset', () => ({
  useSkillPreset: () => mockUseSkillPreset(),
}))
jest.mock('../hooks/use-skill-presets/use-skill-presets', () => ({
  useSkillPresets: () => mockUseSkillPresets(),
}))
jest.mock('../hooks/use-skill-preset-assignees/use-skill-preset-assignees', () => ({
  useSkillPresetAssignees: () => ({ data: undefined }),
}))
// An organization admin: the role gate is covered by skill-presets-access.spec.tsx.
jest.mock('@qovery/shared/iam/feature', () => ({
  useUserRole: () => ({ roles: ['organization:organization-1:admin'], loading: false, isQoveryAdminUser: false }),
}))
jest.mock('@monaco-editor/react', () => {
  const { forwardRef } = jest.requireActual('react')
  const FakeEditor = forwardRef(
    (props: { value: string; onChange: (value: string) => void; options?: { ariaLabel?: string } }, ref: never) => (
      <textarea
        ref={ref}
        aria-label={props.options?.ariaLabel}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
      />
    )
  )
  return { Editor: FakeEditor, DiffEditor: FakeEditor }
})

const assignees = {
  roles: [
    { id: 'role-devops', name: 'Devops' },
    { id: 'role-backend', name: 'Backend engineers' },
  ],
  members: [
    { id: 'user-priya', name: 'Priya Shah', email: 'priya.shah@example.com', role_id: 'role-devops' },
    { id: 'user-taylor', name: 'Taylor Brooks', email: 'taylor.brooks@example.com', role_id: 'role-backend' },
  ],
}

const savedPreset = {
  id: 'preset-1',
  created_at: '2026-11-01T00:00:00Z',
  updated_at: '2026-11-02T00:00:00Z',
  name: 'Backend team',
  description: '',
  base: 'FULL' as const,
  team_context: null,
  skills: [],
  revision: 3,
  is_template: false,
  creator_name: 'Alex Martin',
  assigned_to: { organization_default: true, role_ids: [], user_ids: [] },
}

const renderEditor = (initialName = 'Backend team') =>
  renderWithProviders(
    <SkillPresetEditorForm
      organizationId="organization-1"
      initialValues={{ ...toSkillPresetFormValues(), name: initialName, organizationDefault: true }}
      presets={[]}
      assignees={assignees}
    />
  )

const renderEdit = (preset = savedPreset) =>
  renderWithProviders(
    <SkillPresetEditorForm
      organizationId="organization-1"
      initialValues={toSkillPresetFormValues(preset)}
      preset={preset}
      presets={[preset]}
      assignees={assignees}
    />
  )

beforeEach(() => {
  jest.mocked(useParams).mockReturnValue({ organizationId: 'organization-1' })
  jest.mocked(useSearch).mockReturnValue({})
})

describe('SkillPresetEditorForm', () => {
  beforeEach(() => {
    mockCreateSkillPreset.mockReset()
    mockEditSkillPreset.mockReset()
    mockUseBlocker.mockReset()
  })

  it('previews the unsaved draft without saving or discarding edits', async () => {
    const { userEvent } = renderEdit()
    const name = screen.getByRole('textbox', { name: 'Name', exact: true })
    await userEvent.clear(name)
    await userEvent.type(name, 'Unsaved preset')
    await userEvent.click(screen.getByRole('button', { name: 'Preview', exact: true }))
    expect(screen.getByRole('dialog', { name: 'Preview: Unsaved preset' })).toBeInTheDocument()
    expect(screen.getByText('Preview of your current draft, including unsaved changes.')).toBeInTheDocument()
    expect(mockEditSkillPreset).not.toHaveBeenCalled()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(name).toHaveValue('Unsaved preset')
  })

  it('lists the Qovery skills on the Full base and hides them on the Lean base', async () => {
    const { userEvent } = renderEditor()

    expect(screen.getByTestId('qovery-skill-qovery-deploy')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('combobox', { name: 'Qovery skills' }))
    await userEvent.click(screen.getByText('Lean (CLI-first)', { exact: true }))

    expect(screen.queryByTestId('qovery-skill-qovery-deploy')).not.toBeInTheDocument()
  })

  it('opens the team instructions editor when a skill gets instructions', async () => {
    const { userEvent } = renderEditor()
    const row = screen.getByTestId('qovery-skill-qovery-deploy')

    await userEvent.click(within(row).getByRole('radio', { name: 'Add instructions' }))

    expect(screen.getByRole('textbox', { name: 'Team instructions for qovery-deploy' })).toBeInTheDocument()
  })

  it('shows client-side errors before calling the API', async () => {
    const { userEvent } = renderEditor('')

    await userEvent.click(screen.getByRole('button', { name: 'Create preset' }))

    expect(screen.getByText('Enter a name.')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Name', exact: true })).toHaveFocus()
    expect(mockCreateSkillPreset).not.toHaveBeenCalled()
  })

  it('sends the organization’s own skills', async () => {
    mockCreateSkillPreset.mockResolvedValue(savedPreset)
    const { userEvent } = renderWithProviders(
      <SkillPresetEditorForm
        organizationId="organization-1"
        initialValues={{
          ...toSkillPresetFormValues(),
          name: 'Runbooks',
          customSkills: [{ skillName: 'runbook-a', description: 'Runbook. Use when on call.', content: 'Steps.' }],
        }}
        presets={[]}
        assignees={assignees}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Create preset' }))
    expect(mockCreateSkillPreset.mock.calls[0][0].body.skills).toEqual([
      { skill_name: 'runbook-a', mode: 'ADD', description: 'Runbook. Use when on call.', content: 'Steps.' },
    ])
  })

  it('shows a 422 rejection as a summary and next to the exact line', async () => {
    mockCreateSkillPreset.mockRejectedValue(
      buildSkillPresetApiError(422, 'This preset was rejected to protect the members it applies to.', {
        findings: [
          {
            rule_id: 'dump-secrets',
            location: 'team context',
            line: 2,
            reason: 'Asks the agent to print or collect secrets',
          },
        ],
      })
    )
    const { userEvent } = renderEditor()
    await userEvent.type(screen.getByRole('textbox', { name: 'Team context' }), 'Clusters are in eu-west-3.')

    await userEvent.click(screen.getByRole('button', { name: 'Create preset' }))

    const summary = await screen.findByRole('alert')
    expect(within(summary).getByText('Not saved: 1 line needs a change')).toBeInTheDocument()
    expect(within(summary).getByRole('button', { name: 'Team context, line 2' })).toBeInTheDocument()
    const lines = screen.getByRole('list', { name: 'Lines to fix' })
    expect(within(lines).getByText(/Asks the agent to print or collect secrets/)).toBeInTheDocument()

    // The summary takes the keyboard to the field to fix.
    await userEvent.click(within(summary).getByRole('button', { name: 'Team context, line 2' }))
    expect(screen.getByRole('textbox', { name: 'Team context' })).toHaveFocus()
  })

  it('clears a finding once its field is edited', async () => {
    mockCreateSkillPreset.mockRejectedValue(
      buildSkillPresetApiError(422, 'Rejected', {
        findings: [{ rule_id: 'html-comment', location: 'team context', line: 1, reason: 'Contains an HTML comment' }],
      })
    )
    const { userEvent } = renderEditor()
    const teamContext = screen.getByRole('textbox', { name: 'Team context' })
    await userEvent.type(teamContext, 'x')
    await userEvent.click(screen.getByRole('button', { name: 'Create preset' }))
    await screen.findByRole('alert')

    await userEvent.type(teamContext, 'y')

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows the 409 answer next to the assignment', async () => {
    mockCreateSkillPreset.mockRejectedValue(
      buildSkillPresetApiError(
        409,
        'One of the assignment targets already receives another skill preset: unassign it there first'
      )
    )
    const { userEvent } = renderEditor()

    await userEvent.click(screen.getByRole('button', { name: 'Create preset' }))

    expect(await screen.findByText('Not saved: a target already receives another preset')).toBeInTheDocument()
  })

  it('says how many members receive the draft', () => {
    renderEditor()
    expect(screen.getByText('2 members')).toBeInTheDocument()
  })

  it('saves an edit and keeps the form on the saved state', async () => {
    mockEditSkillPreset.mockResolvedValue({ ...savedPreset, description: 'For backend engineers', revision: 4 })
    const { userEvent } = renderEdit()
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAccessibleDescription('No changes yet')

    await userEvent.type(screen.getByLabelText('Description (optional)'), 'For backend engineers')
    expect(screen.queryByTestId('no-changes-hint')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(mockEditSkillPreset).toHaveBeenCalledWith(
      expect.objectContaining({
        skillPresetId: 'preset-1',
        body: expect.objectContaining({ description: 'For backend engineers' }),
      })
    )
    expect(await screen.findByTestId('no-changes-hint')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('guards leaving the page only while there are unsaved changes', async () => {
    const { userEvent } = renderEdit()
    expect(mockUseBlocker).toHaveBeenLastCalledWith(expect.objectContaining({ disabled: true }))

    await userEvent.type(screen.getByLabelText('Description (optional)'), 'x')

    expect(mockUseBlocker).toHaveBeenLastCalledWith(expect.objectContaining({ disabled: false }))
  })

  it('keeps the draft and warns when someone else saves a newer revision', async () => {
    // Simulates a background refetch that brings a newer revision while the admin types.
    function WithRefetch() {
      const [revision, setRevision] = useState(savedPreset.revision)
      const preset = { ...savedPreset, revision }
      return (
        <>
          <button type="button" onClick={() => setRevision(4)}>
            Refetch
          </button>
          <SkillPresetEditorForm
            organizationId="organization-1"
            initialValues={toSkillPresetFormValues(savedPreset)}
            preset={preset}
            presets={[preset]}
            assignees={assignees}
          />
        </>
      )
    }
    const { userEvent } = renderWithProviders(<WithRefetch />)
    await userEvent.type(screen.getByLabelText('Description (optional)'), 'draft')

    await userEvent.click(screen.getByRole('button', { name: 'Refetch' }))

    expect(screen.getByText('This preset was changed by someone else')).toBeInTheDocument()
    expect(screen.getByLabelText('Description (optional)')).toHaveValue('draft')
    await userEvent.click(screen.getByRole('button', { name: 'Reload latest revision' }))
    expect(screen.getByLabelText('Description (optional)')).toHaveValue('')
  })

  it('shows a concurrent save (409) as a change by someone else, not as an assignment conflict', async () => {
    mockEditSkillPreset.mockRejectedValue(
      buildSkillPresetApiError(409, 'Skill preset preset-1 was changed by someone else: reload it and try again')
    )
    const { userEvent } = renderEdit()
    await userEvent.type(screen.getByLabelText('Description (optional)'), 'x')

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('This preset was changed by someone else')).toBeInTheDocument()
    expect(screen.queryByText('Not saved: a target already receives another preset')).not.toBeInTheDocument()
  })

  it('shows the review in progress and sends a double click once', async () => {
    let finish: (value: unknown) => void = () => undefined
    mockEditSkillPreset.mockReturnValue(new Promise((resolve) => (finish = resolve)))
    const { userEvent } = renderEdit()
    await userEvent.type(screen.getByLabelText('Description (optional)'), 'x')
    const save = screen.getByRole('button', { name: 'Save' })

    await userEvent.dblClick(save)

    const checking = await screen.findByRole('button', { name: /Checking for security…/ })
    expect(checking).toBeDisabled()
    expect(mockEditSkillPreset).toHaveBeenCalledTimes(1)
    expect(screen.getByLabelText('Description (optional)')).toHaveValue('x')
    finish({ ...savedPreset, description: 'x', revision: 4 })
    expect(await screen.findByTestId('no-changes-hint')).toBeInTheDocument()
  })

  it('keeps edits typed while the save runs, as unsaved changes on top of the saved revision', async () => {
    let finish: (value: unknown) => void = () => undefined
    mockEditSkillPreset.mockReturnValue(new Promise((resolve) => (finish = resolve)))
    const { userEvent } = renderEdit()
    const description = screen.getByLabelText('Description (optional)')
    await userEvent.type(description, 'Saved part')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await screen.findByRole('button', { name: /Checking for security…/ })

    await userEvent.type(screen.getByRole('textbox', { name: 'Name', exact: true }), ' v2')
    finish({ ...savedPreset, description: 'Saved part', revision: 4 })

    expect(await screen.findByRole('button', { name: 'Save' })).toBeEnabled()
    expect(screen.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue('Backend team v2')
    expect(description).toHaveValue('Saved part')
    expect(screen.queryByTestId('no-changes-hint')).not.toBeInTheDocument()
    expect(mockUseBlocker).toHaveBeenLastCalledWith(expect.objectContaining({ disabled: false }))
  })

  it('labels model findings and shows their reason in full', async () => {
    mockCreateSkillPreset.mockRejectedValue(
      buildSkillPresetApiError(422, 'Rejected', {
        findings: [
          {
            source: 'RULES',
            rule_id: 'dump-secrets',
            location: 'team context',
            line: 1,
            reason: 'Asks the agent to print or collect secrets',
          },
          {
            source: 'MODEL',
            rule_id: 'data-exfiltration',
            location: 'team context',
            line: 2,
            reason: 'Asks the agent to send environment data to an outside address',
          },
        ],
      })
    )
    const { userEvent } = renderEditor()
    await userEvent.type(screen.getByRole('textbox', { name: 'Team context' }), 'x')
    await userEvent.click(screen.getByRole('button', { name: 'Create preset' }))

    const summary = await screen.findByRole('alert')
    expect(within(summary).getByText('Rule check')).toBeInTheDocument()
    expect(within(summary).getByText('Model review')).toBeInTheDocument()
    expect(
      within(summary).getByText(/Asks the agent to send environment data to an outside address/)
    ).toBeInTheDocument()
    const lines = screen.getByRole('list', { name: 'Lines to fix' })
    expect(within(lines).getAllByText(/Rule check|Model review/)).toHaveLength(2)
  })

  it('keeps the draft when the review is unavailable and retries the same draft', async () => {
    mockCreateSkillPreset
      .mockRejectedValueOnce(
        buildSkillPresetApiError(503, 'The security review is unavailable. Nothing was saved. Try again in a minute.')
      )
      .mockResolvedValueOnce(savedPreset)
    const { userEvent } = renderEditor()
    await userEvent.type(screen.getByRole('textbox', { name: 'Team context' }), 'Deploy to staging first.')
    await userEvent.click(screen.getByRole('button', { name: 'Create preset' }))

    expect(
      await screen.findByText('The security review is unavailable. Nothing was saved. Try again in a minute.')
    ).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Team context' })).toHaveValue('Deploy to staging first.')

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(mockCreateSkillPreset).toHaveBeenCalledTimes(2)
    expect(mockCreateSkillPreset.mock.calls[1][0]).toEqual(mockCreateSkillPreset.mock.calls[0][0])
  })

  it('disables saving when the API says AI features are off', async () => {
    mockCreateSkillPreset.mockRejectedValue(
      buildSkillPresetApiError(
        403,
        'Turn on AI features for this organization to use skill presets: every preset is reviewed by a model before it reaches members.'
      )
    )
    const { userEvent } = renderEditor()
    await userEvent.click(screen.getByRole('button', { name: 'Create preset' }))

    expect(await screen.findByTestId('ai-features-notice')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Turn on AI' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create preset' })).toBeDisabled()
    expect(screen.getByLabelText('Name')).toHaveValue('Backend team')
  })

  it('refuses to save above 200,000 characters without a permanent counter', async () => {
    const { userEvent } = renderWithProviders(
      <SkillPresetEditorForm
        organizationId="organization-1"
        initialValues={{
          ...toSkillPresetFormValues(),
          name: 'Runbooks',
          customSkills: Array.from({ length: 4 }, (_, index) => ({
            skillName: `runbook-${index}`,
            description: 'Runbook. Use when on call.',
            content: 'y'.repeat(60000),
          })),
        }}
        presets={[]}
        assignees={assignees}
      />
    )

    expect(screen.queryByTestId('total-text-counter')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Create preset' }))
    expect(mockCreateSkillPreset).not.toHaveBeenCalled()
    expect(screen.getByTestId('total-text-error')).toHaveTextContent(
      'This preset holds 240,104 characters of text, over the 200,000 a model can review.'
    )
    expect(screen.queryByText(/needs? a change/)).not.toBeInTheDocument()
  })

  it('blocks a 51st skill with a toast and no permanent counter', async () => {
    const { userEvent } = renderWithProviders(
      <SkillPresetEditorForm
        organizationId="organization-1"
        initialValues={{
          ...toSkillPresetFormValues(),
          name: 'Full preset',
          customSkills: Array.from({ length: 50 }, (_, index) => ({
            skillName: `skill-${index}`,
            description: 'Before releasing.',
            content: 'Run checks.',
          })),
        }}
        presets={[]}
        assignees={assignees}
      />
    )
    expect(screen.queryByText(/of 50 skill changes used/)).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Add skill', exact: true }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'New skill' }))
    expect(toast).toHaveBeenCalledWith('warning', 'Skill limit reached', expect.any(String))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Remove skill-49', exact: true }))
    await userEvent.click(screen.getByRole('button', { name: 'Add skill', exact: true }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'New skill' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('adds, edits, cancels and removes a skill through the modal', async () => {
    const { userEvent } = renderEditor()
    await userEvent.click(screen.getByRole('button', { name: 'Add skill', exact: true }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'New skill' }))
    let dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('button', { name: 'Add skill' })).toBeDisabled()
    await userEvent.type(within(dialog).getByLabelText('Skill name'), 'release-checklist')
    await userEvent.type(within(dialog).getByLabelText('When should agents use it?'), 'Before releasing.')
    await userEvent.type(within(dialog).getByLabelText('Content'), 'Run checks.')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Add skill' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('release-checklist')).toBeInTheDocument()
    expect(mockCreateSkillPreset).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Edit release-checklist' }))
    dialog = await screen.findByRole('dialog')
    await userEvent.clear(within(dialog).getByLabelText('Skill name'))
    await userEvent.type(within(dialog).getByLabelText('Skill name'), 'discarded-name')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(screen.getByText('release-checklist')).toBeInTheDocument()
    expect(screen.queryByText('discarded-name')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Edit release-checklist' }))
    dialog = await screen.findByRole('dialog')
    await userEvent.clear(within(dialog).getByLabelText('Skill name'))
    await userEvent.type(within(dialog).getByLabelText('Skill name'), 'release-checks')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Apply changes' }))
    expect(screen.getByText('release-checks')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Remove release-checks' }))
    expect(screen.getByText(/No skills of your own yet/)).toBeInTheDocument()
  })

  it('copies a skill from another preset through the library', async () => {
    mockCreateSkillPreset.mockResolvedValue(savedPreset)
    const other = {
      ...savedPreset,
      id: 'preset-2',
      name: 'Ops team',
      skills: [
        { skill_name: 'runbook-a', mode: 'ADD' as const, description: 'Runbook. Use when on call.', content: 'Steps.' },
      ],
    }
    const { userEvent } = renderWithProviders(
      <SkillPresetEditorForm
        organizationId="organization-1"
        initialValues={{ ...toSkillPresetFormValues(), name: 'Backend team', organizationDefault: true }}
        presets={[other]}
        assignees={assignees}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Add skill', exact: true }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Add from library' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).queryByRole('heading', { name: 'Qovery skills' })).not.toBeInTheDocument()
    expect(within(dialog).queryByRole('checkbox', { name: /Add qovery/ })).not.toBeInTheDocument()
    await userEvent.click(within(dialog).getByRole('checkbox', { name: 'Add runbook-a from Ops team' }))
    await userEvent.click(within(dialog).getByRole('button', { name: 'Add skill' }))

    await userEvent.click(screen.getByRole('button', { name: 'Create preset' }))
    expect(mockCreateSkillPreset.mock.calls[0][0].body.skills).toContainEqual({
      skill_name: 'runbook-a',
      mode: 'ADD',
      description: 'Runbook. Use when on call.',
      content: 'Steps.',
    })
  })

  it('focuses the first Markdown field that needs a change', async () => {
    const { userEvent } = renderEditor()
    const row = screen.getByTestId('qovery-skill-qovery-deploy')
    await userEvent.click(within(row).getByRole('radio', { name: 'Add instructions' }))

    await userEvent.click(screen.getByRole('button', { name: 'Create preset' }))

    expect(screen.getByRole('textbox', { name: 'Team instructions for qovery-deploy' })).toHaveFocus()
  })

  it('drops the errors of fields a Qovery skill no longer shows', async () => {
    const { userEvent } = renderEditor()
    const row = screen.getByTestId('qovery-skill-qovery-deploy')
    await userEvent.click(within(row).getByRole('radio', { name: 'Replace' }))
    await userEvent.click(screen.getByRole('button', { name: 'Create preset' }))
    expect(within(row).getByText('Needs a change')).toBeInTheDocument()
    expect(screen.getByText(/fields? needs? a change/)).toBeInTheDocument()

    await userEvent.click(within(row).getByRole('radio', { name: 'As is' }))

    expect(within(row).queryByText('Needs a change')).not.toBeInTheDocument()
    expect(screen.queryByText(/fields? needs? a change/)).not.toBeInTheDocument()
    expect(mockCreateSkillPreset).not.toHaveBeenCalled()
  })

  it('turns several Qovery skills off at once', async () => {
    mockCreateSkillPreset.mockResolvedValue(savedPreset)
    const { userEvent } = renderEditor()
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select qovery-optimize' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select qovery-speedup' }))
    const bulk = screen.getByRole('group', { name: 'Change the selected skills' })
    expect(bulk).toHaveTextContent('2 selected')
    await userEvent.click(within(bulk).getByRole('button', { name: 'Disable' }))

    await userEvent.click(screen.getByRole('button', { name: 'Create preset' }))
    const skills = mockCreateSkillPreset.mock.calls[0][0].body.skills
    expect(skills).toContainEqual({ skill_name: 'qovery-optimize', mode: 'DISABLE' })
    expect(skills).toContainEqual({ skill_name: 'qovery-speedup', mode: 'DISABLE' })
  })

  it('does not offer the Owner role as a target', async () => {
    const { userEvent } = renderWithProviders(
      <SkillPresetEditorForm
        organizationId="organization-1"
        initialValues={{ ...toSkillPresetFormValues(), name: 'Backend team' }}
        presets={[]}
        assignees={{ ...assignees, roles: [{ id: 'role-owner', name: 'Owner' }, ...assignees.roles] }}
      />
    )
    await userEvent.click(screen.getByLabelText('Roles'))
    expect(await screen.findByRole('option', { name: 'Devops' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Owner' })).not.toBeInTheDocument()
  })
})

describe('SkillPresetEditor', () => {
  it('keeps the draft when a background refetch of the preset fails', async () => {
    jest.mocked(useParams).mockReturnValue({ organizationId: 'organization-1', skillPresetId: 'preset-1' })
    mockUseSkillPresets.mockReturnValue({ data: [savedPreset], isLoading: false })
    mockUseSkillPreset.mockReturnValue({ data: savedPreset, isLoading: false, error: null })
    // react-query keeps the cached preset next to the error of a failed refetch.
    function WithFailedRefetch() {
      const [, setFailed] = useState(false)
      const failRefetch = () => {
        mockUseSkillPreset.mockReturnValue({
          data: savedPreset,
          isLoading: false,
          error: buildSkillPresetApiError(500, 'Internal error'),
        })
        setFailed(true)
      }
      return (
        <>
          <button type="button" onClick={failRefetch}>
            Fail refetch
          </button>
          <SkillPresetEditor />
        </>
      )
    }
    const { userEvent } = renderWithProviders(<WithFailedRefetch />)
    await userEvent.type(screen.getByLabelText('Description (optional)'), 'Unsaved draft')

    await userEvent.click(screen.getByRole('button', { name: 'Fail refetch' }))

    expect(screen.queryByText('This preset could not be loaded')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Description (optional)')).toHaveValue('Unsaved draft')
  })

  it('shows an error when the preset cannot be loaded at all', () => {
    jest.mocked(useParams).mockReturnValue({ organizationId: 'organization-1', skillPresetId: 'preset-1' })
    mockUseSkillPresets.mockReturnValue({ data: [], isLoading: false })
    mockUseSkillPreset.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: buildSkillPresetApiError(404, 'Not found'),
    })
    renderWithProviders(<SkillPresetEditor />)

    expect(screen.getByText('This preset could not be loaded')).toBeInTheDocument()
    expect(screen.queryByLabelText('Description (optional)')).not.toBeInTheDocument()
  })

  it('offers a retry instead of a blank form when the preset to duplicate cannot be loaded', async () => {
    const refetch = jest.fn()
    jest.mocked(useSearch).mockReturnValue({ from: 'preset-1' })
    mockUseSkillPreset.mockReturnValue({ data: undefined, isLoading: false, error: null })
    mockUseSkillPresets.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: buildSkillPresetApiError(500, 'Internal error'),
      refetch,
    })
    const { userEvent } = renderWithProviders(<SkillPresetEditor />)

    expect(screen.getByText('The preset to copy could not be loaded')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Create preset' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(refetch).toHaveBeenCalled()
  })

  it('says the preset to duplicate was not found when it was deleted', () => {
    jest.mocked(useSearch).mockReturnValue({ from: 'deleted-preset' })
    mockUseSkillPreset.mockReturnValue({ data: undefined, isLoading: false, error: null })
    mockUseSkillPresets.mockReturnValue({ data: [savedPreset], isLoading: false, error: null })
    renderWithProviders(<SkillPresetEditor />)

    expect(screen.getByText('The preset to copy was not found')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Create preset' })).not.toBeInTheDocument()
  })

  it('opens a copy of the preset to duplicate, without its assignments', () => {
    jest.mocked(useSearch).mockReturnValue({ from: 'preset-1' })
    mockUseSkillPreset.mockReturnValue({ data: undefined, isLoading: false, error: null })
    mockUseSkillPresets.mockReturnValue({ data: [savedPreset], isLoading: false, error: null })
    renderWithProviders(<SkillPresetEditor />)

    expect(screen.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue('Backend team (copy)')
    expect(
      screen.getByText('Copied from Backend team, without its assignments. Everything below is editable.')
    ).toBeInTheDocument()
  })
})
