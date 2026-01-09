import clsx from 'clsx'
import { useContext, useEffect } from 'react'
import { Badge, Button, Icon, Kbd, Tooltip } from '@qovery/shared/ui'
import { useFormatHotkeys } from '@qovery/shared/util-hooks'
import { DevopsCopilotContext } from '../devops-copilot-context/devops-copilot-context'

export function DevopsCopilotButton() {
  const { devopsCopilotOpen, setDevopsCopilotOpen } = useContext(DevopsCopilotContext)
  const metaKey = useFormatHotkeys('meta')

  // Toggle the menu when ⌘i is pressed
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === 'i' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setDevopsCopilotOpen(true)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [setDevopsCopilotOpen])

  if (!metaKey) return null

  return (
    <Button
      type="button"
      variant="surface"
      onClick={() => setDevopsCopilotOpen(true)}
      className={clsx('ml-4 mr-4 h-[38px] gap-3 px-3 dark:ml-3 dark:h-9', {
        'bg-neutral-50': devopsCopilotOpen,
      })}
    >
      <span className="flex items-center gap-1.5 text-neutral-400 dark:text-white">
        <Icon
          iconName="sparkles"
          iconStyle="light"
          className="relative top-[1px] text-sm text-brand-500 dark:text-white"
        />
        AI Copilot
        <Tooltip
          content="This is an experimental feature. Functionality may change, and billing terms are not final."
          delayDuration={400}
        >
          <Badge color="purple" variant="surface" size="sm" className="ml-0.5">
            Beta
          </Badge>
        </Tooltip>
      </span>
      <div className="ml-auto flex gap-1 text-neutral-400">
        <Kbd>{metaKey}</Kbd>
        <Kbd className="text-2xs">i</Kbd>
      </div>
    </Button>
  )
}

export default DevopsCopilotButton
