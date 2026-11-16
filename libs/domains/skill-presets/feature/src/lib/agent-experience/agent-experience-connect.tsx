import { useParams } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import { Accordion, Badge, ExternalLink, Heading, Icon, Link, Section, TabsPrimitives } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { useResolvedSkillPreset } from '../hooks/use-resolved-skill-preset/use-resolved-skill-preset'
import { QOVERY_SKILLS } from '../utils/qovery-skills'
import { CommandBlock } from './command-block'
import { PresetSummary } from './preset-summary'
import { AgentExperiencePage, CodingAgentLogos } from './ui/agent-experience-ui'

const { Tabs } = TabsPrimitives

export const SKILLS_INSTALL_COMMAND = 'curl -fsSL https://skill.qovery.com/install.sh | bash'
export const CLI_INSTALL_COMMAND = 'curl -s https://get.qovery.com | bash'
export const MCP_URL = 'https://mcp.qovery.com/mcp'
export const MCP_ADD_COMMAND = `claude mcp add --transport http qovery ${MCP_URL} --callback-port 4242`

/**
 * How each coding agent adds the Qovery MCP server. Claude Code and Codex sign in with OAuth, as on
 * the MCP server settings page. The others pass a token in the Authorization header: a policy token
 * keeps the agent to what it needs.
 */
export const MCP_SETUPS: {
  id: string
  name: string
  steps: { title: string; command: string; prompt?: boolean }[]
}[] = [
  { id: 'claude-code', name: 'Claude Code', steps: [{ title: 'Run this command', command: MCP_ADD_COMMAND }] },
  {
    id: 'codex',
    name: 'Codex',
    steps: [
      { title: 'Add this line to your config.toml', command: 'mcp_oauth_callback_port = 4242', prompt: false },
      { title: 'Run this command', command: `codex mcp add qovery --url '${MCP_URL}'` },
    ],
  },
  {
    id: 'cursor',
    name: 'Cursor',
    steps: [
      {
        title: 'Add this server to ~/.cursor/mcp.json',
        prompt: false,
        command: `{
  "mcpServers": {
    "qovery": {
      "url": "${MCP_URL}",
      "headers": { "Authorization": "Token <your token>" }
    }
  }
}`,
      },
    ],
  },
  {
    id: 'gemini-cli',
    name: 'Gemini CLI',
    steps: [
      {
        title: 'Run this command',
        command: `gemini mcp add --transport http --header "Authorization: Token <your token>" qovery ${MCP_URL}`,
      },
    ],
  },
  {
    id: 'vs-code',
    name: 'VS Code',
    steps: [
      {
        title: 'Run this command',
        command: `code --add-mcp '{"name":"qovery","type":"http","url":"${MCP_URL}","headers":{"Authorization":"Token <your token>"}}'`,
      },
    ],
  },
]

function ConnectStep({
  id,
  icon,
  title,
  description,
  badge,
  children,
  footer,
}: {
  id: string
  icon: 'sparkles' | 'terminal' | 'plug'
  title: string
  description: string
  badge?: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <Section aria-labelledby={id} className="flex flex-col gap-3 rounded-md border border-neutral p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-brand-subtle text-brand">
          <Icon iconName={icon} iconStyle="regular" />
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="flex flex-wrap items-center gap-2">
            <Heading level={2} id={id}>
              {title}
            </Heading>
            {badge}
          </span>
          <p className="text-sm text-neutral-subtle">{description}</p>
        </div>
      </div>
      {children}
      {footer && <div className="flex flex-wrap items-center gap-4 text-sm">{footer}</div>}
    </Section>
  )
}

