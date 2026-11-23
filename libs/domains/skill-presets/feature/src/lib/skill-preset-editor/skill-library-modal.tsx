import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Checkbox, Heading, InputSearch, ModalCrud, Section } from '@qovery/shared/ui'

export interface LibrarySkill {
  /** Unique across groups: the same name can exist in two presets. */
  id: string
  group: 'organization' | 'template'
  skillName: string
  description: string
  content: string
  /** Where it comes from, for example the preset or template name. */
  origin: string
}

export interface SkillLibraryModalProps {
  skills: LibrarySkill[]
  presentSkillNames: string[]
  onAdd: (skills: LibrarySkill[]) => void
  onClose: () => void
}

const GROUPS: { value: LibrarySkill['group']; title: string }[] = [
  { value: 'organization', title: "Your organization's skills" },
  { value: 'template', title: 'Template skills' },
]

export function SkillLibraryModal({ skills, presentSkillNames, onAdd, onClose }: SkillLibraryModalProps) {
  const methods = useForm()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return skills.filter(
      (skill) =>
        !query ||
        skill.skillName.includes(query) ||
        skill.description.toLowerCase().includes(query) ||
        skill.origin.toLowerCase().includes(query)
    )
  }, [skills, search])

  const unavailableReason = (skill: LibrarySkill) =>
    presentSkillNames.includes(skill.skillName) ? 'Already in this preset' : null

  // One name per preset: picking two skills with the same name would be refused on save.
  const toggle = (skill: LibrarySkill, checked: boolean) =>
    setSelected((current) => {
      const withoutSameName = current.filter(
        (id) => skills.find((item) => item.id === id)?.skillName !== skill.skillName
      )
      return checked ? [...withoutSameName, skill.id] : withoutSameName
    })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Add skills"
        description="Pick several skills at once. Copies are independent: editing them here doesn’t change the original."
        submitLabel={selected.length > 1 ? `Add ${selected.length} skills` : 'Add skill'}
        submitDisabled={selected.length === 0}
        onClose={onClose}
        onSubmit={methods.handleSubmit(() => onAdd(skills.filter(({ id }) => selected.includes(id))))}
      >
        <div className="flex flex-col gap-4">
          {/* Enter in the search field would submit the modal and add the selection without a click on Add. */}
          <div
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.preventDefault()
            }}
          >
            <InputSearch placeholder="Search skills" value={search} onChange={setSearch} ariaLabel="Search skills" />
          </div>
          <div className="flex max-h-[55vh] flex-col gap-4 overflow-y-auto">
            {GROUPS.map((group) => {
              const groupSkills = filtered.filter((skill) => skill.group === group.value)
              if (groupSkills.length === 0) return null
              return (
                <Section key={group.value} aria-labelledby={`library-${group.value}`} className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between">
                    <Heading level={3} id={`library-${group.value}`}>
                      {group.title}
                    </Heading>
                  </div>
                  <ul className="divide-y divide-neutral overflow-hidden rounded-md border border-neutral">
                    {groupSkills.map((skill) => {
                      const reason = unavailableReason(skill)
                      return (
                        <li key={skill.id}>
                          <label
                            className={clsx(
                              'flex gap-3 p-3',
                              reason
                                ? 'cursor-not-allowed opacity-60'
                                : 'cursor-pointer hover:bg-surface-neutral-subtle'
                            )}
                          >
                            <Checkbox
                              className="mt-0.5"
                              checked={selected.includes(skill.id)}
                              disabled={Boolean(reason)}
                              onCheckedChange={(checked) => toggle(skill, checked === true)}
                              aria-label={`Add ${skill.skillName} from ${skill.origin}`}
                            />
                            <span className="flex min-w-0 flex-1 flex-col gap-0.5 break-words">
                              <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                                <span className="min-w-0 text-sm font-normal text-neutral">{skill.skillName}</span>
                              </span>
                              <span className="text-xs text-neutral-subtle">{skill.description}</span>
                              {reason && <span className="text-xs font-medium text-neutral">{reason}</span>}
                            </span>
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                </Section>
              )
            })}
            {filtered.length === 0 && <p className="text-sm text-neutral-subtle">No skill matches “{search}”.</p>}
          </div>
        </div>
      </ModalCrud>
    </FormProvider>
  )
}
