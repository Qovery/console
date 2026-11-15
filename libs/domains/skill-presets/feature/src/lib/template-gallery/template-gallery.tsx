import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import { Heading, Icon, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useSkillPresets } from '../hooks/use-skill-presets/use-skill-presets'
import { MockScenarioBanner } from '../mock-scenario-banner/mock-scenario-banner'
import { SkillPresetEditor } from '../skill-preset-editor/skill-preset-editor'
import { SkillPresetsAdminOnly } from '../skill-presets-layout/skill-presets-layout'
import { baseLabel } from '../utils/qovery-skills'
import { SKILL_PRESET_TEMPLATES } from '../utils/skill-preset-templates'

function TemplateOption({
  title,
  summary,
  meta,
  icon,
  onSelect,
}: {
  title: string
  summary: string
  meta: ReactNode
  icon: ReactNode
  onSelect: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className="flex h-full w-full items-start gap-3 rounded-md border border-neutral bg-surface-neutral p-3 text-left transition-colors hover:border-brand-strong hover:bg-surface-neutral-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-strong"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-surface-neutral-component text-neutral-subtle">
          {icon}
        </span>
        <span className="flex min-w-0 flex-col gap-1">
          <span className="text-sm font-medium text-neutral">{title}</span>
          <span className="text-xs text-neutral-subtle">{summary}</span>
          <span className="text-xs text-neutral">{meta}</span>
        </span>
      </button>
    </li>
  )
}

/** First step of "Create preset": blank, a Qovery template by profile, or one of the organization's own. */
export function TemplateGallery() {
  const { organizationId = '' } = useParams({ strict: false })
  const navigate = useNavigate()
  const { data: organizationTemplates = [] } = useSkillPresets({ organizationId, isTemplate: true })

  useDocumentTitle('Create skill preset - Organization settings')

  const open = (search: { template?: string; from?: string }) =>
    navigate({ to: '/organization/$organizationId/settings/skill-presets/new', params: { organizationId }, search })

  return (
    <Section className="flex flex-col gap-6 px-8 pb-8 pt-6">
      <div className="flex flex-col gap-3">
        <Link
          to="/organization/$organizationId/settings/skill-presets"
          params={{ organizationId }}
          className="flex w-fit items-center gap-1.5 text-sm text-neutral-subtle hover:text-neutral"
        >
          <Icon iconName="arrow-left" iconStyle="regular" />
          Skill presets
        </Link>
        <Heading>Create preset</Heading>
        <p className="max-w-2xl text-sm text-neutral-subtle">
          Start from a profile and adjust it, or start blank. A template only fills the editor: nothing is assigned
          until you choose who receives the preset.
        </p>
      </div>

      <MockScenarioBanner />

      <section aria-labelledby="gallery-qovery" className="flex flex-col gap-3">
        <Heading level={2} id="gallery-qovery">
          Qovery templates
        </Heading>
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <TemplateOption
            title="Blank preset"
            summary="Full Qovery skills, nothing changed. Build it yourself."
            meta="Full Qovery skills"
            icon={<Icon iconName="file" iconStyle="regular" />}
            onSelect={() => open({ template: 'blank' })}
          />
          {SKILL_PRESET_TEMPLATES.map((template) => {
            const ownSkills = template.preset.skills.filter(({ mode }) => mode === 'ADD').length
            const off = template.preset.skills.filter(({ mode }) => mode === 'DISABLE').length
            return (
              <TemplateOption
                key={template.id}
                title={template.title}
                summary={template.summary}
                meta={[
                  baseLabel(template.preset.base),
                  off > 0 && `${off} off`,
                  ownSkills > 0 && `${ownSkills} own ${ownSkills === 1 ? 'skill' : 'skills'}`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
                icon={<Icon iconName={template.icon} iconStyle="regular" />}
                onSelect={() => open({ template: template.id })}
              />
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="gallery-organization" className="flex flex-col gap-3">
        <Heading level={2} id="gallery-organization">
          Your templates
        </Heading>
        {organizationTemplates.length === 0 ? (
          <p className="text-sm text-neutral-subtle">
            None yet. Use “Save as template” on any preset to reuse it here.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {organizationTemplates.map((preset) => (
              <TemplateOption
                key={preset.id}
                title={preset.name}
                summary={preset.description || 'No description.'}
                meta={`${baseLabel(preset.base)} · ${preset.skills.length} skill changes`}
                icon={<Icon iconName="bookmark" iconStyle="regular" />}
                onSelect={() => open({ from: preset.id })}
              />
            ))}
          </ul>
        )}
      </section>
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
