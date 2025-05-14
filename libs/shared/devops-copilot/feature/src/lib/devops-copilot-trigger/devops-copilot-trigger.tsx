import { useContext } from 'react'
import { DevopsCopilotContext } from '../devops-copilot-context/devops-copilot-context'
import { DevopsCopilotPanel } from '../devops-copilot-panel/devops-copilot-panel'

export interface DevopsCopilotTriggerProps {
  defaultOpen?: boolean
}

export function DevopsCopilotTrigger({ defaultOpen = false }: DevopsCopilotTriggerProps) {
  const { devopsCopilotOpen, setDevopsCopilotOpen } = useContext(DevopsCopilotContext)

  return (
    <DevopsCopilotPanel
      onClose={() => setDevopsCopilotOpen(false)}
      smaller={defaultOpen}
      style={{ display: devopsCopilotOpen ? '' : 'none' }}
    />
  )
}

export default DevopsCopilotTrigger
