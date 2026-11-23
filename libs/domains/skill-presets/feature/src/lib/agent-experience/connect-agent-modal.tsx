import { useState } from 'react'
import { Button, Heading, InputSelectSmall, TabsPrimitives } from '@qovery/shared/ui'
import { CLI_INSTALL_COMMAND, MCP_SETUPS, SKILLS_INSTALL_COMMAND } from './agent-experience-connect'
import { CommandBlock } from './command-block'

const { Tabs } = TabsPrimitives

/** `closeLabel` reads "Back" when the popup is shown inside another modal, which it returns to. */
export function ConnectAgentModal({ onClose, closeLabel = 'Close' }: { onClose: () => void; closeLabel?: string }) {
  const [agentId, setAgentId] = useState(MCP_SETUPS[0].id)
  const agent = MCP_SETUPS.find(({ id }) => id === agentId) ?? MCP_SETUPS[0]
  return (
    <Tabs.Root defaultValue="skills" className="flex flex-col">
      <div className="rounded-t-md bg-surface-neutral-subtle px-5 pt-5">
        <Heading level={1} className="text-lg">
          Connect an agent
        </Heading>
        <p className="mt-1 text-sm text-neutral-subtle">Set up your agent on this machine. Start with Qovery skills.</p>
        <Tabs.List aria-label="Setup methods" className="-mx-5 mt-4 border-b border-neutral px-5">
          <Tabs.Trigger value="skills" className="cursor-pointer">
            Qovery skills
          </Tabs.Trigger>
          <Tabs.Trigger value="cli" className="cursor-pointer">
            CLI
          </Tabs.Trigger>
          <Tabs.Trigger value="mcp" className="cursor-pointer">
            MCP server
          </Tabs.Trigger>
        </Tabs.List>
      </div>
      <Tabs.Content value="skills" className="flex flex-col gap-4 p-5 data-[state=inactive]:hidden">
        <p className="text-sm text-neutral-subtle">
          Install the skills your agent uses to deploy, troubleshoot, and optimize on Qovery.
        </p>
        <CommandBlock command={SKILLS_INSTALL_COMMAND} copyLabel="Copy the skills install command" />
        <p className="text-sm text-neutral-subtle">
          The skills use the Qovery CLI. If needed, install it and sign in from the CLI tab.
        </p>
      </Tabs.Content>
      <Tabs.Content value="cli" className="flex flex-col gap-4 p-5 data-[state=inactive]:hidden">
        <p className="text-sm text-neutral-subtle">Install the CLI, then sign in to your Qovery account.</p>
        <CommandBlock command={CLI_INSTALL_COMMAND} copyLabel="Copy the CLI install command" />
        <CommandBlock command="qovery auth" copyLabel="Copy the sign-in command" />
      </Tabs.Content>
      <Tabs.Content value="mcp" className="flex flex-col gap-4 p-5 data-[state=inactive]:hidden">
        <InputSelectSmall
          name="agent"
          ariaLabel="Coding agent"
          defaultValue={agentId}
          onChange={(value) => setAgentId(value ?? MCP_SETUPS[0].id)}
          items={MCP_SETUPS.map(({ id, name }) => ({ value: id, label: name }))}
        />
        {agent.steps.map(({ title, command, prompt }) => (
          <div key={title} className="flex flex-col gap-2">
            <p className="text-sm font-medium">{title}</p>
            <CommandBlock command={command} prompt={prompt} copyLabel={`Copy ${title}`} />
          </div>
        ))}
        <p className="text-sm text-neutral-subtle">
          {agent.steps.some(({ command }) => command.includes('<your token>'))
            ? 'Replace <your token> with a Qovery token. Use a policy token to limit the agent’s access.'
            : 'Your browser opens to sign in to Qovery. The agent acts with your permissions.'}
        </p>
      </Tabs.Content>
      <div className="flex items-center justify-end gap-3 border-t border-neutral px-5 py-4">
        <Button type="button" variant="outline" color="neutral" onClick={onClose}>
          {closeLabel}
        </Button>
      </div>
    </Tabs.Root>
  )
}