/** The MCP set-up, one tab per coding agent. */
function McpTabs() {
  const { organizationId = '' } = useParams({ strict: false })
  const { canManage } = useCanManageSkillPresets({ organizationId })
  return (
    <Tabs.Root defaultValue="claude-code" className="flex flex-col gap-3">
      <Tabs.List aria-label="Coding agent" className="border-b border-neutral">
        {MCP_SETUPS.map(({ id, name }) => (
          <Tabs.Trigger key={id} value={id} size="md" className="h-10 px-3">
            {name}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {MCP_SETUPS.map(({ id, name, steps }) => {
        const usesToken = steps.some(({ command }) => command.includes('<your token>'))
        return (
          <Tabs.Content key={id} value={id} className="flex flex-col gap-3">
            {steps.map(({ title, command, prompt }, index) => (
              <div key={title} className="flex flex-col gap-1.5">
                <p className="text-sm font-medium text-neutral">
                  {steps.length > 1 ? `${index + 1}. ` : ''}
                  {title}
                </p>
                <CommandBlock
                  command={command}
                  prompt={prompt}
                  copyLabel={`Copy the ${name} ${prompt === false ? 'configuration' : 'command'}`}
                />
              </div>
            ))}
            <p className="text-xs text-neutral-subtle">
              {usesToken ? (
                <>
                  Replace {'<your token>'} with a Qovery token.{' '}
                  {canManage ? (
                    <>
                      A{' '}
                      <Link
                        to="/organization/$organizationId/agent-experience/policy-tokens"
                        params={{ organizationId }}
                        color="brand"
                        size="xs"
                      >
                        policy token
                      </Link>{' '}
                      limits the agent to what it needs.
                    </>
                  ) : (
                    'Ask an admin for a policy token: it limits the agent to what it needs.'
                  )}
                </>
              ) : (
                'Your browser opens to sign in to Qovery. The agent then acts with your permissions.'
              )}
            </p>
          </Tabs.Content>
        )
      })}
    </Tabs.Root>
  )
}

/** The heading of the preset box: the preset that applies to the reader, by name. */
function YourPresetHeading({ id }: { id: string }) {
  const { organizationId = '' } = useParams({ strict: false })
  const { data } = useResolvedSkillPreset({ organizationId })
  const name = data?.skill_preset?.name
  return (
    <Heading level={2} id={id}>
      {name ? `Your preset: ${name}` : data ? 'Your preset: none' : 'Your preset'}
    </Heading>
  )
}

/**
 * How to connect a coding agent to Qovery: skills, CLI and MCP server, each with a command to copy.
 * The skills come first and are enough for most teams.
 */
export function AgentExperienceConnect() {
  useDocumentTitle('Connect your agent - Agents')

  return (
    <AgentExperiencePage
      title="Connect your agent"
      description="Three ways for a coding agent to work with Qovery, in the order most teams need them."
      width="reading"
    >
      <ConnectStep
        id="connect-skills"
        icon="sparkles"
        title="Install the Qovery skills"
        badge={
          <Badge variant="surface" color="brand" size="sm">
            Start here
          </Badge>
        }
        description="Teaches your agent to deploy, troubleshoot and optimize on Qovery. Run it once per machine."
      >
        <CommandBlock command={SKILLS_INSTALL_COMMAND} copyLabel="Copy the skills install command" />
        <CodingAgentLogos />
        <Accordion.Root type="single" collapsible>
          <Accordion.Item value="skills" className="border-0">
            <Accordion.Trigger
              className="min-h-0 cursor-pointer gap-2 bg-transparent px-0 text-sm font-medium text-brand"
              iconClassName="text-brand"
            >
              See the {QOVERY_SKILLS.length} skills
            </Accordion.Trigger>
            <Accordion.Content className="bg-transparent">
              <ul className="flex flex-col gap-2 pt-2" data-testid="connect-skill-list">
                {QOVERY_SKILLS.map(({ name, description }) => (
                  <li key={name} className="flex flex-col gap-0.5 text-sm md:flex-row md:gap-3">
                    <code className="w-48 shrink-0 font-code text-neutral">{name}</code>
                    <span className="text-neutral-subtle">{description}</span>
                  </li>
                ))}
              </ul>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
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
        <CommandBlock command={CLI_INSTALL_COMMAND} copyLabel="Copy the CLI install command" />
      </ConnectStep>
      <ConnectStep
        id="connect-mcp"
        icon="plug"
        title="Add the Qovery MCP server"
        description="For agents that call tools over MCP. Pick your agent."
      >
        <McpTabs />
      </ConnectStep>

      <Section
        aria-labelledby="connect-preset"
        className="flex flex-col gap-2 rounded-md bg-surface-neutral-subtle p-4"
      >
        <YourPresetHeading id="connect-preset" />
        <PresetSummary />
      </Section>
    </AgentExperiencePage>
  )
}
