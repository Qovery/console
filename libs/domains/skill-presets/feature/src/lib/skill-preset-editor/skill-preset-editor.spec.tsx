import { useParams } from '@tanstack/react-router'
import { buildSkillPresetApiError } from '@qovery/domains/skill-presets/data-access'
import { renderWithProviders, screen, within } from '@qovery/shared/util-tests'
import { toSkillPresetFormValues } from '../utils/skill-preset-form'
import { SkillPresetEditorForm } from './skill-preset-editor'

const mockCreateSkillPreset = jest.fn()

jest.mock('../hooks/use-create-skill-preset/use-create-skill-preset', () => ({
  useCreateSkillPreset: () => ({ mutateAsync: mockCreateSkillPreset, isLoading: false }),
}))
jest.mock('../hooks/use-edit-skill-preset/use-edit-skill-preset', () => ({
  useEditSkillPreset: () => ({ mutateAsync: jest.fn(), isLoading: false }),
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

const renderEditor = (initialName = 'Backend team') =>
  renderWithProviders(
    <SkillPresetEditorForm
      organizationId="organization-1"
      initialValues={{ ...toSkillPresetFormValues(), name: initialName, organizationDefault: true }}
      presets={[]}
      assignees={assignees}
    />
  )

beforeEach(() => {
  jest.mocked(useParams).mockReturnValue({ organizationId: 'organization-1' })
})

describe('SkillPresetEditorForm', () => {
  beforeEach(() => {
    mockCreateSkillPreset.mockReset()
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
})
