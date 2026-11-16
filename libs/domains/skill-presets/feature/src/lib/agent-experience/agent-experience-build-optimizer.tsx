import { useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type BuildAnalysisResult } from 'qovery-typescript-axios'
import { BuildOptimizationModal } from '@qovery/domains/service-logs/feature'
import { getSkillPresetsMockScenario } from '@qovery/domains/skill-presets/data-access'
import { Badge, Button, Callout, ExternalLink, Heading, Icon, Link, Section, useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { TURN_ON_AI_LABEL, TurnOnAiModal } from '../ai-features-notice/ai-features-notice'
import { useAiFeaturesEnabled } from '../hooks/use-ai-features-enabled/use-ai-features-enabled'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { OnOffBadge } from './agent-experience-copilot'
import { AgentExperiencePage } from './ui/agent-experience-ui'

/** The flag that shows the Optimize button in the deployment logs (deployment-logs-steps.tsx). */
export const BUILD_OPTIMIZER_FLAG = 'deployment-logs-build-optimizer'
export const BUILD_OPTIMIZER_DOCS_URL = 'https://www.qovery.com/docs/copilot/capabilities/build-optimizer'
export const BUILD_DEPLOYMENT_OPTIMIZER_TASK_DOCS_URL =
  'https://www.qovery.com/docs/configuration/agent-tasks/build-deployment-optimizer'

/** A made-up result, to show what an analysis looks like. Nothing here comes from a real build. */
export const EXAMPLE_BUILD_ANALYSIS: BuildAnalysisResult = {
  confidence: 'HIGH',
  estimated_time_saved: { min_seconds: 90, max_seconds: 110 },
  assets_reviewed: ['DOCKERFILE', 'DOCKERIGNORE', 'BUILD_SETTINGS', 'BUILD_LOGS'],
  summary:
    'The `npm ci` step re-ran on every build and took 104s, because `COPY . .` comes before it, so any source change invalidates its cache. The build argument `GIT_SHA` is declared before the install and changes on every build, which also invalidates it.',
  improvements: [
    'Copy `package.json` and `package-lock.json` alone, run `npm ci`, then copy the rest of the source.',
    'Declare `ARG GIT_SHA` after the dependency install, in the stage that uses it.',
    'Add `node_modules` and `.git` to `.dockerignore` to shrink the build context.',
  ],
  dockerfile:
    'FROM node:22-alpine AS build\nWORKDIR /app\nCOPY package.json package-lock.json ./\nRUN npm ci\nCOPY . .\nARG GIT_SHA\nENV GIT_SHA=$GIT_SHA\nRUN npm run build\n',
  dockerfile_rationale:
    'Dependencies are installed before the source is copied, so their layer stays cached until the lockfile changes.',
  agent_prompt:
    'Reorder the Dockerfile so that package.json and package-lock.json are copied and npm ci runs before COPY . . Move ARG GIT_SHA after the install. Keep the image behavior identical, build twice locally and check that the second build hits the cache, then stop for my review before committing.',
}

const YOU_GET = [
  { icon: 'gauge', text: 'A review confidence, and the estimated time saved on each build.' },
  { icon: 'sparkles', text: 'A summary of what slows the build, with the step, its seconds and what broke its cache.' },
  { icon: 'list-ol', text: 'The improvements to make, highest impact first.' },
  { icon: 'file-code', text: 'A reworked Dockerfile when one applies, and a prompt to paste into your coding agent.' },
] as const

const NEVER_DOES = [
  'It never changes your Dockerfile, your build settings or your image.',
  'It never starts a build.',
  'It only reads the latest build of the service you pick.',
] as const

/** A still of the Build step in the deployment logs, with the Optimize button, as the user will find it. */
function OptimizeButtonIllustration() {
  return (
    <figure className="flex flex-col gap-2" aria-label="Where to find Optimize: the Build step of the deployment logs">
      <div
        className="flex items-center gap-3 rounded-md border border-neutral bg-surface-neutral px-3 py-2 text-sm"
        aria-hidden="true"
        data-testid="build-step-illustration"
      >
        <Icon iconName="circle-check" iconStyle="solid" className="text-positive" />
        <span className="font-medium text-neutral">Build</span>
        <span className="text-neutral-subtle">2m 14s</span>
        <span className="ml-auto inline-flex h-6 items-center gap-1 rounded bg-surface-brand-solid px-2 text-xs font-medium text-neutralInvert">
          <Icon iconName="bolt" iconStyle="regular" />
          Optimize
        </span>
      </div>
      <figcaption className="text-xs text-neutral-subtle">
        The Build step of a deployment’s logs. After an analysis, the button reads Open analysis.
      </figcaption>
    </figure>
  )
}

/**
 * The Build Optimizer, presented in Agents as a use case: an agent with one job, finding why a
 * Docker build is slow. It is on wherever AI features are on. The Console button that starts it, in
 * the deployment logs, still follows a feature flag, and this page says so.
 */
export function AgentExperienceBuildOptimizer() {
  const { organizationId = '' } = useParams({ strict: false })
  const isMock = getSkillPresetsMockScenario() !== null
  const { canManage, isLoading: isRoleLoading } = useCanManageSkillPresets({ organizationId })
  const aiFeaturesEnabled = useAiFeaturesEnabled({ organizationId })
  const flagEnabled = useFeatureFlagEnabled(BUILD_OPTIMIZER_FLAG) === true
  // The mock shows the page as an organization with the button would see it.
  const hasConsoleButton = isMock || flagEnabled
  const { openModal, closeModal } = useModal()
  useDocumentTitle('Optimize builds - Agents')

  const openExample = () =>
    openModal({
      content: <BuildOptimizationModal analysis={EXAMPLE_BUILD_ANALYSIS} buildDurationSec={134} onClose={closeModal} />,
    })

  return (
    <AgentExperiencePage
      title="Optimize builds"
      titleBadge={
        <Badge variant="surface" color="brand" size="sm">
          Preview
        </Badge>
      }
      description="An agent with one job: find why a Docker build is slow, and how to make it faster."
      width="reading"
    >
      <div
        className="flex flex-row flex-wrap items-center justify-between gap-3 rounded-md border border-neutral px-4 py-3"
        data-testid="build-optimizer-state"
      >
        <span className="flex flex-col">
          <span className="text-sm font-medium text-neutral">Build Optimizer</span>
          <span className="text-xs text-neutral-subtle">
            On with AI features, for apps and jobs built from a Dockerfile
          </span>
        </span>
        <span className="flex items-center gap-3">
          <OnOffBadge on={aiFeaturesEnabled} />
          {!aiFeaturesEnabled && !isRoleLoading && canManage && (
            <Button
              type="button"
              size="md"
              onClick={() =>
                openModal({ content: <TurnOnAiModal organizationId={organizationId} onClose={closeModal} /> })
              }
            >
              {TURN_ON_AI_LABEL}
            </Button>
          )}
        </span>
      </div>
      {!aiFeaturesEnabled && !isRoleLoading && !canManage && (
        <p className="text-sm text-neutral-subtle">Ask an owner or admin of your organization to turn on AI.</p>
      )}

      {!hasConsoleButton && (
        <Callout.Root color="neutral" data-testid="build-optimizer-not-in-console">
          <Callout.Icon>
            <Icon iconName="circle-info" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextDescription>
              The Optimize button in the deployment logs is not available to every organization yet, and not to this
              one. The API already works: see the docs.
            </Callout.TextDescription>
          </Callout.Text>
        </Callout.Root>
      )}

      <Section
        aria-labelledby="build-optimizer-how"
        className="flex flex-col gap-3 rounded-md border border-neutral p-4"
      >
        <Heading level={2} id="build-optimizer-how">
          How to use it
        </Heading>
        <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm text-neutral">
          <li>Open a service built from a Dockerfile, then its Deployments.</li>
          <li>Open the logs of its latest deployment that ran a build.</li>
          <li>On the Build step, click Optimize. The result opens by itself when the analysis is done.</li>
        </ol>
        <OptimizeButtonIllustration />
        <p className="text-xs text-neutral-subtle">
          Starting an analysis needs the Deploy permission on the environment. Reading it needs Read-only.
        </p>
      </Section>

      <Section
        aria-labelledby="build-optimizer-get"
        className="flex flex-col gap-3 rounded-md border border-neutral p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Heading level={2} id="build-optimizer-get">
            What you get
          </Heading>
          <Button type="button" size="md" variant="outline" color="neutral" onClick={openExample}>
            See an example result
          </Button>
        </div>
        <ul className="flex flex-col gap-2 text-sm text-neutral">
          {YOU_GET.map(({ icon, text }) => (
            <li key={text} className="flex items-start gap-2">
              <Icon iconName={icon} iconStyle="regular" className="mt-0.5 text-brand" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        aria-labelledby="build-optimizer-never"
        className="flex flex-col gap-2 rounded-md bg-surface-neutral-subtle p-4"
      >
        <Heading level={2} id="build-optimizer-never">
          What it never does
        </Heading>
        <ul className="flex flex-col gap-1.5 text-sm text-neutral">
          {NEVER_DOES.map((text) => (
            <li key={text} className="flex items-start gap-2">
              <Icon iconName="ban" iconStyle="regular" className="mt-0.5 text-neutral-subtle" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
        <p className="text-xs text-neutral-subtle">
          Suggestions only: you review them, and apply them yourself or with your coding agent.
        </p>
      </Section>

      <Section
        aria-labelledby="build-optimizer-schedule"
        className="flex flex-col gap-2 rounded-md border border-neutral p-4"
      >
        <Heading level={2} id="build-optimizer-schedule">
          Run it every week
        </Heading>
        <p className="text-sm text-neutral-subtle">
          The Build &amp; deployment optimizer Agent Task reviews build and deployment times on a schedule and opens a
          pull request with the changes.
        </p>
        <span className="flex flex-wrap gap-4 text-sm">
          <Link
            to="/organization/$organizationId/agent-experience/automate"
            params={{ organizationId }}
            color="brand"
            size="sm"
          >
            See it in Automate
          </Link>
          <ExternalLink href={BUILD_DEPLOYMENT_OPTIMIZER_TASK_DOCS_URL} size="sm">
            Agent Task docs
          </ExternalLink>
        </span>
      </Section>

      <ExternalLink href={BUILD_OPTIMIZER_DOCS_URL} size="sm" className="w-fit">
        Build Optimizer documentation
      </ExternalLink>
    </AgentExperiencePage>
  )
}
