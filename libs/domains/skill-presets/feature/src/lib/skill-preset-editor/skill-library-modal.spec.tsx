import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { SkillLibraryModal } from './skill-library-modal'

const skills = [
  {
    id: 'preset:preset-2:runbook-a',
    group: 'organization' as const,
    skillName: 'runbook-a',
    description: 'Runbook. Use when on call.',
    content: 'Steps.',
    origin: 'Ops team',
  },
]

describe('SkillLibraryModal', () => {
  it('does not add the selection when Enter is pressed in the search field', async () => {
    const onAdd = jest.fn()
    const { userEvent } = renderWithProviders(
      <SkillLibraryModal skills={skills} presentSkillNames={[]} onAdd={onAdd} onClose={jest.fn()} />
    )
    await userEvent.click(screen.getByRole('checkbox', { name: 'Add runbook-a from Ops team' }))

    await userEvent.type(screen.getByLabelText('Search skills'), 'runbook{Enter}')

    expect(onAdd).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Add skill' }))
    expect(onAdd).toHaveBeenCalledWith(skills)
  })
})
