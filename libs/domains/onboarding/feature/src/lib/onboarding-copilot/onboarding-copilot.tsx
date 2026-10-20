import posthog from 'posthog-js'
import { useRef, useState } from 'react'
import { DevopsCopilotContext } from '@qovery/shared/devops-copilot/context'
import { DevopsCopilotTrigger } from '@qovery/shared/devops-copilot/feature'
import { Button } from '@qovery/shared/ui'
import qopilot from '../onboarding-cluster/assets/qopilot.svg'

export function OnboardingCopilot() {
  const [devopsCopilotOpen, setDevopsCopilotOpen] = useState(false)
  const sendMessageRef = useRef<((message: string) => void) | null>(null)
  return (
    <DevopsCopilotContext.Provider value={{ devopsCopilotOpen, setDevopsCopilotOpen, sendMessageRef }}>
      <Button
        size="md"
        variant="surface"
        color="brand"
        radius="full"
        className="fixed bottom-4 right-4 shadow-sm motion-safe:animate-[slidein-up-sm_200ms_cubic-bezier(0.165,0.84,0.44,1)_80ms_backwards,fadein_200ms_cubic-bezier(0.165,0.84,0.44,1)_80ms_backwards] motion-reduce:animate-[fadein_120ms_cubic-bezier(0.165,0.84,0.44,1)] sm:right-8"
        onClick={() => {
          setDevopsCopilotOpen(true)
          posthog.capture('ai-copilot-opened', { trigger: 'onboarding-button-click' })
        }}
      >
        <span className="relative size-3.5">
          <img src={qopilot} alt="" className="absolute -left-px -top-px" />
        </span>
        Need help? Ask Qopilot
      </Button>
      <DevopsCopilotTrigger />
    </DevopsCopilotContext.Provider>
  )
}
