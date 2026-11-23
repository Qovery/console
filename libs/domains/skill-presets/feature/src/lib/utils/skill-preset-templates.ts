import { type IconName } from '@fortawesome/fontawesome-common-types'
import { type SkillPresetBase, type SkillPresetSkill } from '@qovery/domains/skill-presets/data-access'

export interface SkillPresetTemplate {
  id: string
  title: string
  summary: string
  /** Who it usually suits. A hint only: picking a template never assigns it. */
  assignmentHint: string
  icon: IconName
  preset: {
    name: string
    description: string
    base: SkillPresetBase
    team_context: string
    skills: SkillPresetSkill[]
  }
}

const off = (...names: string[]): SkillPresetSkill[] => names.map((skill_name) => ({ skill_name, mode: 'DISABLE' }))

/**
 * Starting points by profile, maintained by Qovery. Everything is editable once picked. The text must
 * pass q-core's content inspector: no links outside qovery.com, no secret or upload commands.
 */
export const SKILL_PRESET_TEMPLATES: SkillPresetTemplate[] = [
  {
    id: 'developer',
    title: 'Developer',
    summary: 'Deploy, troubleshoot and preview. Non-production first.',
    assignmentHint: 'Suggested for: your engineers, as the organization default',
    icon: 'code',
    preset: {
      name: 'Developers',
      description: 'Day-to-day deploys and debugging, non-production first.',
      base: 'FULL',
      team_context: `## Our setup

- Production environments: <list them, for example api-prod>
- Staging environments: <list them>
- Deploys to production go through: <your pipeline or review process>`,
      skills: [
        {
          skill_name: 'qovery-deploy',
          mode: 'OVERLAY',
          content: `Deploy to a non-production environment first and check that it works.
Only deploy to production when the user asks for it explicitly, and confirm the environment name with them first.`,
        },
        {
          skill_name: 'qovery-support',
          mode: 'OVERLAY',
          content: `Check the known fixes before opening a ticket. Try a fix on a non-production environment first.
For production, explain the fix and let the user apply it, or ask the platform team.`,
        },
        ...off('qovery-assess', 'qovery-terraform', 'qovery-policy-token', 'qovery-signup', 'qovery-onboard'),
      ],
    },
  },
  {
    id: 'product-manager',
    title: 'Product manager',
    summary: 'Read-only: status, logs and preview links to review work.',
    assignmentHint: 'Suggested for: product and design roles',
    icon: 'clipboard-list',
    preset: {
      name: 'Product managers',
      description: 'Check status, read logs and open previews. No changes to environments.',
      base: 'LEAN',
      team_context: `You help a product manager follow the work. Stay read-only: show status, logs and links.
Never deploy, stop, delete or change settings. If the user asks for a change, explain who can make it.`,
      skills: [
        {
          skill_name: 'preview-for-review',
          mode: 'ADD',
          description:
            'Finds the preview environment of a pull request and shares its link. Use when asked to review a change.',
          content: `1. Ask for the pull request number or branch if the user did not give it.
2. List the environments of the project and find the preview named after that pull request.
3. Share its status and its public link. If it is stopped or failed, say so and suggest asking the author.`,
        },
      ],
    },
  },
  {
    id: 'platform-engineer',
    title: 'DevOps / platform engineer',
    summary: 'Every Qovery skill, with your Terraform and cost rules.',
    assignmentHint: 'Suggested for: the Devops role',
    icon: 'server',
    preset: {
      name: 'Platform engineers',
      description: 'All Qovery skills, plus our infrastructure-as-code and cost rules.',
      base: 'FULL',
      team_context: `## Our infrastructure

- Clusters: <list them and what runs on each>
- Terraform state lives in: <repository or backend>
- Cost owner: <team or channel to tell before scaling up>`,
      skills: [
        {
          skill_name: 'qovery-terraform',
          mode: 'OVERLAY',
          content: `Changes to clusters and environments go through Terraform. Generate the code, open a pull request and let the user review the plan.
Never apply a plan yourself.`,
        },
        {
          skill_name: 'qovery-optimize',
          mode: 'OVERLAY',
          content: `Before proposing to scale up, show the current usage and the estimated monthly cost change.
Prefer schedules and right-sizing over bigger instances.`,
        },
        {
          skill_name: 'qovery-support',
          mode: 'OVERLAY',
          content: `When the fix is a cluster change (cluster advanced settings, node pools, Kubernetes upgrade, static IP), make it through Terraform like any other change.
Changes that redeploy every service go in a maintenance window. Say so before proposing them.`,
        },
      ],
    },
  },
  {
    id: 'engineering-manager',
    title: 'Engineering manager / tech lead',
    summary: 'Assessments, cost and health reports. CLI-first.',
    assignmentHint: 'Suggested for: managers and tech leads, by member',
    icon: 'chart-line',
    preset: {
      name: 'Engineering managers',
      description: 'Health, cost and best-practice reports for planning.',
      base: 'LEAN',
      team_context: `You help an engineering manager understand the platform. Prefer summaries and tables over raw output.
Stay read-only unless the user asks for a change and confirms it.`,
      skills: [
        {
          skill_name: 'cost-report',
          mode: 'ADD',
          description:
            'Monthly cost and usage summary per project and environment. Use when asked about spend or budget.',
          content: `1. List the clusters and environments with the qovery CLI.
2. For each environment, give the running services, their size and whether they stop at night.
3. End with the three largest savings you see, each with its estimated effect. Do not change anything.`,
        },
        {
          skill_name: 'platform-assessment',
          mode: 'ADD',
          description:
            'Quick review of the organization against production best practices. Use before a planning meeting.',
          content: `Check replicas, health checks, autoscaling and backups for production services.
Report what is missing as a short list, ordered by risk. Do not fix anything yourself.`,
        },
      ],
    },
  },
  {
    id: 'data-ml-engineer',
    title: 'Data / ML engineer',
    summary: 'Deploy jobs and models, size GPU workloads.',
    assignmentHint: 'Suggested for: data and ML roles',
    icon: 'microchip',
    preset: {
      name: 'Data and ML',
      description: 'Deploy jobs and model services, and keep GPU costs in check.',
      base: 'FULL',
      team_context: `## Our setup

- GPU node pools: <names and instance types>
- Batch jobs run in: <project and environment>
- Datasets live in: <bucket or database, never copy them locally>`,
      skills: [
        {
          skill_name: 'qovery-deploy',
          mode: 'OVERLAY',
          content: `For GPU workloads, request GPUs explicitly and set a node selector for the GPU pool.
Prefer jobs with a schedule over long-running services for batch work.`,
        },
        {
          skill_name: 'qovery-optimize',
          mode: 'OVERLAY',
          content: `GPU nodes are the main cost. Check that GPU services stop when idle and that jobs scale to zero after they finish.`,
        },
        ...off('qovery-terraform', 'qovery-policy-token', 'qovery-signup', 'qovery-onboard', 'qovery-preview'),
      ],
    },
  },
  {
    id: 'security',
    title: 'Security / compliance',
    summary: 'Read-only security assessments.',
    assignmentHint: 'Suggested for: security reviewers, by member',
    icon: 'shield-check',
    preset: {
      name: 'Security reviewers',
      description: 'Read-only reviews of security risks and access configuration.',
      base: 'FULL',
      team_context: `You help a security reviewer. Stay read-only: read configuration, never change it.
When you find a risk, describe it, say where it is and how to fix it. Never print secret values, only their names.`,
      skills: [
        ...off(
          'qovery',
          'qovery-deploy',
          'qovery-preview',
          'qovery-optimize',
          'qovery-speedup',
          'qovery-terraform',
          'qovery-policy-token',
          'qovery-signup',
          'qovery-onboard'
        ),
      ],
    },
  },
  {
    id: 'qa-tester',
    title: 'QA / tester',
    summary: 'Preview environments to test pull requests.',
    assignmentHint: 'Suggested for: QA roles',
    icon: 'vial',
    preset: {
      name: 'QA',
      description: 'Create and use preview environments to test pull requests.',
      base: 'FULL',
      team_context: `You help a tester. Work in preview environments only, one per pull request.
Never change staging or production. Stop a preview when the user is done testing.`,
      skills: [
        {
          skill_name: 'qovery-preview',
          mode: 'OVERLAY',
          content: `Name previews after the pull request number. Seed them with the test data set, not a copy of production data.`,
        },
        ...off(
          'qovery',
          'qovery-deploy',
          'qovery-assess',
          'qovery-terraform',
          'qovery-policy-token',
          'qovery-optimize',
          'qovery-speedup',
          'qovery-signup',
          'qovery-onboard'
        ),
      ],
    },
  },
  {
    id: 'support-on-call',
    title: 'Support / on-call',
    summary: 'Known fixes and diagnosis first. Production changes need approval.',
    assignmentHint: 'Suggested for: on-call engineers and support, by member',
    icon: 'life-ring',
    preset: {
      name: 'On-call',
      description: 'Answer support questions and diagnose incidents with known fixes. Read first, change last.',
      base: 'FULL',
      team_context: `## Our on-call rules

- Production environments: <list them>
- Escalation: <your on-call channel or pager>, then Qovery support from the Console help button
- Changes to production need: <who approves, for example the incident lead>`,
      skills: [
        {
          skill_name: 'qovery-support',
          mode: 'OVERLAY',
          content: `Start from the exact error text and match it to a known issue before guessing.
When escalating, write the ticket for the user: Console URL, deployment ID or time window, error lines, what was tried. Never include secrets.`,
        },
        {
          skill_name: 'qovery-troubleshoot',
          mode: 'OVERLAY',
          content: `Read logs, events and status first. In production, propose the fix and wait for an explicit approval before applying it, then confirm the result.`,
        },
        ...off(
          'qovery-terraform',
          'qovery-policy-token',
          'qovery-signup',
          'qovery-onboard',
          'qovery-preview',
          'qovery-assess'
        ),
      ],
    },
  },
]

export const findTemplate = (templateId?: string) => SKILL_PRESET_TEMPLATES.find(({ id }) => id === templateId)
