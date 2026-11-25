import posthog from 'posthog-js'
import { useContext, useEffect } from 'react'
import { Button, Icon } from '@qovery/shared/ui'
import { DevopsCopilotContext } from '../devops-copilot-context/devops-copilot-context'

export function DevopsCopilotButton() {
  const { setDevopsCopilotOpen } = useContext(DevopsCopilotContext)

  // Toggle the menu when ⌘i is pressed
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === 'i' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setDevopsCopilotOpen(true)
        posthog.capture('ai-copilot-opened', {
          trigger: 'keyboard-shortcut',
        })
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [setDevopsCopilotOpen])

  return (
    <Button
      type="button"
      variant="surface"
      color="brand"
      className="max-md:h-7 max-md:w-7 max-md:justify-center max-md:px-0"
      onClick={() => {
        setDevopsCopilotOpen(true)
        posthog.capture('ai-copilot-opened', {
          trigger: 'button-click',
        })
      }}
    >
      <Icon iconName="sparkles" iconStyle="solid" className="text-xs text-brand" />
      <span className="sr-only md:not-sr-only">AI Copilot</span>
    </Button>
  )
}

export default DevopsCopilotButton
