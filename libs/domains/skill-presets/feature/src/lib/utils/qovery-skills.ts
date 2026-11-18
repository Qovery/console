import { type IconName } from '@fortawesome/fontawesome-common-types'
import { type SkillPresetBase } from '@qovery/domains/skill-presets/data-access'

/**
 * The Qovery skills a preset can adjust on the Full base. q-core keeps no list (it only enforces the
 * `qovery` prefix), so a skill shipped later still shows up in the editor when a preset mentions it.
 */
export const QOVERY_SKILLS: { name: string; description: string }[] = [
  { name: 'qovery', description: 'Routes Qovery requests and runs quick operations: status, logs, restart.' },
  { name: 'qovery-deploy', description: 'Deploys an app, a database or a Helm chart, and creates what is missing.' },
  { name: 'qovery-troubleshoot', description: 'Diagnoses failing deployments, crashes and stuck environments.' },
  { name: 'qovery-optimize', description: 'Finds savings: right-sizing, autoscaling, spot instances, schedules.' },
  { name: 'qovery-speedup', description: 'Finds what slows deployments down and proposes fixes.' },
  { name: 'qovery-preview', description: 'Creates a preview environment for each pull request.' },
  { name: 'qovery-terraform', description: 'Turns an existing Qovery setup into Terraform.' },
  { name: 'qovery-policy-token', description: 'Creates a least-privilege policy token for an agent.' },
  { name: 'qovery-signup', description: 'Creates a Qovery account and organization from the terminal.' },
  { name: 'qovery-onboard', description: 'Guides a new user through cluster and environment setup.' },
  { name: 'qovery-assess', description: 'Reviews an organization against production best practices.' },
  {
    name: 'qovery-support',
    description: 'Answers common Qovery, Kubernetes and AWS questions with the fixes that worked.',
  },
]

export const qoverySkillDescription = (skillName: string) =>
  QOVERY_SKILLS.find(({ name }) => name === skillName)?.description ?? 'A Qovery skill.'

export const SKILL_PRESET_BASES: {
  value: SkillPresetBase
  title: string
  description: string
  weight: string
  icon: IconName
}[] = [
  {
    value: 'FULL',
    title: 'Full Qovery skills',
    description: 'Every Qovery skill, with step-by-step guides. Best for teams new to Qovery.',
    weight: 'Heaviest. Each skill loads only when a task needs it.',
    icon: 'layer-group',
  },
  {
    value: 'LEAN',
    title: 'Lean (CLI-first)',
    description: 'One short skill: use the qovery CLI and read its --help. For teams that know Kubernetes.',
    weight: 'Light. One short skill.',
    icon: 'terminal',
  },
  {
    value: 'NONE',
    title: 'None',
    description: 'No Qovery skill. Agents only get your team context and your own skills.',
    weight: 'Only what you write.',
    icon: 'circle-dashed',
  },
]

export const baseLabel = (base: SkillPresetBase) =>
  SKILL_PRESET_BASES.find(({ value }) => value === base)?.title ?? base
