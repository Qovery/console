import posthog from 'posthog-js'
import { useRef, useState } from 'react'
import { DevopsCopilotContext } from '@qovery/shared/devops-copilot/context'
import { DevopsCopilotTrigger } from '@qovery/shared/devops-copilot/feature'
import { Button, Icon } from '@qovery/shared/ui'

export function OnboardingCopilot() {
  const [devopsCopilotOpen, setDevopsCopilotOpen] = useState(false)
  const sendMessageRef = useRef<((message: string) => void) | null>(null)
  const hasSentPrompt = useRef(false)
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
          if (!hasSentPrompt.current && sendMessageRef.current) {
            sendMessageRef.current("I can't install the demo cluster, explain how to do it.")
            hasSentPrompt.current = true
          }
          posthog.capture('ai-copilot-opened', { trigger: 'onboarding-button-click' })
        }}
      >
        <Icon iconName="sparkles" iconStyle="solid" className="text-sm text-brand" />
        Need help? Ask Qopilot
      </Button>
      <DevopsCopilotTrigger />
    </DevopsCopilotContext.Provider>
  )
}
