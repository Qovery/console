import { type ReactNode, useState } from 'react'
import { NeedHelp } from '@qovery/shared/assistant/feature'
import { Badge, CopyButton, ExternalLink, Heading, Icon, Navbar, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

const MCP_TOOLS = [
  {
    name: 'devops_copilot',
    description:
      'Send a message to the DevOps Copilot for Qovery actions. Resolve organization, project, environment, and service IDs first, then reference resources by UUID in the message.',
    icon: 'sparkles',
    accessMode: 'read-write',
  },
  {
    name: 'get_service_logs',
    description: 'Fetch service or application logs, optionally scoped to a deployment or a specific pod.',
    icon: 'scroll',
    accessMode: 'read-only',
  },
  {
    name: 'list_environments',
    description: 'List all environments available in a Qovery project.',
    icon: 'layer-group',
    accessMode: 'read-only',
  },
  {
    name: 'list_organizations',
    description: 'List all organizations the authenticated token can access.',
    icon: 'building',
    accessMode: 'read-only',
  },
  {
    name: 'list_projects',
    description: 'List all projects available in a Qovery organization.',
    icon: 'folder-open',
    accessMode: 'read-only',
  },
]

interface CommandBlockProps {
  content: string
  showPrompt?: boolean
}

function CommandBlock({ content, showPrompt = false }: CommandBlockProps) {
  return (
    <div className="flex items-center gap-6 rounded border border-neutral bg-surface-neutral-subtle p-3 text-neutral retina:border-[0.5px]">
      <div className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm text-neutral">
        {showPrompt ? <span className="select-none">$ </span> : null}
        {content}
      </div>
      <div className="shrink-0">
        <CopyButton content={content} />
      </div>
    </div>
  )
}

interface InstructionSectionProps {
  number: number
  title: string
  description?: string
  children: ReactNode
}

function InstructionSection({ number, title, description, children }: InstructionSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="space-y-1">
        <p className="text-sm font-medium text-neutral">
          {number}. {title}
        </p>
        {description ? <p className="text-sm text-neutral-subtle">{description}</p> : null}
      </div>
      {children}
    </div>
  )
}

export function SettingsMcpServer() {
  useDocumentTitle('MCP server - Organization settings')
  const [activeClient, setActiveClient] = useState<'claude-code' | 'codex'>('claude-code')

  return (
    <div className="w-full">
      <Section className="px-8 pb-8 pt-6">
        <div className="mb-8 flex w-full justify-between gap-2 border-b border-neutral">
          <div className="flex w-full items-start justify-between gap-4 pb-6">
            <div className="flex flex-col gap-2">
              <Heading>MCP server</Heading>
              <p className="max-w-2xl text-sm text-neutral-subtle">
                The Qovery MCP Server lets you interact with your Qovery infrastructure from any MCP-compatible client
                (Claude, Claude Code, ChatGPT, etc.) using natural language.
              </p>
              <NeedHelp className="mt-2" />
            </div>
          </div>
        </div>

        <div className="max-w-content-with-navigation-left space-y-8">
          <Section className="gap-4">
            <div className="space-y-1">
              <Heading level={2}>Configure MCP server</Heading>
            </div>

            <div className="flex flex-col gap-3">
              <div className="overflow-hidden rounded-md border border-neutral bg-surface-neutral">
                <div className="border-b border-neutral px-4">
                  <Navbar.Root
                    activeId={activeClient}
                    ariaLabel="MCP client selector"
                    className="relative top-[1px] -mt-[1px]"
                  >
                    <Navbar.Item
                      id="claude-code"
                      active={activeClient === 'claude-code'}
                      onClick={() => setActiveClient('claude-code')}
                    >
                      <Icon iconName="claude" iconStyle="brands" />
                      <span>Claude Code</span>
                    </Navbar.Item>
                    <Navbar.Item id="codex" active={activeClient === 'codex'} onClick={() => setActiveClient('codex')}>
                      <Icon iconName="openai" iconStyle="brands" />
                      <span>Codex</span>
                    </Navbar.Item>
                  </Navbar.Root>
                </div>

                <div className="p-4">
                  {activeClient === 'claude-code' ? (
                    <InstructionSection
                      number={1}
                      title="Run this command"
                      description="Authenticate through OAuth and add the Qovery MCP server to Claude Code."
                    >
                      <CommandBlock
                        content="claude mcp add --transport http qovery https://mcp.qovery.com/mcp --callback-port 4242"
                        showPrompt
                      />
                    </InstructionSection>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <InstructionSection
                        number={1}
                        title="Update your config.toml"
                        description="Add this setting to your Codex configuration file to use the OAuth callback port."
                      >
                        <CommandBlock content="mcp_oauth_callback_port = 4242" />
                      </InstructionSection>
                      <InstructionSection
                        number={2}
                        title="Run this command"
                        description="Authenticate through OAuth and add the Qovery MCP server to Codex."
                      >
                        <CommandBlock content="codex mcp add qovery --url 'https://mcp.qovery.com/mcp'" showPrompt />
                      </InstructionSection>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-neutral-subtle">
                You can also configure the MCP server through an API token.{' '}
                <ExternalLink
                  href="https://www.qovery.com/docs/copilot/mcp-server#2-api-token"
                  size="sm"
                  className="font-normal text-info hover:text-info"
                >
                  See how
                </ExternalLink>
                .
              </p>
            </div>
          </Section>

          <Section className="gap-4">
            <div className="space-y-1">
              <Heading level={2}>MCP tools</Heading>
              <p className="text-sm text-neutral-subtle">
                Our Qovery MCP server provides MCP tools that let AI assistants search through projects, environments,
                service logs and more.
              </p>
            </div>

            <div className="grid gap-2">
              {MCP_TOOLS.map((tool) => (
                <div
                  key={tool.name}
                  className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral-subtle p-4"
                >
                  <div className="flex items-center gap-2">
                    <Icon iconName={tool.icon} className="text-sm text-neutral-subtle" />
                    <Heading level={3}>{tool.name}</Heading>
                    <Badge
                      size="sm"
                      variant="surface"
                      color={tool.accessMode === 'read-write' ? 'yellow' : 'green'}
                      className="px-1"
                    >
                      {tool.accessMode}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-subtle">{tool.description}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </Section>
    </div>
  )
}
