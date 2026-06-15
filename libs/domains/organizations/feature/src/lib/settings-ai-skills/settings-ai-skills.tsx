import { SettingsHeading } from '@qovery/shared/console-shared'
import { CopyButton, Heading, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

const INSTALL_COMMAND = 'curl -fsSL https://skill.qovery.com/install.sh | bash'

const QOVERY_SKILLS = [
  {
    name: 'qovery-onboard',
    description: 'Evaluates your stack, recommends the right cluster configuration, and guides you through onboarding.',
  },
  {
    name: 'qovery-deploy',
    description: 'Deploys from source code, including Dockerfile, database, environment variables, and failure fixes.',
  },
  {
    name: 'qovery-troubleshoot',
    description: 'Runs an 8-layer diagnostic against common error patterns and returns a structured report with fixes.',
  },
  {
    name: 'qovery-optimize',
    description: 'Analyzes cost drivers and recommends right-sizing, spot instances, sleep mode, and CSV export.',
  },
  {
    name: 'qovery-speedup',
    description: 'Measures pipeline timing, finds bottlenecks, and improves Dockerfile layers and build cache.',
  },
  {
    name: 'qovery-preview',
    description: 'Creates a full-stack preview environment per pull request with app, database, URL, and cleanup.',
  },
  {
    name: 'qovery-builder-env',
    description: 'Creates self-service environments for non-technical teams with RBAC guardrails for production.',
  },
  {
    name: 'qovery-builder-portal',
    description: 'Generates and deploys a portal with SSO login and one-click environment creation.',
  },
]

export function SettingsAiSkills() {
  useDocumentTitle('Skills - Organization settings')

  return (
    <div className="w-full">
      <Section className="px-8 pb-8 pt-6">
        <SettingsHeading
          title="Skills"
          description="Give your AI agent the ability to deploy, troubleshoot, optimize, and manage Kubernetes infrastructure."
        />

        <div className="max-w-content-with-navigation-left space-y-8">
          <Section className="gap-4">
            <div className="space-y-1">
              <Heading level={2}>Install the Qovery AI skill</Heading>
              <p className="text-sm text-neutral-subtle">
                Run this command once to install Qovery skills for supported AI coding tools.
              </p>
            </div>
            <div className="flex items-center gap-4 rounded-md border border-neutral bg-surface-neutral-subtle p-3 retina:border-[0.5px]">
              <code className="min-w-0 flex-1 break-all font-mono text-sm text-neutral">{INSTALL_COMMAND}</code>
              <div className="shrink-0">
                <CopyButton content={INSTALL_COMMAND} />
              </div>
            </div>
          </Section>

          <Section className="gap-4">
            <div className="space-y-1">
              <Heading level={2}>Available skills</Heading>
            </div>

            <div className="overflow-hidden rounded-md border border-neutral bg-surface-neutral">
              <div className="divide-y divide-neutral">
                {QOVERY_SKILLS.map((skill) => (
                  <div key={skill.name} className="flex flex-col gap-2 p-4 md:flex-row md:items-start md:gap-6">
                    <div className="min-w-0 md:w-64 md:shrink-0">
                      <p className="w-fit rounded border border-neutral bg-surface-neutral-subtle px-1.5 py-0.5 font-mono text-ssm font-medium text-neutral retina:border-[0.5px]">
                        {skill.name}
                      </p>
                    </div>

                    <p className="min-w-0 flex-1 text-sm leading-normal text-neutral-subtle">{skill.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>
      </Section>
    </div>
  )
}
