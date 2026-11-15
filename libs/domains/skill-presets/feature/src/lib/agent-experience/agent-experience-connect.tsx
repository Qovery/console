import { useParams } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import { ExternalLink, Heading, Icon, Link, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { CommandBlock } from './command-block'
import { PresetSummary } from './preset-summary'
import { AgentExperiencePage, CodingAgentLogos } from './ui/agent-experience-ui'

export const SKILLS_INSTALL_COMMAND = 'curl -fsSL https://skill.qovery.com/install.sh | bash'
export const CLI_INSTALL_COMMAND = 'curl -s https://get.qovery.com | bash'
export const MCP_ADD_COMMAND = 'claude mcp add --transport http qovery https://mcp.qovery.com/mcp --callback-port 4242'

function ConnectStep({
  id,
  icon,
  title,
  description,
  children,
  footer,
}: {
  id: string
  icon: 'sparkles' | 'terminal' | 'plug'
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <Section aria-labelledby={id} className="flex flex-col gap-3 rounded-md border border-neutral p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-brand-subtle text-brand">
          <Icon iconName={icon} iconStyle="regular" />
        </span>
        <div className="flex flex-col gap-0.5">
          <Heading level={2} id={id}>
            {title}
          </Heading>
          <p className="text-sm text-neutral-subtle">{description}</p>
        </div>
      </div>
      {children}
      <div className="flex flex-wrap items-center gap-4 text-sm">{footer}</div>
    </Section>
  )
}

/** How to connect a coding agent to Qovery: skills, CLI and MCP server, each with a command to copy. */
export function AgentExperienceConnect() {
  const { organizationId = '' } = useParams({ strict: false })
  useDocumentTitle('Connect your agent - Agent Experience')

  return (
    <AgentExperiencePage
      title="Connect your agent"
      description="Three ways for a coding agent to work with Qovery. Most teams install the skills; add the CLI or the MCP server if your agent uses them."
    >
      <div className="flex max-w-content-with-navigation-left flex-col gap-6">
        <ConnectStep
          id="connect-skills"
          icon="sparkles"
          title="Install the Qovery skills"
          description="Teaches your agent to deploy, troubleshoot and optimize on Qovery. Run it once per machine."
          footer={
            <Link
              to="/organization/$organizationId/settings/skills"
              params={{ organizationId }}
              color="brand"
              size="sm"
            >
              See the skills
            </Link>
          }
        >
          <CommandBlock command={SKILLS_INSTALL_COMMAND} />
          <CodingAgentLogos />
        </ConnectStep>
        <ConnectStep
          id="connect-cli"
          icon="terminal"
          title="Install the Qovery CLI"
          description="The skills use it to act on Qovery. Sign in once with qovery auth."
          footer={
            <ExternalLink href="https://www.qovery.com/docs/cli/overview" size="sm">
              CLI documentation
            </ExternalLink>
          }
        >
          <CommandBlock command={CLI_INSTALL_COMMAND} />
        </ConnectStep>
        <ConnectStep
          id="connect-mcp"
          icon="plug"
          title="Add the Qovery MCP server"
          description="For agents that call tools over MCP. This command is for Claude Code."
          footer={
            <Link
              to="/organization/$organizationId/settings/mcp-server"
              params={{ organizationId }}
              color="brand"
              size="sm"
            >
              Commands for other agents
            </Link>
          }
        >
          <CommandBlock command={MCP_ADD_COMMAND} />
        </ConnectStep>

        <Section
          aria-labelledby="connect-preset"
          className="flex flex-col gap-2 rounded-md bg-surface-neutral-subtle p-4"
        >
          <Heading level={2} id="connect-preset">
            Using agents? Here is what your organization’s preset gives them
          </Heading>
          <PresetSummary />
        </Section>
      </div>
    </AgentExperiencePage>
  )
}
