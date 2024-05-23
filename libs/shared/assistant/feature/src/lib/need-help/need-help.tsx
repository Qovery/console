import { useContext } from 'react'
import { Button, Icon } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { AssistantContext } from '../assistant-context/assistant-context'

export interface NeedHelpProps {
  className?: string
}

export function NeedHelp({ className }: NeedHelpProps) {
  const { assistantOpen, setAssistantOpen } = useContext(AssistantContext)
  return (
    <Button
      size="xs"
      color="brand"
      variant="surface"
      className={twMerge('w-fit items-center gap-1', className)}
      onClick={() => setAssistantOpen(!assistantOpen)}
    >
      <Icon iconName="circle-question" iconStyle="regular" className="p-0.5 text-xs" />
      <span>Need help here?</span>
    </Button>
  )
}

export default NeedHelp
