import { useParams } from '@tanstack/react-router'
import { type ReactNode, useState } from 'react'
import { NeedHelp } from '@qovery/shared/assistant/feature'
import { Button, CopyButton, Heading, Icon, Navbar, Section, useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import CrudModalFeature from '../settings-api-token/crud-modal-feature/crud-modal-feature'

interface CommandBlockProps {
  content: string
  showPrompt?: boolean
}

function CommandBlock({ content, showPrompt = false }: CommandBlockProps) {
  const isMultiline = content.includes('\n')

  return (
    <div
      className={`flex gap-6 rounded border border-neutral bg-surface-neutral-subtle p-3 text-neutral retina:border-[0.5px] ${
        isMultiline ? 'items-start' : 'items-center'
      }`}
    >
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
  const { organizationId = '' } = useParams({ strict: false })
  const { openModal, closeModal } = useModal()
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
              <Heading level={2}>Configure via OAuth (recommended)</Heading>
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
                    <div className="flex flex-col gap-5">
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
            </div>
          </Section>

          <Section className="gap-4">
            <div className="space-y-1">
              <Heading level={2}>Configure via API token</Heading>
            </div>

            <div className="overflow-hidden rounded-md border border-neutral bg-surface-neutral p-4">
              <div className="flex flex-col gap-5">
                <InstructionSection
                  number={1}
                  title="Generate token and copy it"
                  description="Save this token securely. You won’t be able to see it again!"
                >
                  <div>
                    <Button
                      color="brand"
                      size="md"
                      onClick={() =>
                        openModal({
                          content: <CrudModalFeature organizationId={organizationId} onClose={closeModal} />,
                        })
                      }
                    >
                      Generate API token
                    </Button>
                  </div>
                </InstructionSection>

                <InstructionSection
                  number={2}
                  title="Authenticate through your API token"
                  description="Pass your Qovery token via query parameter or Authorization header"
                >
                  <CommandBlock
                    content={`# Query parameter
https://mcp.qovery.com/mcp?token=your_qovery_token

# Authorization header
Authorization: Token your_qovery_token`}
                  />
                </InstructionSection>
              </div>
            </div>
          </Section>
        </div>
      </Section>
    </div>
  )
}
