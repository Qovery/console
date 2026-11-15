import { useMemo, useState } from 'react'
import { type SkillPresetBase } from '@qovery/domains/skill-presets/data-access'
import { Button, Checkbox, Heading, InputSearch, Section } from '@qovery/shared/ui'

export interface LibrarySkill {
  /** Unique across groups: the same name can exist in two presets. */
  id: string
  group: 'qovery' | 'organization' | 'template'
  skillName: string
  description: string
  content: string
  /** Where it comes from, for example the preset or template name. */
  origin: string
}

export interface SkillLibraryModalProps {
  skills: LibrarySkill[]
  base: SkillPresetBase
  presentSkillNames: string[]
  onAdd: (skills: LibrarySkill[]) => void
  onClose: () => void
}

const GROUPS: { value: LibrarySkill['group']; title: string; hint: string }[] = [
  { value: 'qovery', title: 'Qovery skills', hint: 'Turns a disabled Qovery skill back on.' },
  { value: 'organization', title: "Your organization's skills", hint: 'Copied from your other presets.' },
  { value: 'template', title: 'Template skills', hint: 'Copied from the Qovery templates.' },
]

export function SkillLibraryModal({ skills, base, presentSkillNames, onAdd, onClose }: SkillLibraryModalProps) {
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

  const isUnavailable = (skill: LibrarySkill) =>
    presentSkillNames.includes(skill.skillName) || (skill.group === 'qovery' && base !== 'QOVERY_FULL')

  const unavailableReason = (skill: LibrarySkill) =>
    skill.group === 'qovery' && base !== 'QOVERY_FULL'
      ? 'Needs the Full base'
      : presentSkillNames.includes(skill.skillName)
        ? 'Already in this preset'
        : null

  // One name per preset: picking two skills with the same name would be refused on save.
  const toggle = (skill: LibrarySkill, checked: boolean) =>
    setSelected((current) => {
      const withoutSameName = current.filter(
        (id) => skills.find((item) => item.id === id)?.skillName !== skill.skillName
      )
      return checked ? [...withoutSameName, skill.id] : withoutSameName
    })

  return (
    <Section className="flex max-h-[80vh] flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <Heading className="text-2xl">Add skills</Heading>
        <p className="text-sm text-neutral-subtle">
          Pick several skills at once. Copies are independent: editing them here doesn't change the original.
        </p>
      </div>
      <InputSearch placeholder="Search skills" value={search} onChange={setSearch} ariaLabel="Search skills" />
      <div className="-mx-6 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6">
        {GROUPS.map((group) => {
          const groupSkills = filtered.filter((skill) => skill.group === group.value)
          if (groupSkills.length === 0) return null
          return (
            <section key={group.value} aria-labelledby={`library-${group.value}`} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <Heading level={3} id={`library-${group.value}`}>
                  {group.title}
                </Heading>
                <span className="text-xs text-neutral-subtle">{group.hint}</span>
              </div>
              <ul className="divide-y divide-neutral rounded-md border border-neutral">
                {groupSkills.map((skill) => {
                  const reason = unavailableReason(skill)
                  return (
                    <li key={skill.id}>
                      <label
                        className={`flex gap-3 p-3 ${isUnavailable(skill) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-surface-neutral-subtle'}`}
                      >
                        <Checkbox
                          className="mt-0.5"
                          checked={selected.includes(skill.id)}
                          disabled={isUnavailable(skill)}
                          onCheckedChange={(checked) => toggle(skill, checked === true)}
                          aria-label={`Add ${skill.skillName} from ${skill.origin}`}
                        />
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="flex items-center gap-2">
                            <span className="font-code text-sm font-medium text-neutral">{skill.skillName}</span>
                            <span className="truncate text-xs text-neutral-subtle">{skill.origin}</span>
                          </span>
                          <span className="text-xs text-neutral-subtle">{skill.description}</span>
                          {reason && <span className="text-xs font-medium text-neutral">{reason}</span>}
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
        {filtered.length === 0 && <p className="text-sm text-neutral-subtle">No skill matches "{search}".</p>}
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" size="lg" variant="plain" color="neutral" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          size="lg"
          disabled={selected.length === 0}
          onClick={() => onAdd(skills.filter(({ id }) => selected.includes(id)))}
        >
          {selected.length > 1 ? `Add ${selected.length} skills` : 'Add skill'}
        </Button>
      </div>
    </Section>
  )
}
