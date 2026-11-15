import { useParams } from '@tanstack/react-router'
import { type ReactNode, useState } from 'react'
import { buildSkillPresetApiError } from '@qovery/domains/skill-presets/data-access'
import { renderWithProviders, screen, within } from '@qovery/shared/util-tests'
import { toSkillPresetFormValues } from '../utils/skill-preset-form'
import { SkillPresetEditorForm } from './skill-preset-editor'

const mockCreateSkillPreset = jest.fn()
const mockEditSkillPreset = jest.fn()
const mockUseBlocker = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: jest.fn(),
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
  base: 'QOVERY_FULL' as const,
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
})

describe('SkillPresetEditorForm', () => {
  beforeEach(() => {
    mockCreateSkillPreset.mockReset()
    mockEditSkillPreset.mockReset()
    mockUseBlocker.mockReset()
  })

  it('lists the Qovery skills on the Full base and hides them on the Lean base', async () => {
    const { userEvent } = renderEditor()

    expect(screen.getByTestId('qovery-skill-qovery-deploy')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('radio', { name: 'Lean (CLI-first)' }))

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
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled()

    await userEvent.type(screen.getByLabelText('Description (optional)'), 'For backend engineers')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(mockEditSkillPreset).toHaveBeenCalledWith(
      expect.objectContaining({
        skillPresetId: 'preset-1',
        body: expect.objectContaining({ description: 'For backend engineers' }),
      })
    )
    expect(await screen.findByText('Revision 4')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled()
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

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText('This preset was changed by someone else')).toBeInTheDocument()
    expect(screen.queryByText('Not saved: a target already receives another preset')).not.toBeInTheDocument()
  })

  it('shows the review in progress and sends a double click once', async () => {
    let finish: (value: unknown) => void = () => undefined
    mockEditSkillPreset.mockReturnValue(new Promise((resolve) => (finish = resolve)))
    const { userEvent } = renderEdit()
    await userEvent.type(screen.getByLabelText('Description (optional)'), 'x')
    const save = screen.getByRole('button', { name: 'Save changes' })

    await userEvent.dblClick(save)

    const checking = await screen.findByRole('button', { name: /Checking for security…/ })
    expect(checking).toBeDisabled()
    expect(mockEditSkillPreset).toHaveBeenCalledTimes(1)
    expect(screen.getByLabelText('Description (optional)')).toHaveValue('x')
    finish({ ...savedPreset, description: 'x', revision: 4 })
    expect(await screen.findByText('Revision 4')).toBeInTheDocument()
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

  it('counts all the text and refuses to save above 200,000 characters', async () => {
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

    expect(screen.getByTestId('total-text-counter')).toHaveTextContent('240,104 / 200,000 characters')
    expect(screen.getByTestId('total-text-counter')).toHaveTextContent('over the limit a model can review')
    await userEvent.click(screen.getByRole('button', { name: 'Create preset' }))
    expect(mockCreateSkillPreset).not.toHaveBeenCalled()
  })
})
