import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import { Heading, Icon, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { SkillPresetEditor } from '../skill-preset-editor/skill-preset-editor'
import { SkillPresetsAdminOnly } from '../skill-presets-layout/skill-presets-layout'
import { SKILL_PRESET_TEMPLATES } from '../utils/skill-preset-templates'

function TemplateOption({
  title,
  summary,
  icon,
  onSelect,
}: {
  title: string
  summary: string
  icon: ReactNode
  onSelect: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className="flex h-full w-full items-start gap-3 rounded-md border border-neutral bg-surface-neutral p-3 text-left transition-colors hover:border-neutral-component hover:bg-surface-neutral-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-strong"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-surface-neutral-component text-neutral-subtle">
          {icon}
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-ssm font-medium text-neutral">{title}</span>
          <span className="text-ssm text-neutral-subtle">{summary}</span>
        </span>
      </button>
    </li>
  )
}

/** First step of "Create preset": blank, or a Qovery template by profile. */
export function TemplateGallery() {
  const { organizationId = '' } = useParams({ strict: false })
  const navigate = useNavigate()

  useDocumentTitle('Create preset - Skills registry - Agents')

  const open = (search: { template?: string; from?: string }) =>
    navigate({
      to: '/organization/$organizationId/agent-experience/skill-presets/new',
      params: { organizationId },
      search,
    })

  return (
    <Section className="flex flex-col gap-6 px-8 pb-8 pt-6">
      <div className="flex flex-col gap-3">
        <Link
          to="/organization/$organizationId/agent-experience/skill-presets"
          params={{ organizationId }}
          className="flex w-fit items-center gap-1.5 text-sm text-neutral-subtle hover:text-neutral"
        >
          <Icon iconName="arrow-left" iconStyle="regular" />
          Skills registry
        </Link>
        <Heading>Create preset</Heading>
        <p className="max-w-2xl text-sm text-neutral-subtle">
          Start from a profile and adjust it, or start blank. A template only fills the editor: nothing is assigned
          until you choose who receives the preset.
        </p>
      </div>

      <Section aria-labelledby="gallery-qovery" className="gap-3">
        <Heading id="gallery-qovery">Qovery templates</Heading>
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <TemplateOption
            title="Blank preset"
            summary="Full Qovery skills, nothing changed. Build it yourself."
            icon={<Icon iconName="file" iconStyle="regular" />}
            onSelect={() => open({ template: 'blank' })}
          />
          {SKILL_PRESET_TEMPLATES.map((template) => (
            <TemplateOption
              key={template.id}
              title={template.title}
              summary={template.summary}
              icon={<Icon iconName={template.icon} iconStyle="regular" />}
              onSelect={() => open({ template: template.id })}
            />
          ))}
        </ul>
      </Section>
    </Section>
  )
}

/** `/new`: the gallery first, then the editor once a starting point is chosen. */
function SkillPresetCreatePage() {
  const search = useSearch({ strict: false }) as { template?: string; from?: string }
  return search.template || search.from ? <SkillPresetEditor /> : <TemplateGallery />
}

/** Owners and admins only: anyone else sees what their own agent receives. */
export function SkillPresetCreate() {
  return (
    <SkillPresetsAdminOnly>
      <SkillPresetCreatePage />
    </SkillPresetsAdminOnly>
  )
}
